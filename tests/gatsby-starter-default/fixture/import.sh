#!/usr/bin/env bash
baseUrl="http://localhost:8080/Plone"

post () {
    url=$1
    payload=$2
    if [ -z "$payload" ]; then
        response=$(\
            curl -s \
            -X POST \
            -H "Accept: application/json" \
            -H "Content-type: application/json" \
            --user "admin:admin" \
            --data "{}" \
            "$url"
        )
    else
        response=$(\
            curl -s \
            -X POST \
            -H "Accept: application/json" \
            -H "Content-type: application/json" \
            --user "admin:admin" \
            -d @"$payload" \
            "$url"
        )
    fi
    echo "$response"
    return $?
}

patch () {
    url=$1
    payload=$2
    response=$(\
        curl -s \
        -X PATCH \
        -H "Accept: application/json" \
        -H "Content-type: application/json" \
        --user "admin:admin" \
        -d @"$payload" \
        "$url"
    )
    echo "$response"
    return $?
}

importPathToUrl () {
    # Define local variables to support recursive calls
    local basename=$1
    local base=$2
    local path=$3
    # Post parent
    response=$(post "$base" "$path/$basename.json")
    local url=$(echo "${response}" | jq -r '."@id"')
    # Patch parent (when content existed)
    if [ "$url" = "null" ]; then
        local url="$base/$basename"
        response=$(patch "$url" "$path/$basename.json")
    fi
    response=$(post "$url/@workflow/publish")
    # Post children
    local type=$(cat "$path/$basename.json" | jq -r '."@type"')
    local items=$(cat "$path/$basename.json" | jq -r '.items')
    if [ "$type" != "Collection" ] && [ "$items" != "null" ]; then
        for sub in $(echo ${items} | jq -r '.[]."@id"'); do
            stripped=$((${#url} + 1))
            sub=${sub:${stripped}:$((${#sub} - stripped))}
            if [ -f "$path/$basename/$sub.json" ]; then
                echo "Importing $url/$sub"
                importPathToUrl "$sub" "$url" "$path/$basename"
            fi
        done
    fi
    # Patch image
    download=$(cat "$path/$basename.json" | jq -r '.image.download')
    filename=$(cat "$path/$basename.json" | jq -r '.image.filename')
    mimetype=$(cat "$path/$basename.json" | jq -r '.image."content-type"')
    if [ -f "$path/$basename-$filename" ]; then
      curl -s \
        -X PATCH \
        -H "Accept: application/json" \
        -H "Content-type: application/json" \
        --user "admin:admin" \
        --data "@-" \
        "$url" << EOF
{"image": {"data": "$(base64 "$path/$basename-$filename"|tr -d '\n')", "encoding": "base64", "filename": "$filename", "content-type": "$mimetype"}}
EOF
    fi
    # Patch file
    download=$(cat "$path/$basename.json" | jq -r '.file.download')
    filename=$(cat "$path/$basename.json" | jq -r '.file.filename')
    mimetype=$(cat "$path/$basename.json" | jq -r '.file."content-type"')
    if [ -f "$path/$basename-$filename" ]; then
      curl -s \
        -X PATCH \
        -H "Accept: application/json" \
        -H "Content-type: application/json" \
        --user "admin:admin" \
        --data "@-" \
        "$url" << EOF
{"file": {"data": "$(base64 "$path/$basename-$filename"|tr -d '\n')", "encoding": "base64", "filename": "$filename", "content-type": "$mimetype"}}
EOF
    fi
    return $?
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
for item in $(cat "$DIR/.index.json" | jq -r '.items | .[]."@id"'); do
    stripped=$((${#baseUrl} + 1))
    basename=${item:${stripped}:$((${#item} - stripped))}
    echo "Importing $baseUrl/$basename"
    importPathToUrl "$basename" "$baseUrl" "$DIR"
done

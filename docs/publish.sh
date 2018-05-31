#!/usr/bin/env bash
baseUrl="http://localhost:8080/Plone"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
marked="$DIR/../node_modules/.bin/marked"

http () {
    method=$1
    url=$2
    payload=$3
    response=$(\
        curl -s \
        -X "$method" \
        -H "Accept: application/json" \
        -H "Content-type: application/json" \
        --user "admin:admin" \
        --data "$payload" \
        "$url"
    )
    status=$?
    echo "$response"
    return ${status}
}

post () {
    http POST "$1" "$2"
    return $?
}

patch () {
    http PATCH "$1" "$2"
    return $?
}

escape () {
    json=$(echo "$1" | python -c 'import json,sys; sys.stdout.write(json.dumps(sys.stdin.read().strip()))')
    status=$?
    echo "$json"
    return ${status}
}

publishFolderToUrl () {
    basename=$1
    base=$2
    # Build
    json='{"@type": "Folder", "id": "'"$basename"'", "title":"'"$basename"'"}'
    # Post
    response=$(post "$base" "$json")
    url=$(echo "${response}" | jq -r '."@id"')
    # Publish
    response=$(post "$url/@workflow/publish" "{}")
    return $?
}

publishMarkdownToUrl () {
    path=$1
    basename=$2
    base=$3
    # Build
    html=$("$marked" "$path")
    title=$(echo "$html"|head -n 1|sed -e 's/<[^>]*>//g')
    body=$(echo "$html"|tail +2)
    json='{"@type": "Document", "id": "'"$basename"'", "title": '$(escape "$title")', "text": {"content-type": "text/html", "encoding": "utf-8", "data": '$(escape "$body")'}}'
    # Post
    response=$(post "$base" "$json")
    url=$(echo "${response}" | jq -r '."@id"')
    # Patch
    if [ "$url" = "null" ]; then
        url="$base/$basename"
        response=$(patch "$url" "$json")
    fi
    # Publish
    response=$(post "$url/@workflow/publish" "{}")
    return $?
}

publishImageToUrl () {
    path=$1
    basename=$2
    base=$3
    # Build
    cat > .publish.image.json << EOF
{"@type": "Image", "title": "$basename", "id": "$basename", "image": {"data": "$(base64 "$path"|tr -d '\n')", "encoding": "base64", "filename": "$basename", "content-type": "image/png"}}
EOF
    # Post
    response=$(post "$base" "@.publish.image.json")
    url=$(echo "${response}" | jq -r '."@id"')
    # Patch
    if [ "$url" = "null" ]; then
        url="$base/$basename"
        response=$(patch "$url" "@.publish.image.json")
    fi
    rm -f .publish.image.json
    # Publish
    response=$(post "$url/@workflow/publish" "{}")
    return $?
}

for path in $(find ${DIR} -name "*.md" -or -name "*.png" -or -type d); do
    stripped=$((${#DIR} + 1))
    filename=${path:${stripped}:$((${#path} - stripped))}
    extension="${filename##*.}"
    directory=$(dirname "${filename%.*}")
    basename=$(basename "${filename%.*}")
    if [ "$directory" == "." ]; then
        directory="/"
    else
        directory="/$directory/"
    fi
    if [ "$basename" != "" ]; then
        if  [ -d "$path" ]; then
            echo "Publishing folder $baseUrl$directory$basename"
            publishFolderToUrl "$basename" "$baseUrl$directory"
        else
            if [ "$extension" == "md" ]; then
                echo "Publishing $baseUrl$directory$basename"
                publishMarkdownToUrl "$path" "$basename" "$baseUrl$directory"
            fi
            if [ "$extension" == "png" ]; then
                echo "Publishing $baseUrl$directory$basename.$extension"
                publishImageToUrl "$path" "$basename.$extension" "$baseUrl$directory"
            fi
        fi
    fi
done

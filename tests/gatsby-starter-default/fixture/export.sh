#!/usr/bin/env bash
baseUrl="http://localhost:8080/Plone"

get () {
    url=$1
    response=$(\
        curl -s \
        -H "Accept: application/json" \
        --user "admin:admin" \
        "$url"
    )
    echo "$response";
    return $?
}

exportUrlToPath() {
    # Define local variables to support recursive calls
    local url=$1
    local base=$2
    local path=$3
    local stripped=$((${#base} + 1))
    local basename=${url:${stripped}:$((${#url} - stripped))}
    local item=$(get "$url")
    local items=$(echo ${item} | jq -r '.items')
    # Export parent
    echo "$item" | jq . > "$path/$basename.json"
    # Export children
    if [ "$items" != "null" ]; then
        mkdir -p "$path/$basename"
        for sub in $(echo ${items} | jq -r '.[]."@id"'); do
            echo "Exporting $sub"
            exportUrlToPath "$sub" "$base/$basename" "$path/$basename"
        done
    fi
    # Export image
    download=$(echo ${item} | jq -r '.image.download')
    filename=$(echo ${item} | jq -r '.image.filename')
    if [ "$download" != "null" ]; then
        curl -s "$download" > "$path/$basename-$filename"
    fi
    # Export file
    download=$(echo ${item} | jq -r '.file.download')
    filename=$(echo ${item} | jq -r '.file.filename')
    if [ "$download" != "null" ]; then
        curl -s "$download" > "$path/$basename-$filename"
    fi
    return $?
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
for item in $(get ${baseUrl} | jq -r '.items | .[]."@id"'); do
    echo "Exporting $item"
    exportUrlToPath "$item" "$baseUrl" "$DIR"
done
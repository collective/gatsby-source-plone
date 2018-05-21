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

publishPathToUrl () {
    basename=$1
    base=$2
    path=$3
    # Compile
    html=$("$marked" "$path/$basename".md)
    title=$(echo "$html"|head -n 1|sed -e 's/<[^>]*>//g')
    body=$(echo "$html"|tail +2)
    json='{"@type": "Document", "id": "'"$basename"'", "title": '$(escape "$title")', "text": {"content-type": "text/html", "encoding": "utf-8", "data": '$(escape "$body")'}}'
    # Create new
    json=$(echo "$json"|jq . -r)
    response=$(post "$base" "$json")
    local url=$(echo "${response}" | jq -r '."@id"')
    # Patch existing
    if [ "$url" = "null" ]; then
        url="$base/$basename"
        response=$(patch "$url" "$json")
    fi
    response=$(post "$url/@workflow/publish" "{}")
    return $?
}

for path in $(ls -tr ${DIR}/*.md); do
    stripped=$((${#DIR} + 1))
    filename=${path:${stripped}:$((${#path} - stripped))}
    extension="${filename##*.}"
    basename="${filename%.*}"
    echo "Publishing $baseUrl/$basename"
    publishPathToUrl "$basename" "$baseUrl" "$DIR"
done

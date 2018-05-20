#!/usr/bin/env bash
baseUrl="http://localhost:8080/Plone"

get () {
    url=$1
    response=$(\
        curl \
        -H "Accept: application/json" \
        --user "admin:admin" \
        "$url"
    )
    echo "$response";
    return $?
}

start=$((${#baseUrl} + 1))

for item in $(get $baseUrl | jq -r '.items | .[]."@id"'); do
    filename=${item:$start:$((${#item} - start))}.json
    echo $(get "$item") | jq . > $filename
done

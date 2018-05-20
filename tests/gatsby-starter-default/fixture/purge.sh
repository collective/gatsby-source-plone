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

delete () {
    url=$1
    response=$(\
        curl \
        -X DELETE \
        -H "Accept: application/json" \
        --user "admin:admin" \
        "$url"
    )
    echo "$response";
    return $?
}

root=$(get $baseUrl)
for item in $(echo "${root}" | jq -r '.items | .[]."@id"'); do
    delete "$item"
done

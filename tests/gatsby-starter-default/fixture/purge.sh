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
    echo "$response"
    return $?
}

delete () {
    url=$1
    response=$(\
        curl -s \
        -X DELETE \
        -H "Accept: application/json" \
        --user "admin:admin" \
        "$url"
    )
    return $?
}

root=$(get ${baseUrl})
for item in $(echo "${root}" | jq -r '.items | .[]."@id"'); do
    echo "Deleting $item"
    delete "$item"
done
echo "Deleted content can restored at $baseUrl/manage_UndoForm"

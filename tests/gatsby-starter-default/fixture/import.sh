#!/usr/bin/env bash
baseUrl="http://localhost:8080/Plone"

post () {
    url=$1
    payload=$2
    if [ -z "$payload" ]; then
        response=$(\
            curl \
            -X POST \
            -H "Accept: application/json" \
            -H "Content-type: application/json" \
            --user "admin:admin" \
            --data "{}" \
            "$url"
        )
    else
        response=$(\
            curl \
            -X POST \
            -H "Accept: application/json" \
            -H "Content-type: application/json" \
            --user "admin:admin" \
            -d @"$payload" \
            "$url"
        )
    fi
    echo "$response";
    return $?
}

for file in $(ls -tr *.json); do
    response=$(post "$baseUrl" "$file")
    url=$(echo "${response}" | jq -r '."@id"')
    response=$(post "$url/@workflow/publish")
done

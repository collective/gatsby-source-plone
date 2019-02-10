#!/usr/bin/env bash
read -p "Username: " USERNAME
read -sp "Password: " PASSWORD
curl -s -X POST http://localhost:8080/Plone/@login -H 'Accept: application/json' -H 'Content-Type: application/json' --data-raw '{"login": "'"$USERNAME"'", "password": "'"$PASSWORD"'"}'|jq -r .token|sed 's|^|TOKEN=|' > .secrets
echo ".secrets updated"

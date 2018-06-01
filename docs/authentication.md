# Authentication

For Plone sites requiring authentication to use plone.restapi, use the following guide to set up a safe method of authentication using [JWT](http://plonerestapi.readthedocs.io/en/latest/authentication.html#json-web-tokens-jwt) and [dotenv](https://github.com/motdotla/dotenv) configuration.

* In UNIX-like systems (OSX, Linux, Linux subsystem for Windows), a bash script would serve as a good way to retrieve the JWT from plone.restapi, by prompting for username and password:

```bash
# 1. enter a new bash environment
bash
# 2. read username into environment variable
read -p "Username: " USERNAME
# 3. read password into environment variable without displaying it while typing
read -sp "Password: " PASSWORD
# 4. request authorization token
curl -s -X POST http://localhost:8080/Plone/@login -H 'Accept: application/json' -H 'Content-Type: application/json' --data-raw '{"login": "'"$USERNAME"'", "password": "'"$PASSWORD"'"}'
# 5. exit bash to forget environment variables
exit
```

* This would give you a token as output:

```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsbmFtZSI6IkpvaG4gRG9lIiwic3ViIjoidXNlcm5hbWUiLCJleHAiOjE1Mjc0NDk0NTl9.epewKm09S6JXe07Ha6UNicN7v9MT32Rrkflxq2OqVRI"
}
```

* Install dotenv and setup `.env` with the token so that it can be used in the Gatsby project

```
// Install dotenv
yarn install dotenv


// In .env in the project folder
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsbmFtZSI6IkpvaG4gRG9lIiwic3ViIjoidXNlcm5hbWUiLCJleHAiOjE1Mjc0NDk0NTl9.epewKm09S6JXe07Ha6UNicN7v9MT32Rrkflxq2OqVRI
```

* Finally setup `gatsby-config.js` to use this in your project:

```javascript
// Top of your file
require("dotenv").config({
  path: '.env',
});

// In plugins list
{
  resolve: 'gatsby-source-plone',
  options: {
    baseUrl: 'http://localhost:8080/Plone/',
    token: process.env.TOKEN,
  },
}
```

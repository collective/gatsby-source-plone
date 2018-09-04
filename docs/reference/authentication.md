# Authenticating REST API calls

For Plone sites requiring authentication to use Plone REST API (or limiting publishable content by permissions of specific user) you may use this guide to set up a safe method of authentication using [JWT](http://plonerestapi.readthedocs.io/en/latest/authentication.html#json-web-tokens-jwt) and [dotenv](https://github.com/motdotla/dotenv) configuration.

**Note:** In time of writing, Plone REST API only created tokens valid for the next 12 hours.

In UNIX-like systems (OSX, Linux, Linux subsystem for Windows), a bash script would serve as a good way to retrieve the JWT from plone.restapi, by prompting for username and password:

```bash
bash
read -p "Username: " USERNAME
read -sp "Password: " PASSWORD
curl -s -X POST http://localhost:8080/Plone/@login -H 'Accept: application/json' -H 'Content-Type: application/json' --data-raw '{"login": "'"$USERNAME"'", "password": "'"$PASSWORD"'"}'
exit
```
The above script will
  
1. enter a new bash environment
2. read username into environment variable
3. read password into environment variable without displaying it when you type
4. request authorization token
5. exit bash to forget environment variables.

This would give you a token as output:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsbmFtZSI6IkpvaG4gRG9lIiwic3ViIjoidXNlcm5hbWUiLCJleHAiOjE1Mjc0NDk0NTl9.epewKm09S6JXe07Ha6UNicN7v9MT32Rrkflxq2OqVRI"
}
```

Install dotenv and setup `.secrets` with the token so that it can be used in the Gatsby project:

```bash
// Install dotenv
yarn install dotenv


// In .env in the project folder
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsbmFtZSI6IkpvaG4gRG9lIiwic3ViIjoidXNlcm5hbWUiLCJleHAiOjE1Mjc0NDk0NTl9.epewKm09S6JXe07Ha6UNicN7v9MT32Rrkflxq2OqVRI
```

Finally setup `gatsby-config.js` to use this in your project:

```javascript
// Top of your file
require("dotenv").config({
  path: '.secrets',
});

// In plugins list
module.exports = {
  resolve: 'gatsby-source-plone',
    options: {
    baseUrl: 'http://localhost:8080/Plone/',
    token: process.env.TOKEN,
  }
};
```

**Important!** Be careful in naming your environment variable file, because Gatsby will automatically include and make public all environment variables from files starting with `.env.` (e.g. `.env.production`).

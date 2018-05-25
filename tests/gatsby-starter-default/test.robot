*** Settings ***

Library         SeleniumLibrary  timeout=10  implicit_wait=0
Library         DebugLibrary

Test Setup      Open browser  about:blank  browser=headlessfirefox
Test Teardown   Close Browser


*** Test Cases ***

Scenario: Front page
  Go To  http://localhost:9000
  Wait until page contains  Gatsby plugin for Plone
  Page should contain  gatsby-source-plone
  Page should contain  Traversal using @search endpoint

Scenario: Link to sub page
  Go To  http://localhost:9000
  Wait until page contains  Gatsby plugin for Plone
  Page should contain  Traversal using @search endpoint
  Click link  Traversal using @search endpoint
  Wait until page contains  plone.restapi

Scenario: Link back to home
  Go To  http://localhost:9000
  Wait until page contains  Gatsby plugin for Plone
  Page should contain  Traversal using @search endpoint
  Click link  Traversal using @search endpoint
  Wait until page contains  plone.restapi
  Page should not contain  Gatsby is a blazing fast
  Click link  Learn more »
  Page should contain  Gatsby is a blazing fast

Scenario: Link to previous page
  Go To  http://localhost:9000
  Wait until page contains  Gatsby plugin for Plone
  Page should contain  Traversal using @search endpoint
  Click link  Traversal using @search endpoint
  Wait until page contains  plone.restapi
  Page should not contain  Gatsby is a blazing fast
  Click link  « Return
  Page should contain  Gatsby is a blazing fast

Scenario: Children of a folder
  Go To  http://localhost:9000/news
  Wait until page contains  News on gatsby-source-plone development
  Page should contain  GSOC for Gatsby
  Page should contain  GatsbyJS plugin for Plone!
  Click link  Let's do a GatsbyJS plugin for Plone!
  Wait until page contains  Gatsby is a blazing fast
  Page should not contain  GSOC for Gatsby

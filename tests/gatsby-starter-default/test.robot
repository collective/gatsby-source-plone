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
  Page should not contain  gatsby-source-plone
  Click link  Learn more »
  Page should contain  gatsby-source-plone
  Click link  gatsby-source-plone
  Wait until page contains  Gatsby is a blazing fast

Scenario: Demo page
  Go To  http://localhost:9000/Demo
  Wait until page contains  Demo
  Page should contain  A News Item

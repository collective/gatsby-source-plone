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
  Page should contain  News
  Page should contain  Docs

Scenario: Link to sub page
  Go To  http://localhost:9000
  Wait until page contains  Gatsby plugin for Plone
  Page should contain  Docs
  Page should not contain  Plugin Options
  Click link  Docs
  Wait until page contains  Plugin Options

Scenario: Link back to home
  Go To  http://localhost:9000
  Wait until page contains  Gatsby plugin for Plone
  Page should contain  Docs
  Page should not contain  Plugin Options
  Click link  Docs
  Wait until page contains  Plugin Options
  Click link  Learn more »
  Wait until page contains  Gatsby plugin for Plone
  Page should not contain  Plugin Options

Scenario: Link to previous page
  Go To  http://localhost:9000
  Wait until page contains  Gatsby plugin for Plone
  Page should contain  Docs
  Page should not contain  Plugin Options
  Click link  Docs
  Wait until page contains  Plugin Options
  Page should contain  Home
  Click link  Home
  Wait until page contains  Gatsby plugin for Plone
  Page should not contain  Plugin Options

Scenario: Children of a folder
  Go To  http://localhost:9000/docs
  Wait until page contains  Plugin Options
  Page should contain  Authentication
  Page should not contain  token
  Click link  Authentication
  Wait until page contains  token
  Page should contain  Home
  Page should contain  Docs
  Page should not contain  Plugin Options

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
  Page should contain  Gatsby is a blazing fast static site generator for React.
  Page should contain  Traversal using @search endpoint

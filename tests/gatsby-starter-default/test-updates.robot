*** Settings ***

Library         SeleniumLibrary  timeout=10  implicit_wait=0

Test Setup      Open browser  about:blank  browser=headlessfirefox
Test Teardown   Close Browser


*** Test Cases ***


Scenario: Deep folder structure
  Go To  http://localhost:9000
  Wait until page contains  Plone plugin for Gatsby
  Element should contain  css=.list-group  Docs
  Page should contain  Examples
  Click link  Examples
  Page should contain  Subfolder level two
  Click link  Subfolder level two
  Page should contain  Level three
  Click link  Level three
  Page should contain  Level four
  Click link  Level four
  Page should contain  Level four

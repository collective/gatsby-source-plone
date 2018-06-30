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

Scenario: Deep folder structure
  Go To  http://localhost:9000
  Wait until page contains  Gatsby plugin for Plone
  Page should contain  Testcases
  Click link  Testcases
  Page should contain  Subfolder level two
  Click link  Subfolder level two
  Page should contain  Level three
  Click link  Level three
  Page should contain  Level four
  Click link  Level four
  Page should contain  Level four
  # Test that breadcrumbs are shown
  Page should contain  Home
  Page should contain  Testcases
  Page should contain  Subfolder level two
  Page should contain  Level three
  Page should contain  Level four
  # Test that other folders from root level are not shown
  Page should not contain  Docs

Scenario: Image in a News Item
  Go To  http://localhost:9000/News
  Wait until page contains  News
  Click link  GSOC for Gatsby source for Plone started
  Page should contain  GSOC for Gatsby
  Page should contain element  css=h3 + .gatsby-image-outer-wrapper img


Scenario: File download on a folder
  Go To  http://localhost:9000/testcases
  Wait until page contains  PDF example
  Page should contain element  css=a[download="plone-logo.pdf"]


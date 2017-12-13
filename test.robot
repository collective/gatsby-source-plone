*** Settings ***

Library         Selenium2Library  timeout=10  implicit_wait=0
Library         DebugLibrary

Test Setup      Open Headless Browser
Test Teardown   Close Browser


*** Test Cases ***

Scenario: Open Headless Browser
  Go To  http://localhost:9000
  Wait until page contains  Gatsby
  Page should contain  Welcome to Plone


*** Keywords ***

Open Headless Browser
  ${options}=  Evaluate  sys.modules['selenium.webdriver'].ChromeOptions()  sys, selenium.webdriver
  Call Method  ${options}  add_argument  headless
  Call Method  ${options}  add_argument  disable-extensions
  Call Method  ${options}  add_argument  start-maximized
  Create WebDriver  Chrome  chrome_options=${options}

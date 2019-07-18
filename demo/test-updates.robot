
*** Settings ***

Library         SeleniumLibrary  timeout=10  implicit_wait=0
Library         REST

Test Setup      Open singleton browser  ${GATSBY_URL}
Test Teardown   Close All Browsers

*** Variables ***

${BROWSER}        firefox
${GATSBY_PORT}    8000
${GATSBY_URL}     http://localhost:${GATSBY_PORT}
${PLONE_PORT}     8080
${PLONE_URL}      http://localhost:${PLONE_PORT}/Plone
${AUTHORIZATION}  Basic YWRtaW46YWRtaW4=

*** Keywords ***

Open singleton browser
    [Documentation]
    ...  Open a new browser window on the first call
    ...  and selects that window on the subsequent calls.
    [Arguments]  ${url}=about:blank
    ${Browser is open} =  Run keyword and return status
    ...  Switch browser  singleton
    Run keyword if  ${Browser is open}
    ...  Go to  ${url}
    ...  ELSE
    ...  Open browser  ${url}  alias=singleton  browser=${BROWSER}

*** Keywords ***

Set Plone headers
    &{headers}=  Create dictionary
    ...  ContentType=application/json
    ...  Authorization=${AUTHORIZATION}
    Set headers  ${headers}

*** Test Cases ***

Scenario: Deep folder structure
  Go To  ${GATSBY_URL}
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

*** Test Cases ***

Scenario: Delete single page
    Set Plone headers
    Go to  ${GATSBY_URL}/examples/subfolder-level-two/level-three/
    Wait until page contains element  css:a[href$="/level-four/"]
    Delete  ${PLONE_URL}/examples/subfolder-level-two/level-three/level-four/
    Wait until page does not contain element  css:a[href$="/level-four/"]

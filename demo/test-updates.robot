
*** Settings ***

Library         SeleniumLibrary  timeout=10  implicit_wait=0
Library         REST

Test Setup      Open singleton browser  ${GATSBY_URL}
#Test Teardown   Close All Browsers

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
    ...  Accept=application/json
    ...  Authorization=${AUTHORIZATION}
    ...  ContentType=application/json
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

Scenario: Delete leaf content
    Set Plone headers
    Go to  ${GATSBY_URL}/examples/subfolder-level-two/level-three/
    Wait until page contains element  css:a[href$="/level-four/"]
    Delete  ${PLONE_URL}/examples/subfolder-level-two/level-three/level-four/
    Go to  ${GATSBY_URL}/examples/subfolder-level-two/level-three/
    Wait until page does not contain element  css:a[href$="/level-four/"]

*** Test Cases ***

Scenario: Delete content with children
    Set Plone headers
    Go to  ${GATSBY_URL}
    Wait until page contains element  css:a[href$="/examples/"]
    Delete  ${PLONE_URL}/examples
    Go to  ${GATSBY_URL}
    Wait until page does not contain element  css:a[href$="/examples/"]

*** Test Cases ***

Scenario: Update page content
    Set Plone headers
    Go to  ${GATSBY_URL}/news
    Wait until page contains  News on gatsby-source-plone development
    Page should not contain  Read the news
    ${payload}=  Create dictionary  description=Read the news
    Patch  ${PLONE_URL}/news  ${payload}
    Go to  ${GATSBY_URL}/news
    Wait until page contains  Read the news
    Page should not contain  News on gatsby-source-plone development

*** Test Cases ***

Scenario: Update content visible in navigation
    Set Plone headers
    Go to  ${GATSBY_URL}/reference
    Wait until page contains element  css:a[href$="/reference/"]
    Element should not contain
    ...  css:a[href$="/reference/"]
    ...  The Docs
    Page should not contain  The Docs
    ${payload}=  Create dictionary  title=The Docs
    Patch  ${PLONE_URL}/reference  ${payload}
    Go to  ${GATSBY_URL}/reference
    Wait until element contains
    ...  css:a[href$="/reference/"]
    ...  The Docs
    Go to  ${GATSBY_URL}
    Wait until page contains  Plone plugin for Gatsby
    Wait until element contains
    ...  css:a[href$="/reference/"]
    ...  The Docs

*** Test Cases ***

Scenario: Update content visible in breadcrumbs
    Set Plone headers
    Go to  ${GATSBY_URL}/tutorial/1_getting_started
    Wait until page contains element
    ...  css:.breadcrumb a[href$="/tutorial/"]
    Element should not contain
    ...  css:.breadcrumb a[href$="/tutorial/"]
    ...  The Tutorial
    Page should not contain  The Tutorial
    ${payload}=  Create dictionary  title=The Tutorial
    Patch  ${PLONE_URL}/tutorial  ${payload}
    Go to  ${GATSBY_URL}/tutorial/1_getting_started
    Wait until element contains
    ...  css:.breadcrumb a[href$="/tutorial/"]
    ...  The Tutorial

*** Test Cases ***

Scenario: Add new content
    Set Plone headers
    Go to  ${GATSBY_URL}
    Wait until page contains  Plone plugin for Gatsby
    Page should not contain  New Page
    Page should not contain  HERE BE DRAGONS
    ${payload}=  Create dictionary
    ...  @type=Document
    ...  title=New Page
    ...  description=Hello World!
    ...  text=<p>HERE BE DRAGONS</p>
    Post  ${PLONE_URL}  ${payload}
    Integer  response status  201
    ${url}=  Output  response headers Location
    Should be equal  ${url}  ${PLONE_URL}/new-page
    Post  ${PLONE_URL}/new-page/@workflow/publish
    Integer  response status  200
    Go to  ${GATSBY_URL}
    Wait until page contains element  css:a[href$="/new-page/"]
    Element should contain
    ...  css:a[href$="/new-page/"]
    ...  New Page
    Go to  ${GATSBY_URL}/new-page/
    Wait until page contains  HERE BE DRAGONS


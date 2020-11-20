## 0.3.0 - 2020-11-20

### Fixed

* Fix issue where modification were no longer properly compared on recent GatsbyJS versions resulting cached Plone nodes not properly being invalidated. @datakurre

### Added

* Add support for Volto `blocks` by transforming them into GraphQL-compatible array of blocks in order with JSON `config` attribute and `blocks_nodes` with linked nodes parsed from Volto blocks. @datakurre

* Add configuration option `transientTypes: string[]` for transient types (default: `[ 'Collection' ]` to be updated regardless of their changes. @datakurre

## 0.2.0 - 2019-10-26

### Added

* Support for private images and files when authorization token has been configured. @iFlameing

* Support for nested queries through nodes`attribute (of GraphQLUnionType) on containers nodes. @datakurre

* Support for real-time update notifications from Plone with WebSocket support enabled. @iFlameing

* Countless small bug fixes. @datakurre

* Code restructuring and larger test coverage. @iFlameing


## 0.1.0 - 2018-09-29

### Added

* Initial release. @ajayns, @datakurre, @tisto, @cekk, @sneridagh

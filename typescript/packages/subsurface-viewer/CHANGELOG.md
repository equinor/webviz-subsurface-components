# [0.4.0](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.3.5...subsurface-viewer@0.4.0) (2023-10-19)


### Features

* Grid3d Layer API and cursor readout enhancements. ([#1714](https://github.com/equinor/webviz-subsurface-components/issues/1714)) ([147292d](https://github.com/equinor/webviz-subsurface-components/commit/147292dc18e5b715c6ced842d4c779c355d7a5aa))

## [0.3.5](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.3.4...subsurface-viewer@0.3.5) (2023-10-17)


### Bug Fixes

* bump @equinor/eds-core-react from 0.32.x to 0.33.0 ([#1704](https://github.com/equinor/webviz-subsurface-components/issues/1704)) ([75c5de8](https://github.com/equinor/webviz-subsurface-components/commit/75c5de8cd069a6c0d1d87b54307e23cf5be1b4b3))

## [0.3.4](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.3.3...subsurface-viewer@0.3.4) (2023-10-17)


### Bug Fixes

* audit fix prod dependencies ([#1707](https://github.com/equinor/webviz-subsurface-components/issues/1707)) ([b5dbcf8](https://github.com/equinor/webviz-subsurface-components/commit/b5dbcf8677d0f0424cfdf4c2d237b378de867e12))

## [0.3.3](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.3.2...subsurface-viewer@0.3.3) (2023-10-13)


### Bug Fixes

* bump d3-format from 1.4.5 to 3.1.0 in /typescript ([#1680](https://github.com/equinor/webviz-subsurface-components/issues/1680)) ([91f42d1](https://github.com/equinor/webviz-subsurface-components/commit/91f42d1b47c8c423ae8e4d720daf44f2b24730e4))

## [0.3.2](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.3.1...subsurface-viewer@0.3.2) (2023-10-13)


### Bug Fixes

* View resets to default when adding/removing a layer. [#1690](https://github.com/equinor/webviz-subsurface-components/issues/1690) ([#1691](https://github.com/equinor/webviz-subsurface-components/issues/1691)) ([5ec5d90](https://github.com/equinor/webviz-subsurface-components/commit/5ec5d904c9fe97df4c87ed9fe51bdd30a16a271a))

## [0.3.1](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.3.0...subsurface-viewer@0.3.1) (2023-10-12)


### Performance Improvements

* Performance improvements to makeFullMesh function in MapLayer  [#1662](https://github.com/equinor/webviz-subsurface-components/issues/1662) ([#1689](https://github.com/equinor/webviz-subsurface-components/issues/1689)) ([f7a79cd](https://github.com/equinor/webviz-subsurface-components/commit/f7a79cdeb4d457106abacb88de2918190e7aba80))

# [0.3.0](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.2.3...subsurface-viewer@0.3.0) (2023-10-05)


### Features

* **grid3d:** constant color for coloring Grid3dLayer ([#1688](https://github.com/equinor/webviz-subsurface-components/issues/1688)) ([718e8a0](https://github.com/equinor/webviz-subsurface-components/commit/718e8a06204fc51c66677415a5bf31ef93860be7))

## [0.2.3](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.2.2...subsurface-viewer@0.2.3) (2023-10-04)


### Bug Fixes

* "IsRenderedCallack" shold return true for layers which has visible attribute set to false. ([#1682](https://github.com/equinor/webviz-subsurface-components/issues/1682)) ([816dc37](https://github.com/equinor/webviz-subsurface-components/commit/816dc377d31cc4c8b422124f9e9cb921669afd28))

## [0.2.2](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.2.1...subsurface-viewer@0.2.2) (2023-09-29)


### Bug Fixes

* Remove duplicate vertices from well path. May cause crash ([#1667](https://github.com/equinor/webviz-subsurface-components/issues/1667)) ([5d0e858](https://github.com/equinor/webviz-subsurface-components/commit/5d0e858dec0977322e4c90be1d9a5a8dbef71fd9))

## [0.2.1](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.2.0...subsurface-viewer@0.2.1) (2023-09-27)


### Bug Fixes

* Rename callback to more descriptive name. Also callback should be… ([#1668](https://github.com/equinor/webviz-subsurface-components/issues/1668)) ([0c1baee](https://github.com/equinor/webviz-subsurface-components/commit/0c1baee321cda44e32275babf2ac45e2135432d3)), closes [#1653](https://github.com/equinor/webviz-subsurface-components/issues/1653)

# [0.2.0](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.1.1...subsurface-viewer@0.2.0) (2023-09-22)


### Features

* New wellsLayer property: "simplifiedRendering".  Default false. ([#1653](https://github.com/equinor/webviz-subsurface-components/issues/1653)) ([baffae1](https://github.com/equinor/webviz-subsurface-components/commit/baffae183456c027c6312a44e56071baec7c0ca3))

## [0.1.1](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.1.0...subsurface-viewer@0.1.1) (2023-09-22)


### Bug Fixes

* Improve "isLoadedCallback" to not return true before first draw of layer not only just when data are loaded. ([#1656](https://github.com/equinor/webviz-subsurface-components/issues/1656)) ([3875f8b](https://github.com/equinor/webviz-subsurface-components/commit/3875f8b55a7d2abf34dca7a82079b602f2741de0))

## [0.1.1](https://github.com/equinor/webviz-subsurface-components/compare/subsurface-viewer@0.1.0...subsurface-viewer@0.1.1) (2023-09-22)


### Bug Fixes

* Improve "isLoadedCallback" to not return true before first draw of layer not only just when data are loaded. ([#1656](https://github.com/equinor/webviz-subsurface-components/issues/1656)) ([3875f8b](https://github.com/equinor/webviz-subsurface-components/commit/3875f8b55a7d2abf34dca7a82079b602f2741de0))

# 1.0.0 (2023-09-22)


### Bug Fixes

* Improve "isLoadedCallback" to not return true before first draw of layer not only just when data are loaded. ([#1656](https://github.com/equinor/webviz-subsurface-components/issues/1656)) ([3875f8b](https://github.com/equinor/webviz-subsurface-components/commit/3875f8b55a7d2abf34dca7a82079b602f2741de0))
* MapLayer - null meshData values are treated as 0 [#1642](https://github.com/equinor/webviz-subsurface-components/issues/1642) ([#1648](https://github.com/equinor/webviz-subsurface-components/issues/1648)) ([6198bc4](https://github.com/equinor/webviz-subsurface-components/commit/6198bc4c144f7ba97076725275c322a555aef20c))
* wrong export of default as type ([#1645](https://github.com/equinor/webviz-subsurface-components/issues/1645)) ([77c171b](https://github.com/equinor/webviz-subsurface-components/commit/77c171b80d6716c6419fbb03ed52ea3309aa7297))


### Features

* **grid3d:** prop to show-hide grid lines added ([#1624](https://github.com/equinor/webviz-subsurface-components/issues/1624)) ([0b22788](https://github.com/equinor/webviz-subsurface-components/commit/0b22788063e462b262cdbaac70d419669dc09308))

# 1.0.0 (2023-09-21)


### Bug Fixes

* Improve "isLoadedCallback" to not return true before first draw of layer not only just when data are loaded. ([#1656](https://github.com/equinor/webviz-subsurface-components/issues/1656)) ([3875f8b](https://github.com/equinor/webviz-subsurface-components/commit/3875f8b55a7d2abf34dca7a82079b602f2741de0))
* MapLayer - null meshData values are treated as 0 [#1642](https://github.com/equinor/webviz-subsurface-components/issues/1642) ([#1648](https://github.com/equinor/webviz-subsurface-components/issues/1648)) ([6198bc4](https://github.com/equinor/webviz-subsurface-components/commit/6198bc4c144f7ba97076725275c322a555aef20c))
* wrong export of default as type ([#1645](https://github.com/equinor/webviz-subsurface-components/issues/1645)) ([77c171b](https://github.com/equinor/webviz-subsurface-components/commit/77c171b80d6716c6419fbb03ed52ea3309aa7297))


### Features

* **grid3d:** prop to show-hide grid lines added ([#1624](https://github.com/equinor/webviz-subsurface-components/issues/1624)) ([0b22788](https://github.com/equinor/webviz-subsurface-components/commit/0b22788063e462b262cdbaac70d419669dc09308))

# 1.0.0 (2023-09-20)


### Bug Fixes

* Improve "isLoadedCallback" to not return true before first draw of layer not only just when data are loaded. ([#1656](https://github.com/equinor/webviz-subsurface-components/issues/1656)) ([3875f8b](https://github.com/equinor/webviz-subsurface-components/commit/3875f8b55a7d2abf34dca7a82079b602f2741de0))
* MapLayer - null meshData values are treated as 0 [#1642](https://github.com/equinor/webviz-subsurface-components/issues/1642) ([#1648](https://github.com/equinor/webviz-subsurface-components/issues/1648)) ([6198bc4](https://github.com/equinor/webviz-subsurface-components/commit/6198bc4c144f7ba97076725275c322a555aef20c))
* wrong export of default as type ([#1645](https://github.com/equinor/webviz-subsurface-components/issues/1645)) ([77c171b](https://github.com/equinor/webviz-subsurface-components/commit/77c171b80d6716c6419fbb03ed52ea3309aa7297))


### Features

* **grid3d:** prop to show-hide grid lines added ([#1624](https://github.com/equinor/webviz-subsurface-components/issues/1624)) ([0b22788](https://github.com/equinor/webviz-subsurface-components/commit/0b22788063e462b262cdbaac70d419669dc09308))

# Changelog - Terrific Micro Exporter

## v0.0.11 - 2015-02-24

- bump is now optional and can be disabled completely by providing `bump: false`

## v0.0.10 - 2015-01-14

- imageminPaths now supports glob patterns
- fixed mapping: now uses custom delimiters `{%` and `%}`
- removed `config` key from configuration to slim down the configuration
- `dumpName` now uses custom delimiters `{%` and `%}` to prevent template processing with old package information
- `tc-micro-exporter` is not longer a multiTask
- Bugs fixed:
    - `tc-micro-exporter:dump` and `tc-micro-exporter:release` fails with errors
    - `tc-micro-exporter:release:minor` and `tc-micro-exporter:release:major` fails with error
    - `dumpName` gets old version on release

## v0.0.6 - 2015-01-13  - first version

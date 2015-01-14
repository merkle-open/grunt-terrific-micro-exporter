# Changelog - Terrific Micro Exporter

## v0.0.7 - 2015-01-14

- removed `config` key from configuration to slim down the configuration
- `dumpName` now uses custom delimiters `{%` and `%}` to prevent template processing with old package information
- `tc-micro-exporter` is not longer a multiTask
- Bugs fixed:
    - `tc-micro-exporter:dump` and `tc-micro-exporter:release` fails with errors
    - `tc-micro-exporter:release:minor` and `tc-micro-exporter:release:major` fails with error
    - `dumpName` gets old version on release

## v0.0.6 - 2015-01-13  - first version

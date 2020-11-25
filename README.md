# doc-combiner

A simple CLI tool for converting multiple local files (e.g. HTTML files or EML files) into screenshots.

## Getting Started

```
npm init
```

## Usage

Usage: ./combiner <INPUT_REGEX> <OUTPUT_PATH>

To convert a list of files with Regex to PNG screenshots:

```
./combiner "./docs/.*" ./output
```

Please make sure to add quotes in the first argument, otherwise the Unix-like system will automatically break it into an array of arguments.

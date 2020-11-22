kindly
==

kindly configuration helpers

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/kindly.svg)](https://npmjs.org/package/my)
[![Downloads/week](https://img.shields.io/npm/dw/kindly.svg)](https://npmjs.org/package/my)
[![License](https://img.shields.io/npm/l/kindly.svg)](https://github.com/AHDesigns/my/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g kindly
$ kindly COMMAND
running command...
$ kindly (-v|--version|version)
kindly/0.0.0 darwin-x64 node-v14.15.0
$ kindly --help [COMMAND]
USAGE
  $ kindly COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`kindly hello [FILE]`](#kindly-hello-file)
* [`kindly help [COMMAND]`](#kindly-help-command)

## `kindly hello [FILE]`

```
USAGE
  $ kindly hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ kindly hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/AHDesigns/kindly/blob/v0.0.0/src/commands/hello.ts)_

## `kindly help [COMMAND]`

```
USAGE
  $ kindly help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_
<!-- commandsstop -->

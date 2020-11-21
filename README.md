my
==

my configuration helpers

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/my.svg)](https://npmjs.org/package/my)
[![Downloads/week](https://img.shields.io/npm/dw/my.svg)](https://npmjs.org/package/my)
[![License](https://img.shields.io/npm/l/my.svg)](https://github.com/AHDesigns/my/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g my
$ my COMMAND
running command...
$ my (-v|--version|version)
my/0.0.0 darwin-x64 node-v14.15.0
$ my --help [COMMAND]
USAGE
  $ my COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`my hello [FILE]`](#my-hello-file)
* [`my help [COMMAND]`](#my-help-command)

## `my hello [FILE]`

```
USAGE
  $ my hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ my hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/AHDesigns/my/blob/v0.0.0/src/commands/hello.ts)_

## `my help [COMMAND]`

```
USAGE
  $ my help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_
<!-- commandsstop -->

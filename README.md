# Tree exec
Node.js cli utility that walks a path and executes a command for each file on the path.

## Motivation
Trying to use NPM as a build tool can be complicated in windows, the biggest problem beeing the shell don't expand glob patterns, so some utilities need a for loop to work properly, to aid with interop this package was developed.

## Basic usage
```
$ tree-exec [options] <command>
```

## Examples:
```
$ tree-exec -a command @f
$ tree-exec -g="./**/*.ext" command @f
$ tree-exec -r="[^node_modules]\/.*$" command @f
```

## Options:
| Parameter: | Description: |
| :---: | :--- |
| `-h`, `--help` | Show this information. |
| `-p`, `--path` | The base path to start the search, if it is different from the current working directory. |
| `-d`, `--depth` | Sets the depth to search. |
| `-g`, `--glob` | A glob pattern to use as search. |
| `-r`, `--regex` | A RegExp pattern to use as search. |
| `-a`, `--all` | Search throug all files. |
| `-i`, `--icase` | Set case insensitiveness of the search. |
| `-x`, `--dot` | Sets if it should include paths starting with `.`. |
| `-l`, `--library` | Sets if it should include library paths like `node_modules` or `bower_components`. |
| `-u`, `--unicode` | Set the unicode flag. **NOTE:** Only use if your node version supports it, or it will give wrong results. |
| `-s`, `--globstar` | Disable `**` matching against multiple folder names. |
| `-c`, `--nocoment` | Suppress the behavior of treating `#` at the start of a pattern as a comment. |
| `-n`, `--nonegate` | Suppress the behavior of treating a leading `!` character as negation. |
| `-e`, `--noext` | Disable "extglob" style patterns like `+(a¦b)`. |
| `-b`, `--nobrace` | Do not expand `{a,b}` and `{1..3}` brace sets. |
| `-m`, `--mathbase` | If set, then patterns without slashes will be matched against the basename of the path if it contains slashes. For example, `a?b` would match the path `/xyz/123/acb`, but not `/xyz/acb/123`. |

## Replace options
The following options can be used after `@`:

| Option | Result | Example |
| :---: | :--- | :--- |
| `f` | The path, name and extension of the file. | `./dir/file.ext` |
| `n` | The name of the file. | `file` |
| `e` | The extension of the file (with dot). | `.ext` |
| `r` | The relative path of the file. | `./dir/` |
| `p` | The full path of the file. | `/home/user/dir/` |
| `s` | The file size (in human redable format). | `1KB` |
| `z` | The file size (in bytes). | `1024` |
| `m` | The file's last modified timestamp. | `2016116043022876` |
| `t` | The file's creation timestamp. | `2016116043022876` |

If the options are preceeded by a `~` then the path will be unquoted.
Eg.: `@~f` will produce `./dir/file.ext`

## TODO
- Test against git bash and other *nix shells for completeness.
- Add attributes flag to file.
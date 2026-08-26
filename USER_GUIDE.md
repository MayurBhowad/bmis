# BMis User Guide

**Version:** v0.0.4

BMis is an interactive command-line key-value store. You type commands at the `BMis>` prompt; data lives in memory for that session only.

## Requirements

- [Node.js](https://nodejs.org/) (LTS recommended)
- No npm packages required

## Starting the CLI

From the project root:

```bash
node src/index.js
```

You should see:

```text
Welcome to BMis CLI
Type commands like: SET name Mayur
BMis>
```

Type a command and press Enter. After each response, the prompt returns so you can run another command.

To leave the session, press `Ctrl+C` (or close the terminal). All stored keys are discarded when the process exits.

## How commands work

- Commands are **case-insensitive** (`SET`, `set`, and `Set` are the same).
- Arguments are separated by whitespace.
- For `SET`, everything after the key is treated as the value (so values may contain spaces).
- Blank lines produce no output; the prompt simply returns.
- Data is **in-memory only** — nothing is written to disk.

## Commands

### SET — store a value

**Syntax:** `SET <key> <value>`

Stores `value` under `key`. If the key already exists, it is overwritten.

| Result | Meaning |
|--------|---------|
| `OK` | Value was stored |
| `ERR wrong number of arguments for SET command` | Missing key or value |

**Examples:**

```text
BMis> SET name Mayur
OK
BMis> SET greeting Hello World
OK
BMis> GET greeting
Hello World
```

### GET — retrieve a value

**Syntax:** `GET <key>`

Returns the value for `key`, or `null` if the key does not exist.

| Result | Meaning |
|--------|---------|
| *(value)* | Value stored for that key |
| `null` | Key is missing |
| `ERR wrong number of arguments for GET command` | Wrong number of arguments |

**Examples:**

```text
BMis> SET city Pune
OK
BMis> GET city
Pune
BMis> GET missing
null
```

### DEL — delete a key

**Syntax:** `DEL <key>`

Removes `key` if it exists.

| Result | Meaning |
|--------|---------|
| `1` | Key existed and was deleted |
| `0` | Key did not exist |
| `ERR wrong number of arguments for DEL command` | Wrong number of arguments |

**Examples:**

```text
BMis> SET temp 123
OK
BMis> DEL temp
1
BMis> DEL temp
0
```

### EXISTS — check if a key exists

**Syntax:** `EXISTS <key>`

Reports whether `key` is present in the store.

| Result | Meaning |
|--------|---------|
| `1` | Key exists |
| `0` | Key does not exist |
| `ERR wrong number of arguments for EXISTS command` | Wrong number of arguments |

**Examples:**

```text
BMis> SET user mayur
OK
BMis> EXISTS user
1
BMis> EXISTS other
0
```

## Errors

| Message | Cause |
|---------|--------|
| `ERR unknown command '<COMMAND>'` | Command name is not recognized |
| `ERR wrong number of arguments for <COMMAND> command` | Too few or too many arguments for that command |

**Examples:**

```text
BMis> FOO bar
ERR unknown command 'FOO'
BMis> SET
ERR wrong number of arguments for SET command
BMis> GET
ERR wrong number of arguments for GET command
```

## Sample session

```text
Welcome to BMis CLI
Type commands like: SET name Mayur
BMis> SET name Mayur
OK
BMis> GET name
Mayur
BMis> EXISTS name
1
BMis> DEL name
1
BMis> GET name
null
BMis> EXISTS name
0
```

## Current limitations

- No persistence — restarting clears all data
- No networking — local CLI only
- No key expiration, lists, hashes, or other data types yet
- No authentication or multi-user access

See the [README](./README.md) for project status and roadmap.

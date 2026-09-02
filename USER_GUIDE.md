# BMis User Guide

**Version:** v0.5.0

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
- Arguments are separated by whitespace; extra spaces between arguments are ignored.
- For `SET`, everything after the key is the value (spaces allowed), unless `EX seconds` is appended to set expiration in the same command.
- `GET` takes **exactly one** argument (the key). Extra arguments are an error. Returns `null` for missing or expired keys.
- `DEL` and `EXISTS` accept **one or more** keys and return a count.
- `EXPIRE` takes **exactly two** arguments: a key and a TTL in seconds.
- `TTL` takes **exactly one** argument (the key). Returns `-2` if the key is missing or expired, `-1` if the key has no expiration, or the remaining seconds otherwise.
- `TYPE` takes **exactly one** argument (the key). Returns `string` for stored values, or `none` if the key is missing or expired.
- `INCR` and `DECR` each take **exactly one** argument (the key). They operate on integer string values and return the new value as a number.
- `LPUSH` and `RPUSH` take a key followed by **one or more** values and return the new list length.
- `LPOP` and `RPOP` each take **exactly one** argument (the key) and return the removed value, or `null` if the list is missing.
- `LRANGE` takes a key, a start index, and a stop index (both inclusive). Use `-1` as the stop index to read through the last element.
- `LLEN` takes **exactly one** argument (the key) and returns the list length, or `0` if the key is missing.
- `SET` clears any existing expiration when overwriting a key. `INCR` and `DECR` also clear expiration when they update a key.
- Blank lines produce no output; the prompt simply returns.
- Data is **in-memory only** — nothing is written to disk.
- Supported types are **strings** (via `SET`) and **lists** (via `LPUSH` / `RPUSH`).

## Commands

### SET — store a value

**Syntax:** `SET <key> <value>` or `SET <key> <value> EX <seconds>`

Stores `value` under `key`. If the key already exists, it is overwritten and any existing expiration is cleared. Use `EX` to set expiration in seconds as part of the same command (`EX` must be the last option, followed by seconds).

| Result | Meaning |
|--------|---------|
| `OK` | Value was stored |
| `ERR wrong number of arguments for SET command` | Missing key or value |
| `ERR syntax error` | `EX` is missing seconds or is not in the correct position |
| `ERR invalid expire time in 'SET' command` | `EX` seconds is not a valid whole number |

**Examples:**

```text
BMis> SET name Mayur
OK
BMis> SET greeting Hello World
OK
BMis> GET greeting
Hello World
BMis> set name mayur
OK
BMis> SET session active EX 60
OK
BMis> TTL session
60
BMis> SET key value EX
ERR syntax error
BMis> SET key value EX abc
ERR invalid expire time in 'SET' command
BMis> SET key value EX 1.5
ERR invalid expire time in 'SET' command
```

### GET — retrieve a value

**Syntax:** `GET <key>`

Returns the value for `key`, or `null` if the key does not exist or has expired. Expired keys are removed when accessed.

| Result | Meaning |
|--------|---------|
| *(value)* | Value stored for that key |
| `null` | Key is missing or expired |
| `ERR wrong number of arguments for GET command` | Missing key, or more than one argument |

**Examples:**

```text
BMis> SET city Pune
OK
BMis> GET city
Pune
BMis> GET missing
null
BMis> GET
ERR wrong number of arguments for GET command
BMis> GET name extra
ERR wrong number of arguments for GET command
```

### DEL — delete one or more keys

**Syntax:** `DEL <key> [key ...]`

Removes each key if it exists. Returns the number of keys that were actually deleted.

| Result | Meaning |
|--------|---------|
| *(number)* | Count of keys that existed and were deleted |
| `ERR wrong number of arguments for DEL command` | No keys provided |

**Examples:**

```text
BMis> SET temp 123
OK
BMis> DEL temp
1
BMis> DEL temp
0
BMis> SET name Mayur
OK
BMis> SET city Mumbai
OK
BMis> DEL name city missing
2
BMis> DEL
ERR wrong number of arguments for DEL command
```

### EXISTS — check if one or more keys exist

**Syntax:** `EXISTS <key> [key ...]`

Reports how many of the given keys are present in the store. Use the full command name `EXISTS` (not `EXIST`).

| Result | Meaning |
|--------|---------|
| *(number)* | Count of keys that exist |
| `ERR wrong number of arguments for EXISTS command` | No keys provided |

**Examples:**

```text
BMis> SET user mayur
OK
BMis> EXISTS user
1
BMis> EXISTS other
0
BMis> SET city Mumbai
OK
BMis> EXISTS user city missing
2
BMis> EXISTS
ERR wrong number of arguments for EXISTS command
BMis> EXIST name
ERR unknown command 'EXIST'
```

### EXPIRE — set a key's time-to-live

**Syntax:** `EXPIRE <key> <seconds>`

Sets an expiration on an existing key. `seconds` must be a whole number (`0` expires the key immediately). After the TTL elapses, `GET` returns `null` and removes the key. `SET` on the same key clears the expiration.

| Result | Meaning |
|--------|---------|
| `1` | Expiration was set on an existing key |
| `0` | Key does not exist |
| `ERR wrong number of arguments for EXPIRE command` | Missing key or seconds, or too many arguments |
| `ERR value is not an integer or out of range` | Seconds is not a valid whole number |

**Examples:**

```text
BMis> SET session active
OK
BMis> EXPIRE session 60
1
BMis> EXPIRE session 0
1
BMis> GET session
null
BMis> EXPIRE missing 60
0
BMis> EXPIRE session
ERR wrong number of arguments for EXPIRE command
BMis> EXPIRE session abc
ERR value is not an integer or out of range
BMis> EXPIRE session 1.5
ERR value is not an integer or out of range
```

### TTL — get remaining time-to-live

**Syntax:** `TTL <key>`

Returns the remaining TTL for a key in seconds. Expired keys are removed when accessed and reported as missing.

| Result | Meaning |
|--------|---------|
| *(number ≥ 0)* | Remaining seconds until expiration |
| `-1` | Key exists but has no expiration |
| `-2` | Key does not exist, or has already expired |
| `ERR wrong number of arguments for TTL command` | Missing key, or more than one argument |

**Examples:**

```text
BMis> SET session active
OK
BMis> TTL session
-1
BMis> EXPIRE session 60
1
BMis> TTL session
60
BMis> TTL missing
-2
BMis> TTL
ERR wrong number of arguments for TTL command
BMis> TTL session extra
ERR wrong number of arguments for TTL command
```

### TYPE — get the type of a key

**Syntax:** `TYPE <key>`

Returns the type of the value stored at `key`. Expired keys are removed when accessed and reported as missing.

| Result | Meaning |
|--------|---------|
| `string` | Key holds a string value (set via `SET`) |
| `list` | Key holds a list (created via `LPUSH` or `RPUSH`) |
| `none` | Key does not exist, or has already expired |
| `ERR wrong number of arguments for TYPE command` | Missing key, or more than one argument |

**Examples:**

```text
BMis> SET name Mayur
OK
BMis> TYPE name
string
BMis> TYPE missing
none
BMis> TYPE
ERR wrong number of arguments for TYPE command
BMis> TYPE name extra
ERR wrong number of arguments for TYPE command
```

### INCR — increment an integer value

**Syntax:** `INCR <key>`

Increments the integer stored at `key` by 1. Values are stored as strings; the command returns the new value as a number. If the key does not exist, it is created with value `1`.

| Result | Meaning |
|--------|---------|
| *(number)* | New value after increment |
| `ERR wrong number of arguments for 'INCR' command` | Missing key, or more than one argument |
| `ERR value is not an integer or out of range` | Existing value is not a valid integer string |

**Examples:**

```text
BMis> SET counter 10
OK
BMis> INCR counter
11
BMis> GET counter
11
BMis> INCR newkey
1
BMis> SET counter hello
OK
BMis> INCR counter
ERR value is not an integer or out of range
BMis> INCR
ERR wrong number of arguments for 'INCR' command
```

### DECR — decrement an integer value

**Syntax:** `DECR <key>`

Decrements the integer stored at `key` by 1. Values are stored as strings; the command returns the new value as a number. If the key does not exist, it is created with value `-1`.

| Result | Meaning |
|--------|---------|
| *(number)* | New value after decrement |
| `ERR wrong number of arguments for 'DECR' command` | Missing key, or more than one argument |
| `ERR value is not an integer or out of range` | Existing value is not a valid integer string |

**Examples:**

```text
BMis> SET counter 10
OK
BMis> DECR counter
9
BMis> GET counter
9
BMis> DECR newkey
-1
BMis> SET counter hello
OK
BMis> DECR counter
ERR value is not an integer or out of range
BMis> DECR
ERR wrong number of arguments for 'DECR' command
```

### LPUSH — prepend to a list

**Syntax:** `LPUSH <key> <value> [value ...]`

Prepends one or more values to the head of a list. Creates the list if it does not exist. Returns the list length after the push.

| Result | Meaning |
|--------|---------|
| *(number)* | New list length |
| `ERR wrong number of arguments for LPUSH command` | Missing key or value |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> LPUSH fruits apple banana
2
BMis> LRANGE fruits 0 -1
banana,apple
BMis> LPUSH fruits orange
3
BMis> LRANGE fruits 0 -1
orange,banana,apple
```

### RPUSH — append to a list

**Syntax:** `RPUSH <key> <value> [value ...]`

Appends one or more values to the tail of a list. Creates the list if it does not exist. Returns the list length after the push.

| Result | Meaning |
|--------|---------|
| *(number)* | New list length |
| `ERR wrong number of arguments for RPUSH command` | Missing key or value |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> RPUSH fruits apple banana
2
BMis> LRANGE fruits 0 -1
apple,banana
BMis> RPUSH fruits orange
3
BMis> LRANGE fruits 0 -1
apple,banana,orange
```

### LPOP — remove the first list element

**Syntax:** `LPOP <key>`

Removes and returns the first element of the list.

| Result | Meaning |
|--------|---------|
| *(value)* | The removed element |
| `null` | List does not exist |
| `ERR wrong number of arguments for LPOP command` | Missing key |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> RPUSH fruits apple banana orange
3
BMis> LPOP fruits
apple
BMis> LRANGE fruits 0 -1
banana,orange
BMis> LPOP missing
null
```

### RPOP — remove the last list element

**Syntax:** `RPOP <key>`

Removes and returns the last element of the list.

| Result | Meaning |
|--------|---------|
| *(value)* | The removed element |
| `null` | List does not exist |
| `ERR wrong number of arguments for RPOP command` | Missing key |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> RPUSH fruits apple banana orange
3
BMis> RPOP fruits
orange
BMis> LRANGE fruits 0 -1
apple,banana
BMis> RPOP missing
null
```

### LRANGE — read a range from a list

**Syntax:** `LRANGE <key> <start> <stop>`

Returns elements from `start` through `stop`, both inclusive. Negative indices count from the end of the list (`-1` is the last element). Returns an empty list for a missing key or an out-of-range request.

| Result | Meaning |
|--------|---------|
| *(list)* | Elements in the requested range (printed comma-separated) |
| `ERR wrong number of arguments for LRANGE command` | Missing key, start, or stop |
| `ERR value is not an integer or out of range` | `start` or `stop` is not a valid integer |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> RPUSH fruits apple banana orange
3
BMis> LRANGE fruits 0 -1
apple,banana,orange
BMis> LRANGE fruits 0 1
apple,banana
BMis> LRANGE missing 0 -1

```

### LLEN — get list length

**Syntax:** `LLEN <key>`

Returns the number of elements in the list at `key`.

| Result | Meaning |
|--------|---------|
| *(number)* | List length |
| `0` | Key does not exist |
| `ERR wrong number of arguments for 'LLEN' command` | Missing key, or more than one argument |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> LPUSH numbers 1 2 3
3
BMis> LLEN numbers
3
BMis> LLEN missing
0
BMis> SET name Mayur
OK
BMis> LLEN name
WRONGTYPE Operation against a key holding the wrong kind of value
BMis> LLEN
ERR wrong number of arguments for 'LLEN' command
```

## Errors

| Message | Cause |
|---------|--------|
| `ERR unknown command '<COMMAND>'` | Command name is not recognized |
| `ERR wrong number of arguments for <COMMAND> command` | Too few or too many arguments for that command |
| `ERR value is not an integer or out of range` | `EXPIRE`, `INCR`, `DECR`, or `LRANGE` received a non-integer value |
| `ERR syntax error` | `SET ... EX` is missing seconds or `EX` is not in the correct position |
| `ERR invalid expire time in 'SET' command` | `SET ... EX` seconds argument is not a valid whole number |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | A list command was used on a non-list key |

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
BMis> TYPE name
string
BMis> SET session active EX 60
OK
BMis> TTL session
60
BMis> RPUSH fruits apple banana
2
BMis> TYPE fruits
list
BMis> LLEN fruits
2
BMis> LRANGE fruits 0 -1
apple,banana
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
- No hashes or other data types yet (strings and lists are supported)
- No authentication or multi-user access

See the [README](./README.md) for project status and roadmap.

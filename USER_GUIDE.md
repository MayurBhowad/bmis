# BMis User Guide

**Version:** v0.5.0

BMis is an in-memory key-value store with an interactive CLI and a TCP server. You can type commands at the `BMis>` prompt or send the same commands over TCP; data lives in memory for that process only and is shared across both interfaces.

## Requirements

- [Node.js](https://nodejs.org/) (LTS recommended)
- Project dependencies via `npm install` (TypeScript is a dev dependency)

## Starting BMis

From the project root:

```bash
npm install
npm run build
npm start
```

`npm start` runs the compiled entry point (`node dist/src/index.js`). It starts both the TCP server and the interactive CLI.

You should see:

```text
BMIS TCP server listening on 127.0.0.1:6379
Welcome to BMis CLI
Type commands like: SET name Mayur
BMis>
```

Type a command and press Enter. After each response, the prompt returns so you can run another command.

To leave the session, press `Ctrl+C` (or close the terminal). All stored keys are discarded when the process exits.

## TCP server

On start, BMis listens on **`127.0.0.1:6379`** (host and port are the current defaults in `TcpServer`).

- Commands are plain text, **one command per line** (newline-delimited). The same commands and arity rules as the CLI apply.
- Replies are **RESP**, terminated with `\r\n`:
  - `OK` → `+OK`
  - integers (`INCR`, `LLEN`, `LPOS` without `COUNT`, and similar) → `:<n>`
  - other strings (`GET`, popped elements, errors' text values) → `$<byte-length>` followed by the value. The length is the UTF-8 byte length.
  - `null` → `$-1` (the CLI prints `null`)
  - arrays (`LRANGE`, `LPOS ... COUNT`) → `*<count>` followed by one bulk string per element. Numeric indexes are sent as bulk strings, not integer replies.
  - errors (`ERR ...` and `WRONGTYPE ...`) → `-<message>`
  - a blank command produces no reply
- The TCP server and CLI share the same in-memory database in that process.
- Clients that send RESP commands (for example `redis-cli`) are not supported yet. Use a line-based client such as `nc`.

Example with `nc`:

```bash
nc 127.0.0.1 6379
```

```text
SET name Mayur
+OK
GET name
$5
Mayur
GET missing
$-1
RPUSH fruits apple banana
:2
LRANGE fruits 0 -1
*2
$5
apple
$6
banana
```

## How commands work

- Commands are **case-insensitive** (`SET`, `set`, and `Set` are the same).
- Arguments are separated by whitespace; extra spaces between arguments are ignored.
- For `SET`, everything after the key is the value (spaces allowed), unless `EX seconds` is appended to set expiration in the same command.
- `GET` takes **exactly one** argument (the key). Extra arguments are an error. Returns `null` for missing or expired keys.
- `DEL` and `EXISTS` accept **one or more** keys and return a count.
- `EXPIRE` takes **exactly two** arguments: a key and a TTL in seconds.
- `TTL` takes **exactly one** argument (the key). Returns `-2` if the key is missing or expired, `-1` if the key has no expiration, or the remaining seconds otherwise.
- `TYPE` takes **exactly one** argument (the key). Returns `string` or `list` for stored values, or `none` if the key is missing or expired.
- `INCR` and `DECR` each take **exactly one** argument (the key). They operate on integer string values and return the new value as a number.
- `LPUSH` and `RPUSH` take a key followed by **one or more** values and return the new list length.
- `LPOP` and `RPOP` each take **exactly one** argument (the key) and return the removed value, or `null` if the list is missing.
- `LRANGE` takes a key, a start index, and a stop index (both inclusive). Use `-1` as the stop index to read through the last element.
- `LLEN` takes **exactly one** argument (the key) and returns the list length, or `0` if the key is missing.
- `LINDEX` takes a key and an index. Negative indices count from the end of the list. Returns `null` if the key or index is out of range.
- `LSET` takes a key, an index, and a value. It updates the element at that index and returns `OK`.
- `LTRIM` takes a key, a start index, and a stop index (both inclusive). It keeps only that range and returns `OK`. An empty or out-of-bounds range deletes the key.
- `RPOPLPUSH` takes a source key and a destination key. It removes the last element of the source list and prepends it to the destination list, returning that element. The same key may be used for both to rotate the list.
- `LPOS` takes a key and an element, and optionally `RANK <rank>` and/or `COUNT <count>` (either order). Without `COUNT` it returns one zero-based index, or `null` if the key or match is missing. With `COUNT` it returns a list of indexes. Positive rank counts matches from the left; negative rank counts from the right. Rank `0` is invalid. `COUNT 0` returns every match from the chosen rank. A negative `COUNT` is rejected.
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

### LINDEX — get a list element by index

**Syntax:** `LINDEX <key> <index>`

Returns the element at `index` in the list. Indices are zero-based; negative indices count from the end (`-1` is the last element).

| Result | Meaning |
|--------|---------|
| *(value)* | Element at the given index |
| `null` | Key or index is out of range |
| `ERR wrong number of arguments for 'LINDEX' command` | Missing key or index, or too many arguments |
| `ERR value is not an integer or out of range` | Index is not a valid integer |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> RPUSH users Mayur John Rahul
3
BMis> LINDEX users 0
Mayur
BMis> LINDEX users -1
Rahul
BMis> LINDEX users 5
null
BMis> LINDEX missing 0
null
BMis> SET name Mayur
OK
BMis> LINDEX name 0
WRONGTYPE Operation against a key holding the wrong kind of value
BMis> LINDEX users abc
ERR value is not an integer or out of range
```

### LSET — set a list element by index

**Syntax:** `LSET <key> <index> <value>`

Sets the list element at `index` to `value`. Indices are zero-based; negative indices count from the end (`-1` is the last element). The key must already exist and hold a list.

| Result | Meaning |
|--------|---------|
| `OK` | Element was updated |
| `ERR wrong number of arguments for 'LSET' command` | Missing key, index, or value, or too many arguments |
| `ERR value is not an integer or out of range` | Index is not a valid integer |
| `ERR no such key` | Key does not exist |
| `ERR index out of range` | Index is outside the list bounds |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> RPUSH users Mayur John Rahul
3
BMis> LSET users 1 Amit
OK
BMis> LRANGE users 0 -1
Mayur,Amit,Rahul
BMis> LSET users -1 Akshay
OK
BMis> LINDEX users -1
Akshay
BMis> LSET missing 0 Mayur
ERR no such key
BMis> LSET users 5 Rahul
ERR index out of range
BMis> SET name Mayur
OK
BMis> LSET name 0 Rahul
WRONGTYPE Operation against a key holding the wrong kind of value
BMis> LSET users abc Rahul
ERR value is not an integer or out of range
```

### LTRIM — trim a list to a range

**Syntax:** `LTRIM <key> <start> <stop>`

Keeps only the elements from `start` through `stop` (inclusive) and removes the rest. Indices are zero-based; negative indices count from the end (`-1` is the last element). Out-of-range bounds are clamped. If the resulting range is empty or invalid, the key is deleted. A missing key still returns `OK`.

| Result | Meaning |
|--------|---------|
| `OK` | List was trimmed (or the key was missing / removed) |
| `ERR wrong number of arguments for LTRIM command` | Missing key, start, or stop, or too many arguments |
| `ERR value is not an integer or out of range` | `start` or `stop` is not a valid integer |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> RPUSH fruits apple banana orange
3
BMis> LTRIM fruits 1 2
OK
BMis> LRANGE fruits 0 -1
banana,orange
BMis> RPUSH names Mayur John Rahul Akshay
4
BMis> LTRIM names -3 -1
OK
BMis> LRANGE names 0 -1
John,Rahul,Akshay
BMis> RPUSH items a b c
3
BMis> LTRIM items 2 1
OK
BMis> LLEN items
0
BMis> LTRIM missing 0 1
OK
BMis> SET name Mayur
OK
BMis> LTRIM name 0 1
WRONGTYPE Operation against a key holding the wrong kind of value
```

### RPOPLPUSH — move the last element to another list

**Syntax:** `RPOPLPUSH <source> <destination>`

Removes the last element of `source` and prepends it to `destination`, then returns that element. If `destination` does not exist, it is created as a list containing that element. Using the same key for both rotates the list (the last element becomes the first). When the source list's last element is moved, the source key is deleted. A missing or empty source returns `null` and leaves `destination` unchanged. If either key exists and is not a list, nothing is moved.

| Result | Meaning |
|--------|---------|
| *(value)* | Element that was moved |
| `null` | Source is missing or empty |
| `ERR wrong number of arguments for RPOPLPUSH command` | Not exactly two keys |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Source or destination exists and is not a list |

**Examples:**

```text
BMis> RPUSH source A B C
3
BMis> RPUSH destination X Y
2
BMis> RPOPLPUSH source destination
C
BMis> LRANGE source 0 -1
A,B
BMis> LRANGE destination 0 -1
C,X,Y
BMis> RPOPLPUSH missing destination
null
BMis> RPUSH users A B C
3
BMis> RPOPLPUSH users users
C
BMis> LRANGE users 0 -1
C,A,B
BMis> SET name Mayur
OK
BMis> RPOPLPUSH name destination
WRONGTYPE Operation against a key holding the wrong kind of value
```

### LPOS — find the index of a list element

**Syntax:** `LPOS <key> <element> [RANK <rank>] [COUNT <count>]`

Returns the zero-based index of `element` in the list at `key`. Without `RANK`, the first match from the left is returned (rank `1`). `RANK n` selects the nth match counting from the left when `n` is positive, or from the right when `n` is negative. The returned index is always counted from the start of the list. Rank `0` is rejected.

`COUNT` changes the result from one index to a list of indexes. The CLI prints that list as a JavaScript array. `COUNT n` returns up to `n` matches, starting at the selected rank. `COUNT 0` returns every match from that rank. `RANK` and `COUNT` may appear in either order. With a negative rank, matches are collected while scanning from the right, so the indexes come back in right-to-left order. A missing element with `COUNT` returns an empty list. A missing key still returns `null`. A negative `COUNT` is rejected.

| Result | Meaning |
|--------|---------|
| *(index)* | Zero-based index of the selected match (no `COUNT`) |
| *(list of indexes)* | Matches selected by `COUNT` |
| `null` | No `COUNT`, and the key is missing, the element is absent, or the rank does not exist |
| `ERR wrong number of arguments for LPOS command` | Not 2, 4, or 6 arguments (each option needs its value) |
| `ERR syntax error` | An option is not `RANK` or `COUNT` |
| `ERR value is not an integer or out of range` | Rank is not a non-zero integer, or `COUNT` is not an integer |
| `ERR count should be > 0` | `COUNT` is negative |
| `WRONGTYPE Operation against a key holding the wrong kind of value` | Key exists but is not a list |

**Examples:**

```text
BMis> RPUSH users Mayur John Rahul
3
BMis> LPOS users John
1
BMis> LPOS users Akshay
null
BMis> LPOS missing John
null
BMis> RPUSH letters A B C B D B
6
BMis> LPOS letters B RANK 2
3
BMis> LPOS letters B RANK -1
5
BMis> LPOS letters B COUNT 2
[ 1, 3 ]
BMis> LPOS letters B COUNT 0
[ 1, 3, 5 ]
BMis> LPOS letters B RANK 2 COUNT 2
[ 3, 5 ]
BMis> LPOS letters B RANK -2 COUNT 2
[ 3, 1 ]
BMis> LPOS letters Z COUNT 1
[]
BMis> LPOS letters B RANK 0
ERR value is not an integer or out of range
BMis> LPOS letters B COUNT -1
ERR count should be > 0
BMis> SET name Mayur
OK
BMis> LPOS name Mayur
WRONGTYPE Operation against a key holding the wrong kind of value
```

## Errors

| Message | Cause |
|---------|--------|
| `ERR unknown command '<COMMAND>'` | Command name is not recognized |
| `ERR wrong number of arguments for <COMMAND> command` | Too few or too many arguments for that command |
| `ERR value is not an integer or out of range` | `EXPIRE`, `INCR`, `DECR`, `LRANGE`, `LINDEX`, `LSET`, `LTRIM`, or `LPOS` received a non-integer value (`LPOS` rank `0` is rejected the same way) |
| `ERR count should be > 0` | `LPOS` `COUNT` is negative (`COUNT 0` is allowed and means every match) |
| `ERR syntax error` | `SET ... EX` is missing seconds or `EX` is not in the correct position, or `LPOS` has an option other than `RANK` or `COUNT` |
| `ERR invalid expire time in 'SET' command` | `SET ... EX` seconds argument is not a valid whole number |
| `ERR no such key` | `LSET` was called on a missing key |
| `ERR index out of range` | `LSET` index is outside the list bounds |
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
BMIS TCP server listening on 127.0.0.1:6379
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
BMis> LSET fruits 1 mango
OK
BMis> LRANGE fruits 0 -1
apple,mango
BMis> RPUSH queue a b c d
4
BMis> LTRIM queue 1 2
OK
BMis> LRANGE queue 0 -1
b,c
BMis> RPOPLPUSH queue fruits
c
BMis> LPOS fruits c
0
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
- TCP commands are plain text, one per line; replies are RESP. Inbound RESP is not parsed yet. Default bind is `127.0.0.1:6379`
- No hashes or other data types yet (strings and lists are supported)
- No authentication or multi-user access

See the [README](./README.md) for project status and roadmap.

# BMis

**Version:** v0.5.0

In-memory data platform.

BMis starts as a minimal key-value engine and is evolving toward a networked database with persistence, messaging, and distributed capabilities.

## Current status

v0.5.0 — interactive CLI over an in-memory key-value store, with unit tests for the database, parser, and command executer. The database layer uses an injectable `Storage` backend (defaults to in-memory). Values are stored with type metadata — **strings** and **lists** are supported and can be inspected with `TYPE`. Integer strings can be incremented or decremented with `INCR` and `DECR`. Lists support `LPUSH`, `RPUSH`, `LPOP`, `RPOP`, `LRANGE`, and `LLEN`. Keys can expire via `EXPIRE`, `SET ... EX`, or remaining TTL can be queried with `TTL`; expired keys are removed lazily on `GET`, `TTL`, and `TYPE`, and `SET` clears expiration when overwriting a key.

| Command | Args | Description | Example |
|---------|------|-------------|---------|
| `SET` | key, value [`EX` seconds] | Store a key-value pair, optionally with expiration | `SET session active EX 60` → `OK` |
| `GET` | key | Retrieve a value by key | `GET name` → `Mayur` (or `null` if missing or expired) |
| `DEL` | key [key ...] | Remove one or more keys | `DEL name city` → `2` (count of keys deleted) |
| `EXISTS` | key [key ...] | Count how many keys exist | `EXISTS name missing` → `1` |
| `EXPIRE` | key, seconds | Set a key's time-to-live in seconds (`0` expires immediately) | `EXPIRE session 60` → `1` (or `0` if key missing) |
| `TTL` | key | Get remaining TTL in seconds | `TTL session` → `60` (or `-1` / `-2`; see below) |
| `TYPE` | key | Get the type of a key | `TYPE name` → `string` (or `list` / `none`) |
| `INCR` | key | Increment an integer string value by 1 | `INCR counter` → `11` (creates key as `1` if missing) |
| `DECR` | key | Decrement an integer string value by 1 | `DECR counter` → `9` (creates key as `-1` if missing) |
| `LPUSH` | key, value [value ...] | Prepend one or more values to a list | `LPUSH fruits apple banana` → `2` |
| `RPUSH` | key, value [value ...] | Append one or more values to a list | `RPUSH fruits apple banana` → `2` |
| `LPOP` | key | Remove and return the first list element | `LPOP fruits` → `apple` (or `null` if missing) |
| `RPOP` | key | Remove and return the last list element | `RPOP fruits` → `orange` (or `null` if missing) |
| `LRANGE` | key, start, stop | Return a range of list elements (inclusive) | `LRANGE fruits 0 -1` → full list |
| `LLEN` | key | Get the length of a list | `LLEN fruits` → `3` (or `0` if missing) |

Commands are case-insensitive. For `SET`, everything after the key is the value (spaces allowed), unless `EX seconds` is appended to set expiration in the same command.

Errors:

- Unknown command → `ERR unknown command '<COMMAND>'`
- Wrong arity → `ERR wrong number of arguments for <COMMAND> command`
- Invalid `EXPIRE` seconds (non-integer or out of range) → `ERR value is not an integer or out of range`
- Invalid `INCR` / `DECR` value (non-integer) → `ERR value is not an integer or out of range`
- Invalid `SET ... EX` syntax → `ERR syntax error`
- Invalid `SET ... EX` seconds → `ERR invalid expire time in 'SET' command`
- Wrong type for list operation → `WRONGTYPE Operation against a key holding the wrong kind of value`

## Project structure

```text
src/
├── index.js                      # Interactive CLI entry point
├── database/
│   ├── database.js               # Typed value store with injectable Storage backend
│   └── storage.js                # Low-level Map-backed storage layer
└── commands/
    ├── command-executer.js       # Routes parsed input to command handlers
    ├── parser.js                 # Parses CLI input into command and args
    ├── commands.js               # Command registry
    ├── set.js                    # SET command
    ├── get.js                    # GET command
    ├── del.js                    # DEL command
    ├── exists.js                 # EXISTS command
    ├── expire.js                 # EXPIRE command
    ├── ttl.js                    # TTL command
    ├── type.js                   # TYPE command
    ├── incr.js                   # INCR command
    ├── decr.js                   # DECR command
    ├── lpush.js                  # LPUSH command
    ├── rpush.js                  # RPUSH command
    ├── lpop.js                   # LPOP command
    ├── rpop.js                   # RPOP command
    ├── lrange.js                 # LRANGE command
    └── llen.js                   # LLEN command
tests/
├── database.test.js              # Database unit tests (node:test)
├── commands.test.js              # CommandExecuter / CLI command tests
└── parser.test.js                # CLI input parser tests
```

## Requirements

- [Node.js](https://nodejs.org/) (LTS recommended)

No external npm dependencies yet. Tests use the built-in `node:test` runner.

## Run

```bash
node src/index.js
```

## Test

```bash
npm test
```

For a full walkthrough of commands, responses, and errors, see **[USER_GUIDE.md](./USER_GUIDE.md)**.

Starts an interactive session:

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
BMis> SET
ERR wrong number of arguments for SET command
```

## Roadmap (high level)

Incremental versions toward:

- Multiple native data structures (strings and lists supported; hashes pending)
- Key expiration
- TCP networking and client-server communication
- RESP-compatible protocol
- Persistence (injectable `Storage` layer in place)
- Pub/Sub
- Replication and distributed capabilities

See **[BMis Mission — Redis-Inspired In-Memory Data Platform.md](./BMis%20Mission%20—%20Redis-Inspired%20In-Memory%20Data%20Platform.md)** for the full mission and design principles, and **[BMis — Docker Runtime Standard.md](./BMis%20—%20Docker%20Runtime%20Standard.md)** for the intended Docker-first runtime model.

## License

ISC

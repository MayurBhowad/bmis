# BMis

**Version:** v0.5.0

In-memory data platform.

BMis starts as a minimal key-value engine and is evolving toward a networked database with persistence, messaging, and distributed capabilities.

## Current status

v0.5.0 — TypeScript interactive CLI over an in-memory key-value store, with unit tests for the database, parser, and command executer. The database layer uses an injectable `Storage` backend (defaults to in-memory). Values are stored with type metadata — **strings** and **lists** are supported and can be inspected with `TYPE`. Integer strings can be incremented or decremented with `INCR` and `DECR`. Lists support `LPUSH`, `RPUSH`, `LPOP`, `RPOP`, `LRANGE`, `LLEN`, `LINDEX`, `LSET`, and `LTRIM`. Keys can expire via `EXPIRE`, `SET ... EX`, or remaining TTL can be queried with `TTL`; expired keys are removed lazily on `GET`, `TTL`, and `TYPE`, and `SET` clears expiration when overwriting a key.

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
| `LINDEX` | key, index | Get a list element by index | `LINDEX fruits 0` → `apple` (or `null` if out of range) |
| `LSET` | key, index, value | Set a list element at index | `LSET fruits 1 mango` → `OK` |
| `LTRIM` | key, start, stop | Trim a list to the given inclusive range | `LTRIM fruits 1 2` → `OK` |

Commands are case-insensitive. For `SET`, everything after the key is the value (spaces allowed), unless `EX seconds` is appended to set expiration in the same command.

Errors:

- Unknown command → `ERR unknown command '<COMMAND>'`
- Wrong arity → `ERR wrong number of arguments for <COMMAND> command`
- Invalid `EXPIRE` seconds (non-integer or out of range) → `ERR value is not an integer or out of range`
- Invalid `INCR` / `DECR` value (non-integer) → `ERR value is not an integer or out of range`
- Invalid `SET ... EX` syntax → `ERR syntax error`
- Invalid `SET ... EX` seconds → `ERR invalid expire time in 'SET' command`
- Wrong type for list operation → `WRONGTYPE Operation against a key holding the wrong kind of value`
- Missing list for `LSET` → `ERR no such key`
- Out-of-range index for `LSET` → `ERR index out of range`

## Project structure

```text
src/
├── index.ts                      # Interactive CLI entry point
├── types.ts                      # Shared TypeScript types
├── database/
│   ├── database.ts               # Typed value store with injectable Storage backend
│   └── storage.ts                # Low-level Map-backed storage layer
└── commands/
    ├── command-executer.ts       # Routes parsed input to command handlers
    ├── parser.ts                 # Parses CLI input into command and args
    ├── commands.ts               # Command registry
    ├── set.ts                    # SET command
    ├── get.ts                    # GET command
    ├── del.ts                    # DEL command
    ├── exists.ts                 # EXISTS command
    ├── expire.ts                 # EXPIRE command
    ├── ttl.ts                    # TTL command
    ├── type.ts                   # TYPE command
    ├── incr.ts                   # INCR command
    ├── decr.ts                   # DECR command
    ├── lpush.ts                  # LPUSH command
    ├── rpush.ts                  # RPUSH command
    ├── lpop.ts                   # LPOP command
    ├── rpop.ts                   # RPOP command
    ├── lrange.ts                 # LRANGE command
    ├── llen.ts                   # LLEN command
    ├── lindex.ts                 # LINDEX command
    ├── lset.ts                   # LSET command
    └── ltrim.ts                  # LTRIM command
tests/
├── database.test.ts              # Database unit tests (node:test)
├── commands.test.ts              # CommandExecuter / CLI command tests
└── parser.test.ts                # CLI input parser tests
```

## Requirements

- [Node.js](https://nodejs.org/) (LTS recommended)
- TypeScript (installed via `npm install`; used as a dev dependency)

Tests use the built-in `node:test` runner against the compiled `dist/` output.

## Run

```bash
npm install
npm run build
npm start
```

`npm start` runs the compiled CLI (`node dist/src/index.js`). `npm test` builds first, then runs tests from `dist/`.

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

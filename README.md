# BMis

**Version:** v0.0.8

In-memory data platform.

BMis starts as a minimal key-value engine and is evolving toward a networked database with persistence, messaging, and distributed capabilities.

## Current status

v0.0.8 — interactive CLI over an in-memory key-value store, with unit tests for the database and command executer. Values are stored internally with type metadata (strings only for now) and can be inspected with `TYPE`. Keys can expire via `EXPIRE` and remaining TTL can be queried with `TTL`; expired keys are removed lazily on `GET`, `TTL`, and `TYPE`, and `SET` clears expiration when overwriting a key.

| Command | Args | Description | Example |
|---------|------|-------------|---------|
| `SET` | key, value | Store a key-value pair | `SET name Mayur` → `OK` |
| `GET` | key | Retrieve a value by key | `GET name` → `Mayur` (or `null` if missing or expired) |
| `DEL` | key [key ...] | Remove one or more keys | `DEL name city` → `2` (count of keys deleted) |
| `EXISTS` | key [key ...] | Count how many keys exist | `EXISTS name missing` → `1` |
| `EXPIRE` | key, seconds | Set a key's time-to-live in seconds (`0` expires immediately) | `EXPIRE session 60` → `1` (or `0` if key missing) |
| `TTL` | key | Get remaining TTL in seconds | `TTL session` → `60` (or `-1` / `-2`; see below) |
| `TYPE` | key | Get the type of a key | `TYPE name` → `string` (or `none` if missing or expired) |

Commands are case-insensitive. For `SET`, everything after the key is the value (spaces allowed).

Errors:

- Unknown command → `ERR unknown command '<COMMAND>'`
- Wrong arity → `ERR wrong number of arguments for <COMMAND> command`
- Invalid `EXPIRE` seconds (non-integer or out of range) → `ERR value is not an integer or out of range`

## Project structure

```text
src/
├── index.js                      # Interactive CLI entry point
├── database/
│   └── database.js               # In-memory typed value store with expiration and TTL
└── commands/
    ├── command-executer.js       # Parses input and routes to handlers
    ├── set.js                    # SET command
    ├── get.js                    # GET command
    ├── del.js                    # DEL command
    ├── exists.js                 # EXISTS command
    ├── expire.js                 # EXPIRE command
    ├── ttl.js                    # TTL command
    └── type.js                   # TYPE command
tests/
├── database.test.js              # Database unit tests (node:test)
└── commands.test.js              # CommandExecuter / CLI command tests
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

- Multiple native data structures (typed value storage in place; strings only)
- Key expiration
- TCP networking and client-server communication
- RESP-compatible protocol
- Persistence
- Pub/Sub
- Replication and distributed capabilities

See **[BMis Mission — Redis-Inspired In-Memory Data Platform.md](./BMis%20Mission%20—%20Redis-Inspired%20In-Memory%20Data%20Platform.md)** for the full mission and design principles, and **[BMis — Docker Runtime Standard.md](./BMis%20—%20Docker%20Runtime%20Standard.md)** for the intended Docker-first runtime model.

## License

ISC

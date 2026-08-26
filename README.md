# BMis

**Version:** v0.0.4

In-memory data platform.

BMis starts as a minimal key-value engine and is evolving toward a networked database with persistence, messaging, and distributed capabilities.

## Current status

v0.0.4 — interactive CLI over an in-memory key-value store.

| Command | Args | Description | Example |
|---------|------|-------------|---------|
| `SET` | key, value | Store a key-value pair | `SET name Mayur` → `OK` |
| `GET` | key | Retrieve a value by key | `GET name` → `Mayur` (or `null` if missing) |
| `DEL` | key | Remove a key | `DEL name` → `1` (or `0` if missing) |
| `EXISTS` | key | Check whether a key exists | `EXISTS name` → `1` (or `0` if missing) |

Commands are case-insensitive.

Errors:

- Unknown command → `ERR unknown command '<COMMAND>'`
- Wrong arity → `ERR wrong number of arguments for <COMMAND> command`

## Project structure

```text
src/
├── index.js                      # Interactive CLI entry point
├── database/
│   └── database.js               # In-memory Map-backed store
└── commands/
    └── command-executer.js       # Parses and routes commands
```

## Requirements

- [Node.js](https://nodejs.org/) (LTS recommended)

No external npm dependencies yet.

## Run

```bash
node src/index.js
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

- Multiple native data structures
- Key expiration
- TCP networking and client-server communication
- RESP-compatible protocol
- Persistence
- Pub/Sub
- Replication and distributed capabilities

See **[BMis Mission — Redis-Inspired In-Memory Data Platform.md](./BMis%20Mission%20—%20Redis-Inspired%20In-Memory%20Data%20Platform.md)** for the full mission and design principles, and **[BMis — Docker Runtime Standard.md](./BMis%20—%20Docker%20Runtime%20Standard.md)** for the intended Docker-first runtime model.

## License

ISC

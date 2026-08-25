# BMis

In-memory data platform.

BMis starts as a minimal key-value engine and is evolving toward a networked database with persistence, messaging, and distributed capabilities.

## Current status

Early prototype: an in-memory store with `SET` and `GET` command execution.

| Command | Description | Example |
|---------|-------------|---------|
| `SET` | Store a key-value pair | `SET name Mayur` → `OK` |
| `GET` | Retrieve a value by key | `GET name` → `Mayur` |

Unknown commands return: `ERR unknown command '<COMMAND>'`.

## Project structure

```text
src/
├── index.js                      # Entry point / smoke demo
├── database/
│   └── database.js               # In-memory Map-backed store
└── commands/
    └── command-executer.js       # Parses and routes SET / GET
```

## Requirements

- [Node.js](https://nodejs.org/) (LTS recommended)

No external npm dependencies yet.

## Run

```bash
node src/index.js
```

Expected output:

```text
OK
Mayur
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

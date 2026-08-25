# BMis

## Mission Document

**BMis** is a high-performance, Redis-inspired in-memory data platform designed and built from first principles.

The mission is to design, implement, test, and evolve BMis into a fully networked in-memory database system with persistence, messaging, and distributed capabilities.

---

# 1. Mission

Build BMis from a minimal in-memory key-value engine into a complete data platform.

The system will progressively support:

- In-memory data storage
- Multiple native data structures
- Key expiration
- TCP networking
- Client-server communication
- RESP-compatible protocol support
- Persistence
- Pub/Sub messaging
- Replication
- Distributed capabilities

The project will be developed incrementally. Every version must be functional, tested, and independently usable.

---

# 2. Operating Principle

```text
BUILD
  ↓
TEST
  ↓
BREAK
  ↓
ANALYZE
  ↓
REDESIGN
  ↓
IMPROVE
  ↓
SHIP NEXT VERSION
```

No feature is considered complete until its behavior, limitations, complexity, and failure modes are understood and documented.

---

# 3. System Vision

```text
                        ┌───────────────┐
                        │    Clients    │
                        │ CLI / Services│
                        └───────┬───────┘
                                │
                                │ TCP
                                ▼
                        ┌───────────────┐
                        │  BMis Server  │
                        └───────┬───────┘
                                │
                                ▼
                        ┌───────────────┐
                        │   Protocol    │
                        │    Engine     │
                        └───────┬───────┘
                                │
                                ▼
                        ┌───────────────┐
                        │ Command Engine│
                        └───────┬───────┘
                                │
                                ▼
                 ┌──────────────────────────┐
                 │      Data Engine         │
                 │                          │
                 │ String                   │
                 │ Hash                     │
                 │ List                     │
                 │ Set                      │
                 │ Sorted Set               │
                 └────────────┬─────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Expiration Engine      Persistence
                    │                   │
                    └─────────┬─────────┘
                              ▼
                         Messaging
                              │
                              ▼
                         Replication
```

---

# 4. Project Stack

## Initial Platform

```text
Runtime: Node.js
Language: TypeScript
Networking: TCP
Protocol: RESP-compatible
Testing: Automated test suite
```

The architecture must remain modular enough to support future implementations in other languages.

---

# 5. Architecture

```text
bmis/
├── src/
│   ├── server/
│   │   ├── tcp-server.ts
│   │   └── connection.ts
│   │
│   ├── protocol/
│   │   ├── parser.ts
│   │   └── serializer.ts
│   │
│   ├── commands/
│   │   ├── dispatcher.ts
│   │   └── handlers/
│   │
│   ├── database/
│   │   ├── database.ts
│   │   ├── object.ts
│   │   └── data-types/
│   │
│   ├── expiration/
│   │   └── expiration-engine.ts
│   │
│   ├── persistence/
│   │   ├── aof.ts
│   │   └── snapshot.ts
│   │
│   ├── pubsub/
│   │
│   ├── replication/
│   │
│   └── index.ts
│
├── tests/
├── docs/
├── package.json
└── README.md
```

---

# 6. Execution Phases

## Phase 0 — Foundation

### Objective

Establish the BMis project infrastructure.

### Deliverables

- [ ] Initialize repository
- [ ] Configure TypeScript
- [ ] Configure test environment
- [ ] Create project structure
- [ ] Create application entry point
- [ ] Establish documentation
- [ ] Create initial commit

### Exit Criteria

```text
npm run dev
```

successfully starts BMis.

---

# Phase 1 — Core Data Engine

### Objective

Implement the core in-memory storage engine.

### Commands

```text
SET key value
GET key
DEL key
EXISTS key
```

### Architecture

```text
Command
   │
   ▼
Database Engine
   │
   ▼
In-Memory Store
```

### Exit Criteria

- [ ] Keys can be created
- [ ] Values can be retrieved
- [ ] Keys can be deleted
- [ ] Existence can be checked
- [ ] Automated tests pass

---

# Phase 2 — Command Engine

### Objective

Create an extensible command execution system.

```text
Raw Input
    │
    ▼
Parser
    │
    ▼
Command
    │
    ▼
Dispatcher
    │
    ├── SET
    ├── GET
    ├── DEL
    └── EXISTS
```

### Exit Criteria

- [ ] Commands are independently implemented
- [ ] Command validation exists
- [ ] Unknown commands return structured errors
- [ ] New commands can be registered cleanly

---

# Phase 3 — Native Data Structures

### Objective

Expand BMis into a multi-data-type platform.

```text
BMis Object
│
├── STRING
├── LIST
├── HASH
├── SET
└── ZSET
```

### Deliverables

#### Strings

- [ ] SET
- [ ] GET
- [ ] INCR
- [ ] DECR
- [ ] APPEND

#### Lists

- [ ] LPUSH
- [ ] RPUSH
- [ ] LPOP
- [ ] RPOP
- [ ] LRANGE

#### Hashes

- [ ] HSET
- [ ] HGET
- [ ] HDEL
- [ ] HGETALL

#### Sets

- [ ] SADD
- [ ] SREM
- [ ] SMEMBERS
- [ ] SISMEMBER

#### Sorted Sets

- [ ] ZADD
- [ ] ZRANGE
- [ ] ZREM
- [ ] ZSCORE

---

# Phase 4 — Expiration Engine

### Objective

Implement automatic key expiration.

### Commands

```text
EXPIRE
TTL
PERSIST
```

### Architecture

```text
Main Store
    │
    ├── Key → Value
    │
    └── Expiration Index
            │
            └── Key → Expiration Time
```

### Strategies

- [ ] Lazy expiration
- [ ] Active expiration
- [ ] Background cleanup

### Exit Criteria

Expired keys are inaccessible and eventually removed from memory.

---

# Phase 5 — Network Server

### Objective

Expose BMis as a network-accessible database server.

```text
Client
   │
   │ TCP
   ▼
BMis Server
   │
   ▼
Command Engine
   │
   ▼
Data Engine
```

### Deliverables

- [ ] TCP server
- [ ] Connection lifecycle management
- [ ] Request handling
- [ ] Response handling
- [ ] Multiple client support

---

# Phase 6 — BMis CLI

### Objective

Create an interactive client.

```text
$ bmis-cli

BMis> SET name Mayur
OK

BMis> GET name
"Mayur"
```

### Exit Criteria

The CLI communicates exclusively through the network interface.

---

# Phase 7 — Protocol Engine

### Objective

Implement RESP-compatible communication.

```text
TCP Bytes
    │
    ▼
Protocol Parser
    │
    ▼
Command
    │
    ▼
Command Engine
    │
    ▼
Response Serializer
    │
    ▼
TCP Response
```

### Critical Requirements

- [ ] Partial packets
- [ ] Multiple commands in one buffer
- [ ] Large payloads
- [ ] Protocol errors
- [ ] Correct response serialization

---

# Phase 8 — Persistence

## AOF

### Objective

Persist write operations.

```text
Write Command
      │
      ├──────► Data Engine
      │
      └──────► Append Only File
```

### Deliverables

- [ ] Append writes
- [ ] Replay on startup
- [ ] Recovery testing
- [ ] Corruption handling strategy

---

## Snapshot Engine

### Objective

Persist complete database state.

```text
Memory
   │
   ▼
Serializer
   │
   ▼
Snapshot
```

### Deliverables

- [ ] Snapshot creation
- [ ] Snapshot loading
- [ ] Scheduled snapshots
- [ ] Recovery process

---

# Phase 9 — Messaging

### Objective

Implement Pub/Sub communication.

```text
Publisher
    │
    ▼
 Channel
    │
 ┌──┼──┐
 ▼  ▼  ▼
 S1 S2 S3
```

### Commands

- [ ] SUBSCRIBE
- [ ] UNSUBSCRIBE
- [ ] PUBLISH

---

# Phase 10 — Replication

### Objective

Synchronize BMis nodes.

```text
          ┌─────────────┐
          │   Primary   │
          └──────┬──────┘
                 │
          Replication Stream
                 │
        ┌────────┴────────┐
        ▼                 ▼
     Replica 1         Replica 2
```

### Deliverables

- [ ] Primary node
- [ ] Replica node
- [ ] Initial synchronization
- [ ] Incremental updates
- [ ] Replica recovery

---

# 7. Version Targets

```text
v0.1  Core Data Engine
v0.2  Command Engine
v0.3  Native Data Structures
v0.4  Expiration Engine
v0.5  TCP Server
v0.6  CLI
v0.7  Protocol Engine
v0.8  AOF Persistence
v0.9  Snapshot Engine
v1.0  Pub/Sub
v1.1  Replication
```

---

# 8. Engineering Standards

Every feature must include:

- [ ] Implementation
- [ ] Automated tests
- [ ] Error handling
- [ ] Complexity analysis
- [ ] Memory considerations
- [ ] Failure scenarios
- [ ] Architecture notes

Every significant engineering decision must document:

```text
Problem

Decision

Alternatives

Tradeoffs

Complexity

Failure Modes

Future Improvements
```

---

# 9. Mission Control

This section is updated continuously.

## Current Version

```text
v0.0.0
```

## Current Phase

```text
Phase 0 — Foundation
```

## Current Objective

```text
Establish the BMis project and development foundation.
```

## Current Task

- [ ] Initialize BMis repository
- [ ] Initialize Node.js and TypeScript
- [ ] Configure development scripts
- [ ] Configure tests
- [ ] Create project structure
- [ ] Start application successfully
- [ ] Create initial commit

## Blockers

```text
None
```

## Next Milestone

```text
v0.1 — Core Data Engine
```

---

# 10. Definition of Completion

BMis reaches mission completion when it operates as an independently usable in-memory data platform with:

- Native data structures
- Network access
- Protocol handling
- Expiration
- Persistence
- Messaging
- Replication

The system must be modular, testable, observable, and capable of evolving beyond the initial architecture.

---

# PROJECT COMMAND

When continuing work on BMis:

```text
1. Read Mission Control
2. Identify current task
3. Complete only the active objective
4. Test the implementation
5. Update Mission Control
6. Commit progress
7. Move to the next objective
```

> **One mission. One system. One milestone at a time.**
# Docker Runtime Standard

BMis will run inside Docker from the beginning.

The host machine should not be responsible for running the BMis runtime directly.

The standard execution model is:

```text
Developer
    │
    │ docker compose up
    ▼
┌──────────────────────────────┐
│         Docker Engine        │
│                              │
│   ┌──────────────────────┐   │
│   │     BMis Server      │   │
│   │                      │   │
│   │      Node.js         │   │
│   │   TypeScript Runtime │   │
│   └──────────┬───────────┘   │
│              │               │
│              ▼               │
│       In-Memory Engine       │
│                              │
└──────────────────────────────┘
```

---

# Container Strategy

## Development

```text
docker compose up
```

Responsibilities:

- Start BMis
- Mount source code
- Support live development
- Expose the BMis port
- Keep the environment reproducible

## Production

```text
docker build -t bmis .
docker run bmis
```

Responsibilities:

- Build the application
- Package runtime dependencies
- Run a minimal production image

---

# Initial Container Architecture

```text
BMis Project
│
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
│
└── src/
    │
    └── BMis Application
```

Initial runtime:

```text
Host Machine
     │
     │ Port Mapping
     ▼
localhost:7379
     │
     ▼
Docker Container
     │
     ▼
BMis Server
     │
     ▼
In-Memory Database
```

---

# Port Standard

BMis will initially use:

```text
BMis Server: 7379
```

Example:

```text
Host
localhost:7379
        │
        ▼
Docker
bmis:7379
```

The port is intentionally separate from Redis default port `6379`.

---

# Docker Compose Services

Initial phase:

```text
services
│
└── bmis
```

Future phases:

```text
services
│
├── bmis
├── bmis-cli
├── bmis-replica-1
├── bmis-replica-2
└── monitoring
```

---

# Development Command Standard

All project operations should eventually be accessible through:

```bash
docker compose up
docker compose down
docker compose logs -f
docker compose exec bmis ...
```

---

# Persistence Strategy

When persistence is introduced, data must survive container recreation.

```text
BMis Container
       │
       ▼
Docker Volume
       │
       ├── appendonly.aof
       │
       └── snapshots/
```

Example architecture:

```text
┌─────────────────────┐
│   BMis Container    │
│                     │
│  Memory Database    │
│         │           │
│         ▼           │
│   Persistence Layer │
└──────────┬──────────┘
           │
           ▼
     Docker Volume
           │
           ├── AOF
           └── Snapshots
```

---

# Mission Control Update

## Runtime

```text
Docker
```

## Primary Development Command

```bash
docker compose up
```

## Initial Service

```text
bmis
```

## Initial Port

```text
7379
```

## Current Task

- [ ] Create project directory
- [ ] Initialize Docker configuration
- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Start empty BMis container
- [ ] Verify container logs
- [ ] Verify port mapping
- [ ] Add application runtime
- [ ] Commit foundation

---

# Rule

> BMis must be reproducible from a fresh machine using Docker.

The target startup flow is:

```bash
git clone <repository>
cd bmis
docker compose up
```

That should be enough to bring the system online.
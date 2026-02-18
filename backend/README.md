## Entry Flow

    server.ts → app.ts → routes.ts → modules

## Layer Responsibilities

    server.ts => Boots the app. Loads config, starts HTTP listener.
    app.ts => Wires up Express. Registers global middleware (cors, json, morgan)and mounts the root router.

## Module Structure

Each module is self-contained and owns its vertical slice.

```
user/
	index.ts       — public API of the module, re-exports what other modules need
	routes.ts      — maps HTTP verbs + URLs to controller methods
	controller.ts  — handles req/res, calls service, returns response
	service.ts     — business logic, validation, orchestration
	types.ts       — DTOs (request/response shapes)
```

### Data Flow

Request → router → controller → service → db → service → controller → response

### Rule of thumb

- Controller knows about HTTP (req, res). Nothing else does.
- Service knows about business rules. Not HTTP, not SQL.
- DB queries live in the service (or a repository if queries get complex).
- index.ts only exports, never implements.

## DATABASE (postgres/neon)

1. Define schema in src/db/schema.ts
2. generate migration sql by 'bun db:generate' , will generate db/migrations/\*.sql
3. apply migration to db using 'bun db:migrate'

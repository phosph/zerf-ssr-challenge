# Zerf SSR Challenge - API

This directory contains the API for the Zerf SSR Challenge. It is built with [Fastify](https://www.fastify.io/) and connects to a PostgreSQL database.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v22.19.0 o superior)
- pnpm
- PostgreSQL

## Installation

1.  Clone the repository (if you haven't already).
2.  Navigate to the monorepo's root directory and run:
    ```shell
    pnpm install
    ```

## Configuration

This project requires a `.env` file in the `/api` directory for environment variables, primarily for the database connection.

1.  Create a `.env` file in the root of this directory (`/api`).
2.  Add the necessary variables. At a minimum, you will need the connection URL for your PostgreSQL database:
    ```env
    # .env
    DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
    ```

### Database Setup for New Developers

This project uses Graphile Migrate to manage the database schema. Follow these steps to set up your local database for the first time.

**1. Prerequisites**

*   A running PostgreSQL server.
*   A PostgreSQL user (role) with `CREATEDB` privileges. Graphile Migrate needs this to create your development database automatically.

    *You can create this role by connecting to Postgres as a superuser and running:*
    ```sql
    CREATE ROLE your_user WITH LOGIN PASSWORD 'your_password' CREATEDB;
    ```

**2. Configure your `.env` file**

Copy `.env.example` to `.env` and fill in the database URLs. It's crucial to set `ROOT_DATABASE_URL` to a user with `CREATEDB` rights.

```env
# .env
# User with permission to create databases
ROOT_DATABASE_URL="postgres://your_user:your_password@localhost:5432/postgres"

# The main application database
DATABASE_URL="postgres://your_user:your_password@localhost:5432/zerf_db"

# A temporary database for migration checks
SHADOW_DATABASE_URL="postgres://your_user:your_password@localhost:5432/zerf_db_shadow"
```

**3. Create and Migrate the Database**

Run the following command from the `/api` directory. It will drop the old databases (if they exist), create new ones, and run all migrations.

```bash
pnpm graphile-migrate reset --erase-db-from-scratch
```

Your database is now ready for development. To apply future migrations, you can simply run `pnpm db-migrate`.

## Available Scripts

You can run the following scripts from the `/api` directory:

| Script | Description |
| :--- | :--- |
| `pnpm dev` | Starts the development server. |
| `pnpm build` | Compiles the TypeScript project to JavaScript for production in the `dist/` directory. |
| `pnpm test` | Runs the unit and integration tests using Mocha. |
| `pnpm test:coverage` | Runs the tests and generates a code coverage report. |
| `pnpm db-migrate` | Applies pending database migrations using Graphile Migrate. |
| `pnpm graphile-migrate ...` | Allows running specific Graphile Migrate commands (e.g., `pnpm graphile-migrate create <migration_name>`). |

### Database Migrations

Database migrations are managed with **Graphile Migrate**.

To create a new migration:
```bash
pnpm graphile-migrate create my-new-migration
```

Para aplicar todas las migraciones pendientes a la base de datos:
```bash
pnpm db-migrate
```

## Tecnologías Principales

- **Framework:** Fastify
- **Base de Datos:** PostgreSQL
- **ORM/Cliente DB:** node-postgres (pg)
- **Migraciones:** Graphile Migrate
- **Testing:** Mocha
- **Bundler:** esbuild

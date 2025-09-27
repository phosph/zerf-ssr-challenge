# Zerf SSR Challenge

This monorepo contains the source code for the "Zerf SSR Challenge". The project is structured as a collection of applications and shared libraries managed via pnpm workspaces.

## Project Structure

The monorepo is organized into the following packages:

*   `api/`: The backend API built with Fastify. It handles business logic, database communication (PostgreSQL), and payment service integration.
*   `ui/`: The public-facing mobile UI, developed with Next.js. It is designed for end-users to make tip payments.
*   `dashboard/`: The administrative dashboard, also built with Next.js. It allows for the visualization of payment statistics, transactions, and other relevant data.
*   `common/`: An internal shared library containing TypeScript types, utilities, and shared logic consumed by other packages in the monorepo to promote code reuse.

## Getting Started

To set up and run the development environment, follow these steps.

### Prerequisites

Ensure the following software is installed on your system:

*   **Node.js**: `v22.19.0` or higher
*   **pnpm**: `v3` or higher
*   **Docker** and **Docker Compose** (for running the database and API services)

### Instalación

1.  Clone this repository to your local machine.
2.  Navigate to the project root and execute the following command to install all workspace dependencies:
    ```bash
    pnpm install
    ```

### Environment Configuration

The API service requires environment variables for database connectivity.

1.  Navigate to the `api/` directory.
2.  Create a `.env` file by copying the `.env.example` template.
3.  Ensure the variables in `api/.env` are configured for your local environment. The default values are suitable for use with the provided `compose.yml` file.

    For detailed database setup instructions, refer to the `api/README.md` file.

### Running the Application

Each application can be launched from the monorepo root directory:

*   **To run the API and its database (via Docker):**
    ```bash
    pnpm --filter zerf-ssr-challenge-api dev
    ```

*   **To run the mobile UI:**
    ```bash
    pnpm --filter ui dev
    ```

*   **To run the Dashboard:**
    ```bash
    pnpm --filter dashboard dev
    ```

## Technical Stack

*   **Frameworks:** Next.js (for `ui` and `dashboard`), Fastify (for `api`).
*   **Language:** TypeScript.
*   **Database:** PostgreSQL.
*   **Package Manager:** pnpm with Workspaces.
*   **Containerization:** Docker and Docker Compose.
*   **Bundler:** esbuild for the API, Next.js (Turbopack/Webpack) for the frontends.
*   **Testing:** Mocha and Sinon.js.

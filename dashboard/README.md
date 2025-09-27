# Zerf SSR Challenge - Dashboard

This package contains the administrative dashboard for the Zerf SSR Challenge. It is a Next.js application designed to visualize payment statistics, transactions, and other relevant data from the API.

## Getting Started

To run this application locally, ensure you have followed the setup instructions in the root `README.md`.

### Prerequisites

*   All monorepo dependencies installed via `pnpm install` in the root directory.
*   The API service must be running, as this dashboard fetches data from it.

### Environment Configuration

This project may require a local environment file to specify the API endpoint.

1.  In the `dashboard/` directory, create a `.env.local` file.
2.  Add the following variable, pointing to your running API instance:
    ```env
    # dashboard/.env.local
    NEXT_PUBLIC_API_ENDPOINT=http://localhost:3001
    ```

### Running the Development Server

You can run the development server from the root of the monorepo:
```bash
pnpm --filter dashboard dev
```

Alternatively, you can run it directly from the `dashboard/` directory:
```bash
pnpm dev
```

The application will be available at `http://localhost:3002`.

## Core Technologies

*   **Framework**: Next.js (with Turbopack)
*   **Styling**: Tailwind CSS
*   **UI Components**: Radix UI
*   **Charting**: Recharts
*   **Icons**: Lucide React
*   **Shared Code**: Consumes the `common` workspace package for types and utilities.


# Zerf SSR Challenge - UI

This package contains the public-facing mobile UI for the Zerf SSR Challenge. It is a Next.js application designed for end-users to make tip payments.

## Getting Started

To run this application locally, ensure you have followed the setup instructions in the root `README.md`.

### Prerequisites

*   All monorepo dependencies installed via `pnpm install` in the root directory.
*   The API service must be running, as this UI makes requests to it.

### Environment Configuration

This project requires a local environment file to function correctly.

1.  In the `ui/` directory, create a `.env.local` file by copying the example:
    ```bash
    cp .env.example .env.local
    ```
2.  Open `.env.local` and fill in the required values:
    *   `NEXT_PUBLIC_SHIFT4_PUBLIC_KEY`: Your public key from the Shift4 payment provider.
    *   `NEXT_PUBLIC_API_ENDPOINT`: The URL where the backend API is running (e.g., `http://localhost:3001`).

### Running the Development Server

You can run the development server from the root of the monorepo:
```bash
pnpm --filter zerf-ssr-challenge-ui dev
```

Alternatively, you can run it directly from the `ui/` directory:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Core Technologies

*   **Framework**: Next.js (with Turbopack)
*   **Styling**: Tailwind CSS
*   **UI Components**: Radix UI
*   **State Management**: Zustand
*   **Shared Code**: Consumes the `common` workspace package for types and utilities.


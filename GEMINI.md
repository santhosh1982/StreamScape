# Project Overview

This is a full-stack video streaming application built with a modern tech stack. The project is structured as a monorepo with a `client`, `server`, and `shared` directory.

## Technologies

*   **Frontend:**
    *   React
    *   Vite
    *   TypeScript
    *   Tailwind CSS
    *   Wouter (for routing)
    *   Radix UI (for UI components)
*   **Backend:**
    *   Node.js
    *   Express
    *   TypeScript
    *   Drizzle ORM (with Neon as the database provider)
    *   Passport.js (for authentication)
*   **Shared:**
    *   Zod (for data validation)

## Architecture

The application follows a client-server architecture.

*   The `client` directory contains the React frontend, which is built with Vite.
*   The `server` directory contains the Express backend, which provides a RESTful API for the client.
*   The `shared` directory contains code that is shared between the client and server, such as the database schema and data validation logic.

# Building and Running

## Development

To start the development server, run the following command:

```bash
npm run dev
```

This will start both the frontend and backend servers in development mode. The frontend will be available at `http://localhost:5173` and the backend will be available at `http://localhost:5000`.

## Production

To build the application for production, run the following command:

```bash
npm run build
```

This will create a `dist` directory with the production-ready assets.

To start the production server, run the following command:

```bash
npm run start
```

# Development Conventions

## Coding Style

The project uses Prettier for code formatting. Please ensure that you have the Prettier extension installed in your editor and that it is configured to format on save.

## Testing

TODO: Add information about the testing strategy.

## Commits

TODO: Add information about the commit message format.
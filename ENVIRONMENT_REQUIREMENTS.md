# Environment Requirements

The following environment variables and configurations are MANDATORY for the application to start.

## 1. Required Environment Variables

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | **YES** | `postgresql://user:password@host:5432/dbname?schema=public` |
| `PORT` | HTTP Port for the server | No (Defaults to 3001) | `3001` |
| `JWT_SECRET` | Secret key for JWT signing | **YES** (Recommended) | `super-secret-key` |

## 2. Infrastructure Prerequisites

*   **Node.js**: Version 18+ (Verified: v25.2.1 detected in environment)
*   **Database**: PostgreSQL 13+
    *   Must be accessible from the application host.
    *   Must allow connection from the credentials provided in `DATABASE_URL`.
*   **Prisma**:
    *   Schema must be synchronized with the database (`npx prisma migrate deploy`).
    *   Client must be generated (`npx prisma generate`).

## 3. Configuration Loading
The application uses `dotenv` for local development. Ensure a `.env` file exists in the root of the `backend` directory for local runs.

**Example `.env`**:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/math_quiz?schema=public"
PORT=3001
JWT_SECRET="development_secret"
```

## 4. Production Considerations
*   In production (e.g., Vercel, AWS), environment variables must be set in the platform's dashboard.
*   Do **not** commit `.env` files to version control.

# Math Quiz Backend

Backend API for the Math Quiz application, built with NestJS and Prisma.

## 🚀 Features

*   **Framework**: NestJS
*   **Database**: PostgreSQL (via Supabase) / SQLite (Local)
*   **ORM**: Prisma
*   **Docs**: Swagger UI (`/api/docs`)
*   **Deployment**: Vercel (Serverless)

## 🛠️ Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env` (or create one):
    ```env
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="your-secret-key"
    ```

3.  **Database Migration**:
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

4.  **Run Server**:
    ```bash
    npm run start:dev
    ```
    API will be available at `http://localhost:3001`.
    Swagger Docs at `http://localhost:3001/api/docs`.

## ☁️ Deployment (Vercel)

1.  Import this project into Vercel.
2.  Framework Preset: Other.
3.  Root Directory: `.` (Current directory).
4.  **Integrations**: Connect Supabase to inject DB variables automatically.

## 📄 License

**Proprietary Software**. All rights reserved.
See [LICENSE](./LICENSE) for details.

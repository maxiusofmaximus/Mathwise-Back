# Regression Prevention Plan

To prevent future startup failures and configuration drifts, implement the following measures.

## 1. Automated Testing
*   **E2E Health Check**: Add an End-to-End test that verifies the `/` or `/health` endpoint returns 200 OK. This implicitly tests database connectivity because the app will not start if DB is down.
*   **Config Validation Tests**: Add unit tests for `PrismaService` that mock `process.env` and verify that it throws when `DATABASE_URL` is missing.

## 2. Robust Configuration Management
*   **Adopt `@nestjs/config`**: Replace direct `process.env` usage with NestJS `ConfigService`.
    *   Use `joi` or `class-validator` to define a schema for environment variables.
    *   This will fail the build/startup *before* any service tries to initialize if variables are missing or invalid.

## 3. CI/CD Pipeline Checks
*   **Migration Check**: Ensure `npx prisma migrate deploy` runs before application startup in production.
*   **Linting**: Enforce `eslint` rules to prevent `console.log` (use `Logger`) and ensure strict typing.

## 4. Monitoring
*   **Startup Logs**: Monitor logs for "Nest application successfully started". If this log does not appear within X seconds of deployment, trigger an alert.
*   **Crash Loops**: Configure infrastructure to alert on repeated container restarts (CrashLoopBackOff).

## 5. Code Review Checklist
*   [ ] Does the new service have `onModuleInit`?
*   [ ] Does it validate its dependencies/config in the constructor?
*   [ ] Is it using `Logger` instead of `console`?

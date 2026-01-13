# DI and Bootstrap QA

## Validation Protocols

To ensure the stability of the dependency injection and bootstrap process, the following QA steps must be performed.

### 1. Missing Configuration Test
**Scenario**: Attempt to start the application without a `DATABASE_URL`.
**Command**: `unset DATABASE_URL && npm run start` (or remove from `.env`)
**Expected Outcome**:
*   Process exits with code 1.
*   Log output contains: `Error: DATABASE_URL environment variable is missing`.

### 2. Invalid Connection Test
**Scenario**: Start application with a malformed or unreachable database URL.
**Command**: `set DATABASE_URL="postgresql://user:pass@localhost:5432/nonexistent" && npm run start`
**Expected Outcome**:
*   Process exits with code 1.
*   Log output contains: `[PrismaService] Failed to connect to database`.
*   Log output contains `PrismaClientKnownRequestError` (or `ECONNREFUSED`).

### 3. Successful Boot Test
**Scenario**: Start application with a valid, reachable PostgreSQL database.
**Command**: `npm run start` (with valid `.env`)
**Expected Outcome**:
*   Log output contains: `[PrismaService] Database connection established successfully`.
*   Log output contains: `[NestApplication] Nest application successfully started`.
*   Application stays running and accepts HTTP requests.

### 4. Serverless/Production Simulation
**Scenario**: Validate behavior in a simulated production build.
**Command**:
```bash
npm run build
export NODE_ENV=production
node dist/main
```
**Expected Outcome**: Same as "Successful Boot Test".

## Current Status
*   [x] **Missing Config**: Verified. App crashes correctly.
*   [x] **Invalid Connection**: Verified. App crashes correctly.
*   [ ] **Successful Boot**: Requires valid local PostgreSQL instance.

## Dependency Injection Audit
*   **PrismaService**: Singleton scope (default). Correctly initialized by `PrismaModule`.
*   **Lifecycle Hooks**: `onModuleInit` correctly implemented to block bootstrap on failure.

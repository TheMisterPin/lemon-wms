# Local PostgreSQL Database Setup

This guide explains how to create a **local PostgreSQL database and user** using `psql`. Follow this once to get the project up and running.

---

## Prerequisites

* PostgreSQL installed locally **or** running via Docker
* `psql` available in your terminal
* Database name used in this project: `boxmas`

---

## 1. Open psql

From your terminal:

```bash
psql -h localhost -p 5432 -U postgres
```

You will be prompted for the `postgres` password.

When connected successfully, you should see:

```
postgres=#
```

> ⚠️ If you ever see `postgres-#` instead of `postgres=#`, it means a command is unfinished. Press **Ctrl+C** immediately before continuing.

---

## 2. Create the Database

```sql
CREATE DATABASE boxmas;
```

Expected output:

```
CREATE DATABASE
```

Verify it exists:

```sql
\l
```

---

## 3. Create a Dedicated User

Create a project-specific user (quotes are required because of the dash):

```sql
CREATE USER "boxmas-user" WITH PASSWORD 'password';
```

---

## 4. Assign Ownership and Permissions

Make the new user the owner of the database:

```sql
ALTER DATABASE boxmas OWNER TO "boxmas-user";
```

Grant full privileges:

```sql
GRANT ALL PRIVILEGES ON DATABASE boxmas TO "boxmas-user";
```

---

## 5. Test the Connection (Optional but Recommended)

Exit `psql`:

```sql
\q
```

Reconnect using the new user:

```bash
psql -h localhost -p 5432 -U boxmas-user -d boxmas
```

If successful, you will see:

```
boxmas=>
```

---

## 6. Prisma Connection String

Add the following to your `.env` file in the Next.js project root:

```env
DATABASE_URL="postgresql://boxmas-user:password@localhost:5432/boxmas?schema=public"
```

⚠️ Restart the Next.js dev server after changing `.env`.

---

## 7. Initialize Prisma

Run the initial migration:

```bash
pnpm prisma migrate dev --name init
```

Open Prisma Studio to verify the connection:

```bash
pnpm prisma studio
```

If Studio opens and shows the database, the setup is complete.

---

## Common Issues

* **`postgres-#` prompt** → unfinished command → press **Ctrl+C**
* **Database does not exist** → `CREATE DATABASE` was not executed (missing `;`)
* **Authentication failed** → check username/password in `DATABASE_URL`
* **Connection refused** → PostgreSQL not running or wrong port

---

You only need to do this once per machine. After that, Prisma migrations handle ever

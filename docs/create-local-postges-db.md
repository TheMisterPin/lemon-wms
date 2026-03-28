# Local PostgreSQL setup for Lemon WMS

Use a local PostgreSQL instance with database name `wms_db`.

## Example
```sql
CREATE DATABASE wms_db;
CREATE USER "wms_user" WITH PASSWORD 'password';
ALTER DATABASE wms_db OWNER TO "wms_user";
GRANT ALL PRIVILEGES ON DATABASE wms_db TO "wms_user";
```

## `.env.local`
```env
DATABASE_URL="postgresql://wms_user:password@localhost:5432/wms_db"
JWT_SECRET="replace-with-openssl-rand"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
```

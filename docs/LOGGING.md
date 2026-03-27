# Persistent Logging System

This application includes a persistent logging system that writes client-side logs to JSON files on the server.

## Features

- **Survives page refreshes**: Logs are written to files on the server, not just the browser console
- **Automatic timestamping**: Each log entry includes timestamp, URL, and user agent
- **Multiple log levels**: info, warn, error, debug
- **Daily log rotation**: Logs are organized by date (e.g., `client-2025-02-10.json`)

## Usage

### Client-Side Logging

Import the logger utility in your component:

```typescript
import { logger } from '@/utils/logger/client-logger'

// Log information
logger.info('User fetched locations', { count: 5 })

// Log warnings
logger.warn('API response was slow', { duration: 3000 })

// Log errors
logger.error('Failed to save data', { error: error.message })

// Log debug information
logger.debug('Component mounted', { props })
```

### Viewing Logs

Logs are stored in the `/logs` directory at the root of the project:

```
logs/
  ├── client-2025-02-10.json
  ├── client-2025-02-11.json
  └── ...
```

Each file contains an array of log entries with the following structure:

```json
[
  {
    "timestamp": "2025-02-10T15:30:45.123Z",
    "level": "error",
    "message": "Failed to fetch locations",
    "data": {
      "error": "Network error",
      "status": 401
    },
    "url": "http://localhost:3000/location",
    "userAgent": "Mozilla/5.0..."
  }
]
```

## Where Logging is Active

The logger is currently integrated in:

1. **Axios Interceptor** ([src/lib/axios.ts](src/lib/axios.ts))
   - Logs all API requests
   - Logs authentication header status
   - Logs 401 errors and token handling

2. **Location Page** ([src/app/location/page.tsx](src/app/location/page.tsx))
   - Logs location fetch attempts
   - Logs success/failure of API calls

## Notes

- The `/logs` directory is excluded from version control (see `.gitignore`)
- Logs are stored indefinitely - you may want to implement log rotation/cleanup
- Failed log writes fail silently to avoid disrupting the application

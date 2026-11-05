# Safe File Deleter

A small full-stack application for safely deleting files within a restricted directory. The backend exposes a single REST endpoint that validates each requested path against a configurable `allowed_root`, refusing symlinks, non-regular files, and any path that resolves outside the root. The React frontend provides a simple textarea-based UI for submitting paths and viewing per-file results.

## Stack

Spring Boot 3.2 / Java 17 / React 18 / Vite 5

## Layout

```
.
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/example/demo/
│           │   ├── DemoApplication.java
│           │   └── controller/ApiController.java
│           └── resources/application.properties
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── App.css
```

## How to run

**Backend** (listens on `http://localhost:8080`):

```bash
cd backend
mvn spring-boot:run
```

**Frontend** (dev server on `http://localhost:5173`, proxies `/api` to the backend):

```bash
cd frontend
npm install
npm run dev
```

The backend deletes files relative to `app.allowed-root` (default `./allowed_root`, resolved from the backend's working directory). Create that directory and place any files you intend to delete inside it before running.

## API

Base path: `/api`

| Method | Path      | Body                     | Description                                                                 |
|--------|-----------|--------------------------|-----------------------------------------------------------------------------|
| POST   | `/delete` | `string[]` (JSON array)  | Attempts to delete each relative path. Returns `{ deleted: string[], errors: { path, error }[] }`. |

Each path is validated independently:

- Must be non-blank and resolve (after normalization) inside `allowed_root`.
- Must not be a symlink.
- Must exist and be a regular file (no directories, devices, etc.).
- Must resolve via `toRealPath()` to a location still inside `allowed_root`.

Failures for individual paths are reported in `errors` without aborting the batch. A `500` is returned only if `allowed_root` itself is inaccessible.

## Notes

- **No authentication or authorization.** The endpoint is open; do not expose it publicly without adding access control.
- **No CSRF protection or rate limiting.** Suitable for local/trusted use only.
- **`allowed_root` is resolved once per request** via `toRealPath()`, so the directory must exist at request time.
- **Deletion is permanent.** There is no trash/undo; files are removed with `Files.delete`.
- **No directory deletion.** Only regular files are accepted; empty directories are not removed.
- **Frontend assumes same-origin `/api`.** In production, serve the built frontend behind a reverse proxy that forwards `/api` to the backend, or adjust `vite.config.js` / fetch URLs accordingly.
- **No tests included** beyond the default Spring Boot test starter.
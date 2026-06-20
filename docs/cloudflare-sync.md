# Cloudflare board sync

This repository uses Cloudflare Pages Functions for the smallest same-origin sync layer.

## Files

- `functions/api/board.js`
- `wrangler.toml`

## KV binding

Create a Cloudflare KV namespace and bind it to Pages Functions as:

```text
COMPASS_BOARD_KV
```

Replace the placeholder IDs in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "COMPASS_BOARD_KV"
id = "REPLACE_WITH_PRODUCTION_KV_NAMESPACE_ID"
preview_id = "REPLACE_WITH_PREVIEW_KV_NAMESPACE_ID"
```

## KV key

The board is stored under:

```text
compass-board:main
```

## API

`GET /api/board` returns the latest server board. If KV has no board yet, it returns:

```json
{ "ok": false, "error": "BOARD_NOT_FOUND" }
```

`POST /api/board` stores the current board when `baseRevision` matches the server revision.
On mismatch, it returns:

```json
{
  "ok": false,
  "error": "REVISION_CONFLICT",
  "serverRevision": 3,
  "clientBaseRevision": 1
}
```

## localStorage

The existing board format in `localStorage["compassBoard.v1"]` is not wrapped or migrated.
Sync metadata is stored separately in:

```text
localStorage["compassBoard.sync.v1"]
```

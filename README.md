# own-oauth-flow

A tiny CLI that runs the Google OAuth 2.0 authorization code flow (with PKCE) and prints the token response, so you can get an access/refresh token for a script or API call without building a whole app or clicking through a web playground.

## Requirements

- Node 22.18+ (the CLI runs TypeScript directly, no build step)
- A Google Cloud OAuth client (type: Web application) with `http://localhost:<PORT>` added as an authorized redirect URI

## Usage

```sh
pnpm start
```

1. It prints a consent URL. Open it and approve the requested scope.
2. Google redirects to `http://localhost:<PORT>`, where a local server picks the `code` out of the query string. The page says you can close the tab.
3. The code is exchanged for tokens and the raw response is printed:

```json
{
  "access_token": "...",
  "expires_in": 3599,
  "refresh_token": "...",
  "scope": "https://www.googleapis.com/auth/drive",
  "token_type": "Bearer"
}
```

Any missing `CLIENT_ID`, `CLIENT_SECRET` or `PORT` is asked for on the terminal if not available via a .env-file.

## How it works

- `src/index.ts` builds the PKCE `code_verifier` (random) and `code_challenge` (S256 hash), then prints the Google authorization URL.
- `src/server.ts` starts a one-shot HTTP server on `PORT` and resolves with the `code` (or the `error`) of the first request that carries one. Favicon/health-check requests without a code are ignored.
- Back in `src/index.ts`, the code plus the verifier is POSTed to `https://oauth2.googleapis.com/token` and the JSON is logged.

## Known limits

- Google only, endpoints are hardcoded.
- The requested scope is hardcoded to Drive (`src/index.ts`); edit it for other APIs.
- No refresh: rerun the CLI when the token expires. The `refresh_token` is printed if you need to do it yourself.
- No tests.

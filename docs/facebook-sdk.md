# Facebook SDK Integration

## Frontend SDK Bootstrap

The website now loads the Facebook JavaScript SDK dynamically through:

- `src/lib/meta-sdk.ts`
- `src/main.tsx`

This replaces the raw inline snippet pattern and keeps configuration in frontend environment variables.

## Frontend Environment Variables

- `VITE_FB_APP_ID`
- `VITE_FB_API_VERSION`

Current default API version:

```text
v22.0
```

## Exposed Helpers

```ts
import { getFacebookLoginStatus, initializeFacebookSdk } from "@/lib/meta-sdk";
```

### `initializeFacebookSdk()`

Loads the SDK script, runs `FB.init`, enables:

- `cookie: true`
- `xfbml: true`
- `version: VITE_FB_API_VERSION`

It also triggers:

- `FB.AppEvents.logPageView()`

### `getFacebookLoginStatus()`

Returns the same login status shape expected from the SDK:

```ts
{
  status: "connected",
  authResponse: {
    accessToken: "...",
    expiresIn: "...",
    signedRequest: "...",
    userID: "..."
  }
}
```

## Notes

- `FB_APP_SECRET` must never be exposed in the frontend.
- Only the public app id is read through `VITE_FB_APP_ID`.
- Authentication callbacks and webhook processing remain server-side through the deployed hook functions.

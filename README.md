# @nakanoaas/hono-linebot-middleware

Hono middleware for LINE Bot webhook signature validation built on Web Standards.

## Features

- **Built on Web Standards** - Uses Web Crypto API for platform-independent implementation
- **Works on any runtime** - Compatible with Cloudflare Workers, Node.js, Deno, Bun, and any environment that supports Web Standards
- **TypeScript support** - Full TypeScript definitions included
- **Lightweight & Simple** - Minimal API surface with zero runtime dependencies
- **Hono integration** - Seamlessly integrates with Hono framework

## Installation

```bash
npm install @nakanoaas/hono-linebot-middleware
# or
pnpm add @nakanoaas/hono-linebot-middleware
# or
yarn add @nakanoaas/hono-linebot-middleware
```

## Basic Usage

```typescript
import { Hono } from "hono";
import type { WebhookRequestBody } from "@line/bot-sdk";
import { lineBotMiddleware } from "@nakanoaas/hono-linebot-middleware";

const app = new Hono();

const channelSecret = /* LINE Channel Secret */;

app.post("/webhook", lineBotMiddleware(channelSecret), async (c) => {
  const events = await c.req.json<WebhookRequestBody>();
  
	// Handle LINE webhook events

  return c.body(null, 204);
});
```

## API Reference

### `lineBotMiddleware(channelSecret: string): MiddlewareHandler`

Creates a Hono middleware that validates LINE Bot webhook signatures.

**Parameters:**
- `channelSecret` (string): Your LINE Bot channel secret

**Returns:**
- `MiddlewareHandler`: A Hono middleware handler

**Behavior:**
- Validates the `x-line-signature` header using HMAC-SHA256
- Throws `HTTPException` with status 401 if:
  - The signature header is missing
  - The signature validation fails
- Calls `next()` if validation succeeds

## Usage Examples

### Cloudflare Workers

```typescript
import { env } from "cloudflare:workers";
import type { WebhookRequestBody } from "@line/bot-sdk";
import { lineBotMiddleware } from "@nakanoaas/hono-linebot-middleware";
import { Hono } from "hono";

const app = new Hono();

app.post("/webhook", lineBotMiddleware(env.LINE_CHANNEL_SECRET!), async (c) => {
  const events = await c.req.json<WebhookRequestBody>();

  // Handle LINE webhook events

  return c.body(null, 204);
});

export default app;
```

### Node.js

```typescript
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { WebhookRequestBody } from "@line/bot-sdk";
import { lineBotMiddleware } from "@nakanoaas/hono-linebot-middleware";

const app = new Hono();

app.post("/webhook", lineBotMiddleware(process.env.LINE_CHANNEL_SECRET!), async (c) => {
  const events = await c.req.json<WebhookRequestBody>();

  // Handle LINE webhook events

  return c.body(null, 204);
});

serve(app);
```

### Deno

```typescript
import { Hono } from "https://deno.land/x/hono/mod.ts";
import type { WebhookRequestBody } from "@line/bot-sdk";
import { lineBotMiddleware } from "@nakanoaas/hono-linebot-middleware";

const app = new Hono();

app.post("/webhook", lineBotMiddleware(Deno.env.get("LINE_CHANNEL_SECRET")!), async (c) => {
  const events = await c.req.json<WebhookRequestBody>();

  // Handle LINE webhook events

  return c.body(null, 204);
});

Deno.serve(app.fetch);
```

### Bun

```typescript
import { Hono } from "hono";
import type { WebhookRequestBody } from "@line/bot-sdk";
import { lineBotMiddleware } from "@nakanoaas/hono-linebot-middleware";

const app = new Hono();

app.post("/webhook", lineBotMiddleware(Bun.env.LINE_CHANNEL_SECRET!), async (c) => {
  const events = await c.req.json<WebhookRequestBody>();

  // Handle LINE webhook events

  return c.body(null, 204);
});

export default {
  port: 3000,
  fetch: app.fetch,
};
```

## Technical Details

- **Signature Algorithm**: HMAC-SHA256
- **Signature Header**: `x-line-signature` (Base64 encoded)
- **Web Crypto API**: Uses `crypto.subtle.verify()` for signature validation
- **Hono Version**: Requires Hono ^4.0.0

## Development

### Prerequisites

- [mise](https://mise.jdx.dev/)

### Setup

```bash
mise trust
mise install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Type Check

```bash
pnpm check-types
```

### Lint & Format

```bash
pnpm check
pnpm check:fix
```

## License

Apache-2.0

## Related Projects

- [Hono](https://hono.dev/) - Web framework built on Web Standards
- [@line/bot-sdk](https://github.com/line/line-bot-sdk-nodejs) - LINE Messaging API SDK for nodejs



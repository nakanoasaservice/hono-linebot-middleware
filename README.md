# @nakanoaas/hono-linebot-middleware

<div align="center">

[![npm version](https://img.shields.io/npm/v/@nakanoaas/hono-linebot-middleware.svg)](https://www.npmjs.com/package/@nakanoaas/hono-linebot-middleware)
[![License](https://img.shields.io/npm/l/@nakanoaas/hono-linebot-middleware.svg)](https://github.com/nakanoasaservice/hono-linebot-middleware/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**Hono middleware for LINE Bot webhook signature validation built on Web Standards**

</div>

---

A lightweight, zero-dependency middleware for validating LINE Bot webhook signatures in [Hono](https://hono.dev/) applications. Built entirely on Web Standards APIs, it works seamlessly across Cloudflare Workers, Node.js, Deno, Bun, and any runtime that supports Web Crypto API.

## ✨ Features

- 🔒 **Secure by Default** - Validates webhook signatures using HMAC-SHA256
- 🌐 **Web Standards** - Built on Web Crypto API, no runtime dependencies
- 🚀 **Universal Runtime Support** - Works on Cloudflare Workers, Node.js, Deno, Bun, and more
- 📦 **Zero Dependencies** - Lightweight and fast
- 💪 **TypeScript First** - Full type definitions included
- 🎯 **Simple API** - One function, zero configuration

## 📦 Installation

```bash
npm install @nakanoaas/hono-linebot-middleware
```

```bash
pnpm add @nakanoaas/hono-linebot-middleware
```

```bash
yarn add @nakanoaas/hono-linebot-middleware
```

## 🚀 Quick Start

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

That's it! The middleware automatically validates incoming webhook requests and rejects invalid signatures with a `401 Unauthorized` response.

## 💡 Examples

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

## 📚 Documentation

### API

#### `lineBotMiddleware(channelSecret: string): MiddlewareHandler`

Creates a Hono middleware that validates LINE Bot webhook signatures.

**Parameters:**

- `channelSecret` (`string`): Your LINE Bot channel secret

**Returns:**

- `MiddlewareHandler`: A Hono middleware handler

**Behavior:**

- Validates the `x-line-signature` header using HMAC-SHA256
- Throws `HTTPException` with status `401` if:
  - The signature header is missing
  - The signature validation fails
- Calls `next()` if validation succeeds

**Throws:**

- `Error`: If `channelSecret` is not a string
- `HTTPException` (401): If the signature header is missing or validation fails

#### `importKeyFromChannelSecret(channelSecret: string): Promise<CryptoKey>`

Imports a cryptographic key from a LINE Bot channel secret for HMAC-SHA256 signature verification.

**Parameters:**

- `channelSecret` (`string`): The LINE Bot channel secret string

**Returns:**

- `Promise<CryptoKey>`: A Promise that resolves to a CryptoKey configured for HMAC-SHA256 verification

**Example:**

```typescript
import { importKeyFromChannelSecret } from "@nakanoaas/hono-linebot-middleware";

const key = await importKeyFromChannelSecret("your-channel-secret");
```

#### `validateSignature(body: BufferSource, key: CryptoKey, signature: string): Promise<boolean>`

Validates a LINE Bot webhook signature using HMAC-SHA256.

**Parameters:**

- `body` (`BufferSource`): The request body as a BufferSource (ArrayBuffer, TypedArray, or DataView)
- `key` (`CryptoKey`): The CryptoKey imported from the channel secret
- `signature` (`string`): The Base64-encoded signature from the `x-line-signature` header

**Returns:**

- `Promise<boolean>`: A Promise that resolves to `true` if the signature is valid, `false` otherwise

**Example:**

```typescript
import { importKeyFromChannelSecret, validateSignature } from "@nakanoaas/hono-linebot-middleware";

const body = await request.arrayBuffer();
const key = await importKeyFromChannelSecret(channelSecret);
const isValid = await validateSignature(body, key, signature);
```

## 🔧 Technical Details

- **Signature Algorithm**: HMAC-SHA256
- **Signature Header**: `x-line-signature` (Base64 encoded)
- **Web Crypto API**: Uses `crypto.subtle.verify()` for signature validation
- **Hono Version**: Requires Hono ^4.0.0

## 🛠️ Development

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

## 📄 License

Apache-2.0 © [Nakano as a Service](https://github.com/nakanoasaservice)

## 🔗 Related Projects

- [Hono](https://hono.dev/) - Web framework built on Web Standards
- [@line/bot-sdk](https://github.com/line/line-bot-sdk-nodejs) - LINE Messaging API SDK for nodejs

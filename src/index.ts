import { HTTPException } from "hono/http-exception";
import type { MiddlewareHandler } from "hono/types";
import { decodeBase64 } from "hono/utils/encode";

/**
 * Imports a cryptographic key from a LINE Bot channel secret for HMAC-SHA256 signature verification.
 *
 * @param channelSecret - The LINE Bot channel secret string
 * @returns A Promise that resolves to a CryptoKey configured for HMAC-SHA256 verification
 *
 * @example
 * ```typescript
 * const key = await importKeyFromChannelSecret("YOUR_CHANNEL_SECRET");
 * ```
 */
export async function importKeyFromChannelSecret(
	channelSecret: string,
): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const keyBytes = encoder.encode(channelSecret);

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyBytes,
		{
			name: "HMAC",
			hash: { name: "SHA-256" },
		},
		false,
		["verify"],
	);

	return cryptoKey;
}

/**
 * Validates a LINE Bot webhook signature using HMAC-SHA256.
 *
 * @param body - The request body as a BufferSource (ArrayBuffer, TypedArray, or DataView)
 * @param key - The CryptoKey imported from the channel secret
 * @param signature - The Base64-encoded signature from the `x-line-signature` header
 * @returns A Promise that resolves to `true` if the signature is valid, `false` otherwise
 *
 * @example
 * ```typescript
 * const body = await request.arrayBuffer();
 * const key = await importKeyFromChannelSecret("YOUR_CHANNEL_SECRET");
 * const isValid = await validateSignature(body, key, signature);
 * ```
 */
export async function validateSignature(
	body: BufferSource,
	key: CryptoKey,
	signature: string,
): Promise<boolean> {
	const signatureBytes = decodeBase64(signature);

	return await crypto.subtle.verify("HMAC", key, signatureBytes, body);
}

/**
 * Creates a Hono middleware that validates LINE Bot webhook signatures.
 *
 * This middleware validates incoming webhook requests by checking the `x-line-signature` header
 * using HMAC-SHA256. If the signature is missing or invalid, it throws an `HTTPException`
 * with status code 401.
 *
 * @param channelSecret - The LINE Bot channel secret string
 * @returns A Hono middleware handler that validates webhook signatures
 *
 * @throws {Error} If `channelSecret` is not a string
 * @throws {HTTPException} If the signature header is missing (401)
 * @throws {HTTPException} If the signature validation fails (401)
 *
 * @example
 * ```typescript
 * import { Hono } from "hono";
 * import type { WebhookRequestBody } from "@line/bot-sdk";
 * import { lineBotMiddleware } from "@nakanoaas/hono-linebot-middleware";
 *
 * const app = new Hono();
 * app.post("/webhook", lineBotMiddleware("YOUR_CHANNEL_SECRET"), async (c) => {
 *   const events = await c.req.json<WebhookRequestBody>();
 *   // Handle webhook events
 *   return c.body(null, 204);
 * });
 * ```
 */
export function lineBotMiddleware(channelSecret: string): MiddlewareHandler {
	if (typeof channelSecret !== "string") {
		throw new Error("no channel secret");
	}

	const cryptoKey = importKeyFromChannelSecret(channelSecret);

	return async (c, next) => {
		const signature = c.req.header("x-line-signature");
		if (!signature) {
			throw new HTTPException(401, { message: "no signature" });
		}

		const body = await c.req.arrayBuffer();

		const isValid = await validateSignature(body, await cryptoKey, signature);
		if (!isValid) {
			throw new HTTPException(401, { message: "signature validation failed" });
		}

		await next();
	};
}

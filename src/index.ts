import { HTTPException } from "hono/http-exception";
import type { MiddlewareHandler } from "hono/types";
import { decodeBase64 } from "hono/utils/encode";

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

export async function validateSignature(
	body: BufferSource,
	key: CryptoKey,
	signature: string,
): Promise<boolean> {
	const signatureBytes = decodeBase64(signature);

	return await crypto.subtle.verify("HMAC", key, signatureBytes, body);
}

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

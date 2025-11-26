import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import {
	importKeyFromChannelSecret,
	lineBotMiddleware,
	validateSignature,
} from "../src/index";

const body = { hello: "world" };
const secret = "test_secret";
const validSignature = "t7Hn4ZDHqs6e+wdvI5TyQIvzie0DmMUmuXEBqyyE/tM=";
const invalidSignature = "t7Hn4ZDHqs6e+wdvi5TyQivzie0DmMUmuXEBqyyE/tM=";

const app = new Hono();
app.post("/", lineBotMiddleware(secret), (c) => {
	return c.body(null, 200);
});

describe("lineBotMiddleware", () => {
	it("should accept request with valid signature", async () => {
		const res = await app.request("/", {
			method: "POST",
			headers: {
				"x-line-signature": validSignature,
			},
			body: JSON.stringify(body),
		});

		expect(res.status).toBe(200);
	});

	it("should throw error when channel secret is missing", async () => {
		expect(() => lineBotMiddleware(null as unknown as string)).toThrowError(
			"channel secret",
		);
	});

	it("should return 401 when signature is missing", async () => {
		const res = await app.request("/", {
			method: "POST",
			body: JSON.stringify(body),
		});

		expect(res.status).toBe(401);
	});

	it("should return 401 when signature is invalid", async () => {
		const res = await app.request("/", {
			method: "POST",
			headers: {
				"x-line-signature": invalidSignature,
			},
			body: JSON.stringify(body),
		});

		expect(res.status).toBe(401);
	});
});

describe("importKeyFromChannelSecret", () => {
	it("should import key and validate signature correctly", async () => {
		const cryptoKey = await importKeyFromChannelSecret(secret);
		expect(
			await validateSignature(
				new TextEncoder().encode(JSON.stringify(body)),
				cryptoKey,
				validSignature,
			),
		).toBe(true);
	});

	it("should return false when signature is invalid", async () => {
		const cryptoKey = await importKeyFromChannelSecret(secret);
		expect(
			await validateSignature(
				new TextEncoder().encode(JSON.stringify(body)),
				cryptoKey,
				invalidSignature,
			),
		).toBe(false);
	});
});

import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

function resolveCredentials() {
	if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
		return {
			url: process.env.UPSTASH_REDIS_REST_URL,
			token: process.env.UPSTASH_REDIS_REST_TOKEN,
		};
	}

	
	if (process.env.UPSTASH_REDIS_URL) {
		try {
			const parsed = new URL(process.env.UPSTASH_REDIS_URL);
			return {
				url: `https://${parsed.hostname}`,
				token: parsed.password || parsed.username,
			};
		} catch (error) {
			console.error("Invalid UPSTASH_REDIS_URL:", error.message);
		}
	}

	return {
		url: "",
		token: "",
	};
}

const { url, token } = resolveCredentials();

const client = new Redis({
	url,
	token,
	automaticDeserialization: false,
});

export const redis = {
	get: (key) => client.get(key),
	set: (key, value, ...args) => {
		if (args.length >= 2 && typeof args[0] === "string" && args[0].toUpperCase() === "EX") {
			return client.set(key, value, { ex: Number(args[1]) });
		}
		if (args.length >= 2 && typeof args[0] === "string" && args[0].toUpperCase() === "PX") {
			return client.set(key, value, { px: Number(args[1]) });
		}
		if (args.length === 1 && typeof args[0] === "object") {
			return client.set(key, value, args[0]);
		}
		return client.set(key, value);
	},
	del: (key) => client.del(key),
	on: () => {},
	ping: () => client.ping(),
};



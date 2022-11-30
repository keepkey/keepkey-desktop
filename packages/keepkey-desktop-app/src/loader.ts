import { Buffer } from "buffer";
import { logger } from "./lib/logger";

(async () => {
    globalThis.__dirname = "/";
    globalThis.global = globalThis;
    globalThis.Buffer = Buffer;
    globalThis.app_env = await (await fetch('./env.json')).json();
    await import("./index")
})().catch(e => logger.error(e, "loader error"));

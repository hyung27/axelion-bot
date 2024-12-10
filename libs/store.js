import pino from "pino";
import { makeInMemoryStore } from "@whiskeysockets/baileys";

const store = makeInMemoryStore({ logger: pino().child({ level: "fatal", stream: "store" }) });

export default store;

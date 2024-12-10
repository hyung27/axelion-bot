/**
 * name: axelion-bot
 * version: 1.0.0
 * description: Simple WhatsApp Bot
 * aurhor: Hyung
 * created at: 2024-12-2
 * github: https://github.com/hyung27
 * whatsapp: wa.me/6285786153616
 */

import config from "../config.js";
import store from "./store.js";
import logger from "./logger.js";

import connectionUpdate from "../events/connections.js";
import groupUpdate from "../events/groups.js";
import participantUpdate from "../events/participants.js";

import pino from "pino";
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from "@whiskeysockets/baileys";

export const pairingCode = !!config.pairing || process.argv.includes("--code");

export default async function connectToWaSocket() {
    const { state, saveCreds } = await useMultiFileAuthState(`${config.session}`);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: !pairingCode,
        logger: pino({ level: "fatal" }),
        browser: Browsers.ubuntu("Chrome"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        defaultQueryTimeoutMs: 0,
        // getMessage: async (key) => ((await store.loadMessage(key.remoteJid, key.id)) || (await store.loadMessage(key.id)) || {}).message || undefined,
    });

    if (pairingCode && !sock.authState.creds.registered) {
        setTimeout(async () => {
            let code = await sock.requestPairingCode(config.pairing.replace(/\D/g, ""));
            logger.info(`Pairing code: ${code}`);
        }, 3000);
    }

    store.bind(sock.ev);

    sock.ev.on("connection.update", connectionUpdate.bind(sock));
    sock.ev.on("groups.update", groupUpdate.bind(sock));
    sock.ev.on("group-participants.update", participantUpdate.bind(sock));
    sock.ev.on("creds.update", saveCreds);

    return sock;
}

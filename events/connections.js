import config from "../config.js";
import logger from "../libs/logger.js";
import connectToWaSocket, { pairingCode } from "../libs/socket.js";
import { DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

export default async function connectionUpdate(update) {
    const { lastDisconnect, connection, qr } = update;
    if (!pairingCode && qr) {
        logger.info("Scan the QR code below, expires in 60 seconds");
    }
    if (connection === "close") {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        if (reason === DisconnectReason.badSession) {
            logger.info(`Bad Session File, Please Delete Session and Scan Again`);
            process.send("reset");
        } else if (reason === DisconnectReason.connectionClosed) {
            logger.info("Connection closed, reconnecting....");
            await connectToWaSocket();
        } else if (reason === DisconnectReason.connectionLost) {
            logger.info("Connection Lost from Server, reconnecting...");
            await connectToWaSocket();
        } else if (reason === DisconnectReason.connectionReplaced) {
            logger.info("Connection Replaced, Another New Session Opened, Please Close Current Session First");
            process.exit(1);
        } else if (reason === DisconnectReason.loggedOut) {
            logger.info(`Device Logged Out, Please Scan Again And Run.`);
            process.exit(1);
        } else if (reason === DisconnectReason.restartRequired) {
            logger.info("Restart Required, Restarting...");
            await connectToWaSocket();
        } else if (reason === DisconnectReason.timedOut) {
            logger.info("Connection TimedOut, Reconnecting...");
            process.send("reset");
        } else if (reason === DisconnectReason.multideviceMismatch) {
            logger.info("Multi device mismatch, please scan again");
            process.exit(0);
        } else {
            logger.info(reason);
            process.send("reset");
        }
    } else if (connection === "connecting") {
        logger.info("Connecting to WhatsApp...");
    } else if (connection === "open") {
        logger.info("Connected to WhatsApp!!");
        this.sendMessage(config.owner[0][0] + "@s.whatsapp.net", {
            text: `${this?.user?.name || "Axelion"} has Connected...`,
        });
    }
}

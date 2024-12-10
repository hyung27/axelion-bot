import logger from "./libs/logger.js";
import connectToWaSocket from "./libs/socket.js";

connectToWaSocket().catch((e) => logger.error(e));

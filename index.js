import logger from "./libs/logger.js";
import { join, dirname } from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { platform } from "os";
import { watchFile, unwatchFile } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

var isRunning = false;
function start(file) {
    if (isRunning) return;
    isRunning = true;
    let args = [join(__dirname, file), ...process.argv.slice(2)];
    let p = spawn(process.argv[0], args, {
        stdio: ["inherit", "inherit", "inherit", "ipc"],
    })
        .on("message", (data) => {
            logger.info(data);
            switch (data) {
                case "reset":
                    platform() === "win32" ? p.kill("SIGINT") : p.kill();
                    isRunning = false;
                    start.apply(this, arguments);
                    break;
                case "uptime":
                    p.send(process.uptime());
                    break;
            }
        })
        .on("exit", (code) => {
            isRunning = false;
            logger.error(`Exited with code: ${code}`);
            if (code === 0) return;
            watchFile(args[0], () => {
                unwatchFile(args[0]);
                start(file);
            });
        });
}

start("main.js");

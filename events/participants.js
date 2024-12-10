import logger from "../libs/logger.js";

export default async function participantUpdate({ id, participants, action }) {
    try {
        const metadata = await this.groupMetadata(id);
        for (const jid of participants) {
            let profile;
            try {
                profile = await this.profilePictureUrl(jid, "image");
            } catch {
                profile =
                    "https://lh3.googleusercontent.com/proxy/esjjzRYoXlhgNYXqU8Gf_3lu6V-eONTnymkLzdwQ6F6z0MWAqIwIpqgq_lk4caRIZF_0Uqb5U8NWNrJcaeTuCjp7xZlpL48JDx-qzAXSTh00AVVqBoT7MJ0259pik9mnQ1LldFLfHZUGDGY=w1200-h630-p-k-no-nu";
            }

            if (action == "add") {
                this.sendMessage(id, {
                    text: `Welcome @${jid.split("@")[0]} to "${metadata.subject}"`,
                    contextInfo: {
                        mentionedJid: [jid],
                        externalAdReply: {
                            title: `Welcome`,
                            mediaType: 1,
                            previewType: 0,
                            renderLargerThumbnail: true,
                            thumbnailUrl: profile,
                            sourceUrl: null,
                        },
                    },
                });
            } else if (action == "remove") {
                if (!db.groups[id]?.leave) return;
                this.sendMessage(id, {
                    text: `@${jid.split("@")[0]} Leaving From "${metadata.subject}"`,
                    contextInfo: {
                        mentionedJid: [jid],
                        externalAdReply: {
                            title: `Leave`,
                            mediaType: 1,
                            previewType: 0,
                            renderLargerThumbnail: true,
                            thumbnailUrl: profile,
                            sourceUrl: null,
                        },
                    },
                });
            }
        }
    } catch (e) {
        logger.error(e);
    }
}

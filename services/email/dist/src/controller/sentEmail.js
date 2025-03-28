"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("../schemas");
const config_1 = require("@/config");
const sentEmail = async (req, res, next) => {
    try {
        const parseBody = schemas_1.emailSchema.safeParse(req.body);
        if (!parseBody.success) {
            res.status(400).json(parseBody.error);
            return;
        }
        const { recipient, subject, body, sender, source } = parseBody.data;
        const from = sender || config_1.default_sender;
        const emailOptions = {
            from,
            to: recipient,
            subject,
            text: body,
        };
        //send email
        const { rejected } = await config_1.transporter.sendMail(emailOptions);
        if (rejected.length) {
            console.log("email rejected", rejected);
            res.status(500).json({ message: "Failed to send email" });
        }
        await prisma_1.default.email.create({
            data: {
                sender: from,
                recipient,
                subject,
                body,
                source,
            },
        });
        res.status(200).json({ message: "Email sent successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.default = sentEmail;
//# sourceMappingURL=sentEmail.js.map
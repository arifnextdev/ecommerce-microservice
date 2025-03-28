"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("@/schemas");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@/config");
const verifyEmail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const parseBody = schemas_1.userVerifySchema.safeParse(req.body);
        if (!parseBody.success) {
            res.status(400).json({ error: parseBody.error.errors });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: parseBody.data.email,
            },
        });
        if (!user) {
            res.status(400).json({ error: "Invalid Creadentials" });
            return;
        }
        const verifyCode = await prisma_1.default.veryficationCode.findFirst({
            where: {
                userId: user.id,
                code: parseBody.data.code,
            },
        });
        if (!verifyCode) {
            res.status(400).json({ error: "Invalid Creadentials" });
            return;
        }
        if (verifyCode.code !== parseBody.data.code) {
            res.status(400).json({ error: "Invalid Code" });
            return;
        }
        if (verifyCode.expiredAt < new Date()) {
            res.status(400).json({ error: "Code Expired" });
            return;
        }
        await prisma_1.default.user.update({
            where: {
                id: user.id,
            },
            data: {
                veryfied: true,
                status: "ACTIVE",
            },
        });
        ///Update verification code
        await prisma_1.default.veryficationCode.update({
            where: {
                id: verifyCode.id,
            },
            data: {
                status: "USED",
                veryfiedAt: new Date(),
            },
        });
        await axios_1.default.post(`${config_1.EMAIL_SERVICE_URL}/email/send`, {
            recipient: user.email,
            subject: "Account Verification",
            body: `Hello ${user.name} your account has been verified successfully`,
            srouce: "VERIFY_EMAIL",
        });
        res.status(200).json({ message: "Email verified" });
    }
    catch (error) {
        next(error);
    }
};
exports.default = verifyEmail;
//# sourceMappingURL=verifyEmail.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("../schemas");
const createLoginHistorey = async (info) => {
    await prisma_1.default.history.create({
        data: {
            ipAddress: info.ipAddress,
            userAgent: info.userAgent,
            userId: info.userId,
            attempt: info.attempt,
        },
    });
};
const userLogin = async (req, res, next) => {
    try {
        const ipAddress = req.headers["x-forwarded-for"] || req.ip || "";
        const userAgent = req.headers["user-agent"] || "";
        //validate the request body
        const parseBody = schemas_1.userLoginSchema.safeParse(req.body);
        if (!parseBody.success) {
            res.status(400).json({ error: parseBody.error.errors });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: {
                email: parseBody.data.email,
            },
        });
        if (!user) {
            res.status(400).json({ error: "Invalid Creadentials" });
            await createLoginHistorey({
                ipAddress,
                userAgent,
                userId: "GUEST",
                attempt: "FAILD",
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(parseBody.data.password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ error: "Invalid Creadentials" });
            await createLoginHistorey({
                ipAddress,
                userAgent,
                userId: user.id,
                attempt: "FAILD",
            });
            return;
        }
        if (!user.veryfied) {
            res.status(400).json({ error: "User not verified" });
            await createLoginHistorey({
                ipAddress,
                userAgent,
                userId: user.id,
                attempt: "FAILD",
            });
        }
        //check user is active
        if (user.status !== "ACTIVE") {
            res.status(400).json({ message: `Your account is ${user.status}` });
            await createLoginHistorey({
                ipAddress,
                userAgent,
                userId: user.id,
                attempt: "FAILD",
            });
        }
        //Generate JWT token
        const accessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            name: user.name,
            email: user.email,
        }, process.env.JWT_SCRECT_KEY || "my-screct-key", {
            expiresIn: "30d",
        });
        await createLoginHistorey({
            ipAddress,
            userAgent,
            userId: user.id,
            attempt: "SUCCESS",
        });
        res.status(200).json({ message: "Login successful", token: accessToken });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.default = userLogin;
//# sourceMappingURL=userLogin.js.map
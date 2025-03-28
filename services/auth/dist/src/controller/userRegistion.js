"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("../schemas");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@/config");
const generateVerificationCode = () => {
    const timeStamp = Date.now().toString();
    const randomNumber = Math.floor(10 + Math.random() * 90);
    let code = `${timeStamp}${randomNumber}`.slice(-5);
    return code;
};
const userRegistion = async (req, res, next) => {
    try {
        //validate the request body
        const parseBody = schemas_1.userCreateSchema.safeParse(req.body);
        if (!parseBody.success) {
            res.status(400).json({ error: parseBody.error.errors });
            return;
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: {
                email: parseBody.data.email,
            },
        });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        //hash password
        const hashPassword = await bcryptjs_1.default.hash(parseBody.data.password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: parseBody.data.name,
                email: parseBody.data.email,
                password: hashPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                veryfied: true,
                status: true,
                createdAt: true,
            },
        });
        console.log("User created successfully", user);
        await axios_1.default.post(`${config_1.USER_SERVICE_URL}/users`, {
            authUserId: user.id,
            name: user.name,
            email: user.email,
        });
        //Generate Verification code
        const verificationCode = generateVerificationCode();
        await prisma_1.default.veryficationCode.create({
            data: {
                userId: user.id,
                code: verificationCode,
                expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24), //24 hours
            },
        });
        //Code send to user by email
        await axios_1.default.post(`${config_1.EMAIL_SERVICE_URL}/email/send`, {
            recipient: user.email,
            subject: "Email Verification",
            body: `Your verification code is ${verificationCode}`,
            source: "User Registion",
        });
        res
            .status(201)
            .json({
            message: "User created, check your email for verification code",
            user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = userRegistion;
//# sourceMappingURL=userRegistion.js.map
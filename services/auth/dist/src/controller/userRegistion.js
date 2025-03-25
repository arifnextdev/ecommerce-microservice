"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("../schemas");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
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
        await axios_1.default.post(`${process.env.USER_SERVICE_URL}/users`, {
            authUserId: user.id,
            name: user.name,
            email: user.email,
        });
        //Generate Verification code
        //Code send to user by email
        res.status(201).json({ message: "User created successfully", user });
    }
    catch (error) {
        next(error);
    }
};
exports.default = userRegistion;
//# sourceMappingURL=userRegistion.js.map
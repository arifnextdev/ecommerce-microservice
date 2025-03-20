"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("../schemas");
const createNewUser = async (req, res, next) => {
    try {
        const parseBody = schemas_1.userCreateSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ error: parseBody.error });
        }
        const exitUser = await prisma_1.default.user.findUnique({
            where: {
                authUserId: parseBody.data.authUserId,
            },
        });
        if (exitUser) {
            return res.status(400).json({ error: "User already exist" });
        }
        const user = await prisma_1.default.user.create({
            data: parseBody.data,
        });
        res.status(201).json({ message: "User created successfully", data: user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.default = createNewUser;
//# sourceMappingURL=createUser.js.map
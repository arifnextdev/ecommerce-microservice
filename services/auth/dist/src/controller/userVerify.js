"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("@/schemas");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userVerify = async (req, res, next) => {
    try {
        //validate the request body
        const parseBody = schemas_1.AccessTokenSchema.safeParse(req.body);
        if (!parseBody.success) {
            res.status(400).json({ error: parseBody.error.errors });
            return;
        }
        //Decode token
        const decodedToken = jsonwebtoken_1.default.verify(parseBody.data.token, process.env.JWT_SCRECT_KEY);
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: decodedToken.id,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        res.status(200).json({ message: "Authorized", user });
    }
    catch (error) {
        next(error);
    }
};
exports.default = userVerify;
//# sourceMappingURL=userVerify.js.map
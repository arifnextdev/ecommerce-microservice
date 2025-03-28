"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const getEmails = async (_req, res, next) => {
    try {
        const emails = await prisma_1.default.email.findMany();
        res.status(200).json(emails);
    }
    catch (error) {
        next(error);
    }
};
exports.default = getEmails;
//# sourceMappingURL=getEmails.js.map
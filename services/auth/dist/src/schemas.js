"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userVerifySchema = exports.AccessTokenSchema = exports.userLoginSchema = exports.userCreateSchema = void 0;
const zod_1 = require("zod");
exports.userCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(100),
});
exports.userLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.AccessTokenSchema = zod_1.z.object({
    token: zod_1.z.string(),
});
exports.userVerifySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().min(5).max(5),
});
//# sourceMappingURL=schemas.js.map
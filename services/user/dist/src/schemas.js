"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUpdateSchema = exports.userCreateSchema = void 0;
const zod_1 = require("zod");
exports.userCreateSchema = zod_1.z.object({
    authUserId: zod_1.z.string().nonempty(),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
});
exports.UserUpdateSchema = exports.userCreateSchema
    .omit({ authUserId: true })
    .partial();
//# sourceMappingURL=schemas.js.map
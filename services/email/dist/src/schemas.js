"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z.object({
    recipient: zod_1.z.string().email(),
    subject: zod_1.z.string(),
    body: zod_1.z.string(),
    source: zod_1.z.string(),
    sender: zod_1.z.string().email().optional(),
});
//# sourceMappingURL=schemas.js.map
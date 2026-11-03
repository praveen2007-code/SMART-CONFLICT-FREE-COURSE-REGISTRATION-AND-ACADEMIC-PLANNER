"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error('[API Error]:', err);
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
        });
        return;
    }
    // Postgres unique constraint violation error code
    if (err.code === '23505') {
        res.status(409).json({
            success: false,
            error: 'Resource already exists or duplicate registration detected.'
        });
        return;
    }
    // Postgres foreign key violation
    if (err.code === '23503') {
        res.status(400).json({
            success: false,
            error: 'Referenced entity not found.'
        });
        return;
    }
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal server error'
    });
};
exports.errorHandler = errorHandler;

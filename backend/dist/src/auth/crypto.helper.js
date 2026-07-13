"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-pepe-frog-tarot';
function base64url(str) {
    const base64 = typeof str === 'string' ? Buffer.from(str).toString('base64') : str.toString('base64');
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function fromBase64url(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4)
        base64 += '=';
    return Buffer.from(base64, 'base64').toString('utf8');
}
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString('hex')}.${salt}`;
}
async function verifyPassword(password, storedHash) {
    try {
        const [hash, salt] = storedHash.split('.');
        if (!hash || !salt)
            return false;
        const hashBuf = Buffer.from(hash, 'hex');
        const verifyBuf = (await scryptAsync(password, salt, 64));
        return (0, crypto_1.timingSafeEqual)(hashBuf, verifyBuf);
    }
    catch (e) {
        return false;
    }
}
function generateToken(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const tokenHeader = base64url(JSON.stringify(header));
    const tokenPayload = base64url(JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
    }));
    const signature = (0, crypto_1.createHmac)('sha256', JWT_SECRET)
        .update(`${tokenHeader}.${tokenPayload}`)
        .digest();
    return `${tokenHeader}.${tokenPayload}.${base64url(signature)}`;
}
function verifyToken(token) {
    try {
        const [header, payload, signature] = token.split('.');
        if (!header || !payload || !signature)
            return null;
        const expectedSignature = (0, crypto_1.createHmac)('sha256', JWT_SECRET)
            .update(`${header}.${payload}`)
            .digest();
        if (base64url(expectedSignature) !== signature)
            return null;
        const parsedPayload = JSON.parse(fromBase64url(payload));
        if (parsedPayload.exp && parsedPayload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return parsedPayload;
    }
    catch (e) {
        return null;
    }
}
//# sourceMappingURL=crypto.helper.js.map
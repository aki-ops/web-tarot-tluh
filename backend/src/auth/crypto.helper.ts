import { randomBytes, scrypt, timingSafeEqual, createHmac } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-pepe-frog-tarot';

function base64url(str: Buffer | string): string {
  const base64 = typeof str === 'string' ? Buffer.from(str).toString('base64') : str.toString('base64');
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function fromBase64url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [hash, salt] = storedHash.split('.');
    if (!hash || !salt) return false;
    const hashBuf = Buffer.from(hash, 'hex');
    const verifyBuf = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashBuf, verifyBuf);
  } catch (e) {
    return false;
  }
}

export function generateToken(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const tokenHeader = base64url(JSON.stringify(header));
  const tokenPayload = base64url(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 ngày
  }));
  const signature = createHmac('sha256', JWT_SECRET)
    .update(`${tokenHeader}.${tokenPayload}`)
    .digest();
  return `${tokenHeader}.${tokenPayload}.${base64url(signature)}`;
}

export function verifyToken(token: string): any {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    
    const expectedSignature = createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest();
    
    if (base64url(expectedSignature) !== signature) return null;
    
    const parsedPayload = JSON.parse(fromBase64url(payload));
    if (parsedPayload.exp && parsedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Đã hết hạn
    }
    return parsedPayload;
  } catch (e) {
    return null;
  }
}

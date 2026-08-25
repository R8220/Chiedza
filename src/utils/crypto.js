import crypto from 'crypto';

function keyBuffer() {
  const secret = process.env.DATA_ENCRYPTION_KEY || process.env.SESSION_SECRET || 'development-only-key';
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptText(value) {
  if (!value) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptText(value) {
  if (!value) return '';
  if (!String(value).startsWith('enc:v1:')) return String(value);
  try {
    const [, , ivB64, tagB64, dataB64] = String(value).split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return '[Unable to decrypt content]';
  }
}

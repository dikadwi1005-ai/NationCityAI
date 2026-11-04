import {createHash,createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
export const checksum=buffer=>createHash('sha256').update(buffer).digest('hex');
function key(){const key=Buffer.from(process.env.BACKUP_KEY??'','base64');if(key.length!==32)throw Error('Kunci backup tidak tersedia.');return key}
export function seal(id,archive){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv);cipher.setAAD(Buffer.from('pg:'+id));const body=Buffer.concat([cipher.update(gzipSync(JSON.stringify(archive))),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),body])}
export function open(id,blob,metadata){const expiry=Number(metadata?.expires);
 if(metadata?.id!==id||metadata.schema!=='51'||!Number.isSafeInteger(expiry)||expiry<=Date.now()||checksum(blob)!==metadata.sha256)throw Error('Objek tidak valid.');
 const cipher=createDecipheriv('aes-256-gcm',key(),blob.subarray(0,12));cipher.setAAD(Buffer.from('pg:'+id));cipher.setAuthTag(blob.subarray(12,28));return JSON.parse(gunzipSync(Buffer.concat([cipher.update(blob.subarray(28)),cipher.final()])))}

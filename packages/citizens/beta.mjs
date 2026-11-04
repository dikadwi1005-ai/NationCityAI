import {createHmac,timingSafeEqual} from 'node:crypto';
export function listed(login){return (process.env.BETA_USERNAMES??'').toLowerCase().split(',').map(s=>s.trim()).includes(login)}
export function invitation(login){if(!listed(login)||(process.env.BETA_INVITE_KEY?.length??0)<32)throw Error('Username atau konfigurasi undangan tidak valid.');return createHmac('sha256',process.env.BETA_INVITE_KEY).update('nation-beta-v1:'+login).digest('base64url')}
export function acceptsInvite(login,value){if(typeof value!=='string'||!listed(login))return false;const expected=Buffer.from(invitation(login)),given=Buffer.from(value);return given.length===expected.length&&timingSafeEqual(expected,given)}

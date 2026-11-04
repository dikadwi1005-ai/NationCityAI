import {createHash} from 'node:crypto';
function stable(value){if(Array.isArray(value))return value.map(stable);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));return value}
export function fingerprint(world){return createHash('sha256').update(JSON.stringify(stable(world))).digest('hex')}
export function assertSourceContract(archive,contract){
 const rows=archive.rows.worlds;
 if(contract.format!==1||rows.length!==1)throw Error('Kontrak sumber tidak valid.');
 const row=rows[0],world=typeof row.state==='string'?JSON.parse(row.state):row.state;
 if(row.id!==contract.worldId||row.revision!==contract.revision||world.objects.length!==contract.objectCount||fingerprint(world)!==contract.worldSha256)throw Error('Sumber berbeda dari dunia awal yang disetujui; audit ulang sebelum migrasi.');
}

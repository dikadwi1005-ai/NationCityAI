import {mkdtempSync,rmSync,existsSync} from 'node:fs';import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';
import {config,snapshot,writeMeta,restore} from '../packages/recovery/local.mjs';import {upload} from '../packages/recovery/remote.mjs';
import {connection,nativeRows} from '../packages/postgres/connection.mjs';import {fromSqlite,importArchive} from '../packages/postgres/archive.mjs';
import {auditSqlite} from './audit-sqlite.mjs';
import {readFileSync} from 'node:fs';
import {assertSourceContract} from '../packages/postgres/source-contract.mjs';
if(process.argv[2]!=='--confirm-new-schema'||!process.env.MIGRATION_SOURCE||!process.env.MIGRATION_DATABASE_URL)throw Error('Tentukan MIGRATION_SOURCE, MIGRATION_DATABASE_URL dan --confirm-new-schema.');
const source=resolve(process.env.MIGRATION_SOURCE);if(!existsSync(source))throw Error('Database sumber belum tersedia.');
const audited=auditSqlite(source),archive=fromSqlite(source,{requireComplete:true});
const contract=JSON.parse(readFileSync(resolve('deploy/railway/source-contract.json'),'utf8'));assertSourceContract(archive,contract);
if(audited.seedOnly&&!process.argv.includes('--allow-seed-source'))throw Error('Sumber hanya berisi dunia awal tanpa riwayat. Tentukan data lama yang benar, atau gunakan --allow-seed-source setelah pemilik memilih sumber ini secara eksplisit.');
if(process.env.MIGRATION_WRITES_FROZEN!=='true')throw Error('Bekukan penulisan web dan multiplayer sumber, lalu set MIGRATION_WRITES_FROZEN=true.');
nativeRows();const db=connection(process.env.MIGRATION_DATABASE_URL),temp=mkdtempSync(join(tmpdir(),'nation-cutover-'));
try{const {dir}=config(source),meta=snapshot(source,'pre-migration-postgres');meta.remote=await upload(dir,meta);writeMeta(dir,meta);
 if(meta.remote!=='terverifikasi')throw Error('Migrasi staging memerlukan backup pra-migrasi terverifikasi di luar host.');
 const immutable=join(temp,'migration.sqlite');restore(source,meta.id,immutable);const frozen=fromSqlite(immutable,{requireComplete:true});assertSourceContract(frozen,contract);await db.connect();console.log(JSON.stringify(await importArchive(db,frozen,process.env.RUNTIME_DB_ROLE,process.env.MIGRATION_TARGET_DATABASE)));console.log('Verified source backup',meta.id)
}finally{await db.end().catch(()=>{});rmSync(temp,{recursive:true,force:true})}

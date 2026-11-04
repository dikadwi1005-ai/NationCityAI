import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {WorldStore} from '../packages/persistence/store.ts';
import {auditSqlite} from '../scripts/audit-sqlite.mjs';
import {fromSqlite} from '../packages/postgres/archive.mjs';

test('audit never creates missing source; recognizes migrated starter and rejects incomplete import',()=>{
 const dir=mkdtempSync(join(tmpdir(),'nation-audit-')),file=join(dir,'nation.sqlite');
 try{
  assert.throws(()=>auditSqlite(file),/menolak membuat/);assert.equal(existsSync(file),false);
  const store=new WorldStore(file);store.close();
  assert.throws(()=>fromSqlite(file,{requireComplete:true}),/Schema sumber belum lengkap/);
  const audit=auditSqlite(file);assert.equal(audit.worlds[0].matchesStarter,true);
  assert.ok(audit.missingVersions.includes(5));assert.ok(audit.missingTables.includes('citizens'));
 }finally{rmSync(dir,{recursive:true,force:true})}
});

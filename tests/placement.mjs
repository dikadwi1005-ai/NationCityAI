import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { chromium } from 'playwright-core';

const dir = await mkdtemp(join(tmpdir(), 'nation-browser-'));
const key = randomUUID();
function startServer(){ return spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', 'apps/web', '-p', '0', '-H', '127.0.0.1'], {
  env: { ...process.env, ADMIN_KEY: key, WORLD_DATA_DIR: dir, NO_COLOR: '1' },
  stdio: ['ignore', 'pipe', 'inherit'],
});
}
let server=startServer(),exited=once(server,'exit');
async function ready(){
  let output = '';
  let origin;
  for await (const chunk of server.stdout) {
    output += chunk;
    origin = output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    if (origin && output.includes('Ready')) break;
  }
  assert.ok(origin);
  return origin;
}
let browser;
try {
  let origin=await ready();
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin);
  const world = () => page.request.get(origin + '/api/world').then(r => r.json());
  const initial = await world();
  const post = (data, headers = { Origin: origin }) => page.request.post(origin + '/api/world', { data, headers });
  assert.equal((await post({})).status(), 403);
  await page.getByRole('button', { name: 'Masuk admin' }).click();
  await page.getByLabel('Kunci administrator').fill(key);
  const login = page.waitForResponse(r => r.url().endsWith('/api/session') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Masuk World Builder' }).click();
  const session = await login;
  assert.equal(session.status(), 200, await session.text());
  await page.getByRole('button', { name: /Rumah warga/ }).click();
  assert.equal((await post({}, { Origin: 'https://invalid.example' })).status(), 403);
  assert.equal((await post({})).status(), 400);
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  assert.ok(box);
  // Orthographic home camera faces the origin along (1,1,1), at 10 pixels per metre.
  const x = box.x + box.width / 2 + (18 - 12) * 10 / Math.sqrt(2);
  const y = box.y + box.height / 2 + (18 + 12 - 2 * .85) * 10 / Math.sqrt(6);
  await page.mouse.click(x, y);
  await page.getByText('Tersimpan di server', { exact: true }).waitFor();
  const saved = await world();
  const house = saved.objects.find(o => !initial.objects.some(i => i.id === o.id));
  assert.equal(house?.asset, 'house');
  assert.equal((await post({ requestId: randomUUID(), expectedRevision: initial.revision, command: { type: 'remove', id: house.id } })).status(), 409);
  await page.reload();
  await page.getByText('Dunia tersimpan', { exact: true }).waitFor();
  assert.deepEqual((await world()).objects.find(o => o.id === house.id), house);
  await canvas.waitFor();
  const selectHouse = async () => {
    await page.mouse.click(x, y - 8);
    await page.getByText('ID: ' + house.id.slice(0,8), { exact: false }).waitFor({timeout: 1500});
  };
  for (let i = 0; ; i++) {
    try { await selectHouse(); break; } catch (error) { if (i >= 4) throw error; }
  }
  await page.getByRole('button',{name:'Buka atlas negara'}).click();
  await page.getByLabel('Nama',{exact:true}).fill('Pulau Sagara');
  await page.getByRole('button',{name:'Pratinjau terrain'}).click();
  assert.equal((await world()).revision,saved.revision);
  await page.getByRole('button',{name:'Simpan dunia'}).click();
  await page.getByRole('button',{name:'Simpan dunia'}).waitFor({state:'hidden'});
  const expanded=await world();
  assert.deepEqual(expanded.objects,saved.objects);
  const island=expanded.geo.strokes[0];
  assert.equal(island.name,'Pulau Sagara');
  await page.getByLabel('Operasi').selectOption('raise');
  await page.getByRole('button',{name:'Pratinjau terrain'}).click();
  await page.getByRole('button',{name:'Simpan dunia'}).click();
  await page.getByRole('button',{name:'Simpan dunia'}).waitFor({state:'hidden'});
  const sculpted=await world();
  assert.equal(sculpted.geo.strokes[1].tool,'raise');
  async function history(name){const ack=page.waitForResponse(r=>r.url().endsWith('/api/world')&&r.request().method()==='POST');await page.getByRole('button',{name}).click();assert.equal((await ack).status(),200)}
  await history(/Urungkan/);assert.deepEqual((await world()).geo,expanded.geo);
  await history(/Ulangi/);assert.deepEqual((await world()).geo,sculpted.geo);
  await page.reload();
  await page.getByRole('button',{name:'Buka atlas negara'}).click();
  await page.getByLabel('Pulau',{exact:true}).selectOption(island.id);
  await page.getByRole('button',{name:'Ikhtisar nasional'}).click();
  await page.screenshot({path:'docs/phase-2-overview.png',animations:'disabled'});
  const final=await world();
  assert.deepEqual(final.objects,saved.objects);
  server.kill();await exited;server=startServer();exited=once(server,'exit');origin=await ready();
  await page.goto(origin);assert.deepEqual(await world(),final);
  console.log('PASS: preview tanpa commit, pulau baru, sculpt, undo/redo, refresh, ikhtisar, restart produksi. Revisi', final.revision);
  assert.deepEqual(errors, []);
  console.log('PASS: penempatan melalui viewport, ACK server, refresh, pemilihan mesh dengan ID sama, validasi API', house.x, house.z);
} finally {
  await browser?.close();
  server.kill();
  await exited;
  await rm(dir, { recursive: true, force: true });
}

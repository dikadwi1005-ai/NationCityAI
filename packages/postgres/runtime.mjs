export function pgRuntime(){if(process.env.NATION_ENV==='staging'&&process.env.NATION_DB!=='postgres')throw Error('Staging memerlukan PostgreSQL.');return process.env.NATION_DB==='postgres'}
export function closedBeta(){return process.env.NATION_ENV==='staging'||process.env.CLOSED_BETA==='true'}
export function webOrigin(){const raw=process.env.WEB_ORIGIN;if(!raw)return '';const u=new URL(raw);if(u.protocol!=='https:'||u.origin!==raw)throw Error('WEB_ORIGIN wajib berupa origin HTTPS.');return u.origin}

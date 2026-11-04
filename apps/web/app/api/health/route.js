import {store} from '../../../../../packages/persistence/store';
import {pgRuntime} from '../../../../../packages/postgres/runtime.mjs';
export const dynamic='force-dynamic';
export function GET(){try{const backend=pgRuntime()?'postgres':'sqlite',db=store().db;if(!db.prepare('SELECT id FROM worlds LIMIT 1').get())throw Error();const schemaVersion=db.prepare('SELECT max(version) AS version FROM schema_migrations').get().version;return Response.json({status:'ready',backend,schemaVersion,release:process.env.RAILWAY_GIT_COMMIT_SHA??null},{headers:{'cache-control':'no-store'}})}catch{return Response.json({status:'unavailable'},{status:503,headers:{'cache-control':'no-store'}})}}

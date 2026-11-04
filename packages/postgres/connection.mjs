import pg from 'pg';
export function connection(value=process.env.DATABASE_URL){
 if(!value)throw Error('DATABASE_URL wajib untuk PostgreSQL.');const u=new URL(value);
 if(!['postgres:','postgresql:'].includes(u.protocol)||![...u.searchParams.keys()].every(k=>k==='sslmode'))throw Error('URL database tidak didukung.');
 const privateHost=['localhost','127.0.0.1','[::1]'].includes(u.hostname)||u.hostname.endsWith('.railway.internal');
 const tls=!privateHost||process.env.PG_CA_PEM||u.searchParams.get('sslmode')==='verify-full';u.search='';
 return new pg.Client({connectionString:u.toString(),ssl:tls?{rejectUnauthorized:true,...(process.env.PG_CA_PEM?{ca:process.env.PG_CA_PEM.replace(/\\n/g,'\n')}:{})}:false,connectionTimeoutMillis:7000,statement_timeout:20000,application_name:'nation-staging',options:'-c timezone=UTC -c search_path=nation_import,pg_catalog'});
}
export function nativeRows(){for(const oid of [114,3802,1114])pg.types.setTypeParser(oid,s=>s);pg.types.setTypeParser(20,s=>Number(s))}

import {snapshot} from '../recovery/local.mjs';
export const definitions={
 gov_regions:'id text PRIMARY KEY,name text NOT NULL,parent text REFERENCES gov_regions(id),level integer NOT NULL,active integer NOT NULL DEFAULT 1',
 residency:'id text PRIMARY KEY,citizen text NOT NULL REFERENCES citizens(id),region text NOT NULL REFERENCES gov_regions(id),since bigint NOT NULL,ended bigint',
 offices:'id text PRIMARY KEY,title text NOT NULL,region text NOT NULL REFERENCES gov_regions(id),method text NOT NULL,days integer NOT NULL,min_age integer NOT NULL,building text,permission text NOT NULL',
 elections:'id text PRIMARY KEY,office text NOT NULL REFERENCES offices(id),state text NOT NULL,opens bigint NOT NULL,closes bigint NOT NULL,tie_rule text NOT NULL,created bigint NOT NULL',
 candidates:'id text PRIMARY KEY,election text NOT NULL REFERENCES elections(id),citizen text NOT NULL REFERENCES citizens(id),program text NOT NULL,status text NOT NULL,ordinal integer NOT NULL,UNIQUE(election,citizen),UNIQUE(election,id)',
 eligibility:'election text NOT NULL REFERENCES elections(id),citizen text NOT NULL REFERENCES citizens(id),region text NOT NULL REFERENCES gov_regions(id),PRIMARY KEY(election,citizen)',
 participation:'election text NOT NULL,citizen text NOT NULL,PRIMARY KEY(election,citizen),FOREIGN KEY(election,citizen) REFERENCES eligibility(election,citizen)',
 ballots:'nonce text PRIMARY KEY,election text NOT NULL,candidate text NOT NULL,FOREIGN KEY(election,candidate) REFERENCES candidates(election,id)',
 election_results:'election text NOT NULL,candidate text NOT NULL,votes integer NOT NULL,PRIMARY KEY(election,candidate),FOREIGN KEY(election,candidate) REFERENCES candidates(election,id)',
 office_terms:'id text PRIMARY KEY,office text NOT NULL REFERENCES offices(id),citizen text NOT NULL REFERENCES citizens(id),election text UNIQUE REFERENCES elections(id),starts bigint NOT NULL,ends bigint NOT NULL,archived bigint,uniform integer NOT NULL DEFAULT 0',
 proposals:'id text PRIMARY KEY,citizen text NOT NULL REFERENCES citizens(id),region text NOT NULL REFERENCES gov_regions(id),kind text NOT NULL,description text NOT NULL,status text NOT NULL,created bigint NOT NULL',
 gov_events:'id text PRIMARY KEY,kind text NOT NULL,region text NOT NULL REFERENCES gov_regions(id),citizen text REFERENCES citizens(id),at bigint NOT NULL,metadata text NOT NULL',
 gov_audit:'id text PRIMARY KEY,action text NOT NULL,subject text NOT NULL,at bigint NOT NULL,actor text NOT NULL'
};
export const indexes=["CREATE UNIQUE INDEX IF NOT EXISTS current_home ON residency(citizen) WHERE ended IS NULL","CREATE UNIQUE INDEX IF NOT EXISTS open_race ON elections(office) WHERE state NOT IN ('CANCELLED','FINALIZED')","CREATE UNIQUE INDEX IF NOT EXISTS active_office ON office_terms(office) WHERE archived IS NULL","CREATE UNIQUE INDEX IF NOT EXISTS active_official ON office_terms(citizen) WHERE archived IS NULL"];
export const views={
 official_assignments:'SELECT id AS term_id,office,citizen,starts,ends FROM office_terms WHERE archived IS NULL',
 construction_queue:"SELECT id,region,citizen,kind,description,created FROM proposals WHERE status='APPROVED'"
};
export function migrate(db){
 if(db.prepare('SELECT 1 FROM schema_migrations WHERE version=5').get())return;
 const source=db.prepare('PRAGMA database_list').get().file;if(source)snapshot(source,'pre-migration-v5');
 db.exec('BEGIN IMMEDIATE');try{for(const [t,ddl] of Object.entries(definitions))db.exec('CREATE TABLE IF NOT EXISTS '+t+' ('+ddl+')'+(['ballots','participation'].includes(t)?' WITHOUT ROWID':''));for(const sql of indexes)db.exec(sql);for(const [name,q] of Object.entries(views))db.exec('CREATE VIEW IF NOT EXISTS '+name+' AS '+q);
 db.exec("INSERT OR IGNORE INTO gov_regions VALUES('nation-001','Nusantara Baru',NULL,0,1); INSERT OR IGNORE INTO schema_migrations VALUES(5);COMMIT")}catch(e){db.exec('ROLLBACK');throw e}
}

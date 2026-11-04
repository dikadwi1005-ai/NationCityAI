import {invitation} from '../packages/citizens/beta.mjs';
// Run interactively in a private operator terminal, never as a deployment/start/build command.
if(!process.stdout.isTTY)throw Error('Gunakan terminal operator privat.');console.log(invitation((process.argv[2]??'').toLowerCase()));

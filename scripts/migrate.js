import { readFile } from 'node:fs/promises';
import { migrate, checkDatabase, closeRepository } from '../src/lib/repository.js';
try { await migrate(await readFile(new URL('../migrations/001_initial.sql',import.meta.url),'utf8')); console.log(`Migração verificada: schema ${await checkDatabase()}`); } finally { closeRepository(); }

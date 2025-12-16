/**
 * Charge les variables d'environnement depuis .env.local
 * À importer en premier dans tous les scripts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Charger .env.local depuis la racine du projet
const envPath = resolve(__dirname, '../../.env.local');
config({ path: envPath });

console.log('✅ Variables environnement chargees depuis .env.local');

#!/bin/bash
# Vérifier les événements et cotes en base de données

export $(cat .env.local | grep -v '^#' | xargs)
npx tsx scripts/check-events.ts

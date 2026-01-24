# 🔍 Review et Améliorations - OddsTracker v4

## ⚠️ Problèmes Critiques

### 1. **Sécurité : Pas d'authentification sur les API routes**

**Fichiers concernés :**
- `app/api/v4/settings/route.ts`
- Toutes les routes API v4

**Problème :**
N'importe qui peut modifier les settings, lancer des syncs, ou accéder aux données sans authentification.

**Solution recommandée :**
```typescript
// lib/auth/middleware.ts
export function requireAuth(request: NextRequest) {
  const password = request.headers.get('x-app-password');
  if (password !== process.env.APP_PASSWORD) {
    throw new Error('Unauthorized');
  }
}

export function requireCronSecret(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    throw new Error('Unauthorized');
  }
}
```

Ajouter dans chaque route PUT/POST/DELETE :
```typescript
export async function PUT(request: NextRequest) {
  try {
    requireAuth(request); // ⬅️ Ajouter cette ligne
    // ... reste du code
  }
}
```

---

### 2. **Bug : Détection des nouveaux événements**

**Fichier :** `lib/services/theoddsapi/discovery.ts:151`

**Problème :**
```typescript
if (!existing.created_at || new Date(existing.created_at).getTime() > startTime - 60000) {
  // Crée market_states seulement si créé dans les 60 dernières secondes
  await createMarketStatesForEvent(...)
}
```

Si un événement est découvert puis que le script redémarre après 2h, les market_states ne seront jamais créés.

**Solution :**
```typescript
// Vérifier si l'événement a déjà des market_states
const { data: existingStates } = await (supabaseAdmin as any)
  .from('market_states')
  .select('id')
  .eq('event_id', existing.id)
  .limit(1);

if (!existingStates || existingStates.length === 0) {
  // Pas de market_states -> en créer
  await createMarketStatesForEvent(
    existing.id,
    trackedMarkets,
    event.commence_time
  );
}
```

---

### 3. **Bug : Inner join sur market_states**

**Fichier :** `lib/db/queries-frontend.ts:60`

**Problème :**
```typescript
.select(`
  *,
  market_states!inner(...)  // ⬅️ INNER JOIN
`)
```

Les événements sans market_states n'apparaîtront jamais dans la liste.

**Solution :**
```typescript
.select(`
  *,
  market_states!left(...)  // ⬅️ LEFT JOIN
`)
```

---

## ⚡ Optimisations de Performance

### 4. **Index manquants pour les recherches**

**Problème :**
La recherche par équipe utilise `ilike` sans index :
```sql
-- Dans queries-frontend.ts:88
query.or(`home_team.ilike.%${search}%,away_team.ilike.%${search}%`)
```

**Solution :**
Créer des index GIN pour les recherches textuelles :
```sql
-- migrations/add-search-indexes.sql
CREATE INDEX idx_events_home_team_gin ON events USING gin(home_team gin_trgm_ops);
CREATE INDEX idx_events_away_team_gin ON events USING gin(away_team gin_trgm_ops);

-- Activer l'extension pg_trgm si pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

### 5. **Requête N+1 potentielle**

**Fichier :** `lib/services/theoddsapi/opening-odds.ts:239`

**Problème :**
```typescript
for (const event of eventsWithPending) {
  const pendingMarkets = await getPendingMarkets(event.id); // ⬅️ N requêtes
}
```

**Solution :**
Récupérer tous les pending markets en une seule requête :
```typescript
// Récupérer tous les event IDs
const eventIds = eventsWithPending.map(e => e.id);

// Une seule requête
const { data: allPendingMarkets } = await (supabaseAdmin as any)
  .from('market_states')
  .select('*')
  .in('event_id', eventIds)
  .eq('status', 'pending');

// Grouper par event_id
const marketsByEvent = new Map();
allPendingMarkets?.forEach(m => {
  if (!marketsByEvent.has(m.event_id)) {
    marketsByEvent.set(m.event_id, []);
  }
  marketsByEvent.get(m.event_id).push(m);
});

// Utiliser dans la boucle
for (const event of eventsWithPending) {
  const pendingMarkets = marketsByEvent.get(event.id) || [];
  // ...
}
```

---

## 🛠️ Améliorations Recommandées

### 6. **Validation des données d'entrée**

**Fichiers :** Toutes les API routes

**Amélioration :**
Ajouter Zod pour valider les inputs :
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const UpdateSettingSchema = z.object({
  key: z.enum(['tracked_sports', 'tracked_markets', 'scan_frequency', ...]),
  value: z.union([
    z.array(z.string()),
    z.number(),
    z.string(),
    z.boolean()
  ]),
});

// Dans la route
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const validated = UpdateSettingSchema.parse(body); // ⬅️ Validation
  // ...
}
```

---

### 7. **Gestion d'erreurs plus robuste**

**Fichiers :** Tous les services

**Amélioration :**
```typescript
// lib/utils/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor() {
    super('API rate limit exceeded', 429, 'RATE_LIMIT');
  }
}

// Utilisation
try {
  const response = await client.getEvents(...);
} catch (error) {
  if (error.response?.status === 429) {
    throw new RateLimitError();
  }
  throw new ApiError('Failed to fetch events', 500);
}
```

---

### 8. **Logging structuré**

**Amélioration :**
Remplacer les `console.log` par un logger structuré :
```typescript
// lib/utils/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta,
      timestamp: new Date().toISOString()
    }));
  },
};

// Utilisation
logger.info('Syncing events', { sportKey, eventsCount: events.length });
```

---

### 9. **Cache pour les filter options**

**Fichier :** `lib/db/queries-frontend.ts:152`

**Amélioration :**
Les filter options changent rarement, les cacher :
```typescript
// lib/cache/filter-options.ts
let cache: { data: FilterOptions; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedFilterOptions(): Promise<FilterOptions> {
  const now = Date.now();

  if (cache && (now - cache.timestamp) < CACHE_TTL) {
    return cache.data;
  }

  const data = await getFilterOptions();
  cache = { data, timestamp: now };
  return data;
}
```

---

### 10. **Pagination côté serveur améliorée**

**Fichier :** `lib/db/queries-frontend.ts:33`

**Amélioration :**
Ajouter cursor-based pagination pour de meilleures performances sur de gros datasets :
```typescript
export async function fetchEventsForTable(params: {
  // ... existing params
  cursor?: string; // timestamp ISO de commence_time
  direction?: 'next' | 'prev';
}) {
  let query = ...;

  if (params.cursor) {
    if (params.direction === 'next') {
      query = query.gt('commence_time', params.cursor);
    } else {
      query = query.lt('commence_time', params.cursor);
    }
  }

  query = query.order('commence_time').limit(params.pageSize);

  // ...
}
```

---

## 📊 Monitoring et Observabilité

### 11. **Dashboard de monitoring API**

**Amélioration :**
Créer une page `/admin/monitoring` qui affiche :
- Consommation API en temps réel
- Taux de succès/échec des jobs
- Temps de réponse moyen
- Events avec le plus de retries

**Requête SQL exemple :**
```sql
-- Top événements avec le plus d'erreurs
SELECT
  e.home_team,
  e.away_team,
  COUNT(*) as error_count
FROM api_usage_logs aul
JOIN events e ON aul.sport_key = e.sport_key
WHERE aul.success = false
  AND aul.created_at > NOW() - INTERVAL '7 days'
GROUP BY e.id, e.home_team, e.away_team
ORDER BY error_count DESC
LIMIT 10;
```

---

### 12. **Alertes automatiques**

**Amélioration :**
Ajouter des alertes quand :
- Quota API < 10% restant
- Taux d'échec > 20%
- Aucun sync depuis 24h

```typescript
// lib/monitoring/alerts.ts
export async function checkAlerts() {
  const usage = await getApiUsageToday();
  const quota = 500; // Plan gratuit

  if (usage.totalCredits > quota * 0.9) {
    await sendAlert({
      type: 'quota_warning',
      message: `API quota at ${Math.round(usage.totalCredits / quota * 100)}%`,
    });
  }
}
```

---

## 🧪 Tests

### 13. **Tests manquants**

**Amélioration :**
Ajouter des tests unitaires et d'intégration :

```typescript
// __tests__/services/discovery.test.ts
describe('Discovery Service', () => {
  it('should sync sports correctly', async () => {
    const result = await syncSports();
    expect(result.success).toBe(true);
    expect(result.sportsCount).toBeGreaterThan(0);
  });

  it('should create market_states for new events', async () => {
    // ...
  });
});

// __tests__/api/v4/events.test.ts
describe('GET /api/v4/events', () => {
  it('should require authentication', async () => {
    const res = await fetch('/api/v4/events');
    expect(res.status).toBe(401);
  });

  it('should return events when authenticated', async () => {
    // ...
  });
});
```

---

## 🎯 Priorités d'implémentation

### Priorité 1 - CRITIQUE (À faire maintenant)
- [ ] **#1 : Authentification sur les API routes**
- [ ] **#2 : Fix détection nouveaux événements**
- [ ] **#3 : Fix inner join → left join**

### Priorité 2 - IMPORTANT (Cette semaine)
- [ ] **#4 : Index pour les recherches**
- [ ] **#5 : Optimisation requête N+1**
- [ ] **#6 : Validation avec Zod**

### Priorité 3 - AMÉLIORATION (Ce mois)
- [ ] **#7 : Gestion d'erreurs robuste**
- [ ] **#8 : Logging structuré**
- [ ] **#9 : Cache filter options**
- [ ] **#11 : Dashboard monitoring**

### Priorité 4 - OPTIONNEL (Plus tard)
- [ ] **#10 : Cursor-based pagination**
- [ ] **#12 : Alertes automatiques**
- [ ] **#13 : Tests unitaires**

---

## ✅ Ce qui fonctionne bien

- ✅ Architecture v4 bien structurée
- ✅ Séparation claire entre discovery/opening/closing
- ✅ Smart scan qui évite les requêtes inutiles
- ✅ Logging API usage pour monitoring
- ✅ Upsert pour éviter les duplicatas
- ✅ GitHub Actions workflows bien configurés
- ✅ Frontend adapté avec composants réutilisables

---

**Prochaine étape recommandée :** Commencer par les 3 problèmes critiques (#1, #2, #3).

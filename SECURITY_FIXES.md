# Correctifs de Sécurité

## 🔒 Remplacement de `xlsx` par `exceljs`

### Problème Identifié

Le package `xlsx@0.18.5` présente des vulnérabilités de sécurité :

1. **Prototype Pollution** (Haute)
   - CVE: GHSA-4r6h-8v6p-xvw6
   - Impact: Possibilité de modifier les propriétés des objets JavaScript

2. **Regular Expression Denial of Service (ReDoS)** (Haute)
   - CVE: GHSA-5pgg-2g8v-p4x9
   - Impact: Possibilité de bloquer l'application avec des expressions régulières malicieuses

### Solution Implémentée

Remplacement par **ExcelJS v4.4.0** :
- ✅ Aucune vulnérabilité de sécurité connue
- ✅ Bien maintenu et activement développé
- ✅ Support TypeScript natif
- ✅ API moderne et complète
- ✅ Meilleure gestion des styles et formats

### Changements dans le Code

#### Avant (xlsx)
```typescript
import * as XLSX from "xlsx";

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Données");
const xlsxBuffer = XLSX.write(workbook, { type: "buffer" });
```

#### Après (exceljs)
```typescript
import ExcelJS from "exceljs";

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Données");
worksheet.columns = visibleColumns.map(col => ({
  header: getColumnLabel(col),
  key: col,
  width: 15
}));
data.forEach(row => worksheet.addRow(row));
const buffer = await workbook.xlsx.writeBuffer();
```

### Avantages Supplémentaires

1. **Styles Améliorés**
   - En-têtes avec fond gris et texte en gras
   - Largeur de colonnes automatique
   - Support des couleurs et formats personnalisés

2. **Performance**
   - Meilleure gestion de la mémoire
   - Streaming supporté pour les gros fichiers

3. **Fonctionnalités**
   - Formules Excel
   - Images
   - Validation de données
   - Graphiques

### Fichiers Modifiés

- ✅ `package.json` - Remplacement de la dépendance
- ✅ `lib/export/xlsx-export.ts` - Réécriture avec ExcelJS

### Installation

```bash
npm uninstall xlsx
npm install exceljs
```

Ou simplement :
```bash
npm install
```

### Vérification

Après l'installation, vérifier qu'il n'y a plus de vulnérabilités :
```bash
npm audit
```

Résultat attendu : `found 0 vulnerabilities`

### Documentation ExcelJS

- [Documentation officielle](https://github.com/exceljs/exceljs)
- [API Reference](https://github.com/exceljs/exceljs#interface)
- [Exemples](https://github.com/exceljs/exceljs#usage)

### Notes de Migration

Si vous ajoutez de nouvelles fonctionnalités d'export :

1. **Créer un workbook**
   ```typescript
   const workbook = new ExcelJS.Workbook();
   ```

2. **Ajouter une feuille**
   ```typescript
   const worksheet = workbook.addWorksheet("Nom de la feuille");
   ```

3. **Définir les colonnes**
   ```typescript
   worksheet.columns = [
     { header: "Nom", key: "name", width: 20 },
     { header: "Age", key: "age", width: 10 }
   ];
   ```

4. **Ajouter des données**
   ```typescript
   worksheet.addRow({ name: "John", age: 30 });
   ```

5. **Styliser**
   ```typescript
   worksheet.getRow(1).font = { bold: true };
   worksheet.getCell("A1").fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: "FFFF0000" }
   };
   ```

6. **Générer le fichier**
   ```typescript
   const buffer = await workbook.xlsx.writeBuffer();
   const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
   ```

## 🔍 Audit de Sécurité

### Commandes de Vérification

```bash
# Vérifier les vulnérabilités
npm audit

# Obtenir un rapport détaillé
npm audit --json

# Corriger automatiquement (si possible)
npm audit fix

# Corriger même les breaking changes
npm audit fix --force
```

### Bonnes Pratiques

1. ✅ Toujours vérifier `npm audit` avant le déploiement
2. ✅ Mettre à jour régulièrement les dépendances
3. ✅ Utiliser `npm outdated` pour voir les packages obsolètes
4. ✅ Consulter GitHub Security Advisories
5. ✅ Activer Dependabot sur le repository GitHub

### Prochaines Vérifications

- [ ] Vérifier régulièrement les mises à jour de sécurité
- [ ] Mettre en place un workflow CI/CD avec audit de sécurité
- [ ] Configurer Dependabot pour les mises à jour automatiques

## 📅 Historique des Correctifs

| Date | Package | Vulnérabilité | Action | Status |
|------|---------|---------------|--------|--------|
| 2025-12-04 | xlsx@0.18.5 | Prototype Pollution + ReDoS | Remplacé par exceljs@4.4.0 | ✅ Corrigé |

---

**Dernière mise à jour** : 04/12/2025
**Responsable** : Équipe de développement OddsTracker

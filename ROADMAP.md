# 📋 PHARMAXY - Plan Directeur & Tracker d'Avancement (Master Issue)

> **Document de référence & Suivi de projet**  
> Ce document est la source unique de vérité de l'avancement du projet Pharmaxy.  
> Nous avançons dans l'ordre strict des priorités : **🔴 Critique ➔ 🟠 Haute ➔ 🟡 Moyenne**.  
> À chaque étape, les tâches terminées sont cochées (`[x]`), et la prochaine action prioritaire est mise en exergue dans la section **Focus Actuel**.

---

## 🎯 Focus Actuel
- **Phase active :** 🟠 PRIORITÉ HAUTE
- **Épic en cours :** Épic 2.3 - Module Patients (`/patients`)
- **Objectif immédiat :** Développer l'annuaire et le dossier patient (fiche complète, allergies, pathologies chroniques, recherche instantanée, historique des achats et ordonnances, liaison POS).

---

## 📊 Tableau de Bord de Progression

| Priorité | Module / Épic | Statut | Tâches Terminées |
| :--- | :--- | :---: | :---: |
| 🔴 **Critique** | 1.1 Backend & Base de Données SQLite | `[x] TERMINÉ` | 7 / 7 |
| 🔴 **Critique** | 1.2 Module POS Fonctionnel & Stock | `[x] TERMINÉ` | 8 / 8 |
| 🔴 **Critique** | 1.3 Authentification & Sessions | `[x] TERMINÉ` | 5 / 5 |
| 🔴 **Critique** | 1.4 Impression Thermique ESC/POS | `[x] TERMINÉ` | 4 / 4 |
| 🟠 **Haute** | 2.1 Module Stock & Inventaire (`/inventory`) | `[x] TERMINÉ` | 8 / 8 |
| 🟠 **Haute** | 2.2 Module Caisse & Clôtures | `[x] TERMINÉ` | 5 / 5 |
| 🟠 **Haute** | 2.3 Module Fiches Patients (`/patients`) | `[ ] À FAIRE` | 0 / 5 |
| 🟠 **Haute** | 2.4 Module Crédit Client & Recouvrement (`/credits`) | `[ ] À FAIRE` | 0 / 6 |
| 🟠 **Haute** | 2.5 Module Livraisons & Réceptions Fournisseurs | `[ ] À FAIRE` | 1 / 5 |
| 🟡 **Moyenne** | 3.1 Module Rapports & Statistiques (`/reports`) | `[ ] À FAIRE` | 0 / 7 |
| 🟡 **Moyenne** | 3.2 Module Stupéfiants & Psychotropes (`/narcotics`) | `[ ] À FAIRE` | 0 / 5 |
| 🟡 **Moyenne** | 3.3 Module Paramètres & Sauvegardes (`/settings`) | `[ ] À FAIRE` | 0 / 6 |

---

## 🔴 PHASE 1 : PRIORITÉ CRITIQUE (Bloquant pour la production)

### 🧱 Épic 1.1 : Backend & Base de Données SQLite
> Objectif : Disposer d'une base locale SQLite robuste, intègre et typée sous Tauri v2.

- [x] **1.1.1** Initialisation SQLite via `tauri-plugin-sql` (`database.ts`, `initializeDatabase.ts`)
- [x] **1.1.2** Migration initiale au lancement (Tables : `pharmacies`, `users`, `products`, `suppliers`, `clients`, `lots`, `sales`, `sale_lines`, `payments`, `stock_adjustments`)
- [x] **1.1.3** Complétion du schéma : Tables `categories`, `deliveries`, `delivery_items`, `cash_sessions`, `narcotic_logs`, `settings`
- [x] **1.1.4** DAL & Requêtes CRUD Produits (`productQueries.ts` : create, read, update, delete, search, lots, péremptions FEFO)
- [x] **1.1.5** DAL & Requêtes CRUD Catégories (`categoryQueries.ts` : list, create, update, delete avec dissociation sécurisée)
- [x] **1.1.6** DAL & Requêtes CRUD Fournisseurs (`supplierQueries.ts` : list, create, update, delete avec centrales CAMEG/Laborex/etc.)
- [x] **1.1.7** Validation stricte des données (Zod / TypeScript + Contraintes SQL SQLite)

---

### 🛒 Épic 1.2 : Module POS Fonctionnel (Caisse & Vente)
> Objectif : Permettre d'encaisser une vente complète avec décrémentation réelle du stock.

- [x] **1.2.1** Moteur de recherche de produits en DB (recherche instantanée par Nom, DCI, Code-barres avec Concurrent Mode)
- [x] **1.2.2** Ajout au panier dynamique connecté à la DB (vérification du stock réel disponible)
- [x] **1.2.3** Calculs financiers automatiques (Sous-total, Total FCFA, Monnaie rendue, raccourcis billets FCFA)
- [x] **1.2.4** Contrôle strict du stock (blocage si stock épuisé ou insuffisant, alerte seuil max)
- [x] **1.2.5** Gestion financière des prix (Prix d'achat lot, Prix de vente FCFA, traçabilité marge)
- [x] **1.2.6** Transaction de vente atomique (`BEGIN TRANSACTION` -> insertion `sales` + `sale_lines` + `payments` + décrémentation `lots` via règle FEFO)
- [x] **1.2.7** Génération d'un numéro de ticket unique (ex: `TK-YYYYMMDD-XXXX`)
- [x] **1.2.8** Support du lecteur de code-barres USB / douchette (écoute des événements scanner hardware)

---

### 🔐 Épic 1.3 : Authentification & Sécurité Caisse
> Objectif : Verrouiller l'accès aux données et tracer les opérations par utilisateur.

- [x] **1.3.1** Interface Clavier PIN moderne (`PinLogin.tsx`) avec `useTransition`
- [x] **1.3.2** Vérification du PIN haché/comparé en DB (`verifyUserPin`)
- [x] **1.3.3** Gestion d'état de session globale (User connecté, rôle admin/cashier, persistance sécurisée)
- [x] **1.3.4** Protection des routes React (`PrivateRoute` / `AuthGuard` empêchant l'accès direct aux URLs sans session)
- [x] **1.3.5** Bouton de déconnexion / verrouillage rapide de caisse (dans le Header / Sidebar)

---

### 🖨️ Épic 1.4 : Impression Thermique & Matériel Caisse
> Objectif : Émettre un ticket physique conforme et piloter le tiroir-caisse.

- [x] **1.4.1** Module de génération de tickets ESC/POS (format 80mm / 58mm)
- [x] **1.4.2** Template officiel de ticket de caisse (En-tête pharmacie MINSANTE, détails lignes, total FCFA, mentions légales, nom vendeur)
- [x] **1.4.3** Déclenchement automatique de l'impression à la validation de la vente
- [x] **1.4.4** Envoi de la commande ESC/POS d'ouverture automatique du tiroir-caisse (`pulse drawer`)

---

## 🟠 PHASE 2 : PRIORITÉ HAUTE (Essentiel Officine)

### 📦 Épic 2.1 : Module Stock & Inventaire (`/inventory` & `/stock`)
- [x] **2.1.1** Page dédiée `/inventory` / `/stock` avec tableau filtrable et paginé
- [x] **2.1.2** Formulaire complet d'ajout de produit (Nom, DCI, forme, dosage, prix vente, lot, date péremption)
- [x] **2.1.3** Édition & Modification rapide des fiches produits
- [x] **2.1.4** Suppression sécurisée de produit (avec archivage et contrôle d'historique de ventes)
- [x] **2.1.5** Système d'alerte péremption dynamique (Badges : < 3 mois rouge, < 6 mois orange, vert > 6 mois)
- [x] **2.1.6** Alertes de stock bas (comparaison stock réel vs `min_stock_alert`)
- [x] **2.1.7** Filtres avancés (par catégorie, statut de stock, recherche instantanée par nom, DCI, code-barres)
- [x] **2.1.8** Export de l'état des stocks au format CSV / Excel (UTF-8 BOM)

---

### 💵 Épic 2.2 : Module Caisse & Clôtures Journalières
- [x] **2.2.1** Modal / Écran d'ouverture de caisse (saisie du fond de caisse initial)
- [x] **2.2.2** Suivi des encaissements par méthode (Espèces, Orange Money, MTN MoMo, Carte, Crédit)
- [x] **2.2.3** Clôture journalière (comptage caisse, calcul automatique écart théorique vs réel)
- [x] **2.2.4** Historique et consultation des clôtures passées
- [x] **2.2.5** Enregistrement des décaissements / sorties de caisse (dépenses courantes)

---

### 👤 Épic 2.3 : Module Patients (`/patients`)
- [ ] **2.3.1** Page annuaire des patients (`/patients`)
- [ ] **2.3.2** Fiche patient complète (Nom, téléphone, date de naissance, allergies, pathologies chroniques)
- [ ] **2.3.3** Recherche instantanée de patient (par téléphone ou nom)
- [ ] **2.3.4** Association optionnelle d'un patient lors de la vente au POS
- [ ] **2.3.5** Historique complet des achats et ordonnances par patient

---

### 💳 Épic 2.4 : Module Crédit Client (Gestion des Dettes)
- [ ] **2.4.1** Page dédiée aux crédits clients (`/credits`)
- [ ] **2.4.2** Option de paiement à crédit au POS (associé obligatoirement à une fiche patient)
- [ ] **2.4.3** Enregistrement des remboursements (partiels ou totaux avec mode de paiement)
- [ ] **2.4.4** Calcul en temps réel de l'encours et solde débiteur par client
- [ ] **2.4.5** Système d'alerte pour créances en souffrance (> 30 jours)
- [ ] **2.4.6** Impression d'un bordereau / reçu de reconnaissance de dette et reçu de versement

---

### 🚚 Épic 2.5 : Module Livraisons & Réceptions Fournisseurs
- [x] **2.5.1** Maquette & Tableau de bord livraisons (`DeliveriesPage.tsx`)
- [ ] **2.5.2** Formulaire d'enregistrement de bon de livraison (fournisseur, n° BL, date, liste articles)
- [ ] **2.5.3** Incrémentation automatique des stocks et création des lots correspondants
- [ ] **2.5.4** Historique des prix d'achat par fournisseur
- [ ] **2.5.5** Comparateur de tarifs entre centrales d'achat (CAME, Cephac, PCT, etc.)

---

## 🟡 PHASE 3 : PRIORITÉ MOYENNE (Confort, Analytics & Réglementation)

### 📈 Épic 3.1 : Module Rapports & Statistiques (`/reports`)
- [ ] **3.1.1** Page générale des rapports (`/reports`) avec sélecteur de période
- [ ] **3.1.2** Rapport journalier (Chiffre d'affaires, panier moyen, marge brute estimée)
- [ ] **3.1.3** Rapport mensuel et courbes de tendance des ventes
- [ ] **3.1.4** Top 10 des médicaments les plus vendus / plus rentables
- [ ] **3.1.5** Rapport des pertes (périmés, casse, avaries)
- [ ] **3.1.6** Graphiques interactifs (ventes par catégorie, heures de pointe)
- [ ] **3.1.7** Génération et export de rapports imprimables en PDF

---

### 💊 Épic 3.2 : Module Stupéfiants & Psychotropes (Conformité MINSANTE)
- [ ] **3.2.1** Espace sécurisé `/narcotics` avec double validation (code PIN superviseur)
- [ ] **3.2.2** Registre numérique des substances vénéneuses (Tableau A & B, stupéfiants)
- [ ] **3.2.3** Traçabilité totale : entrée (fournisseur, BL), sortie (ordonnance, prescripteur, patient)
- [ ] **3.2.4** Alertes sur écarts d'inventaire ou seuil critique de psychotropes
- [ ] **3.2.5** Export officiel du registre paraphé pour inspection sanitaire

---

### ⚙️ Épic 3.3 : Module Paramètres & Maintenance (`/settings`)
- [ ] **3.3.1** Page des paramètres généraux de l'officine (`/settings`)
- [ ] **3.3.2** Mise à jour des coordonnées pharmacie (logo, adresse, agrément, téléphone)
- [ ] **3.3.3** Gestion des utilisateurs (création de comptes préparateurs/caissiers, changement de PIN)
- [ ] **3.3.4** Configuration du matériel de caisse (imprimante ticket, scanner, tiroir-caisse)
- [ ] **3.3.5** Sauvegarde manuelle de la base SQLite vers un fichier `.sqlite` / `.bak`
- [ ] **3.3.6** Restauration sécurisée de la base de données avec contrôle d'intégrité

---

## 🔄 Règle d'Or Opérationnelle
Pour chaque session de travail :
1. **Consulter `ROADMAP.md`** : Prendre la première tâche non cochée du niveau de priorité le plus haut.
2. **Développer & Valider** : Implémenter la fonctionnalité de manière complète (Rust/SQLite + DAL TypeScript + UI React 19).
3. **Mettre à jour `ROADMAP.md`** : Marquer `[x]` dès que la fonctionnalité est opérationnelle et testée.
4. **Passer à la suivante** : Ne jamais entamer une priorité inférieure tant qu'un bloc bloquant supérieur n'est pas consolidé.

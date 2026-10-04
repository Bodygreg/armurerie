# L'Armurerie — Gestion de bibliothèque

Application web de gestion de bibliothèque, conçue en **mobile first**. Un visiteur peut parcourir le catalogue, un adhérent peut réserver et suivre ses emprunts, un gestionnaire administre le catalogue et les prêts, et l'administrateur gère les comptes gestionnaires et consulte des statistiques.

Projet réalisé dans le cadre de la formation **Développeur Web et Web Mobile**.

- **Site en ligne :** `https://armurerie-frontend-production.up.railway.app/`
- **API :** `https://armurerie-production.up.railway.app/`

---

## Sommaire

1. [Fonctionnalités](#1-fonctionnalités)
2. [Stack technique](#2-stack-technique)
3. [Structure du dépôt](#3-structure-du-dépôt)
4. [Installation en local (sans Docker)](#4-installation-en-local-sans-docker)
5. [Lancer le projet avec Docker](#5-lancer-le-projet-avec-docker)
6. [Variables d'environnement](#6-variables-denvironnement)
7. [Déploiement en production (Railway)](#7-déploiement-en-production-railway)
8. [Aperçu de l'API](#8-aperçu-de-lapi)
9. [Règles métier](#9-règles-métier)
10. [Sécurité](#10-sécurité)
11. [Dépannage](#11-dépannage)
12. [Limitations connues](#12-limitations-connues)

---

## 1. Fonctionnalités

| Profil | Ce qu'il peut faire |
|---|---|
| **Visiteur** | Consulter les nouveautés, rechercher un ouvrage (titre, auteur, thème), voir la fiche d'un livre, envoyer un message via le formulaire de contact, créer un compte |
| **Adhérent** | Tout ce que fait le visiteur + réserver / annuler une réservation, être prévenu par e-mail quand un livre redevient disponible, consulter et modifier son profil, voir ses emprunts et réservations, supprimer son compte (anonymisation) |
| **Gestionnaire** | Tout ce que fait l'adhérent + gérer le catalogue (ajout avec photo de couverture, archivage), suivre les emprunts en cours, enregistrer retraits et retours, rechercher un adhérent et consulter sa fiche |
| **Administrateur** | Tout ce que fait le gestionnaire + créer / retirer des gestionnaires, consulter les statistiques d'emprunts (mois, année, total) |

Automatismes : relance e-mail des emprunts en retard, alerte aux gestionnaires après une semaine supplémentaire, annulation automatique des réservations non retirées.

---

## 2. Stack technique

**Backend** (`backend/`)
- Node.js 20, Express 5
- Sequelize 6 (ORM) + MySQL
- Authentification : JWT (`jsonwebtoken`) + hachage `bcrypt`
- Upload d'images : `multer` (en mémoire) → Cloudinary
- E-mails transactionnels : Resend
- Tâches planifiées : `node-cron`

**Frontend** (`frontend/`)
- React 19, Vite
- React Router, Axios
- Context API pour l'état d'authentification
- CSS natif (variables CSS, Flexbox/Grid), approche mobile first

**Infrastructure**
- Docker (Dockerfile backend et frontend, `docker-compose.yml` pour le local)
- Frontend servi par nginx (build multi-étapes)
- Hébergement : Railway (MySQL managé + 2 services construits depuis les Dockerfile)
- Images hébergées sur Cloudinary

---

## 3. Structure du dépôt

```
.
├── backend/
│   ├── src/
│   │   ├── config/        connexion MySQL, Resend, Cloudinary
│   │   ├── models/        modèles Sequelize + relations (index.js)
│   │   ├── controllers/   logique métier
│   │   ├── routes/        endpoints de l'API
│   │   ├── middlewares/   authentification JWT, contrôle de rôle, upload
│   │   ├── jobs/          tâches planifiées (relances, expirations)
│   │   ├── services/      logique réutilisable (notification de disponibilité)
│   │   ├── utils/         calcul des horaires d'ouverture
│   │   └── seed.js        données de test
│   ├── server.js
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/         une page par route
│   │   ├── components/    composants réutilisables (Navbar, Footer, BookCard, onglets admin/gestionnaire)
│   │   ├── context/       AuthContext
│   │   └── services/      instance Axios
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
└── .env.example           variables lues par docker-compose
```

---

## 4. Installation en local (sans Docker)

### Prérequis
- Node.js 20 (ou supérieur) et npm
- Un serveur MySQL local (XAMPP, par exemple)
- Un compte [Resend](https://resend.com) (clé API) et un compte [Cloudinary](https://cloudinary.com)

### Backend

```bash
cd backend
npm install
cp .env.example .env     # puis renseigner les valeurs (voir section 6)
```

Créer une base vide nommée `armurerie_db` (phpMyAdmin ou ligne de commande). Les tables sont créées automatiquement au démarrage par Sequelize.

```bash
npm run dev              # démarre l'API sur http://localhost:5000
npm run seed             # (facultatif) insère des données de test
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm run dev              # démarre l'application sur http://localhost:5173
```

Le backend doit être démarré avant d'utiliser le frontend.

### Comptes de test (créés par `npm run seed`)

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | `admin@armurerie.fr` | `motdepasse123` |
| Gestionnaire | `gestionnaire@armurerie.fr` | `motdepasse123` |
| Adhérent | `claire@test.fr` | `motdepasse123` |
| Adhérent | `marc@test.fr` | `motdepasse123` |

> ⚠️ Ces comptes sont destinés au **développement uniquement**. Ne jamais les conserver tels quels sur une base de production.
>
> Le script de seed n'efface rien : le lancer deux fois crée les données en double.

---

## 5. Lancer le projet avec Docker

Docker sert ici à reproduire en local un environnement proche de la production : **MySQL + backend + frontend**, chacun dans son conteneur. Il n'est pas nécessaire pour que le site en ligne fonctionne.

### Prérequis
- Docker Desktop installé **et démarré**

### Étapes

```bash
cp .env.example .env     # à la racine du dépôt, puis renseigner les valeurs
docker compose up --build
```

Dans un second terminal, une fois les conteneurs démarrés :

```bash
docker compose exec backend npm run seed
```

- Frontend : http://localhost:5173
- API : http://localhost:5000/api

### Commandes utiles

| Commande | Effet |
|---|---|
| `docker compose up` | Relance sans reconstruire les images |
| `docker compose up -d` | Relance en arrière-plan |
| `docker compose logs -f backend` | Suit les journaux du backend |
| `docker compose down` | Arrête les conteneurs (les données MySQL sont conservées) |
| `docker compose down -v` | Arrête **et supprime** les données MySQL (repart de zéro) |
| `docker compose build --no-cache backend` | Reconstruit l'image backend sans cache |

### À savoir
- Le premier démarrage de MySQL peut prendre **plus de deux minutes** (initialisation des fichiers système) ; le `healthcheck` du `docker-compose.yml` en tient compte via `start_period`.
- Les ports **5000** et **5173** doivent être libres : arrêter tout serveur local (`npm run dev`) avant de lancer Docker.
- La base MySQL de Docker est **indépendante** de celle de XAMPP : elle ne contient que ce qu'y insère `npm run seed`.
- Dans `.env` (racine), `VITE_API_URL` doit rester `http://localhost:5000/api` et non `http://backend:5000` : ce code s'exécute dans le navigateur, qui ne connaît pas le réseau interne de Docker.

---

## 6. Variables d'environnement

Ne jamais committer un vrai fichier `.env` (il est ignoré par Git). Seuls les fichiers `.env.example` sont versionnés.

### `backend/.env`

| Variable | Description |
|---|---|
| `DB_NAME` | Nom de la base (`armurerie_db`) |
| `DB_USER` / `DB_PASSWORD` | Identifiants MySQL |
| `DB_HOST` / `DB_PORT` | Hôte et port MySQL (`127.0.0.1` / `3306` en local) |
| `PORT` | Port de l'API (5000 en local) — **ne pas définir sur Railway** |
| `JWT_SECRET` | Chaîne aléatoire longue servant à signer les jetons |
| `RESEND_API_KEY` | Clé API Resend |
| `EMAIL_FROM` | Expéditeur des e-mails, ex. `"L'Armurerie <onboarding@resend.dev>"` |
| `CONTACT_EMAIL` | Adresse qui reçoit les messages du formulaire de contact |
| `FRONTEND_URL` | URL publique du frontend (utilisée dans les liens de réinitialisation) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Identifiants Cloudinary |

Générer un `JWT_SECRET` solide :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL de l'API, ex. `http://localhost:5000/api` |

> Avec Vite, cette variable est **figée au moment du build**, pas au démarrage. La modifier impose de reconstruire le frontend.

### `.env` à la racine (Docker Compose)

Reprend les variables ci-dessus (`DB_NAME`, `DB_PASSWORD`, `JWT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL`, `FRONTEND_URL`, `CLOUDINARY_*`) plus `VITE_API_URL`. `DB_HOST` est fixé à `mysql` dans le `docker-compose.yml` (nom du service sur le réseau Docker).

---

## 7. Déploiement en production (Railway)

L'application est déployée sur [Railway](https://railway.app) sous la forme de **3 services dans un même projet** : MySQL managé, backend, frontend. Railway construit le backend et le frontend à partir de leurs `Dockerfile` respectifs ; le `docker-compose.yml` n'est **pas** utilisé en production.

### 7.1 Préparer le dépôt

Le code doit être sur GitHub (branche `main`). Chaque `git push` sur `main` déclenche automatiquement un redéploiement des services concernés.

### 7.2 Créer le projet et la base

1. Railway → **New Project** → *Empty Project*
2. **+ Create → Database → Add MySQL**

### 7.3 Déployer le backend

1. **+ Create → GitHub Repo** → sélectionner le dépôt
2. *Settings* → **Root Directory** : `backend`
3. *Variables* — relier la base par références (bouton `{{ }}` du champ valeur, ou saisie directe) :

   ```
   DB_HOST     = ${{MySQL.MYSQLHOST}}
   DB_PORT     = ${{MySQL.MYSQLPORT}}
   DB_USER     = ${{MySQL.MYSQLUSER}}
   DB_PASSWORD = ${{MySQL.MYSQLPASSWORD}}
   DB_NAME     = ${{MySQL.MYSQLDATABASE}}
   ```

   (`MySQL` = nom exact du service base de données dans le projet.)

4. Ajouter les autres variables : `JWT_SECRET` (**différent** de celui du local), `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FRONTEND_URL` (valeur provisoire, corrigée à l'étape 7.5)
5. **Ne pas** définir `PORT` : Railway l'injecte et le code lit `process.env.PORT`
6. *Settings → Networking* → **Generate Domain**
7. Vérifier : `https://<url-backend>/api/livres` doit répondre en JSON

### 7.4 Déployer le frontend

1. **+ Create → GitHub Repo** → même dépôt
2. *Settings* → **Root Directory** : `frontend`
3. *Variables* : `VITE_API_URL` = `https://<url-backend>/api`
   (Railway transmet automatiquement cette variable au `ARG VITE_API_URL` du Dockerfile pendant le build.)
4. *Settings → Networking* → **Generate Domain**

### 7.5 Finaliser

- Mettre à jour `FRONTEND_URL` du backend avec l'URL publique du frontend (en `https://…`)
- Si l'URL du **backend** change, mettre à jour `VITE_API_URL` du frontend **et** redéployer le frontend (variable figée au build)

### 7.6 Insérer les données de départ

Le script de seed doit s'exécuter **depuis l'intérieur du réseau Railway** (l'adresse `mysql.railway.internal` n'est pas joignable depuis un poste local) :

```bash
npm install -g @railway/cli
railway login
cd backend
railway link          # choisir le projet puis le service backend
railway ssh           # ouvre un shell dans le conteneur déployé
npm run seed          # dans ce shell
```

### 7.7 Accéder à la base de production (TablePlus, DBeaver…)

1. Service MySQL → *Settings → Networking* → **Add public access** (un redéploiement du service peut être nécessaire pour voir apparaître l'hôte et le port publics)
2. Se connecter avec l'hôte et le port publics + `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` (onglet *Variables* du service MySQL)

### 7.8 Créer un administrateur

Il n'existe volontairement aucune interface pour créer un administrateur. Dans la table `utilisateurs`, passer la colonne `role` de l'utilisateur concerné à `admin`, puis se **déconnecter / reconnecter** (le rôle est encodé dans le jeton émis à la connexion).

### 7.9 Mettre à jour l'application

```bash
git add .
git commit -m "Description du changement"
git push
```

Railway redéploie automatiquement ; il n'est pas nécessaire d'avoir Railway ouvert dans le navigateur.

> Les images de couverture sont hébergées sur Cloudinary, jamais sur le serveur : elles survivent donc à tous les redéploiements, sans volume à configurer.

---

## 8. Aperçu de l'API

Préfixe : `/api`. 🔒 = jeton JWT requis, 🛡️ = rôle gestionnaire ou admin, 👑 = rôle admin.

| Ressource | Endpoint | Accès |
|---|---|---|
| **Auth** | `POST /auth/register` · `POST /auth/login` | public |
| | `POST /auth/mot-de-passe-oublie` · `POST /auth/reinitialiser-mot-de-passe` | public |
| **Livres** | `GET /livres` (filtres `titre`, `auteur`, `theme`, `tri`, `page`, `limite`) · `GET /livres/:id` | public |
| | `POST /livres` (multipart, champ `photo`) · `PATCH /livres/:id/archiver` · `PATCH /livres/:id/photo` | 🔒🛡️ |
| **Thèmes** | `GET /themes` | public |
| **Réservations** | `POST /reservations` · `GET /reservations/mes-reservations` · `PATCH /reservations/:id/annuler` | 🔒 |
| | `PATCH /reservations/:id/convertir-en-emprunt` | 🔒🛡️ |
| **Emprunts** | `GET /emprunts/mes-emprunts` | 🔒 |
| | `GET /emprunts` · `PATCH /emprunts/:id/retour` | 🔒🛡️ |
| **Alertes** | `POST /alertes` · `GET /alertes/mes-alertes` | 🔒 |
| **Utilisateurs** | `GET /utilisateurs/me` · `PATCH /utilisateurs/me` · `DELETE /utilisateurs/me` | 🔒 |
| **Gestionnaire** | `GET /gestionnaire/adherents` · `GET /gestionnaire/adherents/:id` | 🔒🛡️ |
| **Admin** | `GET /admin/gestionnaires` · `POST /admin/gestionnaires` · `DELETE /admin/gestionnaires/:id` · `GET /admin/statistiques` | 🔒👑 |
| **Contact** | `POST /contact` | public |

Les requêtes authentifiées envoient l'en-tête `Authorization: Bearer <token>`.

---

## 9. Règles métier

- Un adhérent peut avoir **3 emprunts simultanés au maximum** (vérifié au moment où un gestionnaire convertit une réservation en emprunt).
- Un prêt dure **3 semaines**. Au-delà : e-mail de rappel à l'adhérent (tâche quotidienne à 8 h), puis alerte aux gestionnaires et administrateurs après **une semaine supplémentaire**.
- Une réservation doit être **retirée avant la fermeture du jour ouvré suivant** (horaires dans `backend/src/utils/horaires.js`). Passé ce délai, un job horaire l'annule, prévient l'adhérent et déclenche les alertes de disponibilité.
- Un adhérent peut demander à être **prévenu par e-mail** quand un livre indisponible redevient libre.
- La disponibilité d'un livre n'est **jamais stockée** : elle est déduite des emprunts et réservations actifs.
- **Aucune suppression destructive** quand un historique existe : compte supprimé → anonymisé ; livre retiré → archivé ; gestionnaire retiré → redevient adhérent.
- Le compte administrateur ne peut pas être supprimé depuis l'interface.

---

## 10. Sécurité

- Mots de passe hachés avec **bcrypt** ; jamais renvoyés par l'API.
- Complexité exigée à l'inscription et à la réinitialisation : 8 caractères minimum, une majuscule, une minuscule, un chiffre, un caractère spécial (validée côté frontend **et** côté backend).
- Jetons JWT valables **2 heures**.
- Le rôle est **toujours forcé côté serveur** (jamais lu depuis la requête) ; l'utilisateur concerné par une action est déduit du jeton, pas d'un paramètre (protection contre l'IDOR).
- Messages d'erreur génériques à la connexion et à la demande de réinitialisation (pas d'énumération des comptes).
- Réinitialisation de mot de passe : jeton aléatoire à **usage unique**, stocké **haché** (SHA-256), valable 1 heure.
- Upload d'images : filtrage sur le type MIME, taille limitée à 5 Mo, fichier jamais écrit sur le disque du serveur.
- Secrets exclusivement via variables d'environnement ; `.env` ignoré par Git et par Docker (`.dockerignore`).

---

## 11. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Cannot find module '../config/cloudinary'` en Docker / Railway, alors que tout marche en local | **Casse du nom de fichier** : Windows l'ignore, Linux non | Nommer les fichiers en minuscules. Si Git ne détecte pas un renommage de casse : renommer vers un nom temporaire, committer, puis renommer vers le nom final et committer |
| `port is already allocated` / `ports are not available` au `docker compose up` | Un serveur local occupe déjà le port 5000 ou 5173 | Arrêter le `npm run dev` local (ou le processus concerné) |
| `dependency failed to start: container … mysql is unhealthy` | MySQL met plus de temps que prévu au premier démarrage | Vérifier `start_period` / `retries` du healthcheck ; si le volume a été initialisé avec un mauvais mot de passe : `docker compose down -v` puis relancer |
| Le mot de passe MySQL défini dans `.env` est ignoré par le conteneur | MySQL n'applique `MYSQL_ROOT_PASSWORD` qu'à la **première** initialisation du volume | `docker compose down -v` puis `docker compose up --build` |
| `getaddrinfo ENOTFOUND mysql.railway.internal` en lançant le seed depuis son poste | L'adresse interne Railway n'est pas joignable de l'extérieur | Utiliser `railway ssh` puis lancer le seed dans le conteneur |
| Le frontend déployé appelle `localhost` | `VITE_API_URL` absente ou modifiée sans reconstruction | Corriger la variable puis redéployer le frontend |
| Erreur `401` sur toutes les routes protégées après un moment | Jeton JWT expiré (2 h) | Se déconnecter / reconnecter |
| `Invalid hook call` après installation d'une bibliothèque React | Conflit de versions ou cache Vite obsolète | Supprimer `node_modules` et `package-lock.json`, `npm install`, puis `npm run dev -- --force` |
| Les lignes des tableaux de seed apparaissent en double | Seed lancé plusieurs fois | Réinitialiser les tables (en local uniquement) puis relancer le seed une seule fois |

### Synchronisation de la base

`sequelize.sync()` crée les tables manquantes mais **ne modifie pas** une table existante. Pour ajouter une colonne à un modèle existant, utiliser temporairement `sequelize.sync({ alter: true })` en **local**, puis revenir à `sequelize.sync()`. Ne jamais laisser `force: true` ni `alter: true` actifs, et ne jamais les utiliser sur la base de production.

---

## 12. Limitations connues

- **E-mails en mode test (Resend).** Tant qu'aucun domaine n'est vérifié sur Resend, tous les e-mails sont redirigés vers l'adresse ayant servi à créer le compte Resend, quel que soit le destinataire prévu. Le comportement disparaît après vérification d'un domaine sur [resend.com/domains](https://resend.com/domains) (et mise à jour de `EMAIL_FROM`), sans modification de code.
- **Fuseau horaire.** Les conteneurs tournent par défaut en **UTC**. Les heures d'ouverture et les tâches planifiées s'appuient sur l'heure du serveur ; pour qu'elles correspondent à l'heure de Paris, définir la variable d'environnement `TZ=Europe/Paris` sur le service backend.
- **Pas de vérification d'e-mail à l'inscription** : le compte est actif et connecté immédiatement.
- **Pas de modification des informations d'un livre existant** (hors photo de couverture) : un livre peut être ajouté ou archivé.
- **Maintenance de MySQL sur Railway.** Railway planifie des correctifs de sécurité sur la base managée (y compris des changements de version majeure). Un instantané est pris avant chaque opération ; tester au préalable en local avec la même version (`image: mysql:9` dans le `docker-compose.yml`) est recommandé.


---

## Auteur

Projet réalisé par **Grégoire** — [@Bodygreg](https://github.com/Bodygreg)

# 🚀 Configuration Production - Frontend & Backend Distants

## Résumé des Changements

Votre app est maintenant prête pour un **déploiement en production où le frontend et backend ne sont pas dans le même réseau Docker**.

### ✅ Changements Effectués

#### **Frontend**
- ✅ Fichier de configuration dynamique `assets/config.json`
- ✅ Script de chargement dans `index.html`
- ✅ Dockerfile avec support `envsubst` pour templater la config
- ✅ Variables d'environnement dans `environment.ts` et `environment.prod.ts`
- ✅ Nginx configuré pour servir les assets correctement

#### **Backend**
- ✅ CORS accepte les origines depuis une variable d'environnement
- ✅ Support de `APP_CORS_ALLOWED_ORIGINS` (peut contenir plusieurs domaines)
- ✅ Configuration documentée dans `application.yml`

#### **Documentation**
- ✅ `DEPLOYMENT.md` - Guide complet de déploiement
- ✅ `.env.production.example` - Exemple de configuration
- ✅ `deploy-production.sh` - Script de déploiement automatisé

---

## ⚡ Démarrage Rapide (Production)

### Étape 1: Préparer l'environnement

```bash
# Copier le template de configuration
cp .env.production.example .env.production

# Éditer avec vos valeurs en production
nano .env.production
```

**À personnaliser dans `.env.production` :**
```env
# URL de votre frontend
APP_CORS_ALLOWED_ORIGINS=https://h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io

# URL de votre backend API
API_URL=https://api.h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io

# Credentials de base de données
SPRING_DATASOURCE_URL=jdbc:mysql://votre-db-host:3306/todo_db
SPRING_DATASOURCE_USERNAME=todo_user
SPRING_DATASOURCE_PASSWORD=password_securise
```

### Étape 2: Déployer

```bash
# Option A: Utiliser le script automatisé
bash deploy-production.sh

# Option B: Déploiement manuel avec Docker
export $(cat .env.production | xargs)

docker build -t ideploy-backend:latest ./backend
docker build -t ideploy-frontend:latest ./frontend

docker run -d -e API_URL -e APP_CORS_ALLOWED_ORIGINS \
  -e SPRING_DATASOURCE_URL -e SPRING_DATASOURCE_USERNAME \
  -e SPRING_DATASOURCE_PASSWORD \
  ideploy-backend:latest

docker run -d -e API_URL -p 80:80 ideploy-frontend:latest
```

---

## 🔧 Variables d'Environnement

### Frontend
| Variable | Fait | Défaut |
|----------|------|--------|
| `API_URL` | URL de l'API backend | `/api` (proxy local) |

### Backend
| Variable | Fait | Défaut |
|----------|------|--------|
| `APP_CORS_ALLOWED_ORIGINS` | Domaines autorisés (CORS) | `http://localhost:*` |
| `SPRING_DATASOURCE_URL` | URL MySQL | Obligatoire |
| `SPRING_DATASOURCE_USERNAME` | Utilisateur MySQL | Obligatoire |
| `SPRING_DATASOURCE_PASSWORD` | Mot de passe MySQL | Obligatoire |

---

## 📝 Flux de Requête

```
Frontend (h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io)
    ↓ Charger config.json
    ↓ Récupère: {"apiUrl": "https://api...."}
    ↓ Requête HTTP vers l'API
    ↓
Backend (api.h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io)
    ↓ Vérifie l'origine dans CORS
    ↓ Traite la requête
    ↓ Répond avec headers CORS appropriés
```

---

## 🧪 Tester la Configuration

### Test depuis le navigateur
```javascript
// Ouvrir la console F12
fetch('https://api.h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io/api/todos')
  .then(r => r.json())
  .then(console.log)
```

### Test de la config frontend
```bash
curl https://h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io/assets/config.json
# Doit retourner: {"apiUrl":"https://api...."}
```

### Vérifier les logs
```bash
# Frontend logs
docker logs ideploy-frontend-prod

# Backend logs
docker logs ideploy-backend-prod | grep -i cors
```

---

## ❌ Dépannage

### Erreur CORS
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Vérifier que `APP_CORS_ALLOWED_ORIGINS` contient votre domaine frontend

### config.json chargement échoué
- Vérifier que le fichier existe: `/usr/share/nginx/html/assets/config.json`
- Vérifier que la variable `API_URL` est passée au container
- Vérifier les logs nginx: `docker logs ideploy-frontend-prod`

### API non accessible
- Vérifier que l'URL dans `API_URL` est correcte
- Vérifier que le backend est accessible depuis le frontend
- Vérifier les firewall/network policies

---

## 📚 Documentation Complète

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour la documentation détaillée avec :
- Configuration du docker-compose
- Déploiement sur serveurs distants
- Configuration avec reverse proxy
- Tests et validation

---

## 🎯 Architecture Finale

```
┌─────────────────────────────────────────────────────────────┐
│ Production Environment                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend Container          Backend Container  DB Server   │
│  ┌─────────────────┐       ┌─────────────────┐            │
│  │  Nginx (Port 80)│       │  Spring Boot    │            │
│  │  + Assets       │◄──────┤  (Port 8080)    │◄───────┐   │
│  │  + config.json  │       │  + CORS Filter  │        │   │
│  │  (templé)       │       └─────────────────┘    MySQL    │
│  │                 │                                 DB     │
│  │  env: API_URL───┼──────configuration────────────────┘   │
│  └─────────────────┘       env: CORS, DB config            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ À savoir

- **API_URL en variable d'env**: Flexible, peut être changée sans recompilation
- **Config templée au démarrage**: Le fichier config.json est généré dynamiquement
- **CORS configurable**: Supporta multiple domaines séparés par des virgules
- **Fallback automatique**: Si variables d'env manquantes, utilise les valeurs par défaut
- **Sécurisé**: Pas d'exposition de secrets en frontend, tout géré en backend


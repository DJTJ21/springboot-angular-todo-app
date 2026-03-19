# 🚀 iDeploy Todo Application

Application fullstack de gestion de tâches (Todo List) entièrement dockerisée, conçue pour tester la plateforme **iDeploy**.

## 📋 Stack Technique

- **Backend**: Java 17 + Spring Boot 3 + Maven
- **Frontend**: Angular 17+ (Standalone Components)
- **Base de données**: MySQL 8
- **Conteneurisation**: Docker + Docker Compose
- **Proxy**: Nginx

## ✨ Fonctionnalités

- ✅ Créer, lire, mettre à jour et supprimer des tâches
- ✅ Marquer les tâches comme terminées/non terminées
- ✅ Filtrer les tâches (Toutes / En cours / Terminées)
- ✅ Compteur de tâches restantes
- ✅ Interface moderne inspirée de iDEM.ai
- ✅ Design responsive mobile-first
- ✅ API REST complète avec Spring Boot
- ✅ Persistance des données avec MySQL

## 🎯 Prérequis

**UNIQUEMENT Docker Desktop est requis !**

Aucune installation de Java, Node.js, Maven ou npm n'est nécessaire. Tout compile et s'exécute dans des conteneurs Docker.

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (version 20.10+)
- Ports disponibles : 80, 8080, 3306

## 🚀 Démarrage Rapide

### 1. Cloner ou créer le projet

Assurez-vous que tous les fichiers sont présents dans le dossier `todo-app/`.

### 2. Lancer l'application

```bash
cd todo-app
docker compose up --build
```

**Première exécution** : Le build peut prendre 5-10 minutes (téléchargement des dépendances Maven et npm).

**Exécutions suivantes** : ~30 secondes grâce au cache Docker.

### 3. Accéder à l'application

Une fois tous les conteneurs démarrés :

- **Frontend (Interface utilisateur)** : [http://localhost](http://localhost)
- **Backend API** : [http://localhost:8080/api/todos](http://localhost:8080/api/todos)
- **Health Check** : [http://localhost:8080/api/health](http://localhost:8080/api/health)
- **Base de données MySQL** : `localhost:3306`

## 📡 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/health` | Vérifier l'état de l'API |
| `GET` | `/api/todos` | Récupérer toutes les tâches |
| `GET` | `/api/todos?completed=true` | Filtrer par statut |
| `GET` | `/api/todos/{id}` | Récupérer une tâche par ID |
| `POST` | `/api/todos` | Créer une nouvelle tâche |
| `PUT` | `/api/todos/{id}` | Mettre à jour une tâche |
| `PATCH` | `/api/todos/{id}/toggle` | Basculer le statut (terminé/non terminé) |
| `DELETE` | `/api/todos/{id}` | Supprimer une tâche |
| `GET` | `/api/todos/stats` | Obtenir les statistiques |

### Exemple de requête POST

```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Ma première tâche",
    "description": "Description optionnelle",
    "completed": false
  }'
```

## 🏗️ Architecture

```
todo-app/
├── docker-compose.yml          # Orchestration des services
├── .env                        # Variables d'environnement
│
├── backend/                    # API Spring Boot
│   ├── Dockerfile             # Multi-stage build (Maven + JRE)
│   ├── pom.xml                # Dépendances Maven
│   └── src/
│       └── main/
│           ├── java/com/ideploy/todo/
│           │   ├── TodoApplication.java
│           │   ├── config/CorsConfig.java
│           │   ├── controller/TodoController.java
│           │   ├── model/Todo.java
│           │   ├── repository/TodoRepository.java
│           │   └── service/TodoService.java
│           └── resources/
│               └── application.yml
│
└── frontend/                   # Application Angular
    ├── Dockerfile             # Multi-stage build (Node + Nginx)
    ├── nginx.conf             # Configuration Nginx
    ├── package.json
    ├── angular.json
    └── src/
        ├── main.ts
        ├── styles.scss
        ├── app/
        │   ├── app.component.ts
        │   ├── app.component.html
        │   ├── app.component.scss
        │   ├── models/todo.model.ts
        │   └── services/todo.service.ts
        └── environments/
            ├── environment.ts
            └── environment.prod.ts
```

## 🐳 Services Docker

### 1. **db** (MySQL 8)
- Image : `mysql:8.0`
- Port : `3306`
- Volume persistant : `mysql-data`
- Healthcheck : Vérifie la disponibilité de MySQL

### 2. **backend** (Spring Boot)
- Build : Multi-stage (Maven build + JRE runtime)
- Port : `8080`
- Dépend de : `db` (avec healthcheck)

### 3. **frontend** (Angular + Nginx)
- Build : Multi-stage (Node build + Nginx serve)
- Port : `80`
- Proxy : `/api/*` → `backend:8080`
- Dépend de : `backend`

## 🔧 Commandes Utiles

### Arrêter l'application
```bash
docker compose down
```

### Arrêter et supprimer les volumes (réinitialisation complète)
```bash
docker compose down -v
```

### Voir les logs
```bash
# Tous les services
docker compose logs -f

# Service spécifique
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Reconstruire un service spécifique
```bash
docker compose up --build backend
docker compose up --build frontend
```

### Accéder à un conteneur
```bash
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec db mysql -u todouser -p
```

## 🛠️ Problèmes Courants et Solutions

### ❌ Port déjà utilisé

**Erreur** : `Bind for 0.0.0.0:80 failed: port is already allocated`

**Solution** :
```bash
# Identifier le processus utilisant le port
sudo lsof -i :80
sudo lsof -i :8080
sudo lsof -i :3306

# Arrêter le processus ou modifier le port dans docker-compose.yml
# Exemple : changer "80:80" en "8000:80"
```

### ❌ Base de données pas prête

**Erreur** : `Connection refused` ou `Unknown database 'tododb'`

**Solution** : Attendre ~30 secondes que MySQL initialise complètement. Le healthcheck garantit que le backend attend la disponibilité de la DB.

```bash
# Vérifier l'état des conteneurs
docker compose ps

# Vérifier les logs MySQL
docker compose logs db
```

### ❌ Erreur de build Maven/npm

**Erreur** : `Could not resolve dependencies` ou `npm ERR!`

**Solution** :
```bash
# Nettoyer le cache Docker et reconstruire
docker compose down
docker system prune -a
docker compose up --build
```

### ❌ CORS errors dans le navigateur

**Erreur** : `Access to XMLHttpRequest blocked by CORS policy`

**Solution** : Vérifier que :
- Le frontend accède à l'API via `/api` (proxy Nginx)
- Le backend autorise l'origine dans `CorsConfig.java`
- Vider le cache du navigateur (Ctrl+Shift+R)

### ❌ Frontend affiche "Impossible de charger les tâches"

**Solution** :
```bash
# 1. Vérifier que le backend est accessible
curl http://localhost:8080/api/health

# 2. Vérifier les logs du backend
docker compose logs backend

# 3. Redémarrer les services
docker compose restart backend frontend
```

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `/frontend/src/styles.scss` et modifiez les variables CSS :

```scss
:root {
  --accent-blue: #3b82f6;    // Couleur principale
  --accent-glow: #60a5fa;    // Couleur de glow
  --bg-primary: #0a0e1a;     // Fond principal
  // ...
}
```

### Modifier le port du frontend

Dans `docker-compose.yml` :

```yaml
frontend:
  ports:
    - "8000:80"  # Accès via http://localhost:8000
```

### Ajouter des données de test

Connectez-vous à MySQL et insérez des données :

```bash
docker compose exec db mysql -u todouser -ptodopassword tododb

# Dans MySQL
INSERT INTO todos (titre, description, completed, date_creation) 
VALUES ('Tâche de test', 'Description', false, NOW());
```

## 📊 Variables d'Environnement

Fichier `.env` :

```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=tododb
MYSQL_USER=todouser
MYSQL_PASSWORD=todopassword
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/tododb
SPRING_DATASOURCE_USERNAME=todouser
SPRING_DATASOURCE_PASSWORD=todopassword
API_BASE_URL=http://localhost:8080
```

⚠️ **Production** : Changez ces valeurs pour des secrets sécurisés !

## 🧪 Tests

### Tester l'API avec curl

```bash
# Health check
curl http://localhost:8080/api/health

# Lister les tâches
curl http://localhost:8080/api/todos

# Créer une tâche
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{"titre":"Test","description":"Test description","completed":false}'

# Marquer comme terminée (ID = 1)
curl -X PATCH http://localhost:8080/api/todos/1/toggle

# Supprimer une tâche (ID = 1)
curl -X DELETE http://localhost:8080/api/todos/1
```

## 📦 Déploiement sur iDeploy

Cette application est prête pour le déploiement sur **iDeploy** :

1. Assurez-vous que `docker-compose.yml` et `.env` sont configurés
2. Poussez le code vers votre repository Git
3. Connectez le repository à iDeploy
4. iDeploy détectera automatiquement le `docker-compose.yml`
5. Déployez ! 🚀

## 📝 Licence

Ce projet est un exemple de démonstration pour la plateforme iDeploy.

## 🤝 Support

Pour toute question ou problème :

1. Vérifiez les logs : `docker compose logs -f`
2. Consultez la section "Problèmes Courants" ci-dessus
3. Vérifiez que tous les ports sont disponibles
4. Essayez un rebuild complet : `docker compose down -v && docker compose up --build`

---

**Développé avec ❤️ pour iDeploy**

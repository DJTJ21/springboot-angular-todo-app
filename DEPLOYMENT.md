# Configuration pour Production

## Vue d'ensemble

La configuration a été mise à jour pour supporter un déploiement où le frontend et backend ne sont **pas dans le même réseau Docker**.

### Changements effectués :

1. **Frontend** :
   - Fichier de configuration dynamique `assets/config.json` qui est templé au démarrage du container
   - Script de chargement dans `index.html` qui charge la config à runtime
   - Dockerfile mis à jour pour utiliser `envsubst` et générer dynamiquement la configuration

2. **Backend** :
   - CorsConfig mise à jour pour accepter les origines depuis une variable d'environnement
   - Support de la propriété `app.cors.allowed-origins` dans `application.yml`

3. **Nginx** :
   - Suppression du proxy `/api/` (le frontend appelle directement l'API)
   - Configuration optimisée pour le servage de fichiers statiques

---

## Déploiement en Production

### Option 1 : Déploiement avec Docker Compose (services sur le même hôte)

Créez ou mettez à jour votre fichier `docker-compose.prod.yml` :

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ideploy-backend-prod
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/todo_db
      SPRING_DATASOURCE_USERNAME: todo_user
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
      # ⭐ CORS - Accepter l'URL du frontend en production
      APP_CORS_ALLOWED_ORIGINS: https://h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io
    ports:
      - "8080:8080"
    depends_on:
      - db
    networks:
      - ideploy-prod-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ideploy-frontend-prod
    environment:
      # ⭐ URL complète du backend API
      API_URL: https://api.h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - ideploy-prod-network
    restart: unless-stopped

  db:
    image: mysql:8.0
    container_name: ideploy-mysql-prod
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: todo_db
      MYSQL_USER: todo_user
      MYSQL_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
    volumes:
      - mysql-prod-data:/var/lib/mysql
    networks:
      - ideploy-prod-network
    restart: unless-stopped

volumes:
  mysql-prod-data:

networks:
  ideploy-prod-network:
    driver: bridge
```

### Option 2 : Déploiement sur serveurs distants

**Backend (serveur 1) :**
```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://db-server:3306/todo_db"
export SPRING_DATASOURCE_USERNAME="todo_user"
export SPRING_DATASOURCE_PASSWORD="secure_password"
export APP_CORS_ALLOWED_ORIGINS="https://h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io"

docker build -t ideploy-backend:latest ./backend
docker run -d \
  -e SPRING_DATASOURCE_URL \
  -e SPRING_DATASOURCE_USERNAME \
  -e SPRING_DATASOURCE_PASSWORD \
  -e APP_CORS_ALLOWED_ORIGINS \
  -p 8080:8080 \
  --restart unless-stopped \
  ideploy-backend:latest
```

**Frontend (serveur 2) :**
```bash
export API_URL="https://api.h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io"

docker build -t ideploy-frontend:latest ./frontend
docker run -d \
  -e API_URL \
  -p 80:80 \
  --restart unless-stopped \
  ideploy-frontend:latest
```

---

## Variables d'Environnement Requises

### Frontend Container
| Variable | Description | Exemple |
|----------|-------------|---------|
| `API_URL` | URL complète de l'API backend | `https://api.h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io` |

**Fallback** : Si `API_URL` n'est pas défini, l'app utilise `/api` (proxy local)

### Backend Container
| Variable | Description | Exemple |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | URL du serveur MySQL | `jdbc:mysql://db:3306/todo_db` |
| `SPRING_DATASOURCE_USERNAME` | Utilisateur MySQL | `todo_user` |
| `SPRING_DATASOURCE_PASSWORD` | Mot de passe MySQL | N/A (à sécuriser) |
| `APP_CORS_ALLOWED_ORIGINS` | Origines autorisées (CORS) | `https://h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io` |

**Format CORS** : Pour plusieurs origines, séparez par des virgules :
```
APP_CORS_ALLOWED_ORIGINS=https://frontend.com,https://admin.frontend.com,http://localhost:4200
```

---

## Flux de Requête Frontend → Backend

```
1. Frontend charge → GET /assets/config.json
   ↓
2. Nginx retourne la config templée avec API_URL
   ↓
3. App Angular stocke la config dans window.__APP_CONFIG__
   ↓
4. TodoService utilise environment.apiUrl (chargé depuis config)
   ↓
5. Requête HTTP vers l'API backend complète
   ↓
6. Backend reçoit la requête, CORS accepte l'origine du frontend
   ↓
7. Réponse retour au frontend
```

---

## Déploiement avec Reverse Proxy (Nginx/Apache frontal)

Si vous utilisez un reverse proxy devant le tout :

**Nginx frontal** :
```nginx
upstream frontend {
    server frontend-container:80;
}

upstream backend {
    server backend-container:8080;
}

server {
    listen 80;
    server_name h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API (si sur le même domaine)
    location /backend/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Alors configurez le frontend pour utiliser une URL relative :
```
API_URL=/backend
```

---

## Tester la Configuration

### 1. Vérifier que config.json est servi correctement
```bash
curl -i http://localhost/assets/config.json
# Doit retourner: {"apiUrl":"https://api.example.com"}
```

### 2. Vérifier les CORS depuis le browser
Ouvrez la console navigateur et vérifiez qu'il n'y a pas d'erreur CORS :
```javascript
// Dans la console du navigateur
fetch('https://api.h8kso4sgo4oks0ok0cs40cos.159.69.185.176.sslip.io/api/todos')
  .then(r => r.json())
  .then(console.log)
```

### 3. Logs backend pour vérifier les CORS
```bash
docker logs ideploy-backend-prod | grep -i cors
```

---

## Résumé des Fichiers Modifiés

1. **`frontend/src/environments/environment.ts`** - Support de variables d'env
2. **`frontend/src/environments/environment.prod.ts`** - Support de variables d'env
3. **`frontend/src/index.html`** - Chargement dynamique de config.json
4. **`frontend/src/assets/config.json`** - Template de configuration
5. **`frontend/Dockerfile`** - Ajout de envsubst + script d'entrée
6. **`frontend/nginx.conf`** - Suppression du proxy /api/
7. **`backend/src/main/java/com/ideploy/todo/config/CorsConfig.java`** - Support de variable d'env pour CORS
8. **`backend/src/main/resources/application.yml`** - Aucun changement (utilise déjà les variables d'env)


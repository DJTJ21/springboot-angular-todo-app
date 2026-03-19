#!/bin/bash
# Production deployment script for Todo App
# Usage: bash deploy-production.sh

set -e

echo "🚀 Todo App - Production Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}📋 Create it from .env.production.example:${NC}"
    echo "   cp .env.production.example .env.production"
    echo "   # Then edit .env.production with your production values"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '#' | xargs)

echo -e "${GREEN}✓ Environment variables loaded${NC}"

# Validate required variables
REQUIRED_VARS=("API_URL" "APP_CORS_ALLOWED_ORIGINS" "SPRING_DATASOURCE_URL" "SPRING_DATASOURCE_USERNAME" "SPRING_DATASOURCE_PASSWORD")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing required variable: $var${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ All required variables present${NC}"

# Display configuration
echo ""
echo -e "${YELLOW}📝 Configuration Summary:${NC}"
echo "   Frontend API URL: $API_URL"
echo "   CORS Allowed Origins: $APP_CORS_ALLOWED_ORIGINS"
echo "   Database URL: $SPRING_DATASOURCE_URL"
echo ""

# Build and start services
echo -e "${YELLOW}🔨 Building images...${NC}"
docker-compose -f docker-compose.yml build --no-cache

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f docker-compose.yml up -d

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Service Status:${NC}"
docker-compose -f docker-compose.yml ps

echo ""
echo -e "${YELLOW}🔗 Testing:${NC}"
echo "   Frontend: http://localhost"
echo "   Backend: http://localhost:8087/api/todos"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo "   docker-compose logs -f frontend"
echo "   docker-compose logs -f backend"

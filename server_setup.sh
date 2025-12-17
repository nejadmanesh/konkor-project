#!/bin/bash

# Define Env File Content
cat <<EOF > .env.blog
HOST=0.0.0.0
PORT=1337
PUBLIC_URL=http://89.42.199.69/cms
APP_KEYS=randomKey123,randomKey456,randomKey789,randomKey000
API_TOKEN_SALT=salt123456789
ADMIN_JWT_SECRET=adminsecret123
TRANSFER_TOKEN_SALT=transfertoken123
JWT_SECRET=jwtsecret123
DATABASE_CLIENT=postgres
DATABASE_HOST=blog-db
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi_secure_pass_123
DATABASE_SSL=false
EOF

# Load Image
echo "Loading Docker Image..."
docker load -i blog-api.tar

# Create Network if not exists
docker network create konkur-ai-main_default 2>/dev/null || true

# Run Database
echo "Starting Database..."
docker run -d \
  --name blog-db \
  --network konkur-ai-main_default \
  --restart always \
  -e POSTGRES_USER=strapi \
  -e POSTGRES_PASSWORD=strapi_secure_pass_123 \
  -e POSTGRES_DB=strapi \
  postgres:16-alpine

# Run Blog API
echo "Starting Blog API..."
docker run -d \
  --name blog-api \
  --network konkur-ai-main_default \
  --restart always \
  --env-file .env.blog \
  blog-api-image

echo "Setup Complete! Please restart your Nginx container to apply changes."
# Optional: docker restart nginx

# Étape 1 : Construction des assets (React / Vite)
FROM node:20-alpine as frontend_build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Production PHP / Nginx
FROM serversideup/php:8.2-fpm-nginx-alpine

# Permet d'ignorer la mise en cache pendant la création de l'image
ENV AUTORUN_ENABLED=true

# Copie de tout le projet
COPY . /var/www/html

# On récupère le dossier build de l'étape Node
COPY --from=frontend_build /app/public/build /var/www/html/public/build

# Assurez-vous que l'utilisateur PHP possède les bons droits
USER root
RUN chown -R webuser:webgroup /var/www/html/storage /var/www/html/bootstrap/cache

# Passage en utilisateur non-root pour plus de sécurité (webuser est standard sur ServerSideUp)
USER webuser

# Installation des dépendances PHP sans le dev
RUN composer install --optimize-autoloader --no-dev --no-interaction

# Optimisations du framework Laravel
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache
RUN php artisan event:cache

# Nginx tournera par défaut sur le port 8080 (interne au conteneur)
EXPOSE 8080

###
# Dockerfile para servir el frontend (build Vite + Nginx)
#
# Etapa 1: compilar la aplicación
###
FROM node:20-alpine AS build

WORKDIR /app

# Instala dependencias usando package.json + lockfile
COPY package*.json ./
RUN npm ci

# Copia el resto del código y genera el build de producción
COPY . .

# Permite sobrescribir la URL del backend durante el build (opcional)
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

###
# Etapa 2: imagen final ligera con Nginx
###
FROM nginx:1.25-alpine AS runtime

# Copia artefactos construidos a la raíz pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración básica para SPA (fallback a index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Ejecuta Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
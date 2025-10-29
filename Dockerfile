# ---------- Etapa 1: build de la app ----------
FROM node:20 AS build

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package*.json ./

RUN npm install

# Copiar el resto del código fuente
COPY . .

# Generar el build de producción (Vite)
RUN npm run build

# ---------- Etapa 2: servir con Nginx ----------
FROM nginx:stable-alpine

# Copiar el build generado por Vite al directorio público de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
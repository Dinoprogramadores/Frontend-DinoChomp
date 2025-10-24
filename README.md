# 🦖 DinoChomp - Frontend

DinoChomp es un videojuego multijugador en tiempo real donde los usuarios  
controlan dinosaurios que compiten recolectando comida en el mapa, usando  
poderes especiales y atacando a sus rivales con mordiscos.

Este repositorio corresponde al **frontend del videojuego**, construido con **Vite + React**. Su objetivo es proporcionar la interfaz de usuario y comunicación con el backend del juego.

---

## 🚀 Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instaladas las siguientes herramientas:

- [Node.js 18+](https://nodejs.org/)
- [npm 9+](https://www.npmjs.com/get-npm)
- [Git](https://git-scm.com/)
- (Opcional) [Visual Studio Code](https://code.visualstudio.com/)

Verifica las versiones con:

```bash
node -v
npm -v
git --version
```
## 📦 Clonar el repositorio

Abre una terminal en el directorio donde quieras guardar el proyecto y ejecuta:

```bash
git clone https://github.com/Dinoprogramadores/Frontend-DinoChomp.git
cd Frontend-DinoChomp
```

## 🧰 Configuración de variables de entorno

1. Copia el archivo de ejemplo `.env.example` para crear tu `.env`:

````bash
cp .env.example .env
````

2. Edita `.env` según corresponda (por ejemplo, cambia la URL del backend si es necesario):

````env
VITE_API_BASE_URL=http://localhost:8080
````
**Nota:** Nunca subas `.env` al repositorio, solo `.env.example`.

## ⚡ Instalar dependencias

````bash
npm install
````

## 🏃‍♂️ Ejecutar el proyecto en local
````bash
npm run dev
````
El proyecto se ejecutará normalmente en:
````
http://localhost:5173/
````
La aplicación se conectará automáticamente al backend usando la URL definida en `.env`.

## 📦 Scripts útiles

Además de npm run dev, puedes usar otros scripts útiles:
````bash

npm run build    # Construye el proyecto para producción
npm run preview  # Vista previa del build de producción
npm run test     # Ejecuta los tests (si están configurados)
npm run format   # Formatea el código usando Prettier (si lo instalaste)
````


## 🧤 Contribuciones

1. Crea una nueva rama:
```bash
git checkout -b feat/nueva-funcionalidad
```

2. Realiza tus cambios y súbelos:
```bash
git commit -m "Agrega nueva funcionalidad"
git push origin feat/nueva-funcionalidad
```

3. Abre un Pull Request y espera la revisión de otro miembro del equipo.
   
## 📖 Notas

Mantén tu `.env` privado para proteger URLs y secretos.

Asegúrate de copiar `.env.example` y creen su `.env` local antes de ejecutar el proyecto.

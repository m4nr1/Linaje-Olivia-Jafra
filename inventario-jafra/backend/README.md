# API RESTful - Sistema de Inventario Jafra - Linaje Olivia

Backend modular desarrollado en Node.js y Express para la gestión de inventarios, control de stock y administración de base de datos de productos Jafra (Iniciativa Linaje Olivia).

## Tecnologías Core
* **Entorno de Ejecución:** Node.js
* **Framework Web:** Express.js
* **Base de Datos:** MongoDB Atlas (Cloud NoSQL)
* **Modelado de Datos (ODM):** Mongoose
* **Control de Versiones:** Git & GitHub

## Arquitectura del Sistema
El proyecto implementa un diseño modular separando responsabilidades para garantizar la escalabilidad:
* `config/` - Gestión de conexiones a la nube y variables de entorno.
* `models/` - Definición estricta de esquemas y colecciones.
* `controllers/` - Lógica de negocio y manejo de excepciones (Try/Catch).
* `routes/` - Exposición de endpoints REST (CRUD completo).

## Instalación y Despliegue Local
1. Clonar el repositorio.
2. Ejecutar `npm install` para restaurar la carpeta `node_modules`.
3. Crear un archivo `.env` en la raíz definiendo `PORT` y `MONGO_URI`.
4. Levantar el entorno de desarrollo con `npm run dev`.
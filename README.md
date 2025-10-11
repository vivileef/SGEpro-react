# Sistema de Gestión de Prácticas Preprofesionales (SGEpro-react)

SGEpro-react es una aplicación web moderna desarrollada con tecnologías de vanguardia que facilita la administración completa de las prácticas preprofesionales dentro de instituciones educativas. Permite a estudiantes, tutores académicos, tutores empresariales y coordinadores interactuar a través de una plataforma centralizada, moderna y completamente responsiva, optimizando los procesos administrativos y de seguimiento académico. 🌟

## ✨ Características Principales

- **👥 Gestión de Usuarios por Rol**: Roles diferenciados para estudiantes, tutores y coordinadores.
- **🎯 Asignación de Tutores**: Proceso automatizado y eficiente de asignación tutor-estudiante.
- **📈 Seguimiento de Avances**: Monitoreo del progreso de las prácticas.
- **📊 Generación de Reportes**: Visualización de datos y estadísticas basadas en localStorage.
- **📱 Interfaz Responsiva**: Adaptable a dispositivos móviles, tablets y desktop.
- **🔒 Seguridad Integrada**: Autenticación y autorización por roles.
- **⚡ Rendimiento Optimizado**: Carga rápida y navegación fluida.
- **📝 Historial de Actividades**: Registro de acciones dentro del navegador usando localStorage.
- **🔔 Notificaciones**: Alertas sobre eventos importantes en la sesión actual.
- **💾 Persistencia Local**: Todos los datos se almacenan en localStorage, sin necesidad de base de datos externa.
- **🌐 Soporte Multiplataforma**: Compatible con la mayoría de navegadores modernos.

## 📌 Funcionalidades Principales por Rol

### 👨‍🏫 Tutor Académico
- Supervisar estudiantes asignados.
- Evaluar reportes y avances de prácticas.
- Generar evaluaciones y observaciones académicas.
- Comunicación directa con estudiantes vía plataforma.
- Acceso al historial de evaluaciones y actividades guardadas en localStorage.

### 🏢 Tutor Empresarial
- Seguimiento de estudiantes en prácticas dentro de la empresa.
- Evaluación de desempeño laboral y profesional.
- Coordinación con tutores académicos para retroalimentación.
- Gestión de actividades y tareas asignadas a estudiantes.

### 👩‍💼 Coordinador
- Administración general del sistema y configuración de parámetros.
- Asignación de tutores y estudiantes de manera automatizada.
- Generación de reportes institucionales y estadísticos basados en datos locales.
- Gestión de usuarios, roles y permisos.
- Supervisión del historial completo de actividades de tutores y estudiantes.
- Control de métricas de rendimiento académico y administrativo.

### 👨‍🎓 Estudiante
- Visualización de prácticas asignadas.
- Subida de reportes y avances, guardados en localStorage.
- Comunicación con tutores académicos y empresariales.
- Consulta de evaluaciones y retroalimentación almacenadas localmente.
- Notificaciones de eventos importantes y fechas límite.

## 🛠️ Tecnologías Utilizadas

| Capa               | Tecnología                          |
|--------------------|-------------------------------------|
| Frontend           | Next.js, React, TailwindCSS        |
| Lenguaje           | TypeScript                          |
| Estado y Persistencia | React Context API + localStorage   |
| Autenticación      | Simulada por roles en localStorage  |
| Control de versiones| Git & GitHub                       |

## 📂 Estructura del Proyecto

```
SGEpro-react/
├── app/                # Páginas y rutas principales
├── components/         # Componentes reutilizables
├── hooks/              # Custom hooks
├── lib/                # Funciones auxiliares
├── public/             # Archivos estáticos
├── styles/             # Estilos globales / Tailwind
├── .gitignore          # Archivos ignorados por Git
├── package.json        # Dependencias y scripts
├── pnpm-lock.yaml      # Lockfile de pnpm
├── postcss.config.mjs  # Configuración PostCSS
├── tailwind.config.ts  # Configuración Tailwind
└── tsconfig.json       # Configuración TypeScript
```

## 🚀 Instalación y Uso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/vivileef/SGEpro-react.git
   ```

2. **Entrar al directorio**
   ```bash
   cd SGEpro-react
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```
   
💡 **Tip**: Para probar diferentes roles, puedes cambiar manualmente los datos en localStorage desde el navegador.

## 🏗️ Flujo de Trabajo

- **Login por rol**: Se simula la autenticación según el rol seleccionado.
- **Asignación y registro de estudiantes y tutores**: Toda la información se guarda localmente.
- **Seguimiento y evaluación**: Los tutores pueden registrar avances y observaciones.
- **Reportes y estadísticas**: Se generan dinámicamente a partir de los datos locales.
- **Notificaciones**: Alertas en tiempo real dentro de la sesión actual.

---

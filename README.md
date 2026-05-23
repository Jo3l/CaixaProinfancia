# CaixaProinfancia Madrid - Repositorio de Actividades

[![Deploy to GitHub Pages](https://github.com/Jo3l/CaixaProinfancia/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jo3l/CaixaProinfancia/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-github_pages-blue)](https://jo3l.github.io/CaixaProinfancia/)

Filtro interactivo para el repositorio colaborativo de actividades formativas de CaixaProinfancia Madrid, similar a [La Mochila de Kay](https://www.lamochiladekay.com/).

**🌐 Demo en vivo:** [https://jo3l.github.io/CaixaProinfancia/](https://jo3l.github.io/CaixaProinfancia/)

Cargando datos desde un archivo Excel, permite filtrar actividades por **competencia trabajada**, **edad**, **entidad** y **búsqueda de texto libre**.

## Requisitos

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8

## Instalación

```bash
pnpm install
```

## Preparar los datos

Coloca el archivo Excel (`Repositorio actividades Competencias.xlsx`) en la carpeta `public/`:

```
cp /ruta/del/archivo/Repositorio\ actividades\ Competencias.xlsx public/
```

Esto permite usar el botón **"Cargar archivo por defecto"** desde la web.

También puedes simplemente **arrastrar y soltar** cualquier archivo `.xlsx` directamente sobre la página.

## Ejecutar en desarrollo

```bash
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Compilar para producción

```bash
pnpm build
```

Los archivos estáticos se generan en la carpeta `dist/`.

## Vista previa de producción

```bash
pnpm preview
```

## Tecnologías

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [PrimeVue 4](https://primevue.org/) (Tema Aura)
- [PrimeIcons](https://primevue.org/icons)
- [SheetJS / xlsx](https://www.npmjs.com/package/xlsx)

## Uso

1. Carga el archivo Excel (arrastrando o con el botón)
2. Selecciona los filtros deseados:
   - **Competencia trabajada** — p.ej. Autoconciencia, Empatía
   - **Edades** — p.ej. Todo Primaria, 10 a 12 años
   - **Entidad** — p.ej. Fundación Amigó, Save the Children
   - **Búsqueda** — texto libre en toda la actividad
3. Explora los resultados en la tabla paginada
4. Expande cada fila para ver detalles completos (objetivos, descripción, materiales, enlaces)

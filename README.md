# Interactive Network Lab

Interactive Network Lab es una herramienta educativa diseñada para ayudar a ingenieros de redes y estudiantes a visualizar y calcular el subneteado de redes IPv4 de manera intuitiva.

## Objetivo

El objetivo es eliminar la dependencia de "tablas de memoria" mediante una interfaz que desglosa el cálculo de subredes en pasos lógicos, mostrando la conversión a binario, el operador lógico AND y el cálculo de límites de red.

## Stack Tecnológico

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS (Arquitectura de componentes modular)
- **Lógica de Red:** `ipaddr.js` (Biblioteca estándar para manipulación de direcciones IP)
- **Despliegue:** GitHub Pages (vía GitHub Actions)

## Funcionalidades Principales

- **Bit-Wise Visualizer:** Panel interactivo de 32 bits que muestra la frontera entre Network y Host, con slider y input numérico sincronizados.
- **VLSM Planner:** Motor de segmentación optimizada con ordenamiento automático de mayor a menor, soporte para múltiples subredes y barra de uso del espacio.
- **Explainability Engine:** Guía paso a paso que genera el desglose binario y la operación AND bit a bit para cada resultado.

## Arquitectura del Proyecto

```text
/src
  /components
    BitVisualizer.jsx    # Visualizador de bits con slider y entradas sincronizadas
    ResultTable.jsx      # Tabla de rangos, broadcast y hosts usables
    ExplainPanel.jsx     # Motor de explicación paso a paso (AND binario)
    VLSMPlanner.jsx      # Planificador VLSM con múltiples subredes
  /utils
    subnetCalculator.js  # Lógica pura de red (sin dependencias de UI)
```

## Desarrollo Local

```bash
npm install
npm run dev
```

## Build y Deploy

El proyecto se despliega automáticamente en GitHub Pages con cada `git push` a `main`.

```bash
npm run build
```

## Licencia

Este proyecto está bajo la licencia MIT.

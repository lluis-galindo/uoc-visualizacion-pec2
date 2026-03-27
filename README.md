# Dashboard de Visualizacion de Datos (Next.js 14)

Aplicacion de pagina unica construida con:

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Recharts
- D3
- react-circular-progressbar

Incluye tres tecnicas de visualizacion en formato dashboard:

1. Infografia: Destino global de residuos
2. Gauge diagram: Nivel de embalses en Espana
3. Spiral plot: Temperatura media en Barcelona

## Estructura

```text
app/
	page.tsx
components/
	Infographic.tsx
	GaugeChart.tsx
	SpiralPlot.tsx
data/
	waste.csv
	reservoirs.csv
	temperature.csv
```

## Datos CSV (ejemplo)

`data/waste.csv`

```csv
type,value
recycling,27
landfill,49
incineration,24
```

`data/reservoirs.csv`

```csv
current_level,max_level
74,100
```

`data/temperature.csv`

```csv
month,temperature
1,10.5
2,11.8
3,13.6
4,15.7
5,19.3
6,23.4
7,26.4
8,26.7
9,23.2
10,19.1
11,14.2
12,11.7
```

## Ejecucion

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar entorno de desarrollo:

```bash
npm run dev
```

3. Abrir en navegador:

```text
http://localhost:3000
```

## Despliegue en Vercel

Proyecto listo para desplegar en Vercel como aplicacion Next.js estandar.

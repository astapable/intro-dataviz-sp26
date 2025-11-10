# NYC Air Quality Visualization

Interactive time-series visualization of PM2.5 (Fine Particulate Matter) levels in New York City.

## Overview

This example demonstrates how to create a line chart with D3.js to visualize air quality data over time. PM2.5 refers to fine inhalable particles with diameters of 2.5 micrometers or smaller, which can pose health risks.

## Data Source

**NYC Open Data**: [Air Quality dataset](https://data.cityofnewyork.us/Environment/Air-Quality/c3uy-2p5r)

The dataset contains air quality measurements from various NYC locations, including:
- PM2.5 (Fine Particulate Matter)
- Ozone
- Nitrogen Dioxide
- And other pollutants

## Features

- Time-series line chart with D3 scales
- Interactive tooltips showing date, value, and location
- Responsive SVG with proper margins and axes
- Clean, modern styling

## Data Format

The CSV should have these columns:
- `start_date`: Measurement date (YYYY-MM-DD format)
- `data_value`: PM2.5 concentration in mcg/m³
- `geo_place_name`: Location/neighborhood
- `measure`: Measurement type

## Getting Fresh Data

To update with current data:

1. Visit [NYC Open Data Air Quality](https://data.cityofnewyork.us/Environment/Air-Quality/c3uy-2p5r)
2. Filter by "PM2.5" in the measure field
3. Export as CSV
4. Save to `data/pm25_sample.csv`

## Technical Details

- Built with [D3.js v7](https://d3js.org/)
- Uses `d3.scaleTime()` for date-based x-axis
- Uses `d3.line()` generator for path creation
- ES6 modules with top-level await

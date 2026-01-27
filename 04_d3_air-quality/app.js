// NYC Air Quality Visualization - PM2.5 Levels
// Data source: NYC Open Data Air Quality dataset

// Load data from NYC Open Data (using local CSV for example)
// To get fresh data: https://data.cityofnewyork.us/Environment/Air-Quality/c3uy-2p5r
const data = await d3.csv('./data/pm25_sample.csv', d => ({
    date: new Date(d.start_date),
    value: +d.data_value,
    location: d.geo_place_name,
    measure: d.measure
}))

// Filter for PM2.5 data
// Load and parse data
// Data source: NYC Open Data - Air Quality
// https://data.cityofnewyork.us/Environment/Air-Quality/c3uy-2p5r
// Sample includes PM2.5 measurements from 2023-2025 (monthly averages)
// Note: June 2023 spike (19.3 mcg/m³) caused by Canadian wildfire smoke
const pm25Data = await d3.csv('./data/pm25_sample.csv', d => ({
  date: new Date(d.start_date),
  value: +d.data_value,
  location: d.geo_place_name,
  measure: d.measure
}));

console.log(`Loaded ${pm25Data.length} PM2.5 measurements`)

// Set up dimensions
const margin = { top: 20, right: 30, bottom: 40, left: 50 }
const width = 900 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom

// Calculate max excluding outlier to prevent skewing color scale
const sortedValues = pm25Data.map(d => d.value).sort((a, b) => a - b)
const q3Index = Math.floor(sortedValues.length * 0.75)
const normalMax = sortedValues[q3Index] * 1.5  // Use 1.5x the 75th percentile

// Create scales
const xScale = d3.scaleTime()
    .domain(d3.extent(pm25Data, d => d.date))
    .range([0, width])

const yScale = d3.scaleLinear()
    .domain([0, d3.max(pm25Data, d => d.value)])
    .nice()
    .range([height, 0])

// Create SVG
const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

// Color scale for lines and dots - matching original
// Uses normalMax to prevent outliers from throwing off the red values
// Domain: 1 (high) = red, 0.8 = orange, 0.6 = blue, 0 (low) = black
const colorScale = d3.scaleLinear()
    .domain([1, 0.8, 0.6, 0])
    .range(['hsla(0, 100%, 50%, 1.0)', 'hsla(30, 100%, 50%, 1.0)', 'hsla(200, 100%, 50%, 1.0)', 'black'])

// Add axes
svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))

svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(yScale))

// Add y-axis label
svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 15)
    .attr('x', -height / 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.85rem')
    .attr('fill', '#666')
    .text('PM2.5 (mcg/m³)')

// Draw line segments - each segment colored based on its value
// Using normalMax instead of actual max to prevent outlier from skewing colors
for (let i = 0; i < pm25Data.length - 1; i++) {
    const d1 = pm25Data[i]
    const d2 = pm25Data[i + 1]
    const avgValue = (d1.value + d2.value) / 2
    
    svg.append('line')
        .attr('x1', xScale(d1.date))
        .attr('y1', yScale(d1.value))
        .attr('x2', xScale(d2.date))
        .attr('y2', yScale(d2.value))
        .attr('stroke', colorScale(Math.min(avgValue / normalMax, 1)))
        .attr('stroke-width', 2)
        .attr('fill', 'none')
}

// Tooltip label
const label = svg.append('g')
    .style('opacity', 0)
    .style('pointer-events', 'none')

const labelRect = label.append('rect')
    .attr('fill', '#000')
    .attr('rx', 3)

const labelText = label.append('text')
    .attr('fill', '#fff')
    .attr('font-size', '0.8rem')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')

// Vertical line
const verticalLine = svg.append('line')
    .attr('stroke', '#000')
    .attr('stroke-width', 1)
    .attr('y1', 0)
    .attr('y2', height)
    .style('opacity', 0)

// Add dots - colored by their value (using normalMax to handle outliers)
svg.selectAll('.dot')
    .data(pm25Data)
    .join('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.date))
    .attr('cy', d => yScale(d.value))
    .attr('r', 2)
    .attr('fill', d => colorScale(Math.min(d.value / normalMax, 1)))

// Hover interaction
svg.on('mousemove', event => {
    const [mx] = d3.pointer(event)
    const closestData = pm25Data.reduce((prev, curr) => {
        const prevDist = Math.abs(xScale(prev.date) - mx)
        const currDist = Math.abs(xScale(curr.date) - mx)
        return currDist < prevDist ? curr : prev
    })
    
    const x = xScale(closestData.date)
    const y = yScale(closestData.value)
    
    // Show vertical line
    verticalLine
        .attr('x1', x)
        .attr('x2', x)
        .style('opacity', 0.3)
    
    // Show label
    const text = `${closestData.value} on ${closestData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    labelText.text(text)
    
    const bbox = labelText.node().getBBox()
    labelRect
        .attr('x', bbox.x - 5)
        .attr('y', bbox.y - 3)
        .attr('width', bbox.width + 10)
        .attr('height', bbox.height + 6)
    
    label
        .attr('transform', `translate(${x}, ${y - 20})`)
        .style('opacity', 1)
})
.on('mouseleave', () => {
    label.style('opacity', 0)
    verticalLine.style('opacity', 0)
})

console.log('✅ Chart rendered')

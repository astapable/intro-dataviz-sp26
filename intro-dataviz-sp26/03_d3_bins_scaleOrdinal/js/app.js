async function main() {
  // select the app container
  const app = d3.select('#app')

  // fetch csv data
  const data = await d3.csv('./data/iris.csv')
  console.log(data)

  // you can fetch any kind of data
  const data_text = await d3.text('./data/helloWorld.txt')
  console.log(data_text)

  // value of longest petal value
  const min_value = d3.min(data, (d) => d.petal_length)
  const max_value = d3.max(data, (d) => d.petal_length)
  console.log('max value')
  console.log(max_value)

  // index of longest petal value
  const max_index = d3.maxIndex(data, (d) => d.petal_length)
  console.log('max index')
  console.log(max_index)

  // sort data by median petal length
  const sorted_data = d3.groupSort(
    data,
    (g) => d3.median(g, (d) => d.petal_length),
    (d) => d
  )
  console.log('sorted data')
  console.log(sorted_data)

  // create a bin generator for petal length
  const bin = d3
    .bin()
    .domain([0, max_value])
    .value((d) => d.petal_length)

  // bin the sorted data
  const binned_data = bin(sorted_data)
  console.log('binned data')
  console.log(binned_data)

  // build HTML for each bin group
  let groupped_html = ``

  binned_data.forEach((bin, groupIndex) => {
    // hydrate: join JSON strings with <br/> for readability
    let hydrate = bin.map((entry) => JSON.stringify(entry)).join('<br/>')
    groupped_html += `
    <div>
        <h1>Group ${groupIndex}:</h1>
        ${hydrate}
    </div>
    `
  })

  // create a div and set its HTML
  const div = d3.create('div')
  div.html(groupped_html)

  // create an SVG for visualization
  const svg = d3
    .create('svg')
    .attr('viewBox', [0, 0, 600, 300])
    .style('border', '1px solid gray')

  // bind binned data to SVG groups
  const g = svg.append('g').selectAll('g').data(binned_data).join('g')

  // set up y scale for bar heights
  const y_scale = d3
    .scaleLinear()
    .domain([0, d3.max(binned_data, (d) => d.length)])
    .range([300, 50])

  // set up x scale for bar positions
  const x_scale = d3
    .scaleBand()
    .domain(binned_data.map((d, i) => i))
    .range([0, 600])

  // use schemeCategory10 for bar colors
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // draw bars for each bin, colored by schemeCategory10
  g.append('rect')
    .attr('width', x_scale.bandwidth())
    .attr('height', (d) => y_scale(0) - y_scale(d.length))
    .attr('x', (d, i) => x_scale(i))
    .attr('y', (d) => y_scale(d.length))
    .attr('fill', (d, i) => colorScale(i)); // apply color

  // add text labels above each bar, centered
  g.append('text')
    .attr('x', (d, i) => x_scale(i) + x_scale.bandwidth() / 2)
    .attr('y', (d) => y_scale(d.length) - 8)
    .attr('text-anchor', 'middle')
    .text((d) => d.length);

  // append SVG to app container
  app.append(() => svg.node())

  // append HTML summary to app container
  app.append(() => div.node())
}

main();

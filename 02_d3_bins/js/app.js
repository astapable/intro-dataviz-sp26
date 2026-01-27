async function main() {
  const app = d3.select('#app')

  // fetch csv data https://en.wikipedia.org/wiki/Iris_flower_data_set
  const data = await d3.csv('./data/iris.csv')
  console.log(data)

  // fetch plain text data
  const data_text = await d3.text('./data/helloWorld.txt')
  console.log(data_text)

  // compute min and max petal length
  const min_value = d3.min(data, (d) => d.petal_length)
  const max_value = d3.max(data, (d) => d.petal_length)
  console.log('max value')
  console.log(max_value)

  // find index of max petal length
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
    let hydrate = bin.map((entry) => JSON.stringify(entry))
    groupped_html += `
    <div>
      <h2>Group ${groupIndex}:</h2>
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
    .range([300, 50]) // flip so bars grow upward

  // set up x scale for bar positions
  const x_scale = d3
    .scaleBand()
    .domain(binned_data.map((d, i) => i))
    .range([0, 600])

  // draw bars for each bin
  g.append('rect')
    .attr('width', x_scale.bandwidth())
    .attr('height', (d) => y_scale(0) - y_scale(d.length))
    .attr('x', (d, i) => x_scale(i))
    .attr('y', (d) => y_scale(d.length))

  // add text labels for each bar, centered and larger font
  g.append('text')
    .attr('x', (d, i) => x_scale(i) + x_scale.bandwidth() / 2) // center in bin
    .attr('y', (d) => y_scale(d.length) - 10) // above bar
    .attr('text-anchor', 'middle') // center text
    .text((d) => d.length)

  // append SVG to app container
  app.append(() => svg.node())

  // append HTML summary to app container
  app.append(() => div.node())
}

main();

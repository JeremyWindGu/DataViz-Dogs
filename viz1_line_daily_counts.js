window.renderViz = (data, mount) => {
  const filtered = data.filter(d => d.dateObj);
  const counts = d3.rollups(
    filtered,
    v => v.length,
    d => d3.timeDay(d.dateObj)
  ).map(([date, count]) => ({ date, count }))
   .sort((a,b) => a.date - b.date);

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const margin = { top: 24, right: 24, bottom: 40, left: 48 };
  const w = Math.max(300, width - margin.left - margin.right);
  const h = Math.max(200, height - margin.top - margin.bottom);

  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
    .domain(d3.extent(counts, d => d.date))
    .range([0, w]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(counts, d => d.count) || 1]).nice()
    .range([h, 0]);

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.count));

  g.append('path')
    .datum(counts)
    .attr('fill', 'none')
    .attr('stroke', '#D4A574')
    .attr('stroke-width', 3)
    .attr('d', line);

  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %d')));

  g.append('g').call(d3.axisLeft(y).ticks(5));

  g.append('text').attr('x', w/2).attr('y', -6).attr('text-anchor', 'middle')
    .text('Number of dogs observed daily');
};
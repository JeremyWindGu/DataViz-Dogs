window.renderViz = (data, mount) => {
  const sources = Array.from(new Set(data.map(d=>d.source))).sort();
  const locations = Array.from(new Set(data.map(d=>d.location))).sort();

  const matrix = [];
  sources.forEach(s => {
    locations.forEach(loc => {
      const count = data.filter(d => d.source===s && d.location===loc).length;
      matrix.push({ source: s, location: loc, count });
    });
  });

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const margin = { top: 60, right: 20, bottom: 60, left: 100 };
  const w = Math.max(320, width - margin.left - margin.right);
  const h = Math.max(220, height - margin.top - margin.bottom);

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(locations).range([0, w]).padding(0.05);
  const y = d3.scaleBand().domain(sources).range([0, h]).padding(0.05);
  const maxCount = d3.max(matrix, d=>d.count) || 1;
  const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, maxCount]);

  g.selectAll('rect').data(matrix).enter().append('rect')
    .attr('x', d => x(d.location)).attr('y', d => y(d.source))
    .attr('width', x.bandwidth()).attr('height', y.bandwidth())
    .attr('fill', d => color(d.count));

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x)).selectAll("text").attr("transform","rotate(20)").style("text-anchor","start");
  g.append('g').call(d3.axisLeft(y));

  svg.append('text').attr('x', width/2).attr('y', 22).attr('text-anchor','middle').text('Observer × Location Heatmap');
};
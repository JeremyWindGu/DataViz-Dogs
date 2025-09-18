window.renderViz = (data, mount) => {
  const counts = d3.rollups(data, v=>v.length, d=>d.location)
    .map(([location, count]) => ({location, count}))
    .sort((a,b) => d3.descending(a.count, b.count));

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const margin = { top: 24, right: 16, bottom: 60, left: 100 };
  const w = Math.max(300, width - margin.left - margin.right);
  const h = Math.max(200, height - margin.top - margin.bottom);

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand().domain(counts.map(d=>d.location)).range([0, h]).padding(0.2);
  const x = d3.scaleLinear().domain([0, d3.max(counts, d=>d.count) || 1]).nice().range([0, w]);

  g.selectAll('rect').data(counts).enter().append('rect')
    .attr('y', d => y(d.location)).attr('x', 0)
    .attr('height', y.bandwidth()).attr('width', d => x(d.count))
    .attr('fill', '#B8935A');

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(5));
  g.append('g').call(d3.axisLeft(y));

  g.append('text').attr('x', w/2).attr('y', -6).attr('text-anchor', 'middle')
    .text('Number of observations at different locations');
};
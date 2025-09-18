window.renderViz = (data, mount) => {
  const order = ['small','medium','large'];
  const counts = order.map(size => ({
    size,
    count: data.filter(d => d.size === size).length
  }));

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const margin = { top: 24, right: 16, bottom: 40, left: 40 };
  const w = Math.max(300, width - margin.left - margin.right);
  const h = Math.max(200, height - margin.top - margin.bottom);

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(order).range([0, w]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(counts, d=>d.count) || 1]).nice().range([h, 0]);

  g.selectAll('rect').data(counts).enter().append('rect')
    .attr('x', d => x(d.size)).attr('y', d => y(d.count))
    .attr('width', x.bandwidth()).attr('height', d => h - y(d.count))
    .attr('fill', '#D4A574');

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x));
  g.append('g').call(d3.axisLeft(y).ticks(5));

  g.append('text').attr('x', w/2).attr('y', -6).attr('text-anchor', 'middle')
    .text('Dog size distribution');
};
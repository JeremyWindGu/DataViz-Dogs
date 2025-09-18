window.renderViz = (data, mount) => {
  const counts = d3.rollups(data, v => v.length, d => d.source)
    .map(([source, count]) => ({source, count}));

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const size = Math.min(width, height) - 40;
  const radius = Math.max(80, size/2);

  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g').attr('transform', `translate(${width/2}, ${height/2})`);

  const pie = d3.pie().value(d => d.count);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  const color = d3.scaleOrdinal().domain(counts.map(d=>d.source)).range(['#D4A574', '#E8C4A0', '#B8935A', '#2C2C2C', '#6B6B6B']);

  g.selectAll('path')
    .data(pie(counts))
    .enter().append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.source))
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5);

  const labelArc = d3.arc().innerRadius(radius*0.6).outerRadius(radius*0.6);

  g.selectAll('text.label')
    .data(pie(counts))
    .enter().append('text')
    .attr('class','label')
    .attr('transform', d => `translate(${labelArc.centroid(d)})`)
    .attr('text-anchor','middle')
    .text(d => `${d.data.source}: ${d.data.count}`);

  svg.append('text')
    .attr('x', width/2)
    .attr('y', 22)
    .attr('text-anchor', 'middle')
    .text('Observer contribution ratio');
};
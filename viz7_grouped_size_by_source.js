window.renderViz = (data, mount) => {
  const sources = Array.from(new Set(data.map(d=>d.source))).sort();
  const sizes = ['small','medium','large'];

  const grouped = sources.map(s => ({
    source: s,
    values: sizes.map(size => ({
      key: size,
      value: data.filter(d => d.source===s && d.size===size).length
    }))
  }));

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const margin = { top: 24, right: 16, bottom: 40, left: 40 };
  const w = Math.max(360, width - margin.left - margin.right);
  const h = Math.max(220, height - margin.top - margin.bottom);

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand().domain(sources).range([0, w]).padding(0.2);
  const x1 = d3.scaleBand().domain(sizes).range([0, x0.bandwidth()]).padding(0.1);
  const y = d3.scaleLinear().domain([0, d3.max(grouped.flatMap(d=>d.values), v=>v.value) || 1]).nice().range([h, 0]);
  const color = d3.scaleOrdinal().domain(sizes).range(['#D4A574','#E8C4A0','#B8935A']);

  const rows = g.selectAll('.row').data(grouped).enter().append('g')
    .attr('class','row')
    .attr('transform', d => `translate(${x0(d.source)},0)`);

  rows.selectAll('rect').data(d => d.values).enter().append('rect')
    .attr('x', v => x1(v.key)).attr('y', v => y(v.value))
    .attr('width', x1.bandwidth()).attr('height', v => h - y(v.value))
    .attr('fill', v => color(v.key));

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x0));
  g.append('g').call(d3.axisLeft(y).ticks(5));

  const legend = svg.append('g').attr('transform', `translate(${width-140},${margin.top})`);
  sizes.forEach((s, i) => {
    const row = legend.append('g').attr('transform', `translate(0, ${i*18})`);
    row.append('rect').attr('width', 12).attr('height', 12).attr('fill', color(s));
    row.append('text').attr('x', 16).attr('y', 10).text(s);
  });

  g.append('text').attr('x', w/2).attr('y', -6).attr('text-anchor', 'middle')
    .text('Observer × Size Grouped Bar Chart');
};
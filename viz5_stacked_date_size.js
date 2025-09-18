window.renderViz = (data, mount) => {
  const sizes = ['small','medium','large'];
  const nested = d3.rollups(
    data.filter(d => d.dateObj),
    v => {
      const o = { date: d3.timeDay(v[0].dateObj) };
      sizes.forEach(s => o[s] = v.filter(d => d.size===s).length);
      return o;
    },
    d => d3.timeDay(d.dateObj)
  ).map(d => d[1]).sort((a,b)=>a.date-b.date);

  const series = d3.stack().keys(sizes)(nested);

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const margin = { top: 24, right: 16, bottom: 40, left: 40 };
  const w = Math.max(320, width - margin.left - margin.right);
  const h = Math.max(220, height - margin.top - margin.bottom);

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(nested.map(d=>d.date)).range([0, w]).padding(0.2);
  const y = d3.scaleLinear()
    .domain([0, d3.max(nested, d => sizes.reduce((acc, k)=>acc + d[k], 0)) || 1])
    .nice().range([h, 0]);

  const color = d3.scaleOrdinal().domain(sizes).range(['#D4A574','#E8C4A0','#B8935A']);

  g.selectAll('g.layer').data(series).enter().append('g')
    .attr('class','layer')
    .attr('fill', d => color(d.key))
    .selectAll('rect').data(d => d).enter().append('rect')
    .attr('x', (d,i) => x(nested[i].date))
    .attr('y', d => y(d[1]))
    .attr('height', d => y(d[0]) - y(d[1]))
    .attr('width', x.bandwidth());

  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')));
  g.append('g').call(d3.axisLeft(y).ticks(5));

  const legend = svg.append('g').attr('transform', `translate(${width-120},${margin.top})`);
  sizes.forEach((s, i) => {
    const row = legend.append('g').attr('transform', `translate(0, ${i*18})`);
    row.append('rect').attr('width', 12).attr('height', 12).attr('fill', color(s));
    row.append('text').attr('x', 16).attr('y', 10).text(s);
  });

  g.append('text').attr('x', w/2).attr('y', -6).attr('text-anchor', 'middle')
    .text('Date × Size Stacked Bar Chart');
};
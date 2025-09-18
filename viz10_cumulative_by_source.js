window.renderViz = (data, mount) => {
  const byDaySource = d3.rollups(
    data.filter(d=>d.dateObj),
    v => v.length,
    d => d3.timeDay(d.dateObj),
    d => d.source
  ).map(([date, inner]) => {
    const obj = { date };
    inner.forEach(([source, count]) => obj[source] = count);
    return obj;
  }).sort((a,b) => a.date - b.date);

  const sources = Array.from(new Set(data.map(d=>d.source))).sort();

  // Compute cumulative
  const cum = [];
  const running = Object.fromEntries(sources.map(s=>[s,0]));
  byDaySource.forEach(row => {
    const out = { date: row.date };
    sources.forEach(s => running[s] += (row[s] || 0));
    sources.forEach(s => out[s] = running[s]);
    cum.push(out);
  });

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const margin = { top: 24, right: 100, bottom: 40, left: 48 };
  const w = Math.max(360, width - margin.left - margin.right);
  const h = Math.max(240, height - margin.top - margin.bottom);

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().domain(d3.extent(cum, d=>d.date)).range([0, w]);
  const y = d3.scaleLinear().domain([0, d3.max(cum, d=>d3.max(sources, s=>d[s])) || 1]).nice().range([h, 0]);
  const color = d3.scaleOrdinal().domain(sources).range(['#D4A574', '#E8C4A0', '#B8935A', '#2C2C2C', '#6B6B6B']);

  const line = d3.line().x(d=>x(d.date));

  sources.forEach(s => {
    const series = cum.map(d => ({date: d.date, value: d[s]}));
    g.append('path')
      .datum(series)
      .attr('fill','none')
      .attr('stroke', color(s))
      .attr('stroke-width', 2)
      .attr('d', line.y(d=>y(d.value)));
  });

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %d')));
  g.append('g').call(d3.axisLeft(y).ticks(5));

  // Legend
  const legend = svg.append('g').attr('transform', `translate(${width - margin.right + 20}, ${margin.top})`);
  sources.forEach((s, i) => {
    const row = legend.append('g').attr('transform', `translate(0, ${i*18})`);
    row.append('rect').attr('width', 12).attr('height', 12).attr('fill', color(s));
    row.append('text').attr('x', 16).attr('y', 10).text(s);
  });

  g.append('text').attr('x', w/2).attr('y', -6).attr('text-anchor', 'middle')
    .text('Cumulative Trend Comparison (by Observer)');
};
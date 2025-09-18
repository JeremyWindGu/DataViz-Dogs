window.renderViz = (data, mount) => {
  const filtered = data.filter(d => d.dateObj);
  const roll = d3.rollups(
    filtered,
    v => {
      const sizes = d3.rollups(v, vv => vv.length, d=>d.size);
      return {
        total: v.length,
        sizes: new Map(sizes)
      };
    },
    d=>d3.timeDay(d.dateObj),
    d=>d.location
  );

  const entries = [];
  roll.forEach(([date, locs]) => {});
  for (const [date, locs] of roll) {
    for (const [loc, obj] of locs) {
      entries.push({ date, location: loc, total: obj.total, sizes: obj.sizes });
    }
  }

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const margin = { top: 24, right: 24, bottom: 60, left: 100 };
  const w = Math.max(360, width - margin.left - margin.right);
  const h = Math.max(240, height - margin.top - margin.bottom);

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().domain(d3.extent(entries, d=>d.date)).range([0, w]);
  const y = d3.scalePoint().domain(Array.from(new Set(entries.map(d=>d.location))).sort()).range([0, h]).padding(0.5);
  const r = d3.scaleSqrt().domain([0, d3.max(entries, d=>d.total) || 1]).range([3, 30]);

  const color = d3.scaleOrdinal().domain(['small','medium','large']).range(['#8cd17d','#4e79a7','#f28e2b']);

  // Draw total bubble with ring
  const nodes = g.selectAll('g.node').data(entries).enter().append('g')
    .attr('class','node')
    .attr('transform', d => `translate(${x(d.date)},${y(d.location)})`);

  nodes.append('circle')
    .attr('r', d => r(d.total))
    .attr('fill', 'none')
    .attr('stroke', '#999')
    .attr('stroke-width', 1.5);

  // Add small wedges for sizes (up to 3 arcs)
  const arc = d3.arc().innerRadius(0);
  nodes.each(function(d) {
    const sel = d3.select(this);
    const total = Math.max(1, d.total);
    const parts = ['small','medium','large'].map(k => (d.sizes.get(k) || 0));
    const sum = parts.reduce((a,b)=>a+b,0) || 1;
    let start = 0;
    parts.forEach((val, i) => {
      const angle = (val / sum) * 2 * Math.PI;
      arc.outerRadius(r(d.total) - 1).startAngle(start).endAngle(start + angle);
      sel.append('path').attr('d', arc).attr('fill', color(['small','medium','large'][i]));
      start += angle;
    });
  });

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %d')));
  g.append('g').call(d3.axisLeft(y));

  g.append('text').attr('x', w/2).attr('y', -6).attr('text-anchor', 'middle')
    .text('Time-place bubble chart (sectors represent size proportions, and circle radius represents total volume)');
};
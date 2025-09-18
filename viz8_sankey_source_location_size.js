window.renderViz = (data, mount) => {
  const sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(12);

  // Build nodes and links for Source -> Location -> Size
  const sources = Array.from(new Set(data.map(d=>d.source)));
  const locations = Array.from(new Set(data.map(d=>d.location)));
  const sizes = ['small','medium','large'];

  const nodes = [
    ...sources.map(s => ({ name: `S:${s}` })),
    ...locations.map(l => ({ name: `L:${l}` })),
    ...sizes.map(z => ({ name: `Z:${z}` })),
  ];

  const nameToIndex = new Map(nodes.map((n,i)=>[n.name, i]));

  function addCount(map, key) { map.set(key, (map.get(key)||0) + 1); }

  // links: source->location
  const sl = new Map();
  data.forEach(d => addCount(sl, `S:${d.source}||L:${d.location}`));

  // links: location->size
  const lz = new Map();
  data.forEach(d => addCount(lz, `L:${d.location}||Z:${d.size}`));

  const links = [
    ...Array.from(sl.entries()).map(([k, v]) => {
      const [s, l] = k.split('||');
      return { source: nameToIndex.get(s), target: nameToIndex.get(l), value: v };
    }),
    ...Array.from(lz.entries()).map(([k, v]) => {
      const [l, z] = k.split('||');
      return { source: nameToIndex.get(l), target: nameToIndex.get(z), value: v };
    }),
  ];

  const container = d3.select(mount);
  const { width, height } = container.node().getBoundingClientRect();
  const margin = { top: 24, right: 24, bottom: 24, left: 24 };
  const w = Math.max(400, width - margin.left - margin.right);
  const h = Math.max(260, height - margin.top - margin.bottom);

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  sankey.extent([[0,0],[w,h]]);

  const graph = sankey({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
  });

  const color = d3.scaleOrdinal()
    .domain(nodes.map(d=>d.name))
    .range(['#D4A574', '#E8C4A0', '#B8935A', '#2C2C2C', '#6B6B6B', '#F8F8F8']);

  g.append('g').selectAll('path')
    .data(graph.links)
    .enter().append('path')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('fill', 'none')
    .attr('stroke', d => color(graph.nodes[d.source.index].name))
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', d => Math.max(1, d.width));

  const node = g.append('g').selectAll('g')
    .data(graph.nodes)
    .enter().append('g');

  node.append('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', d => color(d.name));

  node.append('text')
    .attr('x', d => d.x0 - 6)
    .attr('y', d => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .text(d => d.name)
    .filter(d => d.x0 < w / 2)
    .attr('x', d => d.x1 + 6)
    .attr('text-anchor', 'start');

  svg.append('text')
    .attr('x', width/2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .text('Sankey diagram：Source → Location → Size');
};
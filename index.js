// Paste your data here
const graph = {
  "nodes": [
    { "id": "Blantyre", "x": 0.913, "y": 0.254 },
    { "id": "Chikwawa", "x": 0.144, "y": 0.391 },
    { "id": "Chiradzulu", "x": 0.935, "y": 0.503 },
    { "id": "Chitipa", "x": 0.503, "y": 0.637 },
    { "id": "Dedza", "x": 0.327, "y": 0.327 },
    { "id": "Dowa", "x": 0.449, "y": 0.353 },
    { "id": "Karonga", "x": 0.772, "y": 0.716 },
    { "id": "Kasungu", "x": 0.949, "y": 0.037 },
    { "id": "Lilongwe", "x": 0.032, "y": 0.079 },
    { "id": "Machinga", "x": 0.498, "y": 0.160 },
    { "id": "Mangochi", "x": 0.242, "y": 0.221 },
    { "id": "Mchinji", "x": 0.803, "y": 0.417 },
    { "id": "Mulanje", "x": 0.700, "y": 0.730 },
    { "id": "Likoma", "x": 0.349, "y": 0.625 },
    { "id": "Thyolo", "x": 0.627, "y": 0.769 },
    { "id": "Nsanje", "x": 0.809, "y": 0.508 },
    { "id": "Mwanza", "x": 0.309, "y": 0.914 },
    { "id": "Zomba", "x": 0.725, "y": 0.811 },
    { "id": "Phalombe", "x": 0.934, "y": 0.733 },
    { "id": "Ntcheu", "x": 0.859, "y": 0.417 },
    { "id": "Ntchisi", "x": 0.397, "y": 0.998 },
    { "id": "Rumphi", "x": 0.244, "y": 0.039 },
    { "id": "Mzimba", "x": 0.162, "y": 0.836 },
    { "id": "Salima", "x": 0.837, "y": 0.997 },
    { "id": "Balaka", "x": 0.159, "y": 0.570 },
    { "id": "Nkhata Bay", "x": 0.088, "y": 0.187 },
    { "id": "Nkhotakota", "x": 0.175, "y": 0.001 },
    { "id": "Neno", "x": 0.987, "y": 0.351 }
  ],
  "edges": [
    ["Blantyre", "Chikwawa"], ["Blantyre", "Chiradzulu"], ["Blantyre", "Thyolo"],
    ["Chikwawa", "Nsanje"], ["Chikwawa", "Mwanza"], ["Chiradzulu", "Zomba"],
    ["Chiradzulu", "Phalombe"], ["Chitipa", "Karonga"], ["Dedza", "Lilongwe"],
    ["Dedza", "Ntcheu"], ["Dowa", "Lilongwe"], ["Dowa", "Ntchisi"],
    ["Karonga", "Rumphi"], ["Kasungu", "Lilongwe"], ["Kasungu", "Mzimba"],
    ["Lilongwe", "Mchinji"], ["Lilongwe", "Salima"], ["Machinga", "Zomba"],
    ["Machinga", "Balaka"], ["Mangochi", "Balaka"], ["Mangochi", "Salima"],
    ["Mulanje", "Phalombe"], ["Mulanje", "Thyolo"], ["Mwanza", "Neno"],
    ["Mzimba", "Nkhata Bay"], ["Mzimba", "Rumphi"], ["Nkhata Bay", "Nkhotakota"],
    ["Nkhotakota", "Salima"], ["Nsanje", "Chikwawa"], ["Ntcheu", "Balaka"],
    ["Ntchisi", "Nkhotakota"], ["Phalombe", "Mulanje"], ["Salima", "Nkhotakota"],
    ["Zomba", "Machinga"]
  ]
};

const links = graph.edges.map(([source, target]) => ({ source, target }));

const width = 400, height = 400, margin = 20;

// Scales to map [0,1] to SVG pixels, filling the SVG minus margins
const xScale = d3.scaleLinear().domain([0, 1]).range([margin, width - margin]);
const yScale = d3.scaleLinear().domain([0, 1]).range([margin, height - margin]);

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const container = svg.append("g");

// Center the [0,1] square in the SVG
container.attr("transform", `translate(0,0)`);

svg.call(d3.zoom().on("zoom", (event) => {
  container.attr("transform", event.transform);
}));

const simulation = d3.forceSimulation(graph.nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(0.3))
  .force("charge", d3.forceManyBody().strength(-0.7))
  .force("center", d3.forceCenter(0.5, 0.5))
  .force("collision", d3.forceCollide().radius(0.08)) // More space between nodes
  .on("tick", ticked)
  .on("end", () => {
    console.log("Optimized node positions:");
    graph.nodes.forEach(d => {
      console.log(`${d.id}: (${d.x.toFixed(4)}, ${d.y.toFixed(4)})`);
    });
  });

const link = container.selectAll("line")
  .data(links)
  .enter()
  .append("line")
  .attr("stroke", "#999")
  .attr("stroke-width", 2);

const node = container.selectAll("circle")
  .data(graph.nodes)
  .enter()
  .append("circle")
  .attr("r", 10)
  .attr("fill", "tomato")
  .on("mouseover", highlight)
  .on("mouseout", unhighlight)
  .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended)
  );

const label = container.selectAll("text")
  .data(graph.nodes)
  .enter()
  .append("text")
  .text(d => d.id)
  .attr("font-size", "12px")
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "hanging")
  .attr("fill", "#222");

// Tooltip
const tooltip = d3.select("body").append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("border", "1px solid #ccc")
  .style("padding", "5px")
  .style("display", "none");

function ticked() {
  // Clamp positions to [0,1]
  graph.nodes.forEach(d => {
    d.x = Math.max(0, Math.min(1, d.x));
    d.y = Math.max(0, Math.min(1, d.y));
  });

  link
    .attr("x1", d => xScale(d.source.x))
    .attr("y1", d => yScale(d.source.y))
    .attr("x2", d => xScale(d.target.x))
    .attr("y2", d => yScale(d.target.y));

  node
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y));

  label
    .attr("x", d => xScale(d.x))
    .attr("y", d => yScale(d.y) + 12); // label below node, always visible
}

// Drag functions
function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}
function dragged(event, d) {
  d.fx = Math.max(0, Math.min(1, xScale.invert(event.x)));
  d.fy = Math.max(0, Math.min(1, yScale.invert(event.y)));
}
function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// Highlight functions
function highlight(event, d) {
  // Find all neighbor ids
  const neighborIds = new Set(
    links.flatMap(l =>
      l.source.id === d.id ? [l.target.id] :
      l.target.id === d.id ? [l.source.id] : []
    )
  );

  node.attr("fill", n =>
    n.id === d.id ? "gold" : // hovered node
    neighborIds.has(n.id) ? "steelblue" : // neighbors
    "tomato"
  );

  link.attr("stroke", l =>
    l.source.id === d.id || l.target.id === d.id ? "#f90" : "#999"
  ).attr("stroke-width", l =>
    l.source.id === d.id || l.target.id === d.id ? 4 : 2
  );
}
function unhighlight() {
  node.attr("fill", "tomato");
  link.attr("stroke", "#999").attr("stroke-width", 2);
}


class Node {
  constructor(th, neighbours) {
    this.th = th;
    this.x = th * Math.cos(th);
    this.y = th * Math.sin(th);
    this.neighbours = [];
    for (const node of neighbours) {
      if (!node) continue;
      this.neighbours.push(node);
      if (!node.neighbours.includes(this)) {
        node.neighbours.push(this);
      }
    }
  }
}

function grid(maxTh) {
  const nodes = [];
  for (let i = 1, j = 0; ; i++) {
    const th = 2 * Math.sqrt(i * Math.PI);
    if (th >= maxTh) {
      return nodes;
    }
    const neighbours = [nodes[i - 1], nodes[j]];
    while (j <= i + Math.PI - th) {
      neighbours.push(nodes[++j]);
    }
    nodes[i] = new Node(th, neighbours);
  }
}

function grid2(maxTh, alpha = 4 * Math.PI) {
  const beta = (4 * Math.PI) / alpha;
  const nodes = [];
  for (let i = 0, j = 0; ; i++) {
    const th = Math.sqrt(i * alpha);
    if (th < Math.PI) {
      continue;
    }
    if (th >= maxTh) {
      return nodes;
    }
    const neighbours = [nodes[i - 1], nodes[j]];
    while (j <= i + beta * (Math.PI - th)) {
      neighbours.push(nodes[++j]);
    }
    nodes[i] = new Node(th, neighbours);
  }
}

export function run(canvas) {
  const context = canvas.getContext("2d");
  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  context.strokeStyle = "#663399";
  context.lineWidth = 5;
  context.lineCap = "round";
  context.lineJoin = "round";

  const nodes = grid2(69, Math.PI * 4 * Math.exp(0.5 - Math.random()));
  for (const node of nodes) {
    if (!node) continue;
    for (const neighbour of node.neighbours) {
      if (node.th >= neighbour.th) {
        continue;
      }
      context.beginPath();
      context.moveTo(5 * node.x + 350, 5 * node.y + 350);
      context.lineTo(5 * neighbour.x + 350, 5 * neighbour.y + 350);
      context.stroke();
    }
  }
}

import { fill, sample } from "./util.js";

class Node {
  state = 0;
  neighbours = [];
  neighbours2 = [];
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  connect(that) {
    if (!that || this.neighbours.includes(that)) return;
    if (this.neighbours.length) {
      const i = (this.neighbours.length * Math.random()) | 0;
      this.neighbours.push(this.neighbours[i]);
      this.neighbours[i] = that;
    } else {
      this.neighbours.push(that);
    }
    if (that.neighbours.length) {
      const i = (that.neighbours.length * Math.random()) | 0;
      that.neighbours.push(that.neighbours[i]);
      that.neighbours[i] = this;
    } else {
      that.neighbours.push(this);
    }
  }

  connect2(that) {
    if (!that || that.neighbours2.includes(that)) return;
    this.neighbours2.push(that);
    that.neighbours2.push(this);
  }

  incr() {
    if (this.state < 2) {
      this.state++;
    }
  }
}

function walk(node) {
  const nodes = [];
  a: for (;;) {
    node.state = 3;
    for (const k of node.neighbours) {
      k.incr();
      if (k.state < 2) {
        nodes.push(k);
      }
    }
    while (nodes.length > 0) {
      node = nodes.pop();
      if (node.state < 2) {
        continue a;
      }
    }
    return;
  }
}

const TAU = 2 * Math.PI;

function disc(radius = 34) {
  const counts = fill(radius, (i) => Math.round(i * TAU));
  const nodes = [[]];
  for (let i = 1; i < counts.length; i++) {
    nodes[i] = [];
    const dth = TAU / counts[i];
    const delta = counts[i - 1] / counts[i];
    for (let j = 0; j < counts[i]; j++) {
      const th = (j + 0.5) * dth;
      nodes[i][j] = new Node(35 + i * Math.cos(th), 35 + i * Math.sin(th));
      nodes[i][j].connect(nodes[i][j - 1]);
      const k = (j + 0.5) * delta - 0.5;
      const k0 = Math.ceil(k) % counts[i - 1];
      if (Math.ceil(k) <= k + delta) {
        nodes[i][j].connect(nodes[i - 1][k0]);
      } else {
        nodes[i][j].connect2(nodes[i - 1][k0]);
      }
      const k1 = k > 0 ? Math.floor(k) : counts[i - 1] - 1;
      if (Math.floor(k) >= k - delta) {
        nodes[i][j].connect(nodes[i - 1][k1]);
      } else {
        nodes[i][j].connect2(nodes[i - 1][k1]);
      }
    }
    nodes[i][0].connect(nodes[i][nodes[i].length - 1]);
  }

  nodes[0][0] = new Node(35, 35);
  nodes[1].forEach((it) => nodes[0][0].connect(it));

  for (const node of nodes[radius - 1]) {
    node.incr();
  }

  return nodes.flat();
}

// disconnected walls in the centre--what is missing there?
function spiral(radius = 34) {
  const limit = radius * radius * Math.PI;
  const nodes = [];
  for (let i = 1; i < limit; i++) {
    const th = 2 * Math.sqrt(i * Math.PI);
    const node = (nodes[i] = new Node(
      35 + (th * Math.cos(th)) / TAU,
      35 + (th * Math.sin(th)) / TAU,
    ));
    node.connect(nodes[i - 1]);

    const dth = i > Math.PI ? 1 - Math.sqrt(Math.PI / i) : 0;
    const j = i - th + Math.PI;
    if (j - Math.floor(j) < dth) {
      node.connect(nodes[Math.floor(j)]);
    } else {
      node.connect2(nodes[Math.floor(j)]);
    }
    if (Math.ceil(j) - j < dth) {
      node.connect(nodes[Math.ceil(j)]);
    } else {
      node.connect2(nodes[Math.ceil(j)]);
    }
    if (i + th + Math.PI > limit) {
      node.incr();
    }
  }
  nodes[0] = new Node(35, 35);
  for (let i = 1; i < 7; i++) {
    nodes[0].connect(nodes[i]);
  }
  nodes[0].connect2(nodes[7]);
  // missing lines (?)
  nodes[1].connect2(nodes[6]);
  nodes[1].connect2(nodes[9]);
  nodes[1].connect2(nodes[10]);
  nodes[8].connect2(nodes[10]);
  return nodes;
}

function squares(size = 69) {
  const nodes = [[]];
  for (let j = 0; j < size; j++) {
    nodes[0][j] = new Node(0.5, j + 0.5);
    nodes[0][j].connect(nodes[0][j - 1]);
    nodes[0][j].incr();
  }
  for (let i = 1; i < size; i++) {
    nodes[i] = [];
    for (let j = 0; j < size; j++) {
      nodes[i][j] = new Node(i + 0.5, j + 0.5);
      nodes[i][j].connect2(nodes[i - 1][j - 1]);
      nodes[i][j].connect(nodes[i - 1][j]);
      nodes[i][j].connect2(nodes[i - 1][j + 1]);
      nodes[i][j].connect(nodes[i][j - 1]);
    }
    nodes[i][0].incr();
    nodes[i][size - 1].incr();
  }
  for (let j = 0; j < size; j++) {
    nodes[size - 1][j].incr();
  }
  return nodes.flat();
}

function triangles(size = 69) {
  const nodes = [];
  const half = size >> 1;
  const xOffset = 70 - size;
  for (let i = 0; i < size; i++) {
    nodes[i] = [];
    const j0 = Math.max(0, i - half + 1);
    const j1 = Math.min(size, i + half);
    for (let j = j0; j < j1; j++) {
      nodes[i][j] = new Node(
        (i + j + xOffset) / 2,
        ((j - i) * Math.sqrt(3)) / 2 + 35,
      );
      nodes[i][j].connect(nodes[i - 1]?.[j - 1]);
      nodes[i][j].connect(nodes[i - 1]?.[j]);
      nodes[i][j].connect(nodes[i][j - 1]);
    }
    nodes[i][j0].incr();
    nodes[i][j1 - 1].incr();
  }
  for (const node of nodes[0]) {
    node.incr();
  }
  for (const node of nodes[size - 1]) {
    node?.incr();
  }
  return nodes.flat();
}

function draw(canvas, grid) {
  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  const context = canvas.getContext("2d");
  context.strokeStyle = "#337755";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 4;

  for (const node of grid) {
    if (!node || node.state === 3) {
      continue;
    }
    context.beginPath();
    context.arc(10 * (node.x + 1), 10 * (node.y + 1), 4, 0, 2 * Math.PI);
    context.stroke();
  }
}

function draw2(canvas, nodes) {
  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  const context = canvas.getContext("2d");

  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 2;

  for (const n0 of nodes) {
    if (n0.state === 3) {
      continue;
    }
    context.strokeStyle = "#337755";
    for (const n1 of n0.neighbours) {
      if (n1.state === 3) {
        continue;
      }
      context.beginPath();
      context.moveTo(10 * n0.x, 10 * n0.y);
      context.lineTo(10 * n1.x, 10 * n1.y);
      context.stroke();
    }
    context.strokeStyle = "#773355";
    for (const n1 of n0.neighbours2) {
      if (n1.state === 3) {
        continue;
      }
      context.beginPath();
      context.moveTo(10 * n0.x, 10 * n0.y);
      context.lineTo(10 * n1.x, 10 * n1.y);
      context.stroke();
    }
    n0.state = 4;
  }
}

function draw3(canvas, grid) {
  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  //canvas.style.background='#333333';
  const context = canvas.getContext("2d");

  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 7;

  for (let i = 0; i < grid.length; i++) {
    if (grid[i]?.state !== 3) {
      continue;
    }
    for (const j of grid[i].neighbours) {
      if (grid[j]?.state !== 3) {
        continue;
      }
      context.strokeStyle = i < j ? "#335577" : "775533";
      context.beginPath();
      context.moveTo(10 * (grid[i].x + 1), 10 * (grid[i].y + 1));
      context.lineTo(10 * (grid[j].x + 1), 10 * (grid[j].y + 1));
      context.stroke();
    }
  }
}

const GENERATORS = [disc, spiral, squares, triangles];
let index = 0;

// bugs remain: unconnected
export function run(canvas) {
  const nodes = GENERATORS[index++]();
  index %= GENERATORS.length;
  walk(sample(nodes));
  draw2(canvas, nodes);
}

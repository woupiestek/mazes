import { fill, sample } from "./util.js";

class Node {
  constructor(i, x, y, neighbours) {
    this.i = i;
    this.x = x;
    this.y = y;
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
  for (let i = 1, j = 0;; i++) {
    const th = 2 * Math.sqrt(i * Math.PI);
    if (th >= maxTh) {
      return nodes;
    }
    const neighbours = [nodes[i - 1], nodes[j]];
    while (j <= i + Math.PI - th) {
      neighbours.push(nodes[++j]);
    }
    nodes[i] = new Node(i, th * Math.cos(th), th * Math.sin(th), neighbours);
  }
}

function grid2(maxTh, alpha = 4 * Math.PI) {
  const beta = (4 * Math.PI) / alpha;
  const nodes = [];
  for (let i = 0, j = 0;; i++) {
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
    nodes[i] = new Node(i, th * Math.cos(th), th * Math.sin(th), neighbours);
  }
}

function grid3(maxTh, alpha = 4 * Math.PI, count = 3) {
  const half = Math.PI / count;
  const beta = (4 * Math.PI) / alpha;
  const nodes = [];
  for (let i = 0, j = 0;; i++) {
    const th = Math.sqrt((i * alpha) / count);
    if (th < half) {
      continue;
    }
    if (count * th >= maxTh) {
      return nodes.flat();
    }
    const ns = [nodes[j]];
    while (j <= i + beta * (half - th)) {
      ns.push(nodes[++j]);
    }
    nodes[i] = fill(
      count,
      (k) =>
        new Node(
          count * i + k,
          count * th * Math.cos(th + 2 * half * k),
          count * th * Math.sin(th + 2 * half * k),
          [nodes[i - 1]?.[k], ...ns.map((l) => l?.[(k + 1) % count])],
        ),
    );
  }
}

function walk(node) {
  const frontier = [];
  const visited = new Set();
  const walls = [];
  a: while (node) {
    const wall = [node];
    for (;;) {
      const next = sample(
        node.neighbours.filter((it) => !visited.has(it.i)),
      );
      if (!next) {
        if (wall.length > 1) {
          walls.push(wall);
        }
        node = frontier.pop();
        continue a;
      }
      frontier.push(node);
      visited.add(next.i);
      wall.push(next);
      node = next;
    }
  }
  return walls;
}

let count = 4;

export function run(canvas) {
  const context = canvas.getContext("2d");
  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  context.strokeStyle = "#333333";
  context.lineWidth = 5;
  context.lineCap = "round";
  context.lineJoin = "round";

  const UNIT = 3;
  const nodes = grid3(
    115,
    Math.PI * 4 * Math.exp(0.5 - Math.random()),
    ++count,
  );
  count %= 8;

  const walls = walk(sample(nodes.filter((it) => it)));

  for (const [h, ...t] of walls) {
    context.beginPath();
    context.moveTo(UNIT * h.x + 350, UNIT * h.y + 350);
    for (const node of t) {
      context.lineTo(UNIT * node.x + 350, UNIT * node.y + 350);
    }
    context.stroke();
  }
}

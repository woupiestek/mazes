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

const TAU = 2 * Math.PI;

function grid(maxR, alpha = TAU) {
  const counts = fill(Math.floor(maxR), (i) => Math.round(i * alpha));
  const nodes = [[]];
  for (let i = 1; i < counts.length; i++) {
    nodes[i] = [];
    const factor = counts[i - 1] / (2 * counts[i]);
    const radius = counts[i] / alpha;
    for (let j = 1; j < counts[i]; j++) {
      const k = Math.round((2 * j + 1) * factor - 1 / 2);
      const th = ((2 * j + 1) / counts[i]) * Math.PI;
      nodes[i][j] = new Node(
        i + j / counts[i],
        radius * Math.cos(th),
        radius * Math.sin(th),
        [nodes[i][j - 1], nodes[i - 1]?.[k]]
      );
    }
    const th = Math.PI / counts[i];
    nodes[i][0] = new Node(i, radius * Math.cos(th), radius * Math.sin(th), [
      nodes[i][1],
      nodes[i][counts[i] - 1],
      nodes[i - 1][0],
    ]);
  }
  return nodes.flat();
}

function walk(node) {
  const frontier = [];
  const visited = new Set();
  visited.add(node.i);
  const walls = [];
  a: while (node) {
    const wall = [node];
    for (;;) {
      const next = sample(node.neighbours.filter((it) => !visited.has(it.i)));
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

export function run(canvas) {
  const context = canvas.getContext("2d");
  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  context.strokeStyle = "#333333";
  context.lineWidth = 5;
  context.lineCap = "round";
  context.lineJoin = "round";

  const UNIT = 15;
  const nodes = grid(23, Math.PI * 2 * Math.exp(0.5 - Math.random()));

  const walls = walk(sample(nodes));

  for (const [h, ...t] of walls) {
    context.beginPath();
    context.moveTo(UNIT * h.x + 350, UNIT * h.y + 350);
    for (const node of t) {
      context.lineTo(UNIT * node.x + 350, UNIT * node.y + 350);
    }
    context.stroke();
  }
}

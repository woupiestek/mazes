import { sample } from "./util.js";

class Node {
  weight = 0;
  neighbours = [];

  constructor(x, y, ...neighbours) {
    this.x = x;
    this.y = y;
    for (const node of neighbours) {
      if (!(node instanceof Node)) {
        throw new Error(`bad neighbour ${node} at (${x}, ${y})`);
      }
      node.neighbours.push(this);
    }
    if (neighbours == undefined) {
      throw new Error(`how?`);
    }
    this.neighbours = neighbours;
  }

  isOpen() {
    return this.weight < 2;
  }
  close() {
    this.weight += 2;
    this.neighbours.forEach((node) => (node.weight += 1));
  }

  static walk(nodes) {
    nodes.forEach((node) => node.close());
    const nursery = nodes.map((node) => [node]);
    const walls = [];
    for (let i = 0; nursery.length > 0; i = (i + 1) % nursery.length) {
      const wall = nursery[i];
      const current = wall[wall.length - 1];
      const next = sample(current.neighbours.filter((it) => it.isOpen()));
      if (!next) {
        if (wall.length > 1) {
          walls.push(wall);
        }
        if (nodes.length) {
          nursery[i] = [nodes.shift()];
        } else if (i === nursery.length - 1) {
          nursery.pop();
        } else {
          nursery[i] = nursery.pop();
        }
        continue;
      }
      next.close();
      wall.push(next);
      nodes.push(next);
    }
    return walls;
  }
}

function draw(canvas, walls) {
  const UNIT = 7;
  const CENTER = 351;
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", 702);
  canvas.setAttribute("height", 702);
  context.fillStyle = "#000000";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 4;

  for (let i = 0, l = walls.length; i < l; i++) {
    const [h, ...t] = walls[i];
    if (t.length > 0) {
      context.beginPath();
      context.moveTo(CENTER + UNIT * h.x, CENTER + UNIT * h.y);
      for (const p of t) {
        context.lineTo(CENTER + UNIT * p.x, CENTER + UNIT * p.y);
      }
      context.stroke();
    }
  }
}

const a = Math.sqrt(3) / 2;
function triangleNode(i, j, ...ns) {
  const x = j - i / 2 - 25;
  const y = a * (i - 50);
  return new Node(x, y, ...ns);
}

function triangles() {
  const nodes = [[triangleNode(0, 0)]];
  for (let j = 1; j <= 50; j++) {
    nodes[0][j] = triangleNode(0, j, nodes[0][j - 1]);
  }
  for (let i = 1; i <= 50; i++) {
    nodes[i] = [triangleNode(i, 0, nodes[i - 1][0])];
    for (let j = 1; j < i + 50; j++) {
      nodes[i][j] = triangleNode(
        i,
        j,
        nodes[i - 1][j - 1],
        nodes[i - 1][j],
        nodes[i][j - 1]
      );
    }
    nodes[i][i + 50] = triangleNode(
      i,
      i + 50,
      nodes[i - 1][i + 49],
      nodes[i][i + 49]
    );
  }
  for (let i = 51; i <= 100; i++) {
    nodes[i] = [];
    nodes[i][i - 50] = triangleNode(
      i,
      i - 50,
      nodes[i - 1][i - 51],
      nodes[i - 1][i - 50]
    );
    for (let j = i - 49; j <= 100; j++) {
      nodes[i][j] = triangleNode(
        i,
        j,
        nodes[i][j - 1],
        nodes[i - 1][j - 1],
        nodes[i - 1][j]
      );
    }
  }
  return [nodes[50][49], nodes[50][51]];
}

function discs() {
  const r0 = Math.sqrt(0.5);
  const nodes = [[new Node(+r0)]];
  nodes[0][1] = new Node(0, +r0, nodes[0][0]);
  nodes[0][2] = new Node(-r0, 0, nodes[0][1]);
  nodes[0][3] = new Node(0, -r0, nodes[0][0], nodes[0][2]);

  for (let i = 1; i <= 50; i++) {
    const l0 = 6 * i - 2;
    const l = 6 * i + 4;
    const r = 1 / (2 * Math.tan(Math.PI / l));
    const th = (Math.PI * 2) / l;
    nodes[i] = [new Node(r, 0, nodes[i - 1][0])];
    for (let j = 1; j < l - 1; j++) {
      const jLow = Math.ceil(((j - 1) * l0) / l);
      const jHigh = Math.floor(((j + 1) * l0) / l) % l0;
      if (jLow === jHigh) {
        nodes[i][j] = new Node(
          r * Math.cos(th * j),
          r * Math.sin(th * j),
          nodes[i][j - 1],
          nodes[i - 1][jLow]
        );
      } else {
        nodes[i][j] = new Node(
          r * Math.cos(th * j),
          r * Math.sin(th * j),
          nodes[i][j - 1],
          nodes[i - 1][jLow],
          nodes[i - 1][jHigh]
        );
      }
    }
    nodes[i][l - 1] = new Node(
      r * Math.cos(th * (l - 1)),
      r * Math.sin(th * (l - 1)),
      nodes[i][0],
      nodes[i][l - 2],
      nodes[i - 1][0],
      nodes[i - 1][l0 - 1]
    );
  }
  return [nodes[0][0], nodes[0][2]];
}

function discs2() {
  const size = 57;
  const counts = [];
  for (let i = size; i > 0; i--) {
    const l = Math.floor(i * Math.PI * Math.sqrt(3));
    counts.push(l);
  }

  // outer ring
  const nodes = [];
  {
    const r = 1 / (2 * Math.tan(Math.PI / counts[0]));
    nodes[0] = [new Node(r, 0)];
    const dth = (2 * Math.PI) / counts[0];
    for (let j = 1; j < counts[0] - 1; j++) {
      nodes[0][j] = new Node(
        r * Math.cos(dth * j),
        r * Math.sin(dth * j),
        nodes[0][j - 1]
      );
    }
    nodes[0][counts[0] - 1] = new Node(
      r * Math.cos(dth * (counts[0] - 1)),
      r * Math.sin(dth * (counts[0] - 1)),
      nodes[0][counts[0] - 2],
      nodes[0][0]
    );
  }

  for (let i = 1; i < size; i++) {
    const r = 1 / (2 * Math.tan(Math.PI / counts[i]));
    const dth = (2 * Math.PI) / counts[i];
    nodes[i] = [new Node(r, 0, nodes[i - 1][0])];
    for (let j = 1; j < counts[i] - 1; j++) {
      const k = (j * counts[i - 1]) / counts[i];
      const kLow = Math.floor(k);
      const kHigh = Math.ceil(k) % counts[i - 1];
      if (kLow === kHigh) {
        nodes[i][j] = new Node(
          r * Math.cos(dth * j),
          r * Math.sin(dth * j),
          nodes[i][j - 1],
          nodes[i - 1][kLow]
        );
      } else {
        nodes[i][j] = new Node(
          r * Math.cos(dth * j),
          r * Math.sin(dth * j),
          nodes[i][j - 1],
          nodes[i - 1][kLow],
          nodes[i - 1][kHigh]
        );
      }
    }
    nodes[i][counts[i] - 1] = new Node(
      r * Math.cos(dth * (counts[i] - 1)),
      r * Math.sin(dth * (counts[i] - 1)),
      nodes[i][counts[i] - 2],
      nodes[i][0],
      nodes[i - 1][counts[i - 1] - 1],
      nodes[i - 1][counts[i - 1] - 2]
    );
  }
  return [nodes[49][0], nodes[49][counts[49] >> 1]];
}

const DTH = (2 * Math.PI) / 1;
function spiral() {
  const nodes = [new Node(0, 0)];
  for (let i = 1; ; i++) {
    const r = Math.sqrt(i / Math.PI);
    if (r >= 50) {
      break;
    }
    const th = r * DTH;
    if (r < 1) {
      nodes[i] = new Node(r * Math.cos(th), r * Math.sin(th), nodes[i - 1]);
      continue;
    }
    const j = i - 2 * Math.sqrt(i * Math.PI) + Math.PI;
    nodes[i] = new Node(
      r * Math.cos(th),
      r * Math.sin(th),
      nodes[i - 1],
      nodes[Math.floor(j)],
      nodes[Math.ceil(j)]
    );
  }
  return [nodes[1], nodes[4]];
}

const GENERATORS = [discs2, spiral, discs, triangles];
let index = 0;
export function run(canvas) {
  const nodes = GENERATORS[index++]();
  index %= GENERATORS.length;
  draw(canvas, Node.walk(nodes));
}

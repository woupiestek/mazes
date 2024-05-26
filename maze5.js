import { sample } from "./util.js";

class Node {
  color = "#333333";
  weight = 0;
  neighbours = [];

  constructor(x, y, ...neighbours) {
    this.x = x;
    this.y = y;
    for (const node of neighbours) {
      if (node && !this.neighbours.includes(node)) {
        node.neighbours.push(this);
        this.neighbours.push(node);
      }
    }
    if (neighbours == undefined) {
      throw new Error(`how?`);
    }
    if (neighbours == undefined) {
      throw new Error(`how?`);
    }
  }

  isOpen() {
    return this.weight < 2;
  }
  close() {
    this.weight += 2;
    this.neighbours.forEach((node) => (node.weight += 1));
  }
  distance(x, y) {
    return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
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
      next.color = current.color;
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
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 4;

  for (let i = 0, l = walls.length; i < l; i++) {
    const [h, ...t] = walls[i];
    if (t.length > 0) {
      context.strokeStyle = h.color;
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
  const nodes = [];
  const jSize = 49;
  const iSize = Math.floor(jSize / a);
  for (let i = -iSize; i <= iSize; i++) {
    nodes[i] = [];
    const sign = 1 - 2 * (i & 1);
    for (let j = -jSize; j <= jSize; j++) {
      nodes[i][j] = new Node(
        a * i,
        j + sign / 4,
        nodes[i][j - 1],
        nodes[i - 1]?.[j],
        nodes[i - 1]?.[j + sign]
      );
    }
  }
  nodes[-1][-1].color = "#993333";
  nodes[-1][1].color = "#333399";
  nodes[1][0].color = "#339933";
  return [nodes[-1][-1], nodes[-1][1], nodes[1][0]];
}

function squares(size = 49) {
  const nodes = [];
  for (let i = -size; i <= size; i++) {
    nodes[i] = [];
    for (let j = -size; j <= size; j++) {
      nodes[i][j] = new Node(i, j, nodes[i - 1]?.[j], nodes[i][j - 1]);
    }
  }
  nodes[-1][-1].color = "#996633";
  nodes[-1][1].color = "#993399";
  nodes[1][-1].color = "#339933";
  nodes[1][1].color = "#336699";
  return [nodes[-1][-1], nodes[-1][1], nodes[1][-1], nodes[1][1]];
}

function squares2(size = 49) {
  const nodes = [];
  for (let i = -size; i <= size; i++) {
    nodes[i] = [];
    for (let j = -size; j <= size; j++) {
      nodes[i][j] = new Node(
        i,
        j,
        nodes[i - 1]?.[j - 1],
        nodes[i - 1]?.[j],
        nodes[i - 1]?.[j + 1],
        nodes[i][j - 1]
      );
    }
  }
  nodes[-1][-1].color = "#996633";
  nodes[-1][1].color = "#993399";
  nodes[1][-1].color = "#339933";
  nodes[1][1].color = "#336699";
  return [nodes[-1][-1], nodes[-1][1], nodes[1][-1], nodes[1][1]];
}

const E = 1 - Math.sqrt(3) / 2;
function squares3(size = 49) {
  const nodes = [];
  for (let i = -size; i <= size; i++) {
    nodes[i] = [];
    const sign = 2 * (i & 1) - 1;
    for (let j = -size; j <= size; j++) {
      if (j & 1) {
        nodes[i][j] = new Node(
          i - E,
          j + E * sign,
          nodes[i - 1]?.[j],
          nodes[i - 1]?.[j + sign],
          nodes[i][j - 1]
        );
      } else {
        nodes[i][j] = new Node(
          i + E,
          j + E * sign,
          nodes[i - 1]?.[j],
          nodes[i][j - 1]
        );
      }
    }
  }
  nodes[-1][-1].color = "#996633";
  nodes[-1][1].color = "#993399";
  nodes[1][-1].color = "#339933";
  nodes[1][1].color = "#336699";
  return [nodes[-1][-1], nodes[-1][1], nodes[1][-1], nodes[1][1]];
}

function hexagons(size = 24) {
  const ETH = 2 / Math.sqrt(3);
  const size2 = 2 * Math.floor(size / ETH);
  const nodes = [];
  for (let i = -size; i <= size; i++) {
    nodes[i] = [];
    for (let j = -size2; j <= size2; j++) {
      if ((i + j) % 2 === 0) {
        nodes[i][j] = new Node(
          2 * i - 1 / 3,
          ETH * j,
          nodes[i - 1]?.[j],
          nodes[i][j - 1]
        );
      } else {
        nodes[i][j] = new Node(2 * i + 1 / 3, ETH * j, nodes[i][j - 1]);
      }
    }
  }
  nodes[-1][-1].color = "#993333";
  nodes[-1][1].color = "#333399";
  nodes[1][0].color = "#339933";
  return [nodes[-1][-1], nodes[-1][1], nodes[1][0]];
}

function disc() {
  const nodes = [];
  for (let i = 1; i <= 51; i++) {
    nodes[i] = [];
    const r = (3 * i) / Math.PI;
    for (let j = 1; j < 6 * i; j++) {
      const k = j * (1 - 1 / i);
      nodes[i][j] = new Node(
        r * Math.cos(j / r),
        r * Math.sin(j / r),
        nodes[i][j - 1],
        nodes[i - 1]?.[Math.floor(k)],
        nodes[i - 1]?.[Math.ceil(k)]
      );
    }
    nodes[i][0] = new Node(
      r,
      0,
      nodes[i][6 * i - 1],
      nodes[i][1],
      nodes[i - 1]?.[0]
    );
  }
  nodes[1][0].color = "#993333";
  nodes[1][2].color = "#333399";
  nodes[1][4].color = "#339933";
  return [nodes[1][0], nodes[1][2], nodes[1][4]];
}

function disc2() {
  const counts = [];
  const dSize = Math.PI * Math.sqrt(3);
  const size = Math.floor((100 * Math.PI) / dSize);
  for (let i = size; i > 0; i--) {
    const l = Math.floor(i * dSize);
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
    const a = counts[i - 1] / counts[i];
    nodes[i] = [new Node(r, 0, nodes[i - 1][0])];
    for (let j = 1; j < counts[i] - 1; j++) {
      const k = a * j;
      const kLow = Math.floor(k);
      const kHigh = Math.ceil(k) % counts[i - 1];
      nodes[i][j] = new Node(
        r * Math.cos(dth * j),
        r * Math.sin(dth * j),
        nodes[i][j - 1],
        nodes[i - 1][kLow],
        nodes[i - 1][kHigh]
      );
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
  nodes[49][0].color = "#996633";
  nodes[49][counts[49] >> 1].color = "#336699";
  return [nodes[49][0], nodes[49][counts[49] >> 1]];
}

const FACTOR = 4 / 29;
function spiral() {
  const nodes = [new Node(0, 0)];
  for (let i = 1; ; i++) {
    const th = 2 * Math.sqrt(i * Math.PI);
    if (FACTOR * th >= 50) {
      break;
    }
    const j = i - th + Math.PI;
    nodes[i] = new Node(
      FACTOR * th * Math.cos(th),
      FACTOR * th * Math.sin(th),
      nodes[i - 1],
      nodes[Math.floor(j)],
      nodes[Math.ceil(j)]
    );
  }
  nodes[1].color = "#996633";
  nodes[4].color = "#336699";
  return [nodes[1], nodes[4]];
}

function spiral2() {
  const max = Math.floor(625 / FACTOR / FACTOR / Math.PI);
  const nodes = [];
  for (let i = max; i >= 0; i--) {
    const th = 2 * Math.sqrt(i * Math.PI);
    const j = i + Math.PI + th;
    nodes[i] = new Node(
      FACTOR * th * Math.cos(th),
      FACTOR * th * Math.sin(th),
      nodes[i + 1],
      nodes[Math.floor(j)],
      nodes[Math.ceil(j)]
    );
  }
  nodes[1].color = "#996633";
  nodes[4].color = "#336699";
  return [nodes[1], nodes[4]];
}

function chaos() {
  const coords = [];
  for (let i = 0; i < 2e4; i++) {
    const x = Math.random() * 98 - 49;
    const xR = Math.round(x);
    coords[xR] ||= [];
    const y = Math.random() * 98 - 49;
    const p = [x, y];
    const yR = Math.round(y);
    coords[xR][yR] ||= [];
    coords[xR][yR].push(p);
  }
  const nodes = [];
  for (let i = -49; i <= 49; i++) {
    nodes[i] = [];
    if (!coords[i]) {
      continue;
    }
    for (let j = -49; j <= 49; j++) {
      if (!coords[i][j]) {
        continue;
      }
      nodes[i][j] = [];
      for (let [x, y] of coords[i][j]) {
        nodes[i][j].push(
          new Node(
            x,
            y,
            ...[
              nodes[i - 1]?.[j - 1],
              nodes[i - 1]?.[j],
              nodes[i - 1]?.[j + 1],
              nodes[i][j - 1],
              nodes[i][j],
            ]
              .flatMap((it) => it || [])
              .filter((it) => it.distance(x, y) <= 1.5)
          )
        );
      }
    }
  }
  const flattened = nodes[0].flat();
  const i0 = Math.round(0.45 * flattened.length);
  const i1 = flattened.length - 1 - i0;
  flattened[i0].color = "#339933";
  flattened[i1].color = "#993399";
  return [flattened[i0], flattened[i1]];
}

const GENERATORS = [
  chaos,
  disc,
  disc2,
  hexagons,
  spiral,
  spiral2,
  squares,
  squares2,
  squares3,
  triangles,
];
let index = 0;
export function run(canvas) {
  const nodes = GENERATORS[index++]();
  index %= GENERATORS.length;
  draw(canvas, Node.walk(nodes));
}

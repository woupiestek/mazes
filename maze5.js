import { sample, shuffle } from "./util.js";

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
    const reserve = nodes.map(() => []);
    const walls = [];
    for (let i = 0; nursery.length > 0; i = (i + 1) % nursery.length) {
      const wall = nursery[i];
      const current = wall[wall.length - 1];
      const next = sample(current.neighbours.filter((it) => it.isOpen()));
      if (!next) {
        if (wall.length > 1) {
          walls.push(wall);
        }
        if (reserve[i].length) {
          nursery[i] = [reserve[i].pop()];
        } else {
          nursery[i] = nursery[nursery.length - 1];
          reserve[i] = reserve[nursery.length - 1];
          nursery.length--;
          reserve.length--;
        }
        continue;
      }
      next.color = current.color;
      next.close();
      wall.push(next);
      reserve[i].push(next);
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
        nodes[i - 1]?.[j + sign],
      );
    }
  }
  nodes[-iSize][-jSize].color = "hsl(330,67%,33%)";
  nodes[-iSize][jSize].color = "hsl(60,67%,33%)";
  nodes[iSize][jSize].color = "hsl(150,67%,33%)";
  nodes[iSize][-jSize].color = "hsl(240,67%,33%)";
  return [
    nodes[-iSize][-jSize],
    nodes[-iSize][jSize],
    nodes[iSize][-jSize],
    nodes[iSize][jSize],
  ];
}

function triangles2(size = 49) {
  const nodes = [];
  for (let i = -size; i <= size; i++) {
    nodes[i] = [];
    for (let j = -size; j <= size; j++) {
      if (i - j > size || j - i > size) continue;
      nodes[i][j] = new Node(
        (i + j) / 2,
        ((j - i) * Math.sqrt(3)) / 2,
        nodes[i - 1]?.[j],
        nodes[i - 1]?.[j - 1],
        nodes[i][j - 1],
      );
    }
  }
  nodes[-size][-size].color = "hsl(30,67%,33%)";
  nodes[-size][0].color = "hsl(90,67%,33%)";
  nodes[0][size].color = "hsl(150,67%,33%)";
  nodes[size][size].color = "hsl(210,67%,33%)";
  nodes[size][0].color = "hsl(270,67%,33%)";
  nodes[0][-size].color = "hsl(330,67%,33%)";
  return [
    nodes[-size][-size],
    nodes[-size][0],
    nodes[0][size],
    nodes[size][size],
    nodes[size][0],
    nodes[0][-size],
  ];
}

function squares(size = 49) {
  const nodes = [];
  for (let i = -size; i <= size; i++) {
    nodes[i] = [];
    for (let j = -size; j <= size; j++) {
      nodes[i][j] = new Node(i, j, nodes[i - 1]?.[j], nodes[i][j - 1]);
    }
  }
  nodes[-size][-size].color = "hsl(30,67%,33%)";
  nodes[-size][size].color = "hsl(120,67%,33%)";
  nodes[size][size].color = "hsl(210,67%,33%)";
  nodes[size][-size].color = "hsl(300,67%,33%)";
  return [
    nodes[-size][-size],
    nodes[-size][size],
    nodes[size][-size],
    nodes[size][size],
  ];
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
        nodes[i][j - 1],
      );
    }
  }
  nodes[-size][-size].color = "hsl(30,67%,33%)";
  nodes[-size][size].color = "hsl(120,67%,33%)";
  nodes[size][size].color = "hsl(210,67%,33%)";
  nodes[size][-size].color = "hsl(300,67%,33%)";
  return [
    nodes[-size][-size],
    nodes[-size][size],
    nodes[size][-size],
    nodes[size][size],
  ];
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
          nodes[i][j - 1],
        );
      } else {
        nodes[i][j] = new Node(
          i + E,
          j + E * sign,
          nodes[i - 1]?.[j],
          nodes[i][j - 1],
        );
      }
    }
  }
  nodes[-size][-size].color = "hsl(30,67%,33%)";
  nodes[-size][size].color = "hsl(120,67%,33%)";
  nodes[size][size].color = "hsl(210,67%,33%)";
  nodes[size][-size].color = "hsl(300,67%,33%)";
  return [
    nodes[-size][-size],
    nodes[-size][size],
    nodes[size][-size],
    nodes[size][size],
  ];
}

const K = (4 - Math.sqrt(7)) / 3;
const M = [
  [0, 1, 0, 2],
  [3, 4, 5, 6],
  [0, 2, 0, 1],
  [5, 6, 3, 4],
];
function squares4(size = 49) {
  const nodes = [];
  for (let i = -size; i <= size; i++) {
    nodes[i] = [];
    const ti = i & 3;
    for (let j = -size; j <= size; j++) {
      switch (M[ti][j & 3]) {
        case 0:
          nodes[i][j] = new Node(i, j, nodes[i - 1]?.[j], nodes[i][j - 1]);
          continue;
        case 1:
          nodes[i][j] = new Node(i + K, j, nodes[i][j - 1]);
          continue;
        case 2:
          nodes[i][j] = new Node(i - K, j, nodes[i - 1]?.[j], nodes[i][j - 1]);
          continue;
        case 3:
          nodes[i][j] = new Node(i, j - K, nodes[i - 1]?.[j], nodes[i][j - 1]);
          continue;
        case 4:
          nodes[i][j] = new Node(i, j, nodes[i - 1]?.[j]);
          continue;
        case 5:
          nodes[i][j] = new Node(i, j + K, nodes[i - 1]?.[j]);
          continue;
        case 6:
          nodes[i][j] = new Node(i, j, nodes[i][j - 1]);
          continue;
      }
    }
  }
  nodes[-size][-size].color = "hsl(30,67%,33%)";
  nodes[-size][size].color = "hsl(120,67%,33%)";
  nodes[size][size].color = "hsl(210,67%,33%)";
  nodes[size][-size].color = "hsl(300,67%,33%)";
  return [
    nodes[-size][-size],
    nodes[-size][size],
    nodes[size][-size],
    nodes[size][size],
  ];
}
const TAU = 2 * Math.PI;
function disc3(size = 49) {
  const nodes = [];
  for (let i = -size; i <= size; i++) {
    nodes[i] = [];
    for (let j = -size; j <= size; j++) {
      const r0 = Math.sqrt(i * i + j * j);
      const r = Math.round(r0);
      if (r < 1 || r > 49) continue;
      const x = (i / r0) * r;
      const y = (j * r) / r0;
      nodes[i][j] = new Node(x, y, nodes[i - 1]?.[j], nodes[i][j - 1]);
    }
  }
  nodes[0][49].color = "#996633";
  nodes[0][-49].color = "#336699";
  return [nodes[0][49], nodes[0][-49]];
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
          nodes[i][j - 1],
        );
      } else {
        nodes[i][j] = new Node(2 * i + 1 / 3, ETH * j, nodes[i][j - 1]);
      }
    }
  }
  nodes[-size][-size2].color = "hsl(0,67%,33%)";
  nodes[-size][size2].color = "hsl(90,67%,33%)";
  nodes[size][size2].color = "hsl(180,67%,33%)";
  nodes[size][-size2].color = "hsl(270,67%,33%)";
  return [
    nodes[-size][-size2],
    nodes[-size][size2],
    nodes[size][-size2],
    nodes[size][size2],
  ];
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
        nodes[i - 1]?.[Math.ceil(k)],
      );
    }
    nodes[i][0] = new Node(
      r,
      0,
      nodes[i][6 * i - 1],
      nodes[i][1],
      nodes[i - 1]?.[0],
    );
  }
  nodes[51][51].color = "#993333";
  nodes[51][153].color = "#333399";
  nodes[51][255].color = "#339933";
  return [nodes[51][51], nodes[51][153], nodes[51][255]];
}

function disc2() {
  const counts = [];
  const dSize = Math.PI * Math.sqrt(3);
  const size = Math.floor((100 * Math.PI) / dSize);
  for (let i = size; i > 0; i--) {
    counts.push(Math.floor(i * dSize));
  }

  const nodes = [];

  for (let i = 0; i < size; i++) {
    const r = 1 / (2 * Math.tan(Math.PI / counts[i]));
    const dth = TAU / counts[i];
    const a = counts[i - 1] / counts[i];
    nodes[i] = [];
    for (let j = 1; j < counts[i]; j++) {
      const k = a * (j + 0.5) - 0.5;
      const kLow = Math.floor(k);
      const kHigh = Math.ceil(k) % counts[i - 1];
      nodes[i][j] = new Node(
        r * Math.cos(dth * (j + 0.5)),
        r * Math.sin(dth * (j + 0.5)),
        nodes[i][j - 1],
        nodes[i - 1]?.[kLow],
        nodes[i - 1]?.[kHigh],
      );
    }
    nodes[i][0] = new Node(
      r * Math.cos(dth * 0.5),
      r * Math.sin(dth * 0.5),
      nodes[i][1],
      nodes[i][counts[i] - 1],
      nodes[i - 1]?.[0],
      nodes[i - 1]?.[counts[i - 1] - 1],
    );
  }
  const m = counts[0] >> 2;
  nodes[0][m].color = "#996633";
  nodes[0][3 * m].color = "#336699";
  return [nodes[0][m], nodes[0][3 * m]];
}

const FACTOR = 4 / 29;
function spiral() {
  const nodes = [new Node(0, 0)];
  for (let i = 1;; i++) {
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
      nodes[Math.ceil(j)],
    );
  }
  const k = nodes.length - 180;
  nodes[k].color = "#996633";
  nodes[nodes.length - 1].color = "#336699";
  return [nodes[nodes.length - 1], nodes[k]];
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
      nodes[Math.ceil(j)],
    );
  }
  nodes[nodes.length - 180].color = "#996633";
  nodes[nodes.length - 1].color = "#336699";
  return [nodes[nodes.length - 180], nodes[nodes.length - 1]];
}

function chaos() {
  const nodes = [];
  let tl = new Node(0, 0),
    tr = tl,
    bl = tl,
    br = tl;
  for (let i = 0; i < 3e4; i++) {
    const x = Math.random() * 98 - 49;
    const xR = Math.round(x);
    nodes[xR] ||= [];
    const y = Math.random() * 98 - 49;
    const yR = Math.round(y);
    nodes[xR][yR] ||= [];
    const neighbours = [
      nodes[xR - 1]?.[yR - 1],
      nodes[xR][yR - 1],
      nodes[xR + 1]?.[yR - 1],
      nodes[xR - 1]?.[yR],
      nodes[xR][yR],
      nodes[xR + 1]?.[yR],
      nodes[xR - 1]?.[yR + 1],
      nodes[xR][yR + 1],
      nodes[xR + 1]?.[yR + 1],
    ]
      .filter((it) => it)
      .flatMap((it) => it.filter((node) => node.distance(x, y) <= 1));
    const node = new Node(x, y, ...neighbours);
    if (x * x + y * y < 4000) {
      if (x + y < bl.x + bl.y) {
        bl = node;
      }
      if (y - x < tl.y - tl.x) {
        tl = node;
      }
      if (y - x > br.y - br.x) {
        br = node;
      }
      if (x + y > tr.x + tr.y) {
        tr = node;
      }
    }
    nodes[xR][yR].push(node);
  }
  tl.color = "hsl(330,67%,33%)";
  tr.color = "hsl(60,67%,33%)";
  br.color = "hsl(150,67%,33%)";
  bl.color = "hsl(240,67%,33%)";
  return [tl, tr, bl, br];
}

const GENERATORS = [
  chaos,
  disc,
  disc2,
  disc3,
  hexagons,
  spiral,
  spiral2,
  squares,
  squares2,
  squares3,
  squares4,
  triangles,
  triangles2,
];
let index = 0;
export function run(canvas) {
  const nodes = GENERATORS[index++]();
  index %= GENERATORS.length;
  draw(canvas, Node.walk(nodes));
}

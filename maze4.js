import { sample } from "./util.js";

class Weights {
  #weights = [];
  constructor(maxX, maxY) {
    this.maxX = maxX;
    this.maxY = maxY;
    for (let x = maxX; x >= 0; x--) {
      this.#weights[x] = [];
      for (let y = maxY; y >= 0; y--) {
        this.#weights[x][y] = 0;
      }
    }
  }

  has(node) {
    const [x, y] = node;
    return 0 <= x && x <= this.maxX && 0 <= y && y <= this.maxY;
  }

  isOpen(node) {
    return this.has(node) && this.#weights[node[0]][node[1]] < 2;
  }

  #incr(node, diff) {
    if (this.has(node)) {
      this.#weights[node[0]][node[1]] += diff;
    }
  }

  close([x, y]) {
    this.#incr([x - 1, y - 1], 0.5);
    this.#incr([x - 1, y], 1);
    this.#incr([x - 1, y + 1], 0.5);
    this.#incr([x, y - 1], 1);
    this.#incr([x, y], 2);
    this.#incr([x, y + 1], 1);
    this.#incr([x + 1, y - 1], 0.5);
    this.#incr([x + 1, y], 1);
    this.#incr([x + 1, y + 1], 0.5);
  }
}

function walk({ maxX, maxY }) {
  const weights = new Weights(maxX, maxY);
  const walls = [];

  const nodes = [
    [0, 0],
    [0, maxY],
    [maxX, 0],
    [maxX, maxY],
  ];
  nodes.forEach((node) => weights.close(node));
  const nursery = nodes.map((node) => [node]);

  for (let i = 0; nursery.length > 0; i = (i + 1) % nursery.length) {
    const wall = nursery[i];
    const [x, y] = wall[wall.length - 1];
    const next = sample(
      [
        [x - 1, y],
        [x, y - 1],
        [x + 1, y],
        [x, y + 1],
      ].filter((node) => weights.isOpen(node)),
    );
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
    weights.close(next);
    wall.push(next);
    nodes.push(next);
  }
  return walls;
}

function draw(canvas, { maxX, maxY, unit }, walls) {
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", maxX * unit + 2);
  canvas.setAttribute("height", maxY * unit + 2);
  context.fillStyle = "#000000";
  context.lineCap = "round";
  context.lineJoin = "round";

  for (let i = 0, l = walls.length; i < l; i++) {
    const [[x0, y0], ...t] = walls[i];
    if (t.length > 0) {
      context.beginPath();
      context.moveTo(x0 * unit + 1, y0 * unit + 1);
      for (const p of t) {
        context.lineTo(p[0] * unit + 1, p[1] * unit + 1);
      }
      context.stroke();
    }
  }
}

const Config = {
  maxX: 99,
  maxY: 99,
  unit: 7,
};

export function run(canvas) {
  draw(canvas, Config, walk(Config));
}

import { fill, sample, shuffle } from "./util.js";

class Node {
  state = 0;
  constructor(x, y, neighbours) {
    this.x = x;
    this.y = y;
    this.neighbours = neighbours;
    shuffle(neighbours);
  }

  incr() {
    if (this.state < 2) {
      this.state++;
    }
  }
}

function walk(grid, index) {
  const nodes = [];
  a: for (;;) {
    grid[index].state = 3;
    for (const k of grid[index].neighbours) {
      if (!grid[k]) {
        grid[index].state = 2;
        break;
      }
      grid[k].incr();
      if (grid[k].state < 2) {
        nodes.push(k);
      }
    }
    while (nodes.length > 0) {
      index = nodes.pop();
      if (grid[index].state < 2) {
        continue a;
      }
    }
    return;
  }
}

const TAU = 2 * Math.PI;

function disc(radius = 40) {
  const counts = fill(radius + 1, (i) => Math.ceil(i * TAU));
  const limJ = counts[radius];
  const grid = [];
  for (let i = 1; i < radius; i++) {
    for (let j = 0; j < counts[i]; j++) {
      const th = ((j + 0.5) * TAU) / counts[i];
      const k = (th * counts[i - 1]) / TAU - 0.5;
      const l = (th * counts[i + 1]) / TAU - 0.5;
      const neighbours = [
        limJ * (i - 1) + (k < 0 ? counts[i - 1] - 1 : Math.floor(k)),
        limJ * (i - 1) + (i > 1 ? Math.ceil(k) % counts[i - 1] : 0),
        limJ * i + (j > 0 ? j : counts[i]) - 1,
        limJ * i + ((j + 1) % counts[i]),
        limJ * (i + 1) + (l < 0 ? counts[i + 1] - 1 : Math.floor(l)),
        limJ * (i + 1) + (Math.ceil(l) % counts[i + 1]),
      ];
      grid[limJ * i + j] = new Node(
        34 + 0.87 * i * Math.cos(th),
        34 + 0.87 * i * Math.sin(th),
        neighbours,
      );
    }
  }
  return [grid, sample(Object.keys(grid))];
}

function spiral(radius = 38) {
  const grid = fill(Math.floor(radius * radius * Math.PI), (i) => {
    const th = 2 * Math.sqrt(i * Math.PI);
    const j = i - th + Math.PI;
    const k = i + th + Math.PI;
    return new Node(
      34 + (th * Math.cos(th)) / 7,
      34 + (th * Math.sin(th)) / 7,
      [Math.floor(j), Math.ceil(j), i - 1, i + 1, Math.floor(k), Math.ceil(k)],
    );
  });
  return [grid, 7];
}

function squares(size = 86) {
  return [
    fill(size, (i) =>
      fill(
        size,
        (j) =>
          new Node(i * 0.8, j * 0.8, [
            i > 0 ? size * (i - 1) + j : -1,
            j > 0 ? size * i + j - 1 : -1,
            j < size - 1 ? size * i + j + 1 : -1,
            i < size - 1 ? size * (i + 1) + j : -1,
          ]),
      )).flat(),
    (size + 1) * (size >> 1),
  ];
}

function triangles(size = 69) {
  const half = size >> 1;
  const grid = fill(size, (i) =>
    fill(size, (j) => {
      if (j - i > half || i - j > half) {
        return null;
      }
      return new Node((i + j) / 2, ((j - i) * Math.sqrt(3)) / 2 + half, [
        i > 0 && j > 0 ? size * (i - 1) + j - 1 : -1,
        i > 0 ? size * (i - 1) + j : -1,
        j > 0 ? size * i + j - 1 : -1,
        j < size - 1 ? size * i + j + 1 : -1,
        i < size - 1 ? size * (i + 1) + j : -1,
        i < size - 1 && j < size - 1 ? size * (i + 1) + j + 1 : -1,
      ]);
    })).flat();
  return [grid, (size + 1) * half];
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

const GENERATORS = [disc, spiral, squares, triangles];
let index = 0;

export function run(canvas) {
  const [grid, init] = GENERATORS[index++]();
  index %= GENERATORS.length;
  walk(grid, init);
  draw(canvas, grid);
}

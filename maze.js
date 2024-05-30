import { sample} from './util.js';

function randomInt(max = Number.MAX_SAFE_INTEGER) {
  return (Math.random() * max) | 0;
}

function generateMaze({ maxX, maxY }) {
  const boundary = [
    [0, maxY],
    [maxX, 0],
    [maxX, maxY],
  ];
  const edges = [];
  for (let y = 0; y < maxY; y++) {
    boundary.push([0, y]);
    edges.push([0, y, "s", 0]);
    boundary.push([maxX, y]);
    edges.push([maxX, y, "s", 0]);
  }

  for (let x = 0; x < maxX; x++) {
    boundary.push([x, 0]);
    edges.push([x, 0, "e", 0]);
    boundary.push([x, maxY]);
    edges.push([x, maxY, "e", 0]);
  }

  // create entry & exit
  edges[randomInt(edges.length)] = edges.pop();
  edges[randomInt(edges.length)] = edges.pop();

  const visited = {};
  for (const node of boundary) {
    visited[node.join()] = true;
  }

  //shuffle(boundary);
  const i0 = randomInt(boundary.length);
  let node = boundary[i0];
  boundary[i0] = boundary.pop();
  for (let i = 1, l = 10 * maxX * maxY; i < l; i++) {
    visited[node.join()] = true;
    const [x, y] = node;
    // compute valid neighbours
    const neighbours = [];
    if (!(x === 0 || visited[[x - 1, y].join()])) {
      neighbours.push([x - 1, y, "e", i]);
    }
    if (!(y === 0 || visited[[x, y - 1].join()])) {
      neighbours.push([x, y - 1, "s", i]);
    }
    if (!(x === maxX || visited[[x + 1, y].join()])) {
      neighbours.push([x + 1, y, "w", i]);
    }
    if (!(y === maxY || visited[[x, y + 1].join()])) {
      neighbours.push([x, y + 1, "n", i]);
    }

    if (neighbours.length === 0) {
      switch (boundary.length) {
        case 0:
          console.log(i);
          return edges;
        case 1:
          node = boundary.pop();
          continue;
        default:
          const index = randomInt(boundary.length);
          node = boundary[index];
          boundary[index] = boundary.pop();
          continue;
      }
    }
    if (neighbours.length > 1) {
      boundary.push(node);
    }
    const next = sample(neighbours);
    node = [next[0], next[1]];
    edges.push(next);
  }
  return edges;
}

function draw(canvas, { maxX, maxY, unit }, edges) {
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", (maxX + 1) * unit);
  canvas.setAttribute("height", (maxY + 1) * unit);
  context.strokeStyle = "#663399";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 4;

  const walls = [];

  for (const [x, y, r] of edges) {
    switch (r) {
      case "n":
        walls.push([
          (x + 0.5) * unit,
          (y - 0.5) * unit,
          (x + 0.5) * unit,
          (y + 0.5) * unit,
        ]);
        continue;
      case "e":
        walls.push([
          (x + 0.5) * unit,
          (y + 0.5) * unit,
          (x + 1.5) * unit,
          (y + 0.5) * unit,
        ]);
        continue;
      case "s":
        walls.push([
          (x + 0.5) * unit,
          (y + 0.5) * unit,
          (x + 0.5) * unit,
          (y + 1.5) * unit,
        ]);
        continue;
      case "w":
        walls.push([
          (x - 0.5) * unit,
          (y + 0.5) * unit,
          (x + 0.5) * unit,
          (y + 0.5) * unit,
        ]);
        continue;
    }
  }

  for (const [a, b, c, d] of walls) {
    context.beginPath();
    context.moveTo(a, b);
    context.lineTo(c, d);
    context.stroke();
  }
}

const Config = {
  maxX: 69,
  maxY: 69,
  unit: 10,
};

export function run(canvas) {
  draw(canvas, Config, generateMaze(Config));
}

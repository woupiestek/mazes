import { fill, shuffle } from "./util.js";

class Node {
  constructor(x, y, state, neighbours) {
    this.x = x;
    this.y = y;
    this.state = state;
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

// divide squares (8 by 8) between walls and spaces
// how? increment a counter on the neighbours
function square(size = 69) {
  const grid = fill(size, (i) =>
    fill(
      size,
      (j) =>
        new Node(
          i,
          j,
          +(i === 0) + (i === size - 1) + (j === 0) + (j === size - 1),
          [
            size * (i - 1) + j,
            size * i + j - 1,
            size * i + j + 1,
            size * (i + 1) + j,
          ].filter((k) => k >= 0 && k < size * size)
        )
    )
  ).flat();
  const half = size >> 1;
  grid[half].state = 3;
  return [grid, half];
}

function draw(canvas, grid) {
  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  const context = canvas.getContext("2d");
  context.fillStyle = "#666666";
  context.strokeStyle = "#333333";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 5;

  for (const node of grid) {
    if (node.state === 3) {
      continue;
    }
    context.beginPath();
    context.arc(10 * (node.x + 1), 10 * (node.y + 1), 5, 0, 2 * Math.PI);
    context.stroke();
  }
}

export function run(canvas) {
  const [grid, half] = square();
  walk(grid, half);
  draw(canvas, grid);
}

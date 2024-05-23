// idea: make a random walk, but upon crossing oneself,
// jump to a random visited point

// wall codes

function randomInt(max = Number.MAX_SAFE_INTEGER) {
  return (Math.random() * max) | 0;
}

function sample(array) {
  if (array.length > 0) {
    return array[randomInt(array.length)];
  }
}

const State = {
  RAW: 0,
  VISITED: 1,
  DONE: 2,
};

function init({ maxX, maxY }) {
  const grid = [];
  const nodes = [];
  for (let x = 0; x <= maxX; x++) {
    grid[x] = [];
    for (let y = 0; y <= maxY; y++) {
      nodes.push([x, y]);
      grid[x][y] =
        (2 * x - maxX) * (2 * x - maxX) < 100 &&
        (2 * y - maxY) * (2 * y - maxY) < 100
          ? State.DONE
          : State.RAW;
    }
  }
  return { grid, nodes };
}

function walk({ maxX, maxY }) {
  const { grid, nodes } = init({ maxX, maxY });
  let limit = 10 * maxX * maxY;
  let x, y, neighbours;
  const walls = [];
  a: while (nodes.length > 0 && limit-- > 0) {
    const index = randomInt(nodes.length);
    [x, y] = nodes[index];
    if (index !== length - 1) {
      nodes[index] = nodes.pop();
    } else {
      nodes.pop();
    }

    if (grid[x][y] === State.DONE) {
      continue a;
    }

    const path = [];
    b: while (limit-- > 0) {
      path.push([x, y]);
      neighbours = [];
      if (x !== 0 && grid[x - 1][y] === State.RAW) {
        neighbours.push([x - 1, y]);
      }
      if (y !== 0 && grid[x][y - 1] === State.RAW) {
        neighbours.push([x, y - 1]);
      }
      if (x !== maxX && grid[x + 1][y] === State.RAW) {
        neighbours.push([x + 1, y]);
      }
      if (y !== maxY && grid[x][y + 1] === State.RAW) {
        neighbours.push([x, y + 1]);
      }
      switch (neighbours.length) {
        case 0:
          if (path.length > 1) {
            grid[x][y] = State.DONE;
            walls.push(path);
          }
          continue a;
        case 1:
          grid[x][y] = State.DONE;
          [x, y] = neighbours[0];
          continue b;
        default:
          grid[x][y] = State.VISITED;
          nodes.push([x, y]);
          [x, y] = sample(neighbours);
          continue b;
      }
    }
  }
  console.log(walls.length);
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
  maxX: 139,
  maxY: 139,
  unit: 5,
};

export function run(canvas) {
  draw(canvas, Config, walk(Config));
}

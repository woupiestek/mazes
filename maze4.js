function sample(array) {
  if (!array?.length) {
    return undefined;
  }
  return array[Math.floor(Math.random() * array.length)];
}

function walk({ maxX, maxY }) {
  const weights = [];
  for (let x = maxX; x >= 0; x--) {
    weights[x] = [];
    for (let y = maxY; y >= 0; y--) {
      weights[x][y] = 0;
    }
  }
  const walls = [];
  const nodes = [
    [0, 0],
    [0, maxY],
    [maxX, 0],
    [maxX, maxY],
  ];
  weights[0][0] = 2;
  weights[1][0] = 1;
  weights[0][1] = 1;

  weights[0][maxY] = 2;
  weights[1][maxY] = 1;
  weights[0][maxY - 1] = 1;

  weights[maxX][0] = 2;
  weights[maxX - 1][0] = 1;
  weights[maxX][1] = 1;

  weights[maxX][maxY] = 2;
  weights[maxX - 1][maxY] = 1;
  weights[maxX][maxY - 1] = 1;

  a: while (nodes.length > 0) {
    const i = Math.floor(Math.random() * nodes.length);
    const node = nodes[i];
    if (i !== nodes[length - 1]) {
      nodes[i] = nodes[nodes.length - 1];
      nodes[nodes[length - 1]] = node;
    }
    const wall = [node];
    let [x, y] = node;

    for (;;) {
      const next = sample(
        [
          [x - 1, y],
          [x, y - 1],
          [x + 1, y],
          [x, y + 1],
        ].filter(([i, j]) => weights[i]?.[j] <= 1)
      );
      if (!next) {
        nodes.pop();
        if (wall.length > 1) {
          walls.push(wall);
        }
        continue a;
      }
      weights[next[0]][next[1]] = 2;
      if (weights[next[0] - 1]?.[next[1]] <= 1) weights[next[0] - 1][next[1]]++;
      if (weights[next[0]]?.[next[1] - 1] <= 1) weights[next[0]][next[1] - 1]++;
      if (weights[next[0] + 1]?.[next[1]] <= 1) weights[next[0] + 1][next[1]]++;
      if (weights[next[0]]?.[next[1] + 1] <= 1) weights[next[0]][next[1] + 1]++;
      wall.push(next);
      nodes.push(next);
      [x, y] = next;
    }
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
  maxX: 69,
  maxY: 69,
  unit: 10,
};

export function run(canvas) {
  draw(canvas, Config, walk(Config));
}

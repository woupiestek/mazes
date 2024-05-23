function walk({ maxX, maxY }) {
  const weights = [];
  const nodes = [];
  for (let x = maxX - 1; x >= 0; x--) {
    weights[x] = [];
    for (let y = maxY - 1; y >= 0; y--) {
      weights[x][y] = Math.random();
      nodes.push([x, y]);
    }
  }
  nodes.sort((a, b) => weights[a[0]][a[1]] - weights[b[0]][b[1]]);
  const walls = [];
  a: while (nodes.length > 0) {
    let [x, y] = nodes.pop();
    if (typeof weights[x][y] !== "number") continue;
    let node = [x, y];
    const wall = [];
    for (;;) {
      if (
        weights[x-1] &&
        typeof weights[x - 1][y] === "number" &&
        weights[x - 1][y] > weights[node[0]][node[1]]
      )
        node = [x - 1, y];
      if (
        typeof weights[x][y - 1] === "number" &&
        weights[x][y - 1] > weights[node[0]][node[1]]
      ) {
        node = [x, y - 1];
      }
      if (
        weights[x+1] &&
        typeof weights[x + 1][y] === "number" &&
        weights[x + 1][y] > weights[node[0]][node[1]]
      ) {
        node = [x + 1, y];
      }
      if (
        typeof weights[x][y + 1] === "number" &&
        weights[x][y + 1] > weights[node[0]][node[1]]
      ) {
        node = [x, y + 1];
      }
      //weights[x][y] = null;
      wall.push([x, y]);
      if (node[0] === x && node[1] === y) {
        // reach a low point, so give up;
        if (wall.length>1) {
          walls.push(wall);
        }
        continue a;
      }
      [x, y] = node;
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
  
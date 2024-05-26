const Colors = {
  RED: 1,
  BLUE: 2,
  GREEN: 3,
};

const OFFSET = 0.5 * (Math.sqrt(2) - Math.sqrt(1.5));

function randomColor() {
  switch ((Math.random() * 4) | 0) {
    case 3:
      return Colors.GREEN;
    case 2:
      return Colors.BLUE;
    default:
      return Colors.RED;
  }
}

function square(outer, inner, colorer = randomColor) {
  // lets make this unique
  const colors = [];
  colors[-1] = colors[2 * outer] = [];
  for (let i = 0; i < 2 * outer; i++) {
    colors[i] = [];
    for (let j = 0; j < 2 * outer; j++) {
      if (
        i >= outer - inner &&
        i < outer + inner &&
        j >= outer - inner &&
        j < outer + inner
      ) {
        continue;
      }
      colors[i][j] = colorer(i, j);
    }
  }

  const _nodes = [];
  // now to query this thing
  function node(i, j) {
    if (!_nodes[i]) {
      _nodes[i] = [];
    }

    if (!(colors[i] && colors[i - 1])) {
      console.error(i, colors[i]);
      return;
    }

    const _colors = {
      nw: colors[i - 1][j - 1],
      ne: colors[i][j - 1],
      sw: colors[i - 1][j],
      se: colors[i][j],
    };

    let x = i,
      y = j;
    const neighbours = [];
    // 8 options
    if (_colors.nw === Colors.GREEN) {
      neighbours.push([i - 1, j - 1]);
      x -= OFFSET;
      y -= OFFSET;
    }
    if (_colors.nw || _colors.sw) {
      neighbours.push([i - 1, j]);
    }
    if (_colors.sw === Colors.BLUE) {
      neighbours.push([i - 1, j + 1]);
      x -= OFFSET;
      y += OFFSET;
    }
    if (_colors.sw || _colors.se) {
      neighbours.push([i, j + 1]);
    }
    if (_colors.se === Colors.GREEN) {
      neighbours.push([i + 1, j + 1]);
      x += OFFSET;
      y += OFFSET;
    }
    if (_colors.se || _colors.ne) {
      neighbours.push([i + 1, j]);
    }
    if (_colors.ne === Colors.BLUE) {
      neighbours.push([i + 1, j - 1]);
      x += OFFSET;
      y -= OFFSET;
    }
    if (_colors.ne || _colors.nw) {
      neighbours.push([i, j - 1]);
    }
    return (_nodes[i][j] = { x, y, neighbours });
  }

  const size = 2 * outer + 1;
  function sample() {
    const i = (Math.random() * (outer + inner)) | 0;
    const j = (Math.random() * (outer - inner + 1)) | 0;
    switch ((Math.random() * 4) | 0) {
      case 0:
        return [i, j];
      case 1:
        return [2 * outer - j, i];
      case 2:
        return [2 * outer - i, 2 * outer - j];
      case 3:
        return [j, 2 * outer - i];
    }
  }

  return { node, size, sample };
}

function walk(grid) {
  const walls = [];
  const visited = [];
  for (let i = 0; i < grid.size; i++) {
    visited[i] = [];
  }
  const spots = [grid.sample()];
  a: while (spots.length > 0) {
    let [i, j] = spots.pop();
    const wall = [];
    b: while (true) {
      visited[i][j] = true;
      const node = grid.node(i, j);
      wall.push(node);
      const neighbours = node.neighbours.filter(([i, j]) => !visited[i][j]);
      switch (neighbours.length) {
        case 0:
          if (wall.length > 1) {
            walls.push(wall);
          }
          continue a;
        case 1:
          [i, j] = neighbours[0];
          continue b;
        default:
          spots.push([i, j]);
          [i, j] = neighbours[(Math.random() * neighbours.length) | 0];
          continue b;
      }
    }
  }
  return walls;
}

function bezier(context, coords) {
  const ALPHA = 0.2;
  coords.unshift(coords[0]);
  coords.push(coords[coords.length - 1]);
  context.beginPath();
  context.moveTo(...coords[1]);
  for (let i = 1, l = coords.length - 2; i < l; i++) {
    context.bezierCurveTo(
      ALPHA * (coords[i + 1][0] - coords[i - 1][0]) + coords[i][0],
      ALPHA * (coords[i + 1][1] - coords[i - 1][1]) + coords[i][1],
      ALPHA * (coords[i][0] - coords[i + 2][0]) + coords[i + 1][0],
      ALPHA * (coords[i][1] - coords[i + 2][1]) + coords[i + 1][1],
      ...coords[i + 1],
    );
  }
  context.stroke();
}

function folded(context, coords) {
  context.beginPath();
  context.moveTo(...coords[0]);
  for (let i = 1, l = coords.length; i < l; i++) {
    context.lineTo(...coords[i]);
  }
  context.stroke();
}

function draw(canvas, size, unit, walls) {
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", (size + 1) * unit);
  canvas.setAttribute("height", (size + 1) * unit);
  context.strokeStyle= "#663399";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = unit / 3;

  for (const wall of walls) {
    const coords = wall.map(({ x, y }) => [(x + 1) * unit, (y + 1) * unit]);
    bezier(context, coords);
  }
}

function bias(i, j) {
  const sign = (i & 1) - (j & 1);
  switch (sign) {
    case -1:
      return Colors.BLUE;
    case 1:
      return Colors.GREEN;
    default:
      return Colors.RED;
  }
}

export function run(canvas) {
  const grid = square(24, 5, bias);
  const walls = walk(grid);
  draw(canvas, grid.size, 14, walls);
}

function test(canvas) {
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", 202);
  canvas.setAttribute("height", 202);
  context.strokeStyle= "#663399";
  context.lineCap = "round";
  context.lineJoin = "round";

  const coords = [];
  for (i = 0; i < 10; i++) {
    coords.push([1 + 20 * i, 91 + 20 * Math.random()]);
  }

  bezier(context, coords);
  folded(context, coords);
}
//test();

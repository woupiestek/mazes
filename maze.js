function randomInt(max = Number.MAX_SAFE_INTEGER) {
  return (Math.random() * max) | 0;
}

function sample(array) {
  if (array.length > 0) {
    return array[randomInt(array.length)];
  }
}

function shuffle(array) {
  let j, element;
  for (let i = array.length - 1; i >= 0; i--) {
    j = randomInt(i);
    element = array[i];
    array[i] = array[j];
    array[j] = element;
  }
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

function draw({ maxX, maxY, unit }, edges) {
  const canvas = document.getElementById("world"),
    context = canvas.getContext("2d");

  canvas.setAttribute("width", maxX * unit + 1);
  canvas.setAttribute("height", maxY * unit + 1);
  context.fillStyle = "#000000";
  context.lineCap = "round";
  context.lineJoin = "round";

  frames = [];
  for (const [x, y, r, t] of edges) {
    const i = (t / 60) | 0;
    if (!frames[i]) {
      frames[i] = [];
    }
    switch (r) {
      case "n":
        frames[i].push([x * unit, (y - 1) * unit, 1, unit + 1]);
        continue;
      case "e":
        frames[i].push([x * unit, y * unit, unit + 1, 1]);
        continue;
      case "s":
        frames[i].push([x * unit, y * unit, 1, unit + 1]);
        continue;
      case "w":
        frames[i].push([(x - 1) * unit, y * unit, unit + 1, 1]);
        continue;
    }
  }

  for (let i = 0, l = frames.length; i < l; i++) {
    setTimeout(
      () => frames[i]?.forEach(([a, b, c, d]) => context.fillRect(a, b, c, d)),
      i * 60,
    );
  }
}

const Config = {
  maxX: 69,
  maxY: 69,
  unit: 10,
};

draw(Config, generateMaze(Config));

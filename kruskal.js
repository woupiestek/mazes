import { fill, shuffle } from "./util";

class Vertex {
  parent;
  count = 0;
  findSet() {
    if (this.parent) return (this.parent = this.parent.findSet());
    return this;
  }
  connect(that) {
    const sSet = this.findSet();
    const tSet = that.findSet();
    if (sSet !== tSet) {
      if (sSet.count >= tSet.count) {
        tSet.parent = sSet;
        sSet.count += tSet.count;
      } else {
        sSet.parent = tSet;
        tSet.count += sSet.count;
      }
      return true;
    }
    return false;
  }
}
function squares(size = 69) {
  const edges = fill(size, (i) => [
    [i, 0, i + 1, 0],
    [0, i, 0, i + 1],
    [i, size, i + 1, size],
    [size, i, size, i + 1],
  ]).flat();
  shuffle(edges);

  const edges2 = [];
  for (let i = 1; i < size; i++) {
    for (let j = 0; j < size; j++) {
      edges2.push([i, j, i, j + 1], [j, i, j + 1, i]);
    }
  }
  shuffle(edges2);
  const edges3 = edges2.concat(edges);
  const vertices = fill(size + 1, () => fill(size + 1, () => new Vertex()));
  const walls = [];
  while (edges3.length > 0) {
    const edge = edges3.pop();
    if (vertices[edge[0]][edge[1]].connect(vertices[edge[2]][edge[3]])) {
      walls.push(edge);
    }
  }
  return walls;
}

function draw(canvas, walls) {
  const UNIT = 10;
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  context.strokeStyle = "#663399";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 4;

  for (let i = 0, l = walls.length; i < l; i++) {
    const [a, b, c, d] = walls[i];
    context.beginPath();
    context.moveTo(5 + UNIT * a, 5 + UNIT * b);
    context.lineTo(5 + UNIT * c, 5 + UNIT * d);
    context.stroke();
  }
}

// why aren't you working!?
function alternative(size = 69) {
  const grid = fill(size, (i) =>
    fill(size, (j) => ({
      i,
      j,
      wall: false,
      vertex: new Vertex(),
      weight: Math.random(),
    }))
  );
  const nodes = grid.flat();
  nodes.sort((n, m) => n.weight - m.wieght);
  const walls = fill(size, () => fill(size, () => false));
  a: for (const node of nodes) {
    const sets = new Set();
    for (const neighbour of [
      grid[node.i - 1]?.[node.j],
      grid[node.i][node.j - 1],
      grid[node.i][node.j + 1],
      grid[node.i + 1]?.[node.j],
    ]) {
      if (
        (!neighbour||
        neighbour.weight > node.weight || walls[neighbour.i][neighbour.j])
      )
        continue;
      const set = neighbour.vertex.findSet();
      if (sets.has(set)) {
        walls[node.i][node.j] = true;
        continue a;
      }
      sets.add(set);
    }
    for (const set of sets) {
      node.vertex.findSet().connect(set);
    }
  }
  return walls;
}

function draw2(canvas, walls) {
  const UNIT = 10;
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  context.strokeStyle = "#663399";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 4;

  for (let i = 0; i < 69; i++) {
    for (let j = 0; j < 69; j++) {
      if (!walls[i][j]) continue;
      
      //  context.fillRect(5 + UNIT * i, 5 + UNIT * j, UNIT, UNIT);
      
      for (const [i2, j2] of [
        [i - 1, j - 1],
        [i - 1, j],
        [i - 1, j + 1],
        [i, j - 1],
      ]) {
        if (walls[i][j] && walls[i2]?.[j2]) {
          context.beginPath();
          context.moveTo(5 + UNIT * i, 5 + UNIT * j);
          context.lineTo(5 + UNIT * i2, 5 + UNIT * j2);
          context.stroke();
        }
      }
    }
  }
}

const GENERATORS = [
  (canvas) => draw(canvas, squares()),
  (canvas) => draw2(canvas, alternative()),
];
let index = 0;

// bugs remain: unconnected
export function run(canvas) {
  GENERATORS[index++](canvas);
  index %= GENERATORS.length;
  //walk(sample(nodes));
  //draw2(canvas, nodes);
}

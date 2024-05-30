import { fill, shuffle } from "./util";

class Vertex {
  parent; // Node?
  count = 0;
  findSet() {
    if (this.parent) return (this.parent = this.parent.findSet());
    return this;
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
    const sSet = vertices[edge[0]][edge[1]].findSet();
    const tSet = vertices[edge[2]][edge[3]].findSet();
    if (sSet !== tSet) {
      walls.push(edge);
      if (sSet.count >= tSet.count) {
        tSet.parent = sSet;
        sSet.count += tSet.count;
      } else {
        sSet.parent = tSet;
        tSet.count += sSet.count;
      }
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
export function run(canvas) {
  draw(canvas, squares());
}

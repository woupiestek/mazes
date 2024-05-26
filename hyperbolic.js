import { drawArcs } from "./poincareDisc.js";

const TAU = 2 * Math.PI;

// radius in poincare disc to area in hyperbolic plane
function area(radius) {
  return Math.PI / (1 / (radius * radius) - 1);
}

// inverse of the area function
function radius(area) {
  return 1 / Math.sqrt(1 + Math.PI / area);
}

/*
 * create a maze by builidng walls along a archimedean spiral
 * in the hyperbolic plane, cernter on orgin.
 * the idea is the brek up the spiral into edges based on
 * area, after which each node is connected to the nearest node
 * in the previous revolution.
 */
function hyperbolicSpiral(factor = 10) {
  const f2 = factor * factor;
  const nodes = [];
  let j = 0;
  for (let i = 0; i < area(0.9) * f2; i++) {
    const r = radius(i / f2);
    const th = TAU * Math.atanh(r / 2) * factor;
    if (Number.isNaN(th)) {
      j = i + 1;
      continue;
    }
    const node = {
      id: i,
      th,
      spot: [r * Math.cos(th), r * Math.sin(th)],
      neighbours: [],
    };
    nodes[i] = node;

    let node2 = nodes[i - 1];
    if (!node2) {
      continue;
    }
    node.neighbours.push(node2);
    node2.neighbours.push(node);
    if (th <= TAU) {
      continue;
    }
    const N = 2 * (th - TAU);
    while (nodes[j].th + nodes[j + 1].th < N) {
      j++;
    }
    node2 = nodes[j];
    node.neighbours.push(node2);
    node2.neighbours.push(node);
  }
  return nodes.filter((n) => n);
}

function equilateralTriangleSideLengthCosh(angle) {
  const c = 1 / (Math.sin(angle / 2) * 2);
  return 2 * c * c - 1;
}

const COSH_3_7 = equilateralTriangleSideLengthCosh(TAU / 7);
const SINH_3_7 = Math.sqrt(COSH_3_7 * COSH_3_7 - 1);
const DIST_3_7 = Math.acosh(COSH_3_7);

function normalize(angle) {
  angle %= TAU;
  if (angle > Math.PI) {
    angle -= TAU;
  }
  if (angle < -Math.PI) {
    angle += TAU;
  }
  return angle;
}

/*
 * moving a fixed distance
 * r, th -- polar coordinates
 * ph -- angle with the radius (taking 0 to mean: point straight
 *  to origin)
 * returns [r, th, ph] whith the same meaning, with ph now
 * pointing in the oppostie direction (the function is its own
 *  inverse up to differences of 2 PI between the angles)
 */
function jump_3_7(r, th, ph) {
  th = normalize(th);
  ph = normalize(ph);
  if (r <= 1e-7) {
    return [DIST_3_7, th - ph + Math.PI, 0];
  }
  if (Math.abs(ph) < 1e-7) {
    if (r > DIST_3_7) {
      return [r - DIST_3_7, th, -Math.PI];
    } else {
      return [DIST_3_7 - r, th - Math.PI, 0];
    }
  }
  if (Math.abs(Math.PI - Math.abs(ph)) < 1e-7) {
    return [r + DIST_3_7, th, 0];
  }
  const coshr = Math.cosh(r);
  const sinhr = Math.sinh(r);
  const coshr2 = COSH_3_7 * coshr - SINH_3_7 * sinhr * Math.cos(ph);
  const sinhr2 = Math.sqrt(coshr2 * coshr2 - 1);

  // this is information that cosine loses
  const sign = ph > 0 ? 1 : -1;
  const th2 = th +
    sign * Math.acos((coshr * coshr2 - COSH_3_7) / (sinhr * sinhr2));
  const ph2 = -sign *
    Math.acos((coshr2 * COSH_3_7 - coshr) / (sinhr2 * SINH_3_7));
  if (Number.isNaN(r * th2 * ph2)) {
    throw new Error(`problem input ${r}, ${th}, ${ph}`);
  }
  return [Math.acosh(coshr2), th2, ph2];
}

function test() {
  const all = [];
  for (let f of [1, 2, 3, 4, 5, 6]) {
    let r = 0;
    let th = Math.random() * TAU;
    let ph = Math.random() * TAU;
    const wall = [];
    for (let i = 0; i <= 20; i++) {
      [r, th, ph] = jump_3_7(r, th, ph + (f * TAU) / 7);
      const d = Math.tanh(r / 2);
      wall.push([d * Math.cos(th), d * Math.sin(th)]);
    }
    all.push(wall);
  }
  return all;
}

function connect(nodes) {
  console.log(nodes.length);
  return [nodes.map(({ spot }) => spot)];
}

// the actual maze generator: walk an input graph
// I like this encoding, wher each noed contains its
// neightbours, even though it is filthy oo style.
function walk(nodes) {
  const invalids = nodes.filter(
    ({ id, neighbours, spot }) =>
      [id, neighbours, spot].some((x) => x) === undefined,
  );
  if (invalids.length > 0) {
    invalids.forEach((node) => {
      delete node.neighbours;
    });
    throw new Error(`bad input: ${JSON.stringify(invalids)}`);
  }

  const walls = [];
  const visited = {};

  const node0 = nodes[(nodes.length * Math.random()) | 0];
  const stack = [node0];
  visited[node0.id] = true;

  a: while (stack.length > 0) {
    let node = stack.pop();
    if (!(node.spot instanceof Array)) {
      node.neighbours = null;
      throw new Error(`Bad input ${JSON.stringify(node)}`);
    }
    const wall = [node.spot];
    while (true) {
      const open = node.neighbours.filter(({ id }) => !visited[id]);
      switch (open.length) {
        case 0:
          if (wall.length > 1) {
            walls.push(wall);
          }
          continue a;
        case 1:
          [node] = open;
          break;
        default:
          stack.push(node);
          node = open[(open.length * Math.random()) | 0];
      }
      visited[node.id] = true;
      if (!(node.spot instanceof Array)) {
        node.neighbours = null;
        throw new Error(`Bad input ${JSON.stringify(node)}`);
      }
      wall.push(node.spot);
    }
  }
  return walls;
}

// no perfect (seeing loops) but not completely wrong either
function walk2() {
  const walls = [];
  const visited = {};
  const path0 = Paths.appendAll(null, 3, 4, 3);
  const stack = [path0];
  for (let j = 0; j < 7; j++) {
    visited[Paths.id(Paths.appendAll(path0, j, 0))] = true;
  }

  a: while (stack.length > 0) {
    let path = stack.pop();
    const wall = [path];
    while (true) {
      const open = [];
      for (let i = 0; i < 7; i++) {
        const path2 = Paths.append(path, i);
        const id2 = Paths.id(path2);
        if (id2.length > 6 || visited[id2]) {
          continue;
        }
        open.push(path2);
      }
      switch (open.length) {
        case 0:
          if (wall.length > 1) {
            walls.push(wall);
          }
          continue a;
        case 1:
          [path] = open;
          break;
        default:
          stack.push(path);
          path = open[(open.length * Math.random()) | 0];
      }
      for (let j = 0; j < 7; j++) {
        visited[Paths.id(Paths.appendAll(path, j, 0))] = true;
      }
      wall.push(path);
    }
  }

  return walls.map((wall) =>
    wall.map((path) => {
      const [r, th] = jumps(path);
      const d = Math.tanh(r / 2);
      return [d * Math.cos(th), d * Math.sin(th)];
    })
  );
}

function draw(walls, size = 700) {
  const canvas = document.getElementById("world"),
    context = canvas.getContext("2d");

  canvas.setAttribute("width", size);
  canvas.setAttribute("height", size);
  context.strokeStyle = "#663399";
  context.lineWidth = 1;
  context.lineCap = "round";
  context.lineJoin = "round";

  for (let wall of walls) {
    if (wall.length > 1) {
      const fails = wall.filter((x) => !(x instanceof Array));
      if (fails.length > 0) {
        throw new Error(
          `Bad input ${
            fails
              .map((fail) => `${fail}: ${typeof fail}`)
              .join(", ")
          }`,
        );
      }
      const coords = wall.map(([x, y]) => [
        ((1 + x) / 2) * (size - 10) + 10,
        ((1 + y) / 2) * (size - 10) + 10,
      ]);
      context.beginPath();
      context.moveTo(...coords[0]);
      for (let i = 1, l = coords.length; i < l; i++) {
        context.lineTo(...coords[i]);
      }
      context.stroke();
    }
  }
}

/*
 * Another mystery?
 *
 * Move about the plan by rotating an then jumping.
 * Sometimes there are two ways to the same end position.
 * This is an way to define and compute a normalized path,
 * trying to make it the shortest with the lowest numbers on it.
 */
const Paths = {
  id: (path) => path?.id || "",
  empty: null,
  appendAll: (head, ...tail) => {
    for (const t of tail) {
      head = Paths.append(head, t);
    }
    return head;
  },
  append: (head, tail) => {
    tail %= 7;
    const candidate = { id: (head?.id || "") + "ABCDEFG"[tail], head, tail };
    if (head === null) {
      return candidate;
    }
    if (head.head === null) {
      if (head.tail === 0 && tail === 0) {
        return null;
      }
      return candidate;
    }
    switch (head.tail % 7) {
      case 0:
        // x:0:y => x+y
        return Paths.append(head.head.head, (head.head.tail + tail) % 7);
      case 1:
        // x:1:y => x-1:y-1
        return Paths.appendAll(
          head.head.head,
          (head.head.tail + 6) % 7,
          (tail + 6) % 7,
        );
      case 2:
        //  x:2:3^n:2:y -> x-1:4^{n+1}:y-1
        let p = head.head;
        let i = 1;
        while (p.tail === 3 && p.head !== null) {
          i++;
          p = p.head;
        }
        if (p !== null && p.tail === 2 && p.head !== null) {
          p = Paths.append(p.head.head, (p.head.tail + 6) % 7);
          for (; i > 0; i--) {
            p = Paths.append(p, 4);
          }
          return Paths.append(p, (tail + 6) % 7);
        }
        return candidate;
      // could have done x:4:y -> x+1:2:2:y+1
      case 5:
        // x:5:y => x+1:2:y+1
        return Paths.appendAll(
          head.head.head,
          (head.head.tail + 1) % 7,
          2,
          (tail + 1) % 7,
        );
      case 6:
        // x:6:y => x+1:y+1
        return Paths.appendAll(
          head.head.head,
          (head.head.tail + 1) % 7,
          (tail + 1) % 7,
        );
      default:
        return candidate;
    }
  },
};

(() => {
  const failures2 = [];
  [
    Paths.id(Paths.appendAll(null, 0, 0)),
    Paths.id(Paths.appendAll(null, 1, 1, 1)),
    Paths.id(Paths.appendAll(null, 1, 2, 1, 2)),
    Paths.id(Paths.appendAll(null, 2, 1, 2, 1)),
    Paths.id(Paths.appendAll(null, 2, 2, 2, 2, 2, 2, 2)),
    Paths.id(Paths.appendAll(null, 5, 5, 5, 5, 5, 5, 5)),
    Paths.id(Paths.appendAll(null, 5, 6, 5, 6)),
    Paths.id(Paths.appendAll(null, 6, 5, 6, 5)),
    Paths.id(Paths.appendAll(null, 6, 6, 6)),
    Paths.id(Paths.appendAll(null, 0, 0)),
  ].forEach((str, index) => {
    if (str !== "") {
      failures2.push([str, index]);
    }
  });
  if (failures2.length > 0) {
    console.error(failures2);
  }
})();

const jumps = (() => {
  const result = {};
  function get(path) {
    const key = Paths.id(path);
    if (result[key]) {
      return result[key];
    }
    if (path === null) {
      return (result[key] = [0, 0, 0]);
    }
    const { head, tail } = path;
    const [r, th, ph] = get(head);
    return (result[key] = jump_3_7(r, th, ph + (tail * TAU) / 7));
  }
  return get;
})();

function tiling() {
  // trouble with those paths: the nodes have seven paths to them
  // which all have distinct normal forms...
  // just register each node on each of the paths to it.

  const stack = [null];
  const nodes = {};
  while (stack.length > 0) {
    const path0 = stack.pop();
    const id0 = Paths.id(path0);

    // to debug Paths
    const id1 = Paths.id(Paths.appendAll(path0, 0, 0));
    if (id1 !== id0) {
      throw new Error(`missing mirror: ${id0} !== ${id1}`);
    }

    const neighbours = [];
    const ids = [];
    for (let i = 0; i < 7; i++) {
      const path = Paths.append(path0, i);
      const key = Paths.id(path);
      if (key.length > 7) {
        continue;
      }
      const node = nodes[key];
      if (node) {
        neighbours.push(node);
      } else {
        stack.push(path);
      }
      ids.push(Paths.id(Paths.append(path, 0)));
    }
    if (ids.some((id) => nodes[id])) {
      // avoid building duplicates
      continue;
    }
    const node = {
      id: Paths.id(path0),
      path: path0,
      neighbours,
    };
    ids.forEach((id) => (nodes[id] = node));
    neighbours.forEach((nb) => nb.neighbours.push(node));
  }

  return Object.entries(nodes)
    .filter(([id, node]) => id === node.id)
    .map(([_, node]) => {
      const [r, th] = jumps(node.path);
      const d = Math.tanh(r / 2);
      node.spot = [d * Math.cos(th), d * Math.sin(th)];
      return node;
    });
}

export function run(canvas) {
  drawArcs(canvas, walk2());
}

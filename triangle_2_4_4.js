const ALPHA = "\u03b1";
const BETA = "\u03b2";

export const Triangle_2_4_4 = {
  supers: "\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079",
  empty: null,
  id: (path) => path?.id || "",
  append: (head, symbol, power) => {
    power %= 4;
    if (power === 0) {
      return head;
    }
    if (head !== null && head.symbol === symbol) {
      return Triangle_2_4_4.append(head.head, symbol, head.power + power);
    }

    const id = (head === null ? "" : head.id) +
      symbol +
      (power > 1 ? Triangle_2_4_4.supers[power] : "");
    const candidate = { id, head, symbol, power };
    if (head === null) {
      return candidate;
    }

    if (head.power === 3 && head.head !== null) {
      return Triangle_2_4_4.appendAll(head.head, [
        symbol,
        1,
        head.symbol,
        1,
        symbol,
        1 + power,
      ]);
    }

    a: if (head !== null && power === 1) {
      let c = 0;
      let h = head;
      while (h?.power === 2) {
        c++;
        h = h.head;
      }
      if (h?.power !== 1) {
        break a;
      }
      h = Triangle_2_4_4.append(
        h.head,
        (c & 1) === 0 ? symbol : head.symbol,
        3,
      );
      for (; c > 0; c--) {
        h = Triangle_2_4_4.append(h, (c & 1) === 0 ? head.symbol : symbol, 2);
      }
      return Triangle_2_4_4.append(h, head.symbol, 3);
    }

    return candidate;
  },
  appendAll: (head, tail) => {
    for (let i = 1, l = tail.length; i < l; i += 2) {
      head = Triangle_2_4_4.append(head, tail[i - 1], tail[i]);
    }
    return head;
  },
  match: (head, tail) => {
    while (tail.length > 0) {
      if (
        head === null ||
        head.power !== tail.pop() ||
        head.symbol !== tail.pop()
      ) {
        return false;
      }
      head = head.head;
    }
    return true;
  },
};

(() => {
  let _in = [null];
  let _out = [];
  let count = 0;
  const done = {};
  const fails = [];
  for (let i = 0; i < 10; i++) {
    for (const path of _in) {
      const org = Triangle_2_4_4.id(path);
      if (done[org]) {
        continue;
      }
      done[org] = true;
      const t1 = Triangle_2_4_4.id(
        Triangle_2_4_4.appendAll(path, [ALPHA, 1, BETA, 1, ALPHA, 1, BETA, 1]),
      );
      if (t1 !== org) {
        fails.push(`${org} !== ${t1}`);
      }
      const t2 = Triangle_2_4_4.id(
        Triangle_2_4_4.appendAll(path, [BETA, 1, ALPHA, 1, BETA, 1, ALPHA, 1]),
      );
      if (t2 !== org) {
        fails.push(`${org} !== ${t2}`);
      }
      count++;
      _out.push(Triangle_2_4_4.append(path, ALPHA, 1));
      _out.push(Triangle_2_4_4.append(path, BETA, 1));
    }
    _in = _out;
    _out = [];
  }
  console.log(count, fails.length, ...fails);
})();

function neighbours(paths) {
  switch (paths.length) {
    case 4:
      return paths.map((path) => [path]);
    case 1:
      return [
        [0, 1, 2, 3].map((i) => Triangle_2_4_4.append(paths[0], ALPHA, i)),
        [0, 1, 2, 3].map((i) => Triangle_2_4_4.append(paths[0], BETA, i)),
        [Triangle_2_4_4.appendAll(paths[0], [ALPHA, 1, BETA, 1])],
      ];
    default:
      throw new Error(`what is this? ${paths}`);
  }
}

const length = (() => {
  const mem = { "": 0 };
  return function l(path) {
    const key = Triangle_2_4_4.id(path);
    if (mem[key] !== undefined) {
      return mem[key];
    }
    return (mem[key] = Math.sqrt(path.power * (4 - path.power)) / 2 +
      l(path.head));
  };
})();

function key(paths) {
  return paths.map(Triangle_2_4_4.id).sort().join();
}

function walk() {
  const walls = [];
  const node0 = [
    Triangle_2_4_4.appendAll(null, [ALPHA, 2, BETA, 2, ALPHA, 2, BETA, 2]),
  ];
  const visited = {};
  visited[key(node0)] = true;
  const stack = [node0];
  a: while (stack.length > 0) {
    let node = stack.pop();
    const wall = [spot(node)];
    while (true) {
      const open = neighbours(node).filter(
        (paths) =>
          paths.map(length).every((l) => 3 <= l && l <= 24) &&
          !visited[key(paths)],
      );
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
          node = open[(Math.random() * open.length) | 0];
      }
      wall.push(spot(node));
      visited[key(node)] = true;
    }
  }
  return walls;
}

const spot2 = (() => {
  const len = Math.sqrt(3);
  const cyc = [-1, len, 1, -len];
  const mem = { "": [0, 0, 0] };

  return function f(path) {
    const key = Triangle_2_4_4.id(path);
    if (mem[key]) {
      return mem[key];
    }
    const [x, y, z] = f(path.head);
    const z2 = (z + path.power) % 4;
    return (mem[key] = path.symbol === ALPHA
      ? [x - cyc[z] + cyc[z2], y - cyc[(z + 1) % 4] + cyc[(z2 + 1) % 4], z2]
      : [
        x - cyc[(5 - z) % 4] + cyc[(5 - z2) % 4],
        y - cyc[(4 - z) % 4] + cyc[(4 - z2) % 4],
        z2,
      ]);
  };
})();

function walk2() {
  const NEIGHBOURS = [
    [ALPHA, 1],
    [BETA, 1],
    [ALPHA, 3],
    [BETA, 3],
    [ALPHA, 1, BETA, 1],
  ];
  const walls = [];
  const node0 = Triangle_2_4_4.appendAll(null, [
    ALPHA,
    2,
    BETA,
    2,
    ALPHA,
    2,
    BETA,
    2,
  ]);
  const visited = {
    [Triangle_2_4_4.id(node0)]: true,
  };
  const stack = [node0];
  a: while (stack.length > 0) {
    let node = stack.pop();
    const wall = [spot2(node)];
    while (true) {
      const open = NEIGHBOURS.map((n) => Triangle_2_4_4.appendAll(node, n))
        .filter((p) => {
          if (visited[Triangle_2_4_4.id(p)]) {
            return false;
          }
          const l = length(p);
          return l >= 3 && l <= 24;
        });
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
          node = open[(Math.random() * open.length) | 0];
      }
      wall.push(spot2(node));
      visited[Triangle_2_4_4.id(node)] = true;
    }
  }
  return walls;
}

const coords = (() => {
  const mem = { "": [0, 0, 0] };
  const len = (4 + Math.sqrt(7)) / 3;
  const sin = [-1, -len, 1, len];
  const sign = { [ALPHA]: 1, [BETA]: 3 };
  return function c(path) {
    const key = Triangle_2_4_4.id(path);
    if (mem[key]) {
      return mem[key];
    }
    const [x, y, z] = c(path.head);
    const s = sign[path.symbol];
    const z2 = (z + path.power) % 4;
    return (mem[key] = [
      x - sin[(s * (z + 3)) % 4] + sin[(s * (z2 + 3)) % 4],
      y - sin[(s * z) % 4] + sin[(s * z2) % 4],
      z2,
    ]);
  };
})();

function spot(paths) {
  let x = 0;
  let y = 0;
  let l = 0;
  for (const [a, b] of paths.map(coords)) {
    x += a;
    y += b;
    l++;
  }
  return [(x - y) / l, (x + y) / l];
}

function test() {
  const path0 = Triangle_2_4_4.appendAll(null, [
    BETA,
    1,
    ALPHA,
    2,
    BETA,
    2,
    ALPHA,
    1,
  ]);
  const walls = [
    [
      path0,
      Triangle_2_4_4.append(path0, ALPHA, 1),
      Triangle_2_4_4.appendAll(path0, [ALPHA, 1, BETA, 1]),
      Triangle_2_4_4.appendAll(path0, [ALPHA, 1, BETA, 1, ALPHA, 1]),
    ].map(coords),
    [
      path0,
      Triangle_2_4_4.append(path0, BETA, 1),
      Triangle_2_4_4.appendAll(path0, [BETA, 1, ALPHA, 1]),
      Triangle_2_4_4.appendAll(path0, [BETA, 1, ALPHA, 1, BETA, 1]),
    ].map(coords),
    [
      path0,
      Triangle_2_4_4.append(path0, BETA, 1),
      Triangle_2_4_4.appendAll(path0, [BETA, 2]),
      Triangle_2_4_4.appendAll(path0, [BETA, 3]),
    ].map(coords),
    [
      path0,
      Triangle_2_4_4.append(path0, ALPHA, 1),
      Triangle_2_4_4.appendAll(path0, [ALPHA, 2]),
      Triangle_2_4_4.appendAll(path0, [ALPHA, 3]),
    ].map(coords),
  ];
  console.info(walls);
  return walls;
}

export function run(canvas) {
  const walls = walk2();

  let min = 0,
    max = 0;
  for (const z of walls.flat(2)) {
    min = min > z ? z : min;
    max = max < z ? z : max;
  }
  console.log(min, max);

  const context = canvas.getContext("2d");

  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  context.strokeStyle = "#663399";
  context.lineWidth = 1;
  context.lineCap = "round";
  context.lineJoin = "round";

  const scale = 690 / (max - min);

  for (let wall of walls) {
    const scaled = wall.map(([x, y]) => [
      5 + (x - min) * scale,
      5 + (y - min) * scale,
    ]);
    folded(context, scaled);
  }
}

function folded(context, vecs) {
  context.beginPath();
  context.moveTo(...vecs[0]);
  for (let i = 1, l = vecs.length; i < l; i++) {
    context.lineTo(...vecs[i]);
  }
  context.stroke();
}

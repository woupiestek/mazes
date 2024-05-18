import { Triangle_2_3_7 } from "./hyperbolic2.js";
import { drawArcs } from "./poincareDisc.js";

const length = (() => {
  const mem = {};
  return function l(path) {
    if (path === null) {
      return 0;
    }
    const { head, prime, power, id } = path;
    if (mem[id]) {
      return mem[id];
    }
    if (prime === 3) {
      return l(head);
    }
    return l(head) + (power * (7 - power)) / 12;
  };
})();

function walk() {
  const PERMUTATIONS = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];
  const walls = [];
  const path0 = Triangle_2_3_7.appendAll(
    null,
    [3, 1, 7, 3, 3, 1, 7, 3, 3, 1, 7, 3],
  );
  const stack = [path0];
  const visited = { [Triangle_2_3_7.string(path0)]: true };
  a: while (stack.length > 0) {
    let path = stack.pop();
    const wall = [path];
    while (true) {
      const paths = PERMUTATIONS[(6 * Math.random()) | 0]
        .map((i) => Triangle_2_3_7.appendAll(path, [7, 1, 3, i]))
        .filter((p) => length(p) < 6);
      if (
        paths.length === 0 ||
        paths.some((p) => visited[Triangle_2_3_7.string(p)])
      ) {
        if (wall.length > 1) {
          walls.push(wall);
        }
        continue a;
      }
      while (paths.length > 1) {
        stack.push(paths.pop());
      }
      [path] = paths;
      wall.push(path);
      visited[Triangle_2_3_7.string(path)] = true;
    }
  }
  return walls;
}

const TAU = Math.PI * 2;
const coshD = (Math.cos(TAU / 7) * 4 + 1) / 3;
const sinhD = Math.sqrt(coshD * coshD - 1);

function normalize(angle) {
  angle %= TAU;
  return angle < -Math.PI
    ? angle + TAU
    : angle >= Math.PI
    ? angle - TAU
    : angle;
}

function jump(ch, th, ph) {
  th = normalize(th);
  ph = normalize(ph);
  if (ch <= 1 + 1e-7) {
    return [coshD, th - ph + Math.PI, 0];
  }
  const sh = Math.sqrt(ch * ch - 1);
  const ch2 = coshD * ch - sinhD * sh * Math.cos(ph);
  if (Math.abs(ph) < 1e-7) {
    if (ch > coshD) {
      return [ch2, th, -Math.PI];
    } else {
      return [ch2, th - Math.PI, 0];
    }
  }
  if (Math.abs(Math.PI - Math.abs(ph)) < 1e-7) {
    return [ch2, th, 0];
  }
  const sh2 = Math.sqrt(ch2 * ch2 - 1);

  // this is information that cosine loses
  const sign = ph > 0 ? 1 : -1;
  const th2 = th + sign * Math.acos((ch * ch2 - coshD) / (sh * sh2));
  const ph2 = -sign * Math.acos((ch2 * coshD - ch) / (sh2 * sinhD));
  if (Number.isNaN(ch2 * th2 * ph2)) {
    throw new Error(`problem input ${ch}, ${th}, ${ph}`);
  }
  return [ch2, th2, ph2];
}

const jumps = (() => {
  const mem = { "": [1, 0, 0] };
  return function self(path) {
    const id = Triangle_2_3_7.string(path);
    if (mem[id]) {
      return mem[id];
    }
    const { head, prime, power } = path;
    let [r, th, ph] = self(head);
    switch (prime) {
      case 3:
        ph += (TAU * power) / 3;
        break;
      case 7:
        for (let i = power; i > 0; i--) {
          [r, th, ph] = jump(r, th, ph);
          ph -= TAU / 3;
        }
        break;
    }
    return (mem[id] = [r, th, ph]);
  };
})();

function test() {
  const p1 = [];
  for (let j = 0; j < 3; j++) {
    const p2 = Triangle_2_3_7.append(null, 3, j);
    for (let i = 0; i < 8; i++) {
      p1.push(Triangle_2_3_7.append(p2, 7, i));
    }
  }
  return [p1];
}

function coordinates(walls) {
  return walls.map((wall) =>
    wall.map((path) => {
      const [r, th] = jumps(path);
      const d = Math.sqrt((r - 1) / (r + 1));
      return [d * Math.cos(th), d * Math.sin(th)];
    })
  );
}

export function run(canvas) {
  drawArcs(canvas, coordinates(walk()));
}

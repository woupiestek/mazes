import { Triangle_2_4_5 } from "./hyperbolic4.js";
import { drawArcs } from "./poincareDisc.js";

const length = (() => {
  const mem = {};
  return function l(path) {
    if (path === null) {
      return 0;
    }
    const { head, order, power, id } = path;
    if (mem[id]) {
      return mem[id];
    }
    return l(head) + (2 * Math.sqrt(power * (order - power))) / order;
  };
})();

function walk() {
  const walls = [];
  const path0 = Triangle_2_4_5.appendAll(null, [4, 2, 5, 2]);
  const stack = [path0];
  const visited = {
    [Triangle_2_4_5.id(path0)]: true,
    [Triangle_2_4_5.id(Triangle_2_4_5.appendAll(path0, [4, 1, 5, 1]))]: true,
  };

  a: while (stack.length > 0) {
    let path = stack.pop();
    const wall = [path];
    while (true) {
      const open = [
        [4, 1],
        [4, 1, 5, 2],
        [4, 1, 5, 1, 4, 1],
        [5, 1],
      ]
        .map((tail) => Triangle_2_4_5.appendAll(path, tail))
        .filter(
          (path2) =>
            !(length(path2) > 7.5 || visited[Triangle_2_4_5.id(path2)]),
        );
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
          path = open[(Math.random() * open.length) | 0];
      }
      wall.push(path);
      visited[Triangle_2_4_5.id(path)] = true;
      visited[
        Triangle_2_4_5.id(Triangle_2_4_5.appendAll(path, [4, 1, 5, 1]))
      ] = true;
    }
  }
  console.log(walls.length);
  return walls;
}

const TAU = Math.PI * 2;
const coshD = (() => {
  const c = Math.cos(Math.PI / 5);
  return c * c * 2;
})();
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
  const angle = 2 * Math.atan(1 / Math.sqrt(coshD));
  const mem = { "": [1, 0, 0] };
  return function self(path) {
    const id = Triangle_2_4_5.id(path);
    if (mem[id]) {
      return mem[id];
    }
    const { head, order, power } = path;
    let [r, th, ph] = self(head);
    // now what?
    switch (order) {
      case 4:
        for (let j = power; j > 0; j--) {
          [r, th, ph] = jump(r, th, ph - angle);
        }
        break;
      case 5:
        for (let i = power; i > 0; i--) {
          [r, th, ph] = jump(r, th, ph);
          ph += angle - Math.PI;
        }
        break;
    }
    return (mem[id] = [r, th, ph]);
  };
})();

function test() {
  const p1 = [];
  for (let j = 0; j < 3; j++) {
    const p2 = Triangle_2_4_5.append(null, 3, j);
    for (let i = 0; i < 8; i++) {
      p1.push(Triangle_2_4_5.append(p2, 7, i));
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

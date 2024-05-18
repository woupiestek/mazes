const TAU = 2 * Math.PI;
const ETH = Math.sqrt(3) / 2;

function distance({ x: a, y: b }, { x: c, y: d }) {
  const e = a - c;
  const f = b - d;
  return Math.sqrt(e * e + f * f);
}

const State = {
  RAW: 0,
  VISITED: 1,
  DONE: 2,
};

function connect(node1, node2) {
  if (!node1 || !node2) {
    return;
  }
  node1.neighbours[node2.id] = node2;
  node2.neighbours[node1.id] = node1;
}

function newNode(id, x, y) {
  return { id, x, y, neighbours: {}, state: State.RAW };
}

function disc(inner, outer, distance = 3 / Math.PI) {
  const nodes = [];
  let lastN = 0;

  // chosen to keep nodes within range.
  for (let j = (outer / distance) | 0, min = inner / distance; j > min; j--) {
    nodes[j] = [];
    const r = j * distance;
    const n = (TAU * r) | 0;
    const da = TAU / n;
    for (let i = 0; i < n; i++) {
      const phi = i * da;
      nodes[j][i] = newNode(
        `${j}:${i}`,
        r * Math.cos(phi) + outer,
        r * Math.sin(phi) + outer,
      );
      connect(nodes[j][i - 1], nodes[j][i]);
      const k = Math.round((lastN / n) * i);
      connect(nodes[j + 1] && nodes[j + 1][k], nodes[j][i]);
    }
    connect(nodes[j][0], nodes[j][n - 1]);
    lastN = n;
  }
  return nodes.flat();
}

function swing(inner, outer, factor = 0.5) {
  const yank = 1 / 6;
  const nodes = [];
  for (let i = 0; i < 2 * outer; i++) {
    nodes[i] = [];
    for (let j = 0; j < 2 * outer; j++) {
      if (
        i >= outer - inner &&
        j >= outer - inner &&
        i < inner + outer &&
        j < inner + outer
      ) {
        continue;
      }
      const node = newNode(`${i}:${j}`, i, j);
      nodes[i][j] = node;
      let node2 = nodes[i][j - 1];
      if (node2 && Math.random() < factor) {
        connect(node, node2);
        node.y -= yank;
        node2.y += yank;
      }
      if (nodes[i - 1]) {
        node2 = nodes[i - 1][j + 1];
        const blocked = Math.random() < factor;
        if (node2 && blocked) {
          connect(node, node2);
          node.x -= yank;
          node.y += yank;
          node2.x += yank;
          node2.y -= yank;
        }
        node2 = nodes[i - 1][j];
        if (node2) {
          node2.blocked = blocked;
          if (Math.random() < factor) {
            connect(node, node2);
            node.x -= yank;
            node2.x += yank;
          }
        }
        node2 = nodes[i - 1][j - 1];
        if (node2 && !node2.blocked && Math.random() < factor / (1 - factor)) {
          connect(node, node2);
          node.x -= yank;
          node.y -= yank;
          node2.x += yank;
          node2.y += yank;
        }
      }
    }
  }
  return nodes.flat();
}

function triangle(inner, outer) {
  const nodes = [];
  const H = (1 - ETH) * outer;
  for (let i = 0; i < 2 * outer; i++) {
    nodes[i] = [];
    for (let j = 0; j < 2 * outer; j++) {
      if (
        i < outer &&
        (j >= outer + i ||
          (i >= outer - inner && j >= outer - inner && j < i + inner))
      ) {
        continue;
      }
      if (
        i >= outer &&
        ((i < outer + inner && j >= i - inner && j < outer + inner) ||
          j < i - outer)
      ) {
        continue;
      }

      nodes[i][j] = newNode(`${i}:${j}`, i + (outer - j) / 2, ETH * j + H);
      connect(nodes[i][j], nodes[i][j - 1]);
      if (nodes[i - 1]) {
        connect(nodes[i][j], nodes[i - 1][j]);
        connect(nodes[i][j], nodes[i - 1][j - 1]);
      }
    }
  }
  return nodes.flat();
}

function hexagons(inner, outer) {
  const H = (1 - ETH) * outer;
  const nodes = [];
  for (let i = 0; i <= 2 * outer; i++) {
    nodes[i] = [];
    for (let j = 0; j <= 4 * outer; j++) {
      const sign = 0.5 - ((i + j + outer) & 1);
      const r = Math.max(
        Math.abs(i - outer - 1 / 2),
        Math.abs(j + i + sign / 4 - 3 * outer - 3 / 2) / 2,
        Math.abs(j - i - sign / 4 - outer - 1 / 2) / 2,
      );

      if (r >= outer || r < inner) {
        continue;
      }
      const node = newNode(`${i}:${j}`, (i + sign / 4) * ETH + H, j / 2);
      nodes[i][j] = node;
      connect(nodes[i][j], nodes[i][j - 1]);
      if (nodes[i - 1] && sign < 0) {
        connect(nodes[i][j], nodes[i - 1][j]);
      }
    }
  }
  return nodes.flat();
}

function hexagon2(inner, outer) {
  const ups = [];
  const downs = [];

  for (let i = 0; i <= 2 * outer; i++) {
    downs[i] = [];
    for (let j = 0; j <= 2 * outer; j++) {
      const x = (i - j) / 2;
      const y = ETH * (i + j - 1 / 3 - 2 * outer);
      const r = x * x + y * y;
      if (r > (outer * outer * 3) / 4 || r < (inner * inner * 3) / 4) {
        continue;
      }
      downs[i][j] = newNode(`d${i}_${j}`, x + outer, y + outer);
    }
  }

  for (let i = 0; i <= 2 * outer; i++) {
    ups[i] = [];
    for (let j = 0; j <= 2 * outer; j++) {
      const x = (i - j) / 2;
      const y = ETH * (i + j + 1 / 3 - 2 * outer);
      const r = x * x + y * y;
      if (r > (outer * outer * 3) / 4 || r < (inner * inner * 3) / 4) {
        continue;
      }
      ups[i][j] = newNode(`u${i}_${j}`, x + outer, y + outer);
      connect(ups[i][j], downs[i + 1] && downs[i + 1][j]);
      connect(ups[i][j], downs[i][j + 1]);
      connect(ups[i][j], downs[i][j]);
    }
  }
  return [ups, downs].flat(2);
}

function hexagon3(inner, outer) {
  const H = 1 / Math.sqrt(3);
  const W = 1 / 3;
  const nodes = [];
  for (let i = 0; i <= 3 * outer; i++) {
    nodes[i] = [];
    for (let j = 0; j <= 3 * outer; j++) {
      if ((i + j) % 3 === 0 || Math.abs(j - i) > (3 / 2) * outer) {
        continue;
      }
      const r = Math.max(
        Math.abs(i - (3 / 2) * outer),
        Math.abs(j - (3 / 2) * outer),
        Math.abs(j - i),
      );
      if (r < (3 / 2) * inner) {
        continue;
      }
      nodes[i][j] = newNode(
        `${i}:${j}`,
        (j + i - 3 * outer) * W + outer,
        (j - i) * H + outer,
      );
      for (
        const node of [
          nodes[i][j - 1],
          nodes[i - 1] && nodes[i - 1][j - 1],
          nodes[i - 1] && nodes[i - 1][j],
        ]
      ) {
        connect(nodes[i][j], node);
      }
    }
  }
  return nodes.flat();
}

function cairo2(inner, outer) {
  const yank = (4 - Math.sqrt(7)) / 3;
  const nodes = [];
  for (let i = 0; i < 2 * outer + 1; i++) {
    nodes[i] = [];
    for (let j = 0; j < 2 * outer + 1; j++) {
      if (
        i > outer - inner &&
        i <= outer + inner &&
        j > outer - inner &&
        j <= outer + inner
      ) {
        continue;
      }

      if ((i & 1) === 1 && (j & 1) === 1) {
        continue;
      }
      const node = newNode(`${i}:${j}`, i, j);
      nodes[i][j] = node;
      const mode = (i - j) & 3;

      if ((i & 1) === 0) {
        connect(node, nodes[i][j - 1]);
        switch (mode) {
          case 3:
            node.x -= yank;
            connect(node, i > 1 && nodes[i - 2][j]);
            break;
          case 1:
            node.x += yank;
            break;
        }
      }
      if ((j & 1) === 0) {
        connect(node, i > 0 && nodes[i - 1][j]);
        switch (mode) {
          case 3:
            node.y -= yank;
            connect(node, nodes[i][j - 2]);
            break;
          case 1:
            node.y += yank;
            break;
        }
      }
    }
  }

  return nodes.flat();
}

function cairo3(inner, outer) {
  const yank = (4 - Math.sqrt(7)) / 6;
  const order3 = [];
  for (let i = 0; i <= 2 * outer; i++) {
    order3[i] = [];
    for (let j = 0; j <= 2 * outer; j++) {
      if (
        i > outer - inner &&
        i <= outer + inner &&
        j > outer - inner &&
        j <= outer + inner
      ) {
        continue;
      }

      const node = newNode(`${i}:${j}:3`, i, j);
      order3[i][j] = node;
      switch (`${i & 1}${j & 1}`) {
        case "00":
          node.x += yank;
          node.y -= yank;
          break;
        case "01":
          node.x -= yank;
          node.y -= yank;
          connect(node, i > 0 && order3[i - 1][j - 1]);
          break;
        case "10":
          node.x += yank;
          node.y += yank;
          break;
        case "11":
          node.x -= yank;
          node.y += yank;
          connect(node, i > 0 && order3[i - 1][j + 1]);
          break;
      }
    }
  }

  const order4 = [];
  for (let i = 1; i <= 2 * outer; i += 2) {
    order4[i] = [];
    for (let j = 1; j <= 2 * outer; j += 2) {
      if (
        i > outer - inner &&
        i <= outer + inner &&
        j > outer - inner &&
        j <= outer + inner
      ) {
        continue;
      }
      const node0 = newNode(`${i}:${j}:-`, i - 0.5, j - 0.5);
      order4.push(node0);
      for (
        const node1 of [
          i > 0 && order3[i - 1][j - 1],
          order3[i][j - 1],
          i > 0 && order3[i - 1][j],
          order3[i][j],
        ]
      ) {
        connect(node0, node1);
      }

      const node2 = newNode(`${i}:${j}:+`, i + 0.5, j + 0.5);
      order4.push(node0);
      for (
        const node3 of [
          order3[i + 1][j + 1],
          order3[i][j + 1],
          order3[i + 1][j],
          order3[i][j],
        ]
      ) {
        connect(node2, node3);
      }
    }
  }

  return [order3, order4].flat(2);
}

function snubSquare(inner, outer) {
  const yank = 1 - ETH;
  const nodes = [];
  for (let i = 0; i <= 2 * outer; i++) {
    nodes[i] = [];
    for (let j = 0; j <= 2 * outer; j++) {
      if (
        i > outer - inner &&
        i <= outer + inner &&
        j > outer - inner &&
        j <= outer + inner
      ) {
        continue;
      }
      const sj = (j & 1) === 0;
      const si = (i & 1) === 0;
      nodes[i][j] = newNode(
        `${i}:${j}`,
        i + (sj ? yank : -yank),
        j + (si ? yank : -yank),
      );
      connect(nodes[i][j], nodes[i][j - 1]);
      if (!nodes[i - 1]) {
        continue;
      }
      connect(nodes[i][j], nodes[i - 1][j]);
      if (sj) {
        continue;
      }
      connect(nodes[i][j], si ? nodes[i - 1][j + 1] : nodes[i - 1][j - 1]);
    }
  }
  return nodes.flat();
}

function square(inner, outer) {
  const nodes = [];
  for (let i = 0; i <= 2 * outer; i++) {
    nodes[i] = [];
    const i2 = Math.abs(i - outer);
    for (let j = 0; j <= 2 * outer; j++) {
      const r2 = Math.max(i2, Math.abs(j - outer));
      if (r2 <= inner) {
        continue;
      }
      nodes[i][j] = newNode(`${i}:${j}`, i, j);
      connect(nodes[i][j], nodes[i][j - 1]);
      connect(nodes[i][j], nodes[i - 1] && nodes[i - 1][j]);
    }
  }
  return nodes.flat();
}

function tetrakis(inner, outer) {
  const nodes = [];
  for (let i = 0; i <= 2 * outer; i++) {
    nodes[i] = [];
    const i2 = Math.abs(i - outer);
    for (let j = 0; j <= 2 * outer; j++) {
      const r2 = Math.max(i2, Math.abs(j - outer));
      if (r2 <= inner) {
        continue;
      }
      nodes[i][j] = newNode(`${i}:${j}`, i, j);
      connect(nodes[i][j], nodes[i][j - 1]);
      if (!nodes[i - 1]) {
        continue;
      }
      connect(nodes[i][j], nodes[i - 1][j]);
      if (((i + j) & 1) === 0) {
        continue;
      }
      connect(nodes[i][j], nodes[i - 1][j - 1]);
      connect(nodes[i][j], nodes[i - 1][j + 1]);
    }
  }
  return nodes.flat();
}

function spiral2(inner, outer, count = 3, distance = 3 / Math.PI) {
  const beta = TAU / count;
  const alpha = beta / distance;
  const nodes = [];
  const min = Math.ceil((inner * inner * alpha) / 2);
  const max = (outer * outer * alpha) / 2;
  for (let a = min; a <= max; a++) {
    nodes[a] = [];
    const r = Math.sqrt((2 / alpha) * a);
    const phi = r * alpha;

    // index of neighbour
    const b = Math.round(a - beta * (r - distance / 2));
    for (let ph = 0; ph < count; ph++) {
      nodes[a][ph] = newNode(
        `${a}:${ph}`,
        r * Math.cos(phi - ph * beta) + outer,
        r * Math.sin(phi - ph * beta) + outer,
      );
      if (nodes[a - 1]) {
        connect(nodes[a][ph], nodes[a - 1][ph]);
      }
      if (nodes[b] && ph > 0) {
        connect(nodes[a][ph], nodes[b][ph - 1]);
      }
    }
    if (nodes[b]) {
      connect(nodes[b][count - 1], nodes[a][0]);
    }
  }
  return nodes.flat();
}

function spiral3(inner, outer, count = 3, distance = 3 / Math.PI) {
  const beta = TAU / count;
  const alpha = beta / distance;
  const nodes = [];
  const min = (inner * inner * alpha) / 2;
  const max = ((outer * outer * alpha) / 2) | 0;
  for (let a = max; a >= min; a--) {
    nodes[a] = [];
    const r = Math.sqrt((2 / alpha) * a);
    const phi = r * alpha;

    // index of neighbour
    const b = Math.round(a + beta * (r + distance / 2));
    for (let ph = 0; ph < count; ph++) {
      nodes[a][ph] = newNode(
        `${a}:${ph}`,
        r * Math.cos(phi + ph * beta) + outer,
        r * Math.sin(phi + ph * beta) + outer,
      );
      if (nodes[a + 1]) {
        connect(nodes[a][ph], nodes[a + 1][ph]);
      }
      if (nodes[b] && ph > 0) {
        connect(nodes[a][ph], nodes[b][ph - 1]);
      }
    }
    if (nodes[b]) {
      connect(nodes[b][count - 1], nodes[a][0]);
    }
  }
  return nodes.flat();
}

function elipticSpiral(_, radius, limit = Math.PI / 16, count = 3) {
  const nodes = [];
  const area = (TAU * radius * radius) / count;
  const dphi = (TAU * radius) / count;
  const ph = TAU / count;
  const maxI = area * Math.cos(limit);

  for (let n = 0; n < count; n++) {
    nodes[n] = [];
    for (let i = 0; i <= maxI; i++) {
      const th = Math.acos(i / area);
      const r = Math.sqrt((area - i) / (area + i)) * radius;
      nodes[n][i] = newNode(
        `${n}:${i}`,
        r * Math.cos(dphi * th + ph * n) + radius,
        r * Math.sin(dphi * th + ph * n) + radius,
      );
      connect(nodes[n][i], nodes[n][i - 1]);
    }
  }

  for (let i = 0; i <= maxI; i++) {
    const j = Math.round(area * Math.cos(Math.acos(i / area) + 1 / radius));
    for (let n = 0; n < count; n++) {
      connect(nodes[n][i], nodes[n > 0 ? n - 1 : count - 1][j]);
    }
  }
  return nodes.flat();
}

function elipticSpiral2(inner, radius, armCount = 3) {
  const cellHeight = Math.PI / (2 * radius);
  const cellWidth = cellHeight;

  const nodes = [];

  const cosCH = Math.cos(cellHeight);
  const sinCH = Math.sin(cellHeight);
  const dTh = TAU / armCount;
  const dA = cellHeight * cellWidth * armCount;

  const max = TAU / dA;
  const min = (max * inner) / (2 * radius);

  for (let i = max | 0; i > min; i--) {
    nodes[i] = [];
    const A = i * dA;
    const rh = Math.acos(1 - A / TAU);
    const i2 = Math.round(
      (TAU - (TAU - A) * cosCH + Math.sqrt(A * (2 * TAU - A)) * sinCH) / dA,
    );
    const r = Math.tan(rh / 2) * radius;
    const th0 = dTh * (rh / cellHeight);
    for (let j = 0; j < armCount; j++) {
      nodes[i][j] = newNode(
        `${i}:${j}`,
        r * Math.cos(th0 + dTh * j) + radius,
        r * Math.sin(th0 + dTh * j) + radius,
      );
      connect(nodes[i][j], nodes[i + 1] && nodes[i + 1][j]);
      connect(nodes[i][j], nodes[i2] && nodes[i2][(j > 0 ? j : armCount) - 1]);
    }
  }
  return nodes.flat();
}

function square2(inner, outer, threshold = 1 / 4, distance = 1 / 4) {
  const nodes = [];
  for (let i = 0; i < 2 * outer; i++) {
    nodes[i] = [];
    for (let j = 0; j < 2 * outer; j++) {
      if (
        i > outer - inner &&
        j > outer - inner &&
        j < outer + inner &&
        i < outer + inner
      ) {
        continue;
      }
      const node = newNode(`${i}:${j}`, i, j);
      nodes[i][j] = node;

      const factor = ((2 * Math.random()) / threshold) | 0;

      if (nodes[i][j - 1]) {
        if (factor === 0) {
          nodes[i][j - 1].y -= distance;
          node.y += distance;
        } else {
          connect(node, nodes[i][j - 1]);
        }
      }

      if (nodes[i - 1] && nodes[i - 1][j]) {
        if (factor === 1) {
          nodes[i - 1][j].x -= distance;
          node.x += distance;
        } else {
          connect(node, nodes[i - 1][j]);
        }
      }
    }
  }
  return nodes.flat();
}

function hyperbolicDisc(_, radius, div = 64 / TAU) {
  const nodes = [];
  const circ = [];

  const maxI = div * 2;

  for (let i = 1; i < maxI; i++) {
    nodes[i] = [];
    const r = Math.tanh(i / div);
    circ[i] = (div * TAU * Math.sinh(i / div)) | 0;
    const dphi = TAU / circ[i];
    for (let j = 0; j < circ[i]; j++) {
      nodes[i][j] = newNode(
        `${i}:${j}`,
        (1 + r * Math.cos(dphi * j)) * radius,
        (1 + r * Math.sin(dphi * j)) * radius,
      );
      connect(nodes[i][j], nodes[i][j - 1]);
      if (i > 1) {
        const k = Math.round((circ[i - 1] * j) / circ[i]);
        connect(nodes[i][j], nodes[i - 1][k]);
      }
    }
    connect(nodes[i][0], nodes[i][circ[i] - 1]);
  }
  return nodes.flat();
}

function ar(radius) {
  return Math.PI / (1 / (radius * radius) - 1);
}

function rad(area) {
  return 1 / Math.sqrt(1 + Math.PI / area);
}

function hyperbolicSpiral(_, radius, armCount = 3) {
  const deltaD = TAU / 64;
  const deltaA = deltaD * deltaD * armCount;
  const maxI = ((1 << 12) / armCount) | 0;
  const nodes = [];
  const dPhi = TAU / armCount;

  for (let i = 1; i < maxI; i++) {
    nodes[i] = [];
    const d = rad(deltaA * i);
    const r = Math.atanh(d);
    const j = Math.round(ar(Math.tanh(r - deltaD)) / deltaA);
    for (let k = 0; k < armCount; k++) {
      const node = newNode(
        `${i}:${k}`,
        (1 + d * Math.cos(dPhi * (r / deltaD - k))) * radius,
        (1 + d * Math.sin(dPhi * (r / deltaD - k))) * radius,
      );
      nodes[i][k] = node;
      if (i < 2) {
        continue;
      }
      connect(nodes[i][k], nodes[i - 1][k]);
      if (j < 1) {
        continue;
      }
      connect(nodes[i][k], nodes[j][(k === 0 ? armCount : k) - 1]);
    }
  }
  return nodes.flat();
}

function shuffle(array) {
  let j, element;
  for (let i = array.length - 1; i >= 0; i--) {
    j = (i * Math.random()) | 0;
    element = array[i];
    array[i] = array[j];
    array[j] = element;
  }
}

function walk(nodes) {
  shuffle(nodes);
  const walls = [];
  a: while (nodes.length > 0) {
    let node = nodes.pop();
    if (node.state === State.DONE) {
      continue;
    }
    const wall = [];
    b: while (true) {
      wall.push(node);
      const neighbours = Object.values(node.neighbours).filter(
        ({ state }) => state === State.RAW,
      );
      switch (neighbours.length) {
        case 0:
          if (wall.length > 1) {
            node.state = State.DONE;
            walls.push(wall);
          }
          continue a;
        case 1:
          node.state = State.DONE;
          node = neighbours[0];
          continue b;
        default:
          node.state = State.VISITED;
          nodes.push(node);
          node = neighbours[(Math.random() * neighbours.length) | 0];
          continue b;
      }
    }
  }
  console.log(walls.length);
  return walls;
}

function bezier(context, coords) {
  const ALPHA = 0.1;
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

function draw(canvas, { width, height, unit }, walls) {
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", (width + 1) * unit);
  canvas.setAttribute("height", (height + 1) * unit + 2);
  context.fillStyle = "#000000";
  context.lineWidth = 1;
  context.lineCap = "round";
  context.lineJoin = "round";

  let i = 0;
  for (const wall of walls) {
    if (wall.length > 1) {
      i += wall.length - 1;
      const coords = wall.map(({ x, y }) => [(x + 1) * unit, (y + 1) * unit]);
      setTimeout(() => folded(context, coords), i);
    }
  }
}

const Config = {
  radius: 24,
  inner: 5,
  width: 49,
  height: 49,
  unit: 14,
};

let index = 0;
const GENERATORS = [
  cairo2,
  cairo3,
  disc,
  elipticSpiral,
  elipticSpiral2,
  hexagon2,
  hexagon3,
  hexagons,
  hyperbolicDisc,
  hyperbolicSpiral,
  snubSquare,
  spiral2,
  spiral3,
  square,
  square2,
  swing,
  tetrakis,
  triangle,
];
export function run(canvas) {
  const nodes = GENERATORS[index++](3, 24);
  index %= GENERATORS.length;
  draw(canvas, Config, walk(nodes));
}

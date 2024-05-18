function walk(inner, outer, count) {
  const factor = Math.PI / count;
  const min = factor * inner * inner;
  const max = factor * outer * outer;
  const i0 = Math.round(Math.random() * (max - min));
  const visited = [];
  visited[i0] = true;
  const walls = [];
  const stack = [i0];
  a: while (stack.length > 0) {
    let i = stack.pop();
    const wall = [i];
    while (true) {
      const open = [
        i + 1,
        Math.round(i + 2 * Math.sqrt(factor * i) + factor),
        i - 1,
        Math.round(i - 2 * Math.sqrt(factor * i) + factor),
      ].filter((j) => j > min && j < max && !visited[j]);
      switch (open.length) {
        case 0:
          if (wall.length > 0) {
            walls.push(wall);
          }
          continue a;
        case 1:
          [i] = open;
          break;
        default:
          stack.push(i);
          i = open[(Math.random() * open.length) | 0];
      }
      wall.push(i);
      visited[i] = true;
    }
  }

  console.log(walls.length);
  return walls.flatMap(coords(min, max, count));
}

function coords(min, max, count) {
  const R = [];
  const TH = [];

  const dTh = (2 * Math.PI) / Math.round(count);

  for (let i = Math.ceil(min); i < max; i++) {
    R[i] = Math.sqrt((count * i) / Math.PI);
    TH[i] = R[i];
  }

  return function c(wall) {
    const results = [];
    for (let j = 0; j <= count - 0.5; j++) {
      results[j] = [];
      let a = j;
      for (const i of wall) {
        a = TH[i] + Math.round(a - TH[i]);
        const angle = a * dTh;
        results[j].push([R[i] * Math.cos(angle), R[i] * Math.sin(angle)]);
      }
    }
    return results;
  };
}

export function run(canvas) {
  const walls = walk(3, 24, 0.99 * Math.PI);

  let min = 0,
    max = 0;
  for (const z of walls.flat(2)) {
    min = min > z ? z : min;
    max = max < z ? z : max;
  }

  const context = canvas.getContext("2d");
  canvas.setAttribute("width", 700);
  canvas.setAttribute("height", 700);
  context.fillStyle = "#000000";
  context.lineWidth = 1;
  context.lineCap = "round";
  context.lineJoin = "round";

  const scale = 690 / (max - min);

  for (const wall of walls) {
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

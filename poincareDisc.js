const TAU = 2 * Math.PI;

function angle(x, y) {
  if (x > 0) {
    return Math.atan(y / x);
  }
  if (x === 0) {
    if (y > 0) {
      return Math.PI / 2;
    }
    return -Math.PI / 2;
  }
  if (y > 0) {
    return Math.atan(y / x) + Math.PI;
  }
  return Math.atan(y / x) - Math.PI;
}

function arc(x0, y0, x1, y1) {
  const x2 = (x0 + x1) / 2;
  const y2 = (y0 + y1) / 2;
  const dx = x1 - x0;
  const dy = y1 - y0;

  /*
   * I'll be scratching my head over this one...
   * okay, the distance d0 of the center of the arc from origin
   * and the disatnce d1 from the end points satisfies:
   *
   * d0 * d0 = 1 + d1 * d1
   *
   * Why? The Pythagorean theorem applied to the triangle formed
   * by the origin, the center of the arc and the intersection
   * of the tangent line to the boudanry of the disc.
   *
   * So is we have two points p0 and p1, consider the line:
   *
   * (p0 + p1)/2 + alpha * (p1 - p0) * i
   *
   * where 'i' rotates differense vector by a straight edge.
   * Find the point onthe line that satiesfy the equation above
   * et voila.
   */

  const denom = dx * y2 - x2 * dy;
  if (denom === 0) {
    const D = x1 * y0 - x0 * y1;
    throw new Error(
      `the points are on the same radius [${x0}, ${y0}], [${x1}, ${y1}], ${D}`,
    );
  }
  const alpha = (1 - x2 * x2 - y2 * y2 + dx * dx + dy * dy) / (2 * denom);
  const radius = Math.sqrt((alpha * alpha + 1 / 4) * (dx * dx + dy * dy));
  const a0 = angle(dy, -dx);
  const da = angle(2 * alpha, 1);
  return [
    x2 - dy * alpha,
    y2 + dx * alpha,
    radius,
    a0 - da,
    a0 + da,
    denom < 0,
  ];
}

export function drawArcs(canvas, walls, size = 700) {
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", size);
  canvas.setAttribute("height", size);
  context.strokeStyle = "#663399";
  context.lineWidth = 1;
  context.lineCap = "round";
  context.lineJoin = "round";

  const scale = (size - 4) / 2;
  function adjust(x) {
    return size / 2 + scale * x;
  }
  for (const wall of walls) {
    if (wall.length <= 1) {
      continue;
    }
    context.beginPath();
    context.moveTo(adjust(wall[0][0]), adjust(wall[0][1]));
    for (let i = 1, l = wall.length; i < l; i++) {
      // deal with points on the same radius
      const D = wall[i - 1][1] * wall[i][0] - wall[i - 1][0] * wall[i][1];
      if (Math.abs(D) < 1e-5) {
        context.lineTo(adjust(wall[i][0]), adjust(wall[i][1]));
        continue;
      }
      const coords = arc(...wall[i - 1], ...wall[i]);
      context.arc(
        adjust(coords[0]),
        adjust(coords[1]),
        scale * coords[2],
        coords[3],
        coords[4],
        coords[5],
      );
    }
    context.stroke();
  }
}

function testWalls() {
  const arcs = [];
  const r = Math.random();
  const i0 = Math.random();
  for (let i = 0; i < 8; i++) {
    const th = (TAU * (i + i0)) / 7;
    arcs.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  const arcs2 = [];
  const r2 = 1 - r;
  for (let i = 0; i < 8; i++) {
    const th = (TAU * (3 / 4 + i0 - i)) / 7;
    arcs2.push([r * Math.cos(th), r * Math.sin(th)]);
    const th2 = (TAU * (1 / 4 + i0 - i)) / 7;
    arcs2.push([r2 * Math.cos(th2), r2 * Math.sin(th2)]);
  }
  const arcs3 = [];
  for (let i = 0; i < 8; i++) {
    const th = (TAU * (2 / 3 + i0 + i)) / 7;
    arcs3.push([r * Math.cos(th), r * Math.sin(th)]);
    arcs3.push([r2 * Math.cos(th), r2 * Math.sin(th)]);
  }
  return [arcs, arcs2, arcs3];
}

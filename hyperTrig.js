/* given a radius,
 * a counterclockwise angle relative to facing orgin and
 * a distance ahead, compute new radius and change in angle
 * add the ultimate facing direction for good measure.
 */

export function move(r0, [d, ph]) {
  const r1 = Math.acosh(
    Math.cosh(d) * Math.cosh(r0) - Math.sinh(d) * Math.sinh(r0) * Math.cos(ph)
  );
  const sinLaw = Math.sin(ph) / Math.sinh(r1);
  const dTh = Math.asin(sinLaw * Math.sinh(d));
  const ph1 = Math.asin(sinLaw * Math.sinh(r0));
  return [r, dTh, ph1];
}

/* length of side given the angles of a triangle */
export function lengthFromAngles(a, b, c) {
  return Math.acosh(
    (Math.cos(a) + Math.cos(b) * Math.cos(c)) / (Math.sin(b) * Math.sin(c))
  );
}

export function lengthFromOpposite(a, b, gamma) {
  return Math.acosh(
    Math.cosh(a) * Math.cosh(b) - Math.sinh(a) * Math.sinh(b) * Math.cos(gamma)
  );
}

export function angleFromSides(a, b, c) {
  return Math.acos(
    (Math.cosh(a) * Math.cosh(b) - Math.cosh(c)) / (Math.sinh(a) * Math.sinh(b))
  );
}

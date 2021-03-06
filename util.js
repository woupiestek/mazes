export function chain(number, depth) {
  const result = [];
  for (let i = 0; i < depth; i++) {
    const int = number | 0;
    result.push(int);
    if (number === int) {
      break;
    }
    number = 1 / (number - int);
  }

  let d = 1,
    n = 0;
  while (result.length > 0) {
    const x = result.pop() * n + d;
    d = n;
    n = x;
  }
  return `${n} / ${d}`;
}

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

export function sample(array) {
  if (!array?.length) {
    return undefined;
  }
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = ((i + 1) * Math.random()) | 0;
    const elt = array[i];
    array[i] = array[j];
    array[j] = elt;
  }
}

export function fill(length, f) {
  return Array.from({ length }).map((_, i) => f(i));
}

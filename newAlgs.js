const size = 64;
const directions = [
  [1, 0],
  [0, 1],
  [size - 1, 0],
  [0, size - 1],
];

const grid = [];
for (let i = 0; i < size; i++) {
  grid[i] = [];
  for (let j = 0; j < size; j++) {
    grid[i][j] = 0;
  }
}
// none of these really work that well.
const black = [[(size >> 1) - 1, (size >> 1) - 1]];
const white = [[size >> 1, size >> 1]];

while (black.length + white.length > 0) {
  for (const options of [black, white]) {
    if (options.length === 0) continue;
    const index = Math.floor(options.length * Math.random());
    const top = options.pop();
    let candidate = top;
    if (index < options.length - 1) {
      candidate = options[options.length - 1 - index];
      options[options.length - 1 - index] = top;
    }
    const [i, j] = candidate;
    if (grid[i][j] !== 0) continue;
    grid[i][j] = options === black ? 1 : 2;
    for ([k, l] of directions) {
      const x = (i + k) % size;
      const y = (j + l) % size;
      if (grid[x][y] === 0) {
        options.push([x, y]);
      }
    }
  }
}

console.log(
  grid.map((r) => r.map((c) => ["?", "X", " "][c]).join("")).join("\n"),
);

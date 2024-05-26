// idea: make a random walk, but upon crossing oneself,
// jump to a random visited point

// wall codes

function randomInt(max = Number.MAX_SAFE_INTEGER) {
  return (Math.random() * max) | 0;
}

function sample(array) {
  if (array.length > 0) {
    return array[randomInt(array.length)];
  }
}

function newGrid(maxX, maxY) {
  const result = [];
  for (let x = 0; x < maxX; x++) {
    result[x] = [];
    for (let y = 0; y < maxY; y++) {
      result[x][y] = {
        up: [x, (y > 0 ? y : maxY) - 1],
        left: [(x > 0 ? x : maxX) - 1, y],
        down: [x, y + 1 < maxY ? y + 1 : 0],
        right: [x + 1 < maxX ? x + 1 : 0, y],
      };
    }
  }
  return result;
}

function passages() {
  const _passages = {};

  function open(x, y, k) {
    _passages[`x${x}y${y}d${k}`] = true;
  }
  function isClosed(x, y, k) {
    return !_passages[`x${x}y${y}d${k}`];
  }
  return { open, isClosed };
}

function popRandom(array) {
  if (array.length === 1) {
    return array.pop();
  }
  const index = randomInt(array.length);
  if (index === array.length - 1) {
    return array.pop();
  }
  const result = array[index];
  array[index] = array.pop();
  return result;
}

// do proper breadth first now.
const DOORS = ["up", "left", "down", "right"];
function walk(maxX, maxY) {
  // build
  const _passages = passages();
  const grid = newGrid(maxX, maxY);
  const visited = [];
  for (let i = 0; i < maxX; i++) {
    visited[i] = [];
  }

  // init
  let x = randomInt(maxX),
    x2,
    y = randomInt(maxY),
    y2,
    d = randomInt(4),
    dirs;
  visited[x][y] = true;
  const stack = [[x, y, d]];

  // run
  while (stack.length > 0) {
    // select
    [x, y, d] = stack.pop();

    // move
    [x2, y2] = grid[x][y][DOORS[d]];
    if (visited[x2][y2]) {
      continue;
    }
    visited[x2][y2] = true;
    if (d < 2) {
      _passages.open(x, y, DOORS[d]);
    } else {
      _passages.open(x2, y2, DOORS[d - 2]);
    }

    dirs = [0, 1, 2, 3];
    while (dirs.length > 0) {
      stack.push([x2, y2, popRandom(dirs)]);
    }
  }
  return _passages;
}

function draw(canvas, { maxX, maxY, unit }, passages) {
  function f(z) {
    return (z + 1) * unit;
  }
  const context = canvas.getContext("2d");

  canvas.setAttribute("width", f(maxX + 1));
  canvas.setAttribute("height", f(maxY + 1));
  context.lineWidth = unit / 4;
  context.strokeStyle= "#663399";
  context.lineCap = "round";
  context.lineJoin = "round";

  for (let x = 0; x <= maxX; x++) {
    let state = "penUp";
    for (let y = 0; y < maxY; y++) {
      if (state === "penUp" && passages.isClosed(x % maxX, y, "left")) {
        context.beginPath();
        context.moveTo(f(x), f(y));
        state = "penDown";
      }
      if (state === "penDown" && !passages.isClosed(x % maxX, y, "left")) {
        context.lineTo(f(x), f(y));
        context.stroke();
        state = "penUp";
      }
    }
    if (state === "penDown") {
      context.lineTo(f(x), f(maxY));
      context.stroke();
      state = "penUp";
    }
  }

  for (let y = 0; y <= maxY; y++) {
    let state = "penUp";
    for (let x = 0; x < maxX; x++) {
      if (state === "penUp" && passages.isClosed(x, y % maxY, "up")) {
        context.beginPath();
        context.moveTo(f(x), f(y));
        state = "penDown";
      }
      if (state === "penDown" && !passages.isClosed(x, y % maxY, "up")) {
        context.lineTo(f(x), f(y));
        context.stroke();
        state = "penUp";
      }
    }
    if (state === "penDown") {
      context.lineTo(f(maxX), f(y));
      context.stroke();
      state = "penUp";
    }
  }
  return context;
}

function traverse(passages, document, context, { maxX, maxY, unit }) {
  function drawBall(x, y) {
    context.beginPath();
    context.arc(
      (x + 1.5) * unit,
      (y + 1.5) * unit,
      unit * 0.25,
      0,
      Math.PI * 2,
    );
    context.fillStyle = `#000000`;
    context.fill();
    context.closePath();
  }

  let x = 0;
  let y = 0;
  drawBall(x, y);
  const step = 1;
  document.addEventListener(
    "keydown",
    ({ code }) => {
      context.clearRect(
        (x + 6 / 5) * unit,
        (y + 6 / 5) * unit,
        (unit * 3) / 5,
        (unit * 3) / 5,
      );
      switch (code) {
        case "ArrowUp": {
          if (passages.isClosed(x, y, "up")) {
            break;
          }
          y = (y === 0 ? maxY : y) - step;
          break;
        }
        case "ArrowRight": {
          const x2 = x + step === maxX ? 0 : x + step;
          if (passages.isClosed(x2, y, "left")) {
            break;
          }
          x = x2;
          break;
        }
        case "ArrowDown": {
          const y2 = y + step === maxY ? 0 : y + step;
          if (passages.isClosed(x, y2, "up")) {
            break;
          }
          y = y2;
          break;
        }
        case "ArrowLeft": {
          if (passages.isClosed(x, y, "left")) {
            break;
          }
          x = (x === 0 ? maxX : x) - step;
          break;
        }
        default:
          return;
      }
      drawBall(x, y);
    },
    false,
  );
}

export function run(canvas) {
  const Config = {
    maxX: 63,
    maxY: 63,
    unit: 10,
  };
  const p = walk(63, 63);
  traverse(p, canvas, draw(canvas, Config, p), Config);
}

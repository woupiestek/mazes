export const Triangle_2_4_5 = {
  alpha: "\u03b1",
  beta: "\u03b2",
  supers: "\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079",
  empty: null,
  id: (path) => path?.id || "",
  append: (head, order, power) => {
    power %= order;
    if (power === 0) {
      return head;
    }
    if (head !== null && head.order === order) {
      return Triangle_2_4_5.append(head.head, order, head.power + power);
    }

    const id = (head === null ? "" : head.id) +
      (order === 5 ? Triangle_2_4_5.alpha : Triangle_2_4_5.beta) +
      (power > 1 ? Triangle_2_4_5.supers[power] : "");
    const candidate = { id, head, order, power };
    if (head === null) {
      return candidate;
    }

    if (head.power === 1 && head.head !== null) {
      return Triangle_2_4_5.appendAll(head.head, [
        order,
        order - 1,
        head.order,
        head.order - 1,
        order,
        order + power - 1,
      ]);
    }

    a: if (head !== null && power === order - 1) {
      let c = 0;
      let h = head;
      while (h !== null && h.power === h.order - 2) {
        c++;
        h = h.head;
      }
      if (h === null || h.power !== h.order - 1) {
        break a;
      }
      h = Triangle_2_4_5.append(h.head, (c & 1) === 0 ? order : 9 - order, 1);
      for (; c > 0; c--) {
        h = Triangle_2_4_5.append(h, (c & 1) === 0 ? 9 - order : order, 2);
      }
      return Triangle_2_4_5.append(h, 9 - order, 1);
    }

    return candidate;
  },
  appendAll: (head, tail) => {
    for (let i = 1, l = tail.length; i < l; i += 2) {
      head = Triangle_2_4_5.append(head, tail[i - 1], tail[i]);
    }
    return head;
  },
  match: (head, tail) => {
    while (tail.length > 0) {
      if (
        head === null ||
        head.power !== tail.pop() ||
        head.order !== tail.pop()
      ) {
        return false;
      }
      head = head.head;
    }
    return true;
  },
};

(() => {
  let _in = [null];
  let _out = [];
  let count = 0;
  const done = {};
  const fails = [];
  for (let i = 0; i < 20; i++) {
    for (const path of _in) {
      const org = Triangle_2_4_5.id(path);
      if (done[org]) {
        continue;
      }
      done[org] = true;
      const t1 = Triangle_2_4_5.id(
        Triangle_2_4_5.appendAll(path, [4, 1, 5, 1, 4, 1, 5, 1]),
      );
      if (t1 !== org) {
        fails.push(`${org} !== ${t1}`);
      }
      const t2 = Triangle_2_4_5.id(
        Triangle_2_4_5.appendAll(path, [5, 1, 4, 1, 5, 1, 4, 1]),
      );
      if (t2 !== org) {
        fails.push(`${org} !== ${t2}`);
      }
      count++;
      _out.push(Triangle_2_4_5.append(path, 4, 1));
      _out.push(Triangle_2_4_5.append(path, 5, 1));
    }
    _in = _out;
    _out = [];
  }
  console.log(count, fails.length, ...fails);
})();

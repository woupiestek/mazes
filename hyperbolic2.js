export const Triangle_2_3_7 = {
  alpha: "\u03b1",
  beta: "\u03b2",
  supers: "\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079",
  string: (x) => x?.id || "",
  empty: null,
  append: (head, prime, power) => {
    power %= prime;
    if (power === 0) {
      return head;
    }
    const id = (head !== null ? head.id : "") +
      (prime === 7 ? Triangle_2_3_7.alpha : Triangle_2_3_7.beta) +
      (power > 1 ? Triangle_2_3_7.supers[power] : "");
    const candidate = { head, power, prime, id };
    if (head === null) {
      return candidate;
    }

    if (head.prime === prime) {
      return Triangle_2_3_7.append(head.head, prime, power + head.power);
    }
    if (head.head !== null && head.power === head.prime - 1) {
      return Triangle_2_3_7.appendAll(head.head, [
        prime,
        1,
        head.prime,
        1,
        prime,
        power + 1,
      ]);
    }

    if (Triangle_2_3_7.match(candidate, [7, 1, 3, 1])) {
      return Triangle_2_3_7.appendAll(head.head, [3, 2, 7, 6]);
    }
    if (Triangle_2_3_7.match(candidate, [3, 1, 7, 1])) {
      return Triangle_2_3_7.appendAll(head.head, [7, 6, 3, 2]);
    }

    // β¹α²β¹ !== α⁶β¹α⁶
    if (Triangle_2_3_7.match(candidate, [3, 1, 7, 2, 3, 1])) {
      return Triangle_2_3_7.appendAll(head.head.head, [7, 6, 3, 1, 7, 6]);
    }

    if (Triangle_2_3_7.match(candidate, [3, 1, 7, 2])) {
      let h = head.head;
      let c = 1;
      while (Triangle_2_3_7.match(h, [3, 1, 7, 4])) {
        h = h.head.head;
        c++;
      }

      // α²β¹α⁴β¹α⁴β¹α³β¹ !== β²α⁵β¹α⁵β¹α⁵β¹α⁶
      // replacement sequence 1
      if (Triangle_2_3_7.match(h, [7, 2])) {
        h = Triangle_2_3_7.append(h.head, 3, 2);
        for (; c > 0; c--) {
          h = Triangle_2_3_7.appendAll(h, [7, 5, 3, 1]);
        }
        return Triangle_2_3_7.append(h, 3, 1);
      }

      // β¹α³β¹α⁴β¹α⁴β¹α² !== α⁶β¹α⁵β¹α⁵β¹α⁵β²
      // replacement sequence 5
      if (Triangle_2_3_7.match(h, [3, 1, 7, 3])) {
        h = Triangle_2_3_7.appendAll(h.head.head, [7, 6, 3, 1]);
        for (; c > 0; c--) {
          h = Triangle_2_3_7.appendAll(h, [7, 5, 3, 1]);
        }
        return Triangle_2_3_7.append(h, 3, 1);
      }
    }

    if (Triangle_2_3_7.match(candidate, [3, 1, 7, 3, 3, 1])) {
      let h = head.head.head;
      let c = 1;
      while (Triangle_2_3_7.match(h, [3, 1, 7, 4])) {
        h = h.head.head;
        c++;
      }

      // α²β¹α⁴β¹α⁴β¹α³β¹ !== β²α⁵β¹α⁵β¹α⁵β¹α⁶
      // replacement sequence 3
      if (Triangle_2_3_7.match(h, [7, 2])) {
        h = Triangle_2_3_7.append(h.head, 3, 2);
        for (; c > 0; c--) {
          h = Triangle_2_3_7.appendAll(h, [7, 5, 3, 1]);
        }
        return Triangle_2_3_7.append(h, 7, 6);
      }

      // β¹α³β¹α³β¹ !== α⁶β¹α⁵β¹α⁶
      // α⁶β¹α⁵β¹α⁵β¹α⁶ !== β¹α³β¹α⁴β¹α³β¹
      // replacement sequence 4
      if (Triangle_2_3_7.match(h, [3, 1, 7, 3])) {
        h = Triangle_2_3_7.appendAll(h.head.head, [7, 6, 3, 1]);
        for (; c > 0; c--) {
          h = Triangle_2_3_7.appendAll(h, [7, 5, 3, 1]);
        }
        return Triangle_2_3_7.append(h, 7, 6);
      }
    }

    return candidate;
  },
  appendAll: (head, tail) => {
    for (let i = 0, l = tail.length; i + 1 < l; i += 2) {
      head = Triangle_2_3_7.append(head, tail[i], tail[i + 1]);
    }
    return head;
  },
  match: (head, tail) => {
    while (tail.length > 0) {
      if (
        head === null ||
        head.power !== tail.pop() ||
        head.prime !== tail.pop()
      ) {
        return false;
      }
      head = head.head;
    }
    return true;
  },
};

function test() {
  let _in = [null];
  let _out = [];
  let count = 0;
  const done = {};
  const fails = [];
  for (let i = 0; i < 20; i++) {
    for (const path of _in) {
      const org = Triangle_2_3_7.string(path);
      if (done[org]) {
        continue;
      }
      done[org] = true;
      const t1 = Triangle_2_3_7.string(
        Triangle_2_3_7.appendAll(path, [3, 1, 7, 1, 3, 1, 7, 1]),
      );
      if (t1 !== org) {
        fails.push(`${org} !== ${t1}`);
      }
      const t2 = Triangle_2_3_7.string(
        Triangle_2_3_7.appendAll(path, [7, 1, 3, 1, 7, 1, 3, 1]),
      );
      if (t2 !== org) {
        fails.push(`${org} !== ${t2}`);
      }
      count++;
      _out.push(Triangle_2_3_7.append(path, 3, 1));
      _out.push(Triangle_2_3_7.append(path, 7, 1));
    }
    _in = _out;
    _out = [];
  }
  console.log(count, fails.length, ...fails);
}

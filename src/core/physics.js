const constants = {
  Gravity: 10,
};

class Physics {
  static gravity() {
    return constants.Gravity;
  }

  static setGravity(g = 10) {
    constants.Gravity = g;
  }

  static jump({
    height,
    totalRedraw,
    current,
    g = constants.Gravity,
  }) {
    const _t = Math.sqrt(2 * height / g);
    const t = _t * current / totalRedraw;
    const v0 = _t / g;
    const vt = v0 - g * t;
    return {
      offset: vt * _t / totalRedraw,
    };
  }

  static freeFall({
    v,
    a = constants.Gravity,
  }) {
    const nv = v + a;
    return {
      v: nv,
      a: a + constants.Gravity,
      offset: nv / 10,
    };
  }
}

export default Physics;

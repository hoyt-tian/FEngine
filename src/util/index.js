const EventListener = {
  listen(el, handlerBaseName, cb) {
    if (el.addEventListener) {
      el.addEventListener(handlerBaseName, cb, false);
    } else if (el.attachEvent) {
      el.attachEvent(`on${handlerBaseName}`, cb);
    }
  },

  capture(el, handlerBaseName, cb) {
    if (!el.addEventListener) {
      console.error('You are attempting to use addEventlistener ' +
            'in a browser that does not support it support it.' +
            'This likely means that you will not receive events that ' +
            'your application relies on (such as scroll).');
      return;
    }
    el.addEventListener(handlerBaseName, cb, true);
  },
};

const clone = obj => JSON.parse(JSON.stringify(obj));

/**
 * convert px to rem
 * @param {} px
 */
const p2r = px => (px / 100).toFixed(2);

const p2rem = px => `${p2r(px)}rem`;

export { EventListener, clone, p2r, p2rem };

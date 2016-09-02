export const ready =
  function ready(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

export const keys = {
  A: 65,
  D: 68,
  S: 83,
  W: 87
}

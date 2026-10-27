/** Small helpers shared by the route modules. */

export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function asString(value, { max = 500 } = {}) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

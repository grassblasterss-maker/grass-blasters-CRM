export function methodNotAllowed(res, methods) {
  res.setHeader('Allow', methods.join(', '));
  return res.status(405).json({ error: 'method_not_allowed', allowed: methods });
}

export function getHeader(req, name) {
  const value = req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export function contentLengthTooLarge(req, limitBytes = 1_000_000) {
  const raw = getHeader(req, 'content-length');
  if (!raw) return false;
  const length = Number(raw);
  return Number.isFinite(length) && length > limitBytes;
}

export function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function requiredStrings(object, fields) {
  return fields.filter((field) => typeof object[field] !== 'string' || !object[field].trim());
}

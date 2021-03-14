import { isObject, isArray, validateProp, hasOwn } from './componentProps';

export default function objectValidator(options) {
  return (rawValues) => {
    if (!isObject(rawValues)) return false;
    for (const key in options) {
      let opt = options[key]
      if (opt == null) continue
      if (!isObject(opt) || isArray(opt)) {
        opt = { type: opt, required: true }
      }
      if (!validateProp(key, rawValues[key], opt, !hasOwn(rawValues, key))) {
        return false;
      }
    }
    return true;
  }
}
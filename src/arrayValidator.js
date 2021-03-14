import { isObject, isArray, validateProp } from './componentProps';

export default function arrayValidator(opt) {
  return (rawValues) => {
    if (!isArray(rawValues)) return false;
    if (!isObject(opt) || isArray(opt)) {
      opt = { type: opt, required: true }
    }
    return rawValues.every((element, i) => validateProp(i, element, opt, false))
  }
}
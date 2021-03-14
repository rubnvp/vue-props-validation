"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.objectValidator = objectValidator;
exports.arrayValidator = arrayValidator;

/** Object validator */
function objectValidator(options) {
  return rawValues => {
    if (!isObject(rawValues)) return false;

    for (const key in options) {
      let opt = options[key];
      if (opt == null) continue;

      if (!isObject(opt) || isArray(opt)) {
        opt = {
          type: opt,
          required: true
        };
      }

      if (!validateProp(key, rawValues[key], opt, !hasOwn(rawValues, key))) {
        return false;
      }
    }

    return true;
  };
}
/** Array validator */


function arrayValidator(opt) {
  return rawValues => {
    if (!isArray(rawValues)) return false;

    if (!isObject(opt) || isArray(opt)) {
      opt = {
        type: opt,
        required: true
      };
    }

    return rawValues.every((element, i) => validateProp(i, element, opt, false));
  };
}
/** Code from vue-next repository: https://github.com/vuejs/vue-next/blob/1a955e22785cd3fea32b80aa58049c09bba4e321/packages/runtime-core/src/componentProps.ts#L476 */


const hasOwnProperty = Object.prototype.hasOwnProperty;

const hasOwn = (val, key) => hasOwnProperty.call(val, key); // use function string name to check type constructors
// so that it works across vms / iframes.


function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : '';
}

function makeMap(str, expectsLowerCase) {
  const map = Object.create(null);
  const list = str.split(',');

  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }

  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
}

const isSimpleType = makeMap('String,Number,Boolean,Function,Symbol,BigInt');

const isObject = val => val !== null && typeof val === 'object';

const isArray = Array.isArray;

function assertType(value, type) {
  let valid;
  const expectedType = getType(type);

  if (isSimpleType(expectedType)) {
    const t = typeof value;
    valid = t === expectedType.toLowerCase(); // for primitive wrapper objects

    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isObject(value);
  } else if (expectedType === 'Array') {
    valid = isArray(value);
  } else {
    valid = value instanceof type;
  }

  return {
    valid,
    expectedType
  };
}

function validateProp(name, value, prop, isAbsent) {
  const {
    type,
    required,
    validator
  } = prop; // required!

  if (required && isAbsent) {
    //   console.warn('Missing required prop: "' + name + '"')
    return false;
  } // missing but optional


  if (value == null && !prop.required) {
    return true;
  } // type check


  if (type != null && type !== true) {
    let isValid = false;
    const types = isArray(type) ? type : [type]; // const expectedTypes = []
    // value is valid as long as one of the specified types match

    for (let i = 0; i < types.length && !isValid; i++) {
      const {
        valid,
        expectedType
      } = assertType(value, types[i]); // expectedTypes.push(expectedType || '')

      isValid = valid;
    }

    if (!isValid) {
      // console.warn(getInvalidTypeMessage(name, value, expectedTypes))
      return false;
    }
  } // custom validator


  if (validator && !validator(value)) {
    // warn('Invalid prop: custom validator check failed for prop "' + name + '".')
    return false;
  }

  return true;
}
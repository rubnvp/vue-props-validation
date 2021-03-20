/** Config */

const config = {
  enabled: true,
  logLevel: 'error',
};
const logLevels = ['none', 'warn', 'error', 'throw'];

export function setConfig({enabled, logLevel}) {
  if (enabled != null) {
    config.enabled = Boolean(enabled);
  }
  if (logLevel != null)  {
    if (!logLevels.includes(logLevel)) {
      throw new Error(`Invalid log level: ${logLevel}, specify one of these: ${logLevels.join()}`)
    }
    config.logLevel = logLevel;
  }
}

/** Object validator */

export function objectValidator(options) {
  return (rawValues) => {
    if (!config.enabled) return true // skip validations if disabled
    if (!isObject(rawValues)) return false
    for (const key in options) {
      let opt = options[key]
      if (opt == null) continue
      if (!isObject(opt) || isArray(opt)) {
        opt = { type: opt, required: true }
      }
      if (!validateProp(key, rawValues[key], opt, !hasOwn(rawValues, key), 'objectValidator')) {
        return false
      }
    }
    return true
  }
}

/** Array validator */

export function arrayValidator(opt) {
  return (rawValues) => {
    if (!config.enabled) return true // skip validations if disabled
    if (!isArray(rawValues)) return false
    if (!isObject(opt) || isArray(opt)) {
      opt = { type: opt, required: true }
    }
    return rawValues.every((element, i) => validateProp(i, element, opt, false, 'arrayValidator'))
  }
}

/** Logging */

function log(message) {
  const logLevel = config.logLevel;
  if (logLevel === 'none') return;
  message =`[VueProps] ${message}`;
  if (logLevel === 'throw') throw new Error(message);
  console[logLevel](message);
}

const fnPropName = {
  'objectValidator': 'prop',
  'arrayValidator': 'element',
}

/** Code from vue-next repository: https://github.com/vuejs/vue-next/blob/1a955e22785cd3fea32b80aa58049c09bba4e321/packages/runtime-core/src/componentProps.ts#L476 */

function validateProp(name, value, prop, isAbsent, fnName) {
  const { type, required, validator } = prop
  // required!
  if (required && isAbsent) {
    log('Missing required prop: "' + name + '"')
    return false
  }
  // missing but optional
  if (value == null && !prop.required) {
    return true
  }
  // type check
  if (type != null && type !== true) {
    let isValid = false
    const types = isArray(type) ? type : [type]
    const expectedTypes = []
    // value is valid as long as one of the specified types match
    for (let i = 0; i < types.length && !isValid; i++) {
      const { valid, expectedType } = assertType(value, types[i])
      expectedTypes.push(expectedType || '')
      isValid = valid
    }
    if (!isValid) {
      log(getInvalidTypeMessage(name, value, expectedTypes, fnName))
      return false
    }
  }
  // custom validator
  if (validator && !validator(value)) {
    const propName = fnName === 'objectValidator' ? `"${name}"` : name;
    log(`Invalid ${fnPropName[fnName]}: custom validator check failed for ${fnPropName[fnName]} ${propName}.`)
    return false
  }
  return true
}

function assertType(value, type) {
  let valid
  const expectedType = getType(type)
  if (isSimpleType(expectedType)) {
    const t = typeof value
    valid = t === expectedType.toLowerCase()
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type
    }
  } else if (expectedType === 'Object') {
    valid = isObject(value)
  } else if (expectedType === 'Array') {
    valid = isArray(value)
  } else {
    valid = value instanceof type
  }
  return {
    valid,
    expectedType
  }
}

// use function string name to check type constructors
// so that it works across vms / iframes.
function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

const isSimpleType = makeMap(
  'String,Number,Boolean,Function,Symbol,BigInt'
)

function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}

const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (val, key) => hasOwnProperty.call(val, key)

const isObject = (val) => val !== null && typeof val === 'object'
const isArray = Array.isArray

function getInvalidTypeMessage(name, value, expectedTypes, fnName) {
  const propName = fnName === 'objectValidator' ? `"${name}"` : name;
  let message =
    `Invalid ${fnPropName[fnName]}: type check failed for ${fnPropName[fnName]} ${propName}.` +
    ` Expected ${expectedTypes.map(capitalize).join(', ')}`
  const expectedType = expectedTypes[0]
  const receivedType = toRawType(value)
  const expectedValue = styleValue(value, expectedType)
  const receivedValue = styleValue(value, receivedType)
  // check if we need to specify expected value
  if (
    expectedTypes.length === 1 &&
    isExplicable(expectedType) &&
    !isBoolean(expectedType, receivedType)
  ) {
    message += ` with value ${expectedValue}`
  }
  message += `, got ${receivedType}`
  // check if we need to specify received value
  if (isExplicable(receivedType)) {
    message += ` with value ${receivedValue}.`
  }
  return message
}

const cacheStringFunction = (fn) => {
  const cache = Object.create(null)
  return ((str) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  })
}

const capitalize = cacheStringFunction(
  (str) => str.charAt(0).toUpperCase() + str.slice(1)
)

const toRawType = (value) => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

const toTypeString = (value) =>
  objectToString.call(value)

const objectToString = Object.prototype.toString

function styleValue(value, type) {
  if (type === 'String') {
    return `"${value}"`
  } else if (type === 'Number') {
    return `${Number(value)}`
  } else {
    return `${value}`
  }
}

function isExplicable(type) {
  const explicitTypes = ['string', 'number', 'boolean']
  return explicitTypes.some(elem => type.toLowerCase() === elem)
}

function isBoolean(...args) {
  return args.some(elem => elem.toLowerCase() === 'boolean')
}
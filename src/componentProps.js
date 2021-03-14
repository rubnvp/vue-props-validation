const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (val, key) => hasOwnProperty.call(val, key)

// use function string name to check type constructors
// so that it works across vms / iframes.
function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}

const isSimpleType = makeMap(
  'String,Number,Boolean,Function,Symbol,BigInt'
)

export const isObject = (val) => val !== null && typeof val === 'object'
export const isArray = Array.isArray

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

export function validateProp(name, value, prop, isAbsent) {
  const { type, required, validator } = prop
  // required!
  if (required && isAbsent) {
    //   console.warn('Missing required prop: "' + name + '"')
    return false;
  }
  // missing but optional
  if (value == null && !prop.required) {
    return true;
  }
  // type check
  if (type != null && type !== true) {
    let isValid = false
    const types = isArray(type) ? type : [type]
    // const expectedTypes = []
    // value is valid as long as one of the specified types match
    for (let i = 0; i < types.length && !isValid; i++) {
      const { valid, expectedType } = assertType(value, types[i])
      // expectedTypes.push(expectedType || '')
      isValid = valid
    }
    if (!isValid) {
      // console.warn(getInvalidTypeMessage(name, value, expectedTypes))
      return false;
    }
  }
  // custom validator
  if (validator && !validator(value)) {
    // warn('Invalid prop: custom validator check failed for prop "' + name + '".')
    return false;
  }
  return true;
}
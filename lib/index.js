(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.VueProps = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setConfig = setConfig;
  _exports.objectValidator = objectValidator;
  _exports.arrayValidator = arrayValidator;

  function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  /** Config */
  var config = {
    enabled: true,
    logLevel: 'error'
  };
  var logLevels = ['none', 'warn', 'error', 'throw'];

  function setConfig(_ref) {
    var enabled = _ref.enabled,
        logLevel = _ref.logLevel;

    if (enabled != null) {
      config.enabled = Boolean(enabled);
    }

    if (logLevel != null) {
      if (!logLevels.includes(logLevel)) {
        throw new Error("Invalid log level: ".concat(logLevel, ", specify one of these: ").concat(logLevels.join()));
      }

      config.logLevel = logLevel;
    }
  }
  /** Object validator */


  function objectValidator(options) {
    return function (rawValues) {
      if (!config.enabled) return true; // skip validations if disabled

      if (!isObject(rawValues)) return false;

      for (var key in options) {
        var opt = options[key];
        if (opt == null) continue;

        if (!isObject(opt) || isArray(opt)) {
          opt = {
            type: opt,
            required: true
          };
        }

        if (!validateProp(key, rawValues[key], opt, !hasOwn(rawValues, key), 'objectValidator')) {
          return false;
        }
      }

      return true;
    };
  }
  /** Array validator */


  function arrayValidator(opt) {
    return function (rawValues) {
      if (!config.enabled) return true; // skip validations if disabled

      if (!isArray(rawValues)) return false;

      if (!isObject(opt) || isArray(opt)) {
        opt = {
          type: opt,
          required: true
        };
      }

      return rawValues.every(function (element, i) {
        return validateProp(i, element, opt, false, 'arrayValidator');
      });
    };
  }
  /** Logging */


  function log(message) {
    var logLevel = config.logLevel;
    if (logLevel === 'none') return;
    message = "[VueProps] ".concat(message);
    if (logLevel === 'throw') throw new Error(message);
    console[logLevel](message);
  }

  var fnPropName = {
    'objectValidator': 'prop',
    'arrayValidator': 'element'
  };
  /** Code from vue-next repository: https://github.com/vuejs/vue-next/blob/1a955e22785cd3fea32b80aa58049c09bba4e321/packages/runtime-core/src/componentProps.ts#L476 */

  function validateProp(name, value, prop, isAbsent, fnName) {
    var type = prop.type,
        required = prop.required,
        validator = prop.validator; // required!

    if (required && isAbsent) {
      log('Missing required prop: "' + name + '"');
      return false;
    } // missing but optional


    if (value == null && !prop.required) {
      return true;
    } // type check


    if (type != null && type !== true) {
      var isValid = false;
      var types = isArray(type) ? type : [type];
      var expectedTypes = []; // value is valid as long as one of the specified types match

      for (var i = 0; i < types.length && !isValid; i++) {
        var _assertType = assertType(value, types[i]),
            valid = _assertType.valid,
            expectedType = _assertType.expectedType;

        expectedTypes.push(expectedType || '');
        isValid = valid;
      }

      if (!isValid) {
        log(getInvalidTypeMessage(name, value, expectedTypes, fnName));
        return false;
      }
    } // custom validator


    if (validator && !validator(value)) {
      var propName = fnName === 'objectValidator' ? "\"".concat(name, "\"") : name;
      log("Invalid ".concat(fnPropName[fnName], ": custom validator check failed for ").concat(fnPropName[fnName], " ").concat(propName, "."));
      return false;
    }

    return true;
  }

  function assertType(value, type) {
    var valid;
    var expectedType = getType(type);

    if (isSimpleType(expectedType)) {
      var t = _typeof(value);

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
      valid: valid,
      expectedType: expectedType
    };
  } // use function string name to check type constructors
  // so that it works across vms / iframes.


  function getType(ctor) {
    var match = ctor && ctor.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : '';
  }

  var isSimpleType = makeMap('String,Number,Boolean,Function,Symbol,BigInt');

  function makeMap(str, expectsLowerCase) {
    var map = Object.create(null);
    var list = str.split(',');

    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }

    return expectsLowerCase ? function (val) {
      return !!map[val.toLowerCase()];
    } : function (val) {
      return !!map[val];
    };
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var hasOwn = function hasOwn(val, key) {
    return hasOwnProperty.call(val, key);
  };

  var isObject = function isObject(val) {
    return val !== null && _typeof(val) === 'object';
  };

  var isArray = Array.isArray;

  function getInvalidTypeMessage(name, value, expectedTypes, fnName) {
    var propName = fnName === 'objectValidator' ? "\"".concat(name, "\"") : name;
    var message = "Invalid ".concat(fnPropName[fnName], ": type check failed for ").concat(fnPropName[fnName], " ").concat(propName, ".") + " Expected ".concat(expectedTypes.map(capitalize).join(', '));
    var expectedType = expectedTypes[0];
    var receivedType = toRawType(value);
    var expectedValue = styleValue(value, expectedType);
    var receivedValue = styleValue(value, receivedType); // check if we need to specify expected value

    if (expectedTypes.length === 1 && isExplicable(expectedType) && !isBoolean(expectedType, receivedType)) {
      message += " with value ".concat(expectedValue);
    }

    message += ", got ".concat(receivedType); // check if we need to specify received value

    if (isExplicable(receivedType)) {
      message += " with value ".concat(receivedValue, ".");
    }

    return message;
  }

  var cacheStringFunction = function cacheStringFunction(fn) {
    var cache = Object.create(null);
    return function (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };

  var capitalize = cacheStringFunction(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  var toRawType = function toRawType(value) {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1);
  };

  var toTypeString = function toTypeString(value) {
    return objectToString.call(value);
  };

  var objectToString = Object.prototype.toString;

  function styleValue(value, type) {
    if (type === 'String') {
      return "\"".concat(value, "\"");
    } else if (type === 'Number') {
      return "".concat(Number(value));
    } else {
      return "".concat(value);
    }
  }

  function isExplicable(type) {
    var explicitTypes = ['string', 'number', 'boolean'];
    return explicitTypes.some(function (elem) {
      return type.toLowerCase() === elem;
    });
  }

  function isBoolean() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.some(function (elem) {
      return elem.toLowerCase() === 'boolean';
    });
  }
});
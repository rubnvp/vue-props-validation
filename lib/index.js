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
  _exports.objectValidator = objectValidator;
  _exports.arrayValidator = arrayValidator;

  function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  /** Object validator */
  function objectValidator(options) {
    return function (rawValues) {
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

        if (!validateProp(key, rawValues[key], opt, !hasOwn(rawValues, key))) {
          return false;
        }
      }

      return true;
    };
  }
  /** Array validator */


  function arrayValidator(opt) {
    return function (rawValues) {
      if (!isArray(rawValues)) return false;

      if (!isObject(opt) || isArray(opt)) {
        opt = {
          type: opt,
          required: true
        };
      }

      return rawValues.every(function (element, i) {
        return validateProp(i, element, opt, false);
      });
    };
  }
  /** Code from vue-next repository: https://github.com/vuejs/vue-next/blob/1a955e22785cd3fea32b80aa58049c09bba4e321/packages/runtime-core/src/componentProps.ts#L476 */


  function validateProp(name, value, prop, isAbsent) {
    var type = prop.type,
        required = prop.required,
        validator = prop.validator; // required!

    if (required && isAbsent) {
      //   console.warn('Missing required prop: "' + name + '"')
      return false;
    } // missing but optional


    if (value == null && !prop.required) {
      return true;
    } // type check


    if (type != null && type !== true) {
      var isValid = false;
      var types = isArray(type) ? type : [type]; // const expectedTypes = []
      // value is valid as long as one of the specified types match

      for (var i = 0; i < types.length && !isValid; i++) {
        var _assertType = assertType(value, types[i]),
            valid = _assertType.valid,
            expectedType = _assertType.expectedType; // expectedTypes.push(expectedType || '')


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
});
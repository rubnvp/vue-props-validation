import { expect, test } from '@jest/globals';
import {objectValidator, arrayValidator, setConfig} from './index';

// mock console output to check validation error messages
global.console = {
  error: jest.fn(),
  warn: jest.fn(),
};

afterEach(() => {
  Object.values(global.console).forEach(fn => fn.mockClear()) // clean mocks
  setConfig({enabled: true, logLevel: 'error'}) // reset default global config
})

describe('objectValidator', () => {

  test('valid object attribute', () => {
    expect(objectValidator({ name: String })({ name: 'Chili' })).toBe(true);
  })

  test('invalid object attribute', () => {
    expect(objectValidator({ name: String })({ name: 123 })).toBe(false);
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid prop: type check failed for prop "name". Expected String with value "123", got Number with value 123.')
  })

  test('native constructors', () => {
    expect(objectValidator({value: String})({value: 'string'})).toBe(true);
    expect(objectValidator({value: Number})({value: 123})).toBe(true);
    expect(objectValidator({value: Boolean})({value: false})).toBe(true);
    expect(objectValidator({value: Object})({value: {val: 1}})).toBe(true);
    expect(objectValidator({value: Array})({value: [1, 2]})).toBe(true);
    expect(objectValidator({value: Function})({value: function(){return 'fun'}})).toBe(true);
    expect(objectValidator({value: Symbol})({value: Symbol('foo')})).toBe(true);
    expect(objectValidator({value: BigInt})({value: BigInt("9007199254740991")})).toBe(true);
    expect(objectValidator({value: Date})({value: new Date()})).toBe(true);
    function Person (firstName, lastName) {
      this.firstName = firstName
      this.lastName = lastName
    }
    expect(objectValidator({value: new Person('John', 'Doe')})({value: Person})).toBe(true);
  })

  test('required object attribute', () => {
    expect(
      objectValidator({
        name: {type: String, required: true}
      })({ id: 'Peppers' })
    ).toBe(false);
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Missing required prop: "name"')
  })

  test('non required object attribute', () => {
    expect(
      objectValidator({
        name: {type: String, required: false}
      })({ id: 'Peppers' })
    ).toBe(true);
  })

  test('multiple types validation', () => {
    const validator = objectValidator({
      id: [Number, String],
    });
    expect(
      validator({ id: 'Peppers' })
    ).toBe(true);
    expect(
      validator({ id: 123 })
    ).toBe(true);
    expect(
      validator({ id: false })
    ).toBe(false);
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid prop: type check failed for prop "id". Expected Number, String, got Boolean with value false.')
  })

  test('custom validator', () => {
    const validator = objectValidator({
      email: {
        type: String,
        validator: email => email.includes('@'),
      },
    });
    expect(validator({ email: 'hello@google.com' })).toBe(true);
    expect(validator({ email: 'not an email' })).toBe(false);
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid prop: custom validator check failed for prop "email".')
  })

  test('nested object validator', () => {
    const validator = objectValidator({
      name: String,
      animal: {
        type: Object,
        validator: objectValidator({
          id: [Number, String],
        })
      }
    });
    expect(validator({
      name: 'Chili',
      animal: {
        id: 2,
      },
    })).toBe(true);
    expect(validator({
      name: 'Chili',
      animal: {
        id: ['_id_'],
      },
    })).toBe(false);
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid prop: type check failed for prop "id". Expected Number, String, got Array')
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid prop: custom validator check failed for prop "animal".')
  })
})

describe('arrayValidator', () => {

  test('valid array', () => {
    expect(arrayValidator(Number)([1, 2, 3])).toBe(true);
  })

  test('invalid array', () => {
    expect(arrayValidator(Number)([1, '2', 3])).toBe(false);
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid element: type check failed for element 1. Expected Number with value 2, got String with value "2".')
  })

  test('multiple types array', () => {
    expect(arrayValidator([Number, String])([1, '2', 3])).toBe(true);
    expect(arrayValidator([Number, String])([1, '2', {}])).toBe(false);
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid element: type check failed for element 2. Expected Number, String, got Object')
  })

  test('element custom validator', () => {
    const validator = arrayValidator({
      type: Number,
      validator: num => num > 18,
    });
    expect(validator([21, 35, 100])).toBe(true);
    expect(validator([21, 17, 100])).toBe(false);
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid element: custom validator check failed for element 1.')
  })
})

describe('object and array validators together', () => {

  test('validate objects array', () => {
    const validator = arrayValidator({
      type: Object,
      validator: objectValidator({
        id: Number,
        name: String,
        isCat: Boolean,
      }),
    });
    expect(validator([
      {id: 1, name: 'chili', isCat: true},
      {id: 2, name: 'Peppers', isCat: false},
    ])).toBe(true);
    expect(validator([
      {id: 1, name: 'chili', isCat: true},
      {id: 2, name: 'Peppers', isCat: 'yes'},
    ])).toBe(false);
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid prop: type check failed for prop "isCat". Expected Boolean, got String with value "yes".')
    expect(global.console.error)
      .toHaveBeenCalledWith('[VueProps] Invalid element: custom validator check failed for element 1.')
  })
})

describe('config', () => {

  test('if disabled then should pass even invalid validations', () => {
    setConfig({enabled: false})
    expect(objectValidator({ name: String })({ name: 123 })).toBe(true);
    expect(arrayValidator(Number)([1, '2', 3])).toBe(true);
  })

  test('change log level to console.warn', () => {
    setConfig({logLevel: 'warn'});
    arrayValidator(Number)([1, '2', 3]);
    expect(global.console.warn)
      .toHaveBeenCalledWith('[VueProps] Invalid element: type check failed for element 1. Expected Number with value 2, got String with value "2".')
  })
})
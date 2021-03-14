import {objectValidator, arrayValidator} from '../index';

describe('objectValidator', () => {

  test('validate object', () => {
    const validator = objectValidator({
      name: String,
      age: Number,
      animal: {
        type: Object,
        validator: objectValidator({
          id: [Number, String],
        })
      }
    });
    const value = {
      name: 'Chili',
      age: 1,
      animal: {
        id: 2,
      },
    };
    expect(validator(value)).toBeTruthy();
  })
})

describe('arrayValidator', () => {

  test('validate numbers array', () => {
    expect(arrayValidator(Number)([1, 2, 3])).toBeTruthy();
  })

  test('validate emails array', () => {
    const validator = arrayValidator({
        type: [String, Number],
        validator: value => value.includes('@'),
      });
    const value = ['hola@gmail.com', 'hola2@gmail.com', 'ruben@'];
    expect(validator(value)).toBeTruthy();
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
    const value = [{id: 1, name: 'chili', isCat: true}, {id: 2, name: 'Peppers', isCat: false}]
    expect(validator(value)).toBeTruthy();
  })
})
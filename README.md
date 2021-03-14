# vue-props-validation
Vue props validation logic extracted for nested validation in object and arrays.

## Install

```bash
npm install vue-props-validation
```

## Usage
You can write validations for object attributes and array elements in the Vue syntax way (without `default`). You can also validate any other object or array outside vue props.

### Objects validator
```js
import {objectValidator} from 'vue-props-validation';

props: {
  email: String,
  user: {
    type: Object,
    validator: objectValidator({
      id: Number,
      firstName: String,
      lastName: {type: String, required: false},
      age: Number,
    }),
  },
}
```

### Arrays validator
```js
import {arrayValidator} from 'vue-props-validation';

props: {
  names: arrayValidator(String),
  emails: arrayValidator({
    type: String,
    validator: email => email.includes('@'),
  }),
}
```

### Combined use of both validators
You can nest validators as much as you want.
```js
import {arrayValidator, objectValidator} from 'vue-props-validation';

props: {
  animals: arrayValidator({
    type: Object,
    validator: objectValidator({
      id: [String, Number],
      name: String,
      age: Number,
      isCat: Boolean,
      vaccinationDates: {
        type: Array,
        required: false,
        validator: arrayValidator([Date, String, Number]),
      }
    }),
  }),
}
```

### API response validation example
```js
import {arrayValidator, objectValidator} from 'vue-props-validation';

fetch('https://raw.githubusercontent.com/rubnvp/vue-pokedex/master/data/pokemons.json') 
  .then(response => response.json())
  .then(pokemons => {
      const isValid = arrayValidator({
        type: Object,
        validator: objectValidator({
          id: Number,
          name: String,
          types: Array,
        }),
      });
      if (!isValid) console.error('invalid pokemons response');
  });
```
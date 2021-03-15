# vue-props-validation
Vue props validation logic extracted for nested validation in object and arrays.

## Install

```bash
npm install vue-props-validation
```

## Usage
You can write validations for object attributes and array elements in the Vue syntax way (vue validators are not executed in production). You can also validate any other object or array outside vue props.

### Objects validation
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

### Arrays validation
```js
import {arrayValidator} from 'vue-props-validation';

props: {
  names: {
    type: Array,
    validator: arrayValidator(String),
  },
  emails: {
    type: Array,
    validator: arrayValidator({
      type: String,
      validator: email => email.includes('@'),
    }),
  },
}
```

### Combined use of both validators
You can nest validators as much as you want.
```js
import {arrayValidator, objectValidator} from 'vue-props-validation';

props: {
  animals: {
    type: Array,
    validator: arrayValidator({
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
  },
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
      })(pokemons);
      if (!isValid) console.error('invalid pokemons response');
  });
```

## Notes
Like in Vue, the type can be any native or custom constructor: String, Number, Boolean, Array, Object, Date, Function, Symbol, BigInt, etc. ⚠️  The attribute `default` is not supported in order to avoid mutating props.

## Todo roadmap
- Detailed messages of why the validation fails with log level option.
- Option for global or local flags to skip validation in production mode (like Vue props).
- Include a plugin to avoid imports on every component.

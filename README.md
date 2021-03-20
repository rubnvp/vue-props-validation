# vue-props-validation
Vue props validation logic extracted for nested validation in object and arrays.

## Install

```bash
npm install vue-props-validation
```

## Usage
You can write validations for object attributes and array elements in the Vue syntax way using the validator attribute. You can also validate any other object or array outside vue props.

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
      arrayValidator({ // this will return false and log an error to the console if it fails
        type: Object,
        validator: objectValidator({
          id: Number,
          name: String,
          types: Array,
        }),
      })(pokemons);
  });
```

## Config
### enabled
You can enable or disable all validators in order to skip validations in production enviroments and avoid possible performance issues:
```js
// at main.js
import {setConfig} from 'vue-props-validation';

setConfig({enabled: process.env.NODE_ENV !== 'production'});
```
### logLevel
Also you can choose the log level for validation message errors between:
- `none`: no logs
- `warn`: logs with console.warn
- `error`: logs with console.error (by default)
- `throw`: logs in exceptions
```js
// at main.js
import {setConfig} from 'vue-props-validation';

setConfig({logLevel: 'warn'});
```

## Usage from script tag
You can point to unpkg.com. An object called VueProps with the functions will be added to the global scope.
```html
<script src="https://unpkg.com/vue-props-validation"></script>
```

## Notes
 Remember that vue validators are not executed in production enviroments. Like in Vue, the type can be any native or custom constructor: String, Number, Boolean, Array, Object, Date, Function, Symbol, BigInt, etc. The attribute `default` is not supported in order to avoid mutating props.

## Todo roadmap
- Option for local config to overwrite global config.
- Include a plugin to avoid imports on every component.

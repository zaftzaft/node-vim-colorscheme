# node-vim-colorscheme

## Installation
```bash
$ npm i node-vim-colorscheme
```

## Usage
```js
  var vimcs = require("node-vim-colorscheme");

  vimcs.init({
    useCache: true
  }, function(){
    console.log(
      vimcs("Todo")("vim TODO color")
    );
  });
```

```js
  // Node.js v0.12
  var vimcs = require("node-vim-colorscheme");
  vimcs.initSync({
    useCache: true
  });
  console.log(vimcs("Todo")("vim TODO color"));
```

## API
+ vimcs.init(options, callback)
+ vimcs.initSync(options)
  + `options` -
    + `useCache` - default: `false`
    + `cachePath` - default: `./vimcs`
    + `filetype` - e.g. `js`
+ vimcs(colorName, option, attr)
  + `colorName` - highlight name. e.g. `String`, `Function`. See more, in Vim :highlight commands
  + `option` - `fg` or `bg`. default: both
  + `attr` - `boolean`. default: `false`


## Todo

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

## API
+ vimcs.init(options, callback)
  + `options` -
    + `useCache` - default: `false`
    + `cachePath` - default: `./vimcs`
+ vimcs(colorName, option, attr)
  + `colorName` - highlight name. e.g. `String`, `Function`. See more, in Vim :highlight commands
  + `option` - `fg` or `bg`. default: both
  + `attr` - `boolean`. default: `false`

## Todo
+ support iojs and node v0.12 (use spawnSync)

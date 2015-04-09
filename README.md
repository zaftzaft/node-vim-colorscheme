# node-vim-colorscheme

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

## Todo
+ ~~basic API~~
+ support iojs and node v0.12 (use spawnSync)

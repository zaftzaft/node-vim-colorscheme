var vimcs = require("../");

vimcs.init({
  useCache: false,
  filetype: process.argv[2] || "js"
}, function(){
  Object.keys(vimcs.colors).forEach(function(name){
    vimcs.colors[name].ctermfg && console.log(
      vimcs(name)(name),
      vimcs.colors[name].ctermfg
    );
  });
});

var vimcs = require("../");

vimcs.initSync({
  //useCache: true,
  filetype: "js"
});

console.log(vimcs("Todo")("vim TODO color"));
console.log(vimcs("javaScriptIdentifier")("JavaScript"));

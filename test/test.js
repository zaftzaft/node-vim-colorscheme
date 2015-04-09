var vimcs = require("../");

vimcs.init({
  useCache: true
}, function(){
  console.log(vimcs("MatchParen")("Str"));
  console.log(vimcs("MatchParen", "bg")("Str"));
  console.log(vimcs("SpellLocal", "", true)("Str"));
  console.log(vimcs("SpellLocal", "fg")("Str"));
  console.log(vimcs("Todo")("vim TODO color"));
});

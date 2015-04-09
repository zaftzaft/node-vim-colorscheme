var vimcs = require("../");

vimcs.init({
  useCache: true
}, function(){
  console.log(vimcs("MatchParen")("Str"));
  console.log(vimcs("MatchParen", "bg")("Str"));
  console.log(vimcs("SpellLocal")("Str"));
  console.log(vimcs("SpellLocal", "fg")("Str"));
});

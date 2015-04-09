var fs    = require("fs");
var spawn = require("child_process").spawn;
var temp  = require("temp").track();

var colors = {};
var reHi = /^([\w]+)\s+xxx\s+(.+)$/;
var reLink = /^links to ([\w]+)$/;

var rediHi = function(filePath, callback){
  var vim = spawn("vim", ["-e", "+redi! > " + filePath, "+hi", "+q!"], {
    stdio: [
      process.stdin,
      process.stdout,
      process.stderr
    ]
  });

  vim.on("close", callback);

  return vim;
};

var init = function(options, callback){
  options = {
    useCache: options.useCache || false,
    cachePath: options.cachePath || "./vimcs"
  };

  var readCache = function(){
    fs.readFile(options.cachePath, "utf8", function(err, data){
      parse(data);
      callback();
    });
  };

  if(options.useCache){
    return fs.exists(options.cachePath, function(exists){
      if(exists){
        readCache();
      }
      else{
        rediHi(options.cachePath, readCache);
      }
    });
  }

  temp.open("", function(err, info){
    rediHi(info.path, function(){
      fs.readFile(info.path, "utf8", function(err, data){
        parse(data);
        temp.cleanup();
        callback();
      });
    });
  });
};

var parse = function(data){
  var index = {};
  var before = null;
  data.split("\n").forEach(function(line){
    var m;
    if(m = line.match(reHi)){
      index[before = m[1]] = m[2];
    }
    else{
      before && (index[before] += line);
    }
  });

  var f = function(value){
    var m = value.match(reLink);
    return m ? f(index[m[1]]) : value;
  };

  Object.keys(index).forEach(function(key){
    colors[key] = {};
    f(index[key]).split(" ").filter(function(a){return a;}).forEach(function(a){
      var b = a.split("=");
      colors[key][b[0]] = b[1] || true;
    });
  });
};


module.exports = function(colorName, option){
  var dummy = function(s){return s;};
  var gen = function(c){
    return function(s){
      return c + s + "\x1b[0m"
    };
  };
  var compose = function(f, g){
    return function(s){
      return f(g(s));
    };
  };

  var c = colors[colorName];
  if(!c){
    return dummy;
  }
  var fg = /^\d+$/.test(c.ctermfg) ? gen("\x1b[38;5;" + c.ctermfg + "m") : dummy;
  var bg = /^\d+$/.test(c.ctermbg) ? gen("\x1b[48;5;" + c.ctermbg + "m") : dummy;
  if(option === "fg"){
    return fg;
  }
  else if(option === "bg"){
    return bg;
  }
  else{
    return compose(fg, bg);
  }
};

module.exports.init = init;

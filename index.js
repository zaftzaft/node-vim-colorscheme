var fs    = require("fs");
var spawn = require("child_process").spawn;
var temp  = require("temp").track();

var colors = {};
var reHi = /^([\w]+)\s+xxx\s+(.+)$/;
var reLink = /^links to ([\w]+)$/;

var rediHi = function(filePath, callback, option){
  var args = ["-e", ];
  args = args.concat(option);
  args.push("+redi! > " + filePath, "+hi", "+q!");
  var vim = spawn("vim", args, {
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
  options = options || {};
  options.useCache = options.useCache || false;
  options.cachePath = options.cachePath || "./vimcs";
  var addcmd = [];
  if(options.filetype){
    addcmd.push("+e x." + options.filetype);
  }

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
        rediHi(options.cachePath, readCache, addcmd);
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
    }, addcmd);
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


module.exports = function(colorName, option, attr){
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

  if(attr){
    [
      [/bold/,      "\x1b[1m"],
      [/underline/, "\x1b[4m"],
      [/reverse/,   "\x1b[7m"],
      [/inverse/,   "\x1b[7m"],
      [/standout/,  "\x1b[1;4m"]
    ].forEach(function(x){
      if(x[0].test(c.cterm)){
        var g = gen(x[1]);
        fg = compose(fg, g);
        bg = compose(bg, g);
      }
    });
  }

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
module.exports.colors = colors;

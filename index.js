var fs            = require("fs");
var child_process = require("child_process");
var spawn         = child_process.spawn;
var spawnSync     = child_process.spawnSync;
var temp          = require("temp").track();

var colors = {};
var reHi = /^([\w]+)\s+xxx\s+(.+)$/;
var reLink = /^links to ([\w]+)$/;


var buildArgs = function(filePath, options){
  var args = ["-e"];
  if(options.filetype){
    args.push("+e x." + options.filetype);
  }
  args.push("+redi! > " + filePath, "+hi", "+q!");
  return args;
};


var buildOption = function(options){
  options = options || {};
  options.useCache = options.useCache || false;
  options.cachePath = options.cachePath || "./vimcs";
  return options;
};


var rediHi = function(args, callback){
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


var rediHiSync = function(args){
  spawnSync("vim", args, {
    stdio: [
      process.stdin,
      process.stdout,
      process.stderr
    ]
  });
};


var init = function(options, callback){
  options = buildOption(options);

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
        rediHi(buildArgs(options.cachePath, options), readCache);
      }
    });
  }

  temp.open("", function(err, info){
    rediHi(buildArgs(info.path, options), function(){
      fs.readFile(info.path, "utf8", function(err, data){
        parse(data);
        temp.cleanup();
        callback();
      });
    });
  });
};


var initSync = function(options){
  options = buildOption(options);
  var readCache = function(){
    parse(fs.readFileSync(options.cachePath, "utf8"));
  };
  if(options.useCache){
    if(fs.existsSync(options.cachePath)){
      readCache();
    }
    else{
      rediHiSync(buildArgs(options.cachePath, options));
      readCache();
    }
  }
  else{
    var tempPath = temp.openSync("").path;
    rediHiSync(buildArgs(tempPath, options));
    parse(fs.readFileSync(tempPath, "utf8"));
    temp.cleanupSync();
  }
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
module.exports.initSync = initSync;
module.exports.colors = colors;

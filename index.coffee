{spawn} = require "child_process"
temp = require("temp").track()
fs = require "fs"

temp.open "", (err, info) ->
  vim = spawn "vim", ["-e", "+redir! > #{info.path}", "+hi", "+q!"], {
    stdio: [
      process.stdin
      process.stdout
      process.stderr
    ]
  }

  vim.on "close", ->
    fs.readFile info.path, "utf8", (err, data) ->
      parse data
      temp.cleanup()

reHi = /^([\w]+)\s+xxx\s+(.+)$/
reLink = /^links to ([\w]+)$/
parse = (data) ->
  colors = {}
  bef = null
  data
    .split "\n"
    .forEach (line) ->
      if m = line.match reHi
        colors[bef = m[1]] = m[2]
      else
        colors[bef] += line if bef

  Object
    .keys colors
    .forEach (key) ->
      value = colors[key]
      if m = value.match reLink
        if colors[m[1]]
          value = colors[key]

      value
        .split " "
        .filter (a) -> a
        .forEach (a) ->
          if m = a.match /^ctermfg=(\d+)/
            console.log "\x1b[38;5;#{m[1]}m#{key}"

  #console.log colors


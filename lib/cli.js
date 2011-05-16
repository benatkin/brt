#!/usr/bin/env node
var BRT = require('brt')

var CLI = function() {
  this.brt = new BRT()
}

CLI.prototype = {
  commands: {
    x: {
      args: 0
    }
  },
  dispatch: function() {
    var that = this
    var argv = require('optimist')
          .usage(["brt x"
                , "  lists the Chrome extensions"].join("\n"))
          .demand(1)
          .check(function (argv) {
            var command = argv._[0]
              , args    = argv._.slice(1)

            var err = function(message) {
              console.log(message)
              process.exit(1)
            }

            if (! that.commands.hasOwnProperty(command))
              err('brt: invalid command: ' + command)

            if (args.length != that.commands[command].args)
              err('brt: expected ' + that.commands[command].args + ' argument(s) for ' + command + ' but got ' + args.length + '.')
          })
          .argv
      , command = argv._[0]
      , args    = argv._.slice(1)
    this[command].apply(this, args)
    return 0
  },
  x: function() {
    this.brt.list_extensions()
  }
}

module.exports = CLI

if (! module.parent)
  (new CLI()).dispatch()

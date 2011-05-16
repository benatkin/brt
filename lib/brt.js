var fs = require('fs')
  , path = require('path')
  , Seq = require('seq')
  , _ = require('underscore')

var BRT = function() {
  _.bindAll(this, 'print_extensions')
  this.find_chrome_home()
}

BRT.prototype = {
  chrome_home_dirs: [
    ".config/google-chrome",
    "Library/Application Support/Google/Chrome"
  ],
  find_chrome_home: function() {
    var dir;
    for (var i=0; i < this.chrome_home_dirs.length; i++) {
      dir = path.join(process.env.HOME, this.chrome_home_dirs[i])
      if (path.existsSync(dir)) {
        this.chrome_home = dir
        return true;
      }
    }
    throw "Couldn't find the Chrome home directory"
  },
  list_extensions: function() {
    var xdir = path.join(this.chrome_home, 'Default', 'Extensions')
    this.extensions = {}

    var that = this;
    Seq()
    .seq(function() {
      fs.readdir(xdir, this)
    })
    .flatten()
    .parEach(function(dir) {
      that.load_manifest(path.join(xdir, dir), this)
    })
    .seq(this.print_extensions)
  },
  load_manifest: function(dir, cb) {
    var shared = {}
    var that = this
    Seq()
    .seq(function() {
      fs.readdir(dir, this)
    })
    .seq(function(vdirs) {
      vdirs.sort()
      shared.vdir = path.join(dir, vdirs[vdirs.length - 1])
      shared.mfile = path.join(shared.vdir, 'manifest.json')
      path.exists('manifest.json', this)
    })
    .seq(function(exists) {
      fs.readFile(shared.mfile, 'utf8', this)
    })
    .seq(function(data) {
      var manifest = JSON.parse(data)
      if (manifest.name.substr(0, 2) != '__') {
        that.extensions[manifest.name] = shared.vdir
      }
      cb.call(cb)
    })
  },
  print_extensions: function() {
    console.log(JSON.stringify(this.extensions, null, 2))
  }
}

module.exports = BRT

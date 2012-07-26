# JAM

JavaScript Application Manager

# Clone & Install
git clone git@github.com:blackjk3/jam.git

Run npm install to install node modules.

Then add jam to your corresponding path file. (.zshrc, .profile, .bash_profile)
JAM_HOME=/Users/kadrm002/Documents/Examples/jam/bin; export JAM_HOME
export PATH=other/paths/etc:$JAM_HOME

# Commands

# Help

```javascript
jam -h
```

# New project
```javascript
jam new test-project
```

# Using jam bundler
The bundler is similar to rails in that it will read a config file (package.json) and manage your vendor assets folder accordingly.

```javascript
jam bundle
```

A sample package.json file is as follows.  To define dependencies for jam to pull in just add them to the dependencies object.  Each entry can be versioned or will grab the latest in the absense of a version number.  Additionally, the minified flag will instruct jam on which version to pull minified or un-minified.  Every time "jam bundle" is run the specified vendor folder is cleared and updated based on the dependencies.  If you have other libraries that you want to use outside of jam, put them in a different folder as they will get removed when you bundle again.

```javascript
{
  "jaws": {
    "baseUrl": "js/app",
    "vendorPath": "js/vendor",

    "jamSource": "https://raw.github.com/blackjk3/jam/master/repos/repos.json",
    "dependencies" : {
      "jquery": {
        "version": "1.7.1",
        "minified": true
      },
      "zepto": {
        "minified": true
      },
      "chosen": {
        "minified": false
      }
    }
  }
}
```

# Adding files outside of bundler
Sometimes you may want to simply add a file and not go through the hassle of using bundler.  To add a library run

```javascript
jam add moment
```

This example will grab the latest moment.js, add it to the current working directory, and output the following.

```javascript
* Downloading moment-1.7.0 to /Users/kadrm002/Documents/Examples/test-jaws/testing-js/moment-1.7.0.js
```

To grab a minified version it is as easy as adding the -m flag. 

```javascript
jam add -m moment
```

If you run the add command from a rails project root jam can help with that.  If jam detects rails it will prompt with the following

```javascript
"Detected rails. Do you want to put file in vendor/assets/javascripts? y"
```

If you respond "y" then jam will store the asset in vendor folder that rails uses.

# Generating a backbone view + template

```javascript
jam g view index
```

# Generating a backbone model

```javascript
jam g model index
```


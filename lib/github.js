var q = require('q'),
    https = require('https'),
    querystring = require('querystring'),
    version = require('./version'),
    apiHost = 'api.github.com',
    versionRegExp = /^(v|r|release-)?(\d+\.)?(\d+\.)?(\d+)$/;

function github(path, key, options) {

  options = options || {};
  options.contentType = options.contentType || 'application/json';

  if (options.content && typeof options.content !== 'string') {
    options.content = JSON.stringify(options.content);
  }

  var req,
      d = q.defer(),
      args = {
        host: apiHost,
        path: '/' + path,
        method: options.method || 'GET'
      };
  
  req = https.request(args, function (response) {
    
    var body = '';

    response.on('data', function (data) {
        body += data;
    });

    response.on('end', function () {
      var err;
      if (response.statusCode === 404) {
          err = new Error(args.host + args.path + ' does not exist');
          err.response = response;
          d.reject(err);
      } else if (response.statusCode === 200 ||
                 response.statusCode === 201) {
          //Convert the response into an object
          d.resolve(JSON.parse(body));
      } else {
          err = new Error(args.host + args.path + ' returned status: ' +
                   response.statusCode + '. ' + body);
          err.response = response;
          d.reject(err);
      }
    });

  }).on('error', function (e) {
      d.reject(e);
  });

  req.end();

  return d.promise;
}

github.tags = function( repoLocation ) {
    return github('repos/' + repoLocation + '/tags').then(function (tags) {

      tags = tags.map(function (data) {
          return data.name;
      });

      tags = tags.filter(function (tag) {
        return versionRegExp.test(tag);
      });
      
      tags.sort(version.compare);

      return tags;
    });
};

github.latestTag = function ( repoLocation ) {
  return github.tags( repoLocation ).then(function (tagNames) {
    return tagNames[0];
  });
};

module.exports = github;
/*global require*/
'use strict';

console.time();

require.config({
  shim: {
  },
  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/lodash/dist/lodash',
    Q: '../bower_components/q/q',
    async: '../bower_components/async/dist/async',
    mammoth: 'vendor/mammoth.browser.min'
  }
});

require([
  'backbone', 'Q', 'async', 'mammoth'
], function (Backbone, Q, async, mammoth) {

  var CLIENT_ID = '72848749493-pva84reb1v48u6ddc6l7cukmsso7qib2.apps.googleusercontent.com',
      SCOPES = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive'
      ],
      FOLDER_ID = '0BzN4DMSEkyAFUENlamlIUVhDalU',
      TYPE_FOLDER = 'application/vnd.google-apps.folder',
      TYPE_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  var Auth = Backbone.Model.extend({

    authorize: function (callback) {
      var isAttemptingAuth = false,
          currentAuthAttempt = 0,
          maxAuthAttempt = 5;

      function attemptAuth(callback) {
        if (isAttemptingAuth) return;

        console.log('[DRIVE-IN] OAuth2: attempting authentication...');

        // Prevent ReferenceError on gapi if unable to establish connection.
        var gapi = window.gapi || {};

        // Attempt starts here. Count the number of attempt.
        // Give up if it exceeds the maximum number possible.
        if (gapi && gapi.auth) {
          isAttemptingAuth = true;
          gapi.auth.authorize({
            'client_id': CLIENT_ID,
            'scope': SCOPES,
            'immediate': true
          }, handleAuthResult);
        } else {
          currentAuthAttempt++;
          if (currentAuthAttempt < maxAuthAttempt) {
            console.log(
              '[DRIVE-IN] OAuth2: Google API not ready yet, retrying ('
              + currentAuthAttempt + '/' + maxAuthAttempt + ').'
            );
            _.delay(attemptAuth, 1000, callback)
          } else {
            console.warn(
              '[DRIVE-IN] OAuth2: Could not reach Google API after ' + maxAuthAttempt +
              'tries. I\'m giving up.'
            );
            return;
          }
        }
      }

      function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
          console.log('[DRIVE-IN] Oauth2: Done.');
          callback(authResult);
        } else {
          gapi.auth.authorize({
            'client_id': CLIENT_ID,
            'scope': SCOPES,
            'immediate': false
          }, handleAuthResult);
        }
      }

      // Start here.
      attemptAuth(callback);
    }

  });

  var FilesProcessor = Backbone.Model.extend({

    queue: null,
    countTotalHtmlisableDoc: 0,
    currentCountHtmlisableDoc: 0,

    initialize: function (opts) {
      var tree = (opts && opts.tree) ? opts.tree : {};
      this.set('tree', tree);

      _.bindAll(this, 'processFiles', 'generateHtmlFromTree');
    },

    retrieveAllFilesInFolder: function (folderId) {
      console.groupCollapsed('[DRIVE-IN] Attempting to retrieve all files in folder "' + folderId + '".');

      var deferred,
          retrievePageOfChildren,
          initialRequest;

      deferred = Q.defer();

      retrievePageOfChildren = function (request, result) {
        request.execute(function (response) {
          result = result.concat(response.items);
          var nextPageToken = response.nextPageToken;
          if(nextPageToken) {
            request = gapi.client.drive.children.list({
              folderId: folderId,
              pageToken: nextPageToken
            });
            retrievePageOfChildren(request, result);
          } else {
            return deferred.resolve({ files: result, folderId: folderId });
          }
        });
      };

      initialRequest = gapi.client.drive.children.list({
        folderId: folderId
      });

      retrievePageOfChildren(initialRequest, []);

      return deferred.promise;
    },

    processFiles: function (payload) {
      var files = payload.files,
          folderId = payload.folderId,
          crawl, addFileToTree;

      console.log('[DRIVE-IN] Building files tree for folder "' + folderId + '"...');

      crawl = function (id, parentId, callback) {
        var request = gapi.client.drive.files.get({
          fileId: id
        });

        request.execute(function (fileOrDirectory) {
          if (fileOrDirectory.mimeType === TYPE_FOLDER) {
            this.set('tree', addFolderToTree(this.get('tree'), fileOrDirectory));
            this.retrieveAllFilesInFolder(fileOrDirectory.id)
              .then(this.processFiles);
          } else if (fileOrDirectory.mimeType === TYPE_DOCX) {
            this.set('tree', addFileToTree(this.get('tree'), parentId, fileOrDirectory))
          }
          callback();
        }.bind(this));
      }.bind(this);

      if (this.queue === null) {
        this.queue = async.queue(function (task, callback) {
          crawl(task.id, task.parentId, callback);
        });

        this.queue.drain = function () {
          console.log('[DRIVE-IN] Files tree is ready.');
          this.generateHtmlFromTree(this.get('tree'));
          return;
        }.bind(this)
      }

      _.each(files, function (file) {
        file.parentId = folderId
        this.queue.push(file, fileProcessFinishedHandler);
      }.bind(this));

      addFileToTree = function (tree, folderId, file) {
        var filePayload = {
          id: file.id,
          type: 'file',
          link: file.selfLink,
          data: file,
          html: ''
        };

        // Treatment for single files at the top level directory.
        if (folderId == FOLDER_ID) {
          tree[file.id] = filePayload;
          return tree;
        }

        // Increment the total number of documents we will
        // be transforming to HTML, so that we can create
        // a counter during the transformation phase and
        // trigger an event to notify the app when all
        // files have been transformed.
        this.countTotalHtmlisableDoc++;

        // Add file object to its parent folder object.
        // Use file's ID as key.
        tree[folderId].children.push(filePayload);

        return tree;
      }.bind(this);

      function fileProcessFinishedHandler(err) {
        if (err) {
          console.error(err.message);
        } else {
          console.log('[DRIVE-IN] Done processing file.');
        }
      }

      function addFolderToTree(tree, folder) {
        tree[folder.id] = {
          id: folder.id,
          type: 'folder',
          data: folder,
          children: []
        };
        return tree;
      }

      console.groupEnd();
    },

    generateHtmlFromTree(tree) {
      console.groupCollapsed('[DRIVE-IN] Generating HTML for files in tree.');

      var self = this;

      var crawlFolder = function (folder) {
        console.log('[DRIVE-IN] Crawling folder ' + folder.id + '.');
        var children = folder.children;
        _.each(children, function (child) {
          if (child.type === 'file') {
            transformFile(child);
          } else if (child.type == 'folder') {
            crawlFolder(child);
          }
        });
      }.bind(this);

      function transformFile(file) {
        console.log('[DRIVE-IN] Starting transform process for file ' + file.id + '.');
        downloadFile(file, convertFileBlobToHtml);
      }

      function downloadFile(file, callback) {
        if (file.link) {
          console.log('[DRIVE-IN] Downloading ' + file.id + '.');

          var errorMsg = '[DRIVE-IN] There was an error while downloading the file (id: ' + file.id
                          + ') from Google Drive. Try requesting the URI yourself to see if an error '
                          + 'message is provided: ' + file.link,
              accessToken = gapi.auth.getToken().access_token,
              xhr = new XMLHttpRequest();

          xhr.responseType = 'blob';
          xhr.open('GET', file.link + '?alt=media');
          xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
          xhr.onload = function() {
            if (xhr.status === 200 && xhr.statusText === "OK") {
              var blob = xhr.response;
              callback(file, blob);
            } else {
              console.error(errorMsg);
              callback(null);
            }
          };
          xhr.onerror = function() {
            console.error(errorMsg);
            callback(null);
          };
          xhr.send();
        } else {
          callback(null);
        }
      }

      function convertFileBlobToHtml(file, blob) {
        readFileAsArrayBuffer(blob, function (arrayBuffer) {
          if (!arrayBuffer) return;
          mammoth
            .convertToHtml({ arrayBuffer: arrayBuffer })
            .then(function (html) {
              console.log('[DRIVE-IN] Done converting file.');
              file.html = html;

              self.currentCountHtmlisableDoc++;

              if (self.currentCountHtmlisableDoc === self.countTotalHtmlisableDoc) {
                self.trigger('event:filetree:ready', self.get('tree'));
              }

              return file;
            })
            .done();
        });
      }

      function readFileAsArrayBuffer(blob, callback) {
        if (!blob) {
          console.info('[DRIVE-IN] No Blob given to readFileAsArrayBuffer(). Aborting.');
          return null;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
          var arrayBuffer = e.target.result;
          callback(arrayBuffer);
        };
        reader.readAsArrayBuffer(blob);
      }

      _.each(tree, function (branch) {
        switch (branch.type) {
          case 'folder':
            crawlFolder(branch);
            break;
          case 'file':
            transformFile(branch);
            break;
        }
      });

      console.groupEnd();
    }

  });

  var Parser = Backbone.Model.extend({
    initialize: function () {
      _.bindAll(this, 'parse');
    },

    parse: function (tree) {
      console.log('[DRIVE-IN] Parsing files tree.');

      var structure = _.map(tree, function (branch) {
        if (branch.type === 'file') {
          return this.cleanUpHtml(branch.html.value);
        } else if (branch.type == 'folder') {
          return _.map(branch.children, function (leaf) {
            return this.cleanUpHtml(leaf.html.value);
          }.bind(this));
        }
      }.bind(this));

      structure = _.compact(structure);
      console.log(structure);
      return structure;
    },

    cleanUpHtml: function (dirtyHtml) {
      if (!dirtyHtml) return;
      var cleanHtml = dirtyHtml.replace(/^<p><a id="[^"]*"><\/a>/gi, '<p>');
      return cleanHtml;
    }
  });

  var auth = new Auth(),
      filesProcessor = new FilesProcessor(),
      parser = new Parser();

  filesProcessor.on('event:filetree:ready', function (tree) {
    parser.parse(tree);
  });

  auth.authorize(function (token) {
    auth.set('token', token);
    gapi.client.load('drive', 'v2', gapiClientLoadHandler);
  });

  function gapiClientLoadHandler() {
    filesProcessor
      .retrieveAllFilesInFolder(FOLDER_ID)
      .then(filesProcessor.processFiles);
  }

  Backbone.history.start();
});

console.timeEnd();

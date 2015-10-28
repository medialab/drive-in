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
    async: '../bower_components/async/dist/async'
  }
});

require([
  'backbone', 'Q', 'async'
], function (Backbone, Q, async) {

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

  var FileProcessor = Backbone.Model.extend({

    queue: null,

    initialize: function (opts) {
      var tree = (opts && opts.tree) ? opts.tree : {};
      this.set('tree', tree);

      _.bindAll(this, 'processFiles');
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
          crawl;

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
          crawl(task.id, task._________________parentId, callback);
        });

        this.queue.drain = function () {
          console.log('[DRIVE-IN] Files tree is ready.');
          return;
        }.bind(this)
      }

      _.each(files, function (file) {
        file._________________parentId = folderId
        this.queue.push(file, fileProcessFinishedHandler);
      }.bind(this));

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
          children: {}
        };
        return tree;
      }

      function addFileToTree(tree, folderId, file) {
        var filePayload = {
          id: file.id,
          type: 'file',
          data: file
        };

        if (folderId == FOLDER_ID) {
          tree[file.id] = filePayload;
          return tree;
        }

        tree[folderId].children[file.id] = filePayload;
        return tree;
      }

      console.groupEnd();
    }

  });

  var auth = new Auth(),
      fileProcessor = new FileProcessor();

  auth.authorize(function (token) {
    auth.set('token', token);
    gapi.client.load('drive', 'v2', gapiClientLoadHandler);
  });

  function gapiClientLoadHandler() {
    fileProcessor
      .retrieveAllFilesInFolder(FOLDER_ID)
      .then(fileProcessor.processFiles);
  }

  Backbone.history.start();
});

console.timeEnd();

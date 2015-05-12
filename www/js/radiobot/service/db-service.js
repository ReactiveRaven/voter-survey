angular.module("radiobot.service.db", [])
    .service(
        "DBService",
        function DBService(
            $http,
            cornercouch,
            COUCH_MOUNT, COUCH_DB
        ) {
            var that = this;

            this.rows = [];
            var documents = {};
            var lastSeq = 0;
            var callbacks = [];

            function poll() {
                $http.get(COUCH_MOUNT + "/" + COUCH_DB + "/_changes?feed=longpoll&include_docs=true&since=" + lastSeq)
                    .then(function(response) {
                        lastSeq = response.data.last_seq;
                        response.data.results
                            .forEach(function(result) {
                                processResult(result.doc);
                            });

                        dedupe();
                        removeDeleted();
                        callbacks.forEach(function(callback) {
                            callback();
                        });
                    })
                    .finally(poll);
            }
            poll();

            var processResult = function(result) {
                var curDoc = that.rows
                        .filter(function(row) {
                            return row._id === result._id;
                        })[0] || {};

                if (that.rows.indexOf(curDoc) === -1) {
                    that.rows.push(curDoc);
                }

                // Delete existing keys
                Object.keys(curDoc)
                    .filter(function(key) {
                        return typeof key !== "function";
                    })
                    // remove
                    .forEach(function(key) {
                        delete curDoc[key];
                    });

                // Copy new keys across
                Object.keys(result)
                    .forEach(function(key) {
                        curDoc[key] = result[key];
                    });

                // Push new copy into the array
                // copy used so we can tell if it has been updated
                documents[curDoc._id] = JSON.stringify(curDoc);
            }.bind(this);

            this.saveAll = function() {
                that.rows
                    .filter(function(row) {
                        return (
                            // new
                            row._id === undefined ||
                            // dirty
                            JSON.stringify(row) !== documents[row._id]
                        );
                    })
                    .forEach(this.save);
            };

            var dedupe = function() {
                var idsSeen = {};

                that.rows
                    .filter(function(row) {
                        return row._id !== undefined;
                    })
                    .filter(function(row) {
                        var wasThere = idsSeen[row._id];
                        idsSeen[row._id] = true;
                        return wasThere;
                    })
                    .forEach(function(row) {
                        that.rows.splice(that.rows.indexOf(row), 1);
                    });

            }.bind(this);

            var removeDeleted = function() {
                that.rows
                    .filter(function(row) {
                        return !!row._deleted;
                    })
                    .forEach(function(row) {
                        that.rows.splice(that.rows.indexOf(row), 1);
                    });
            }.bind(this);

            this.save = function(doc) {
                if (typeof doc !== "object") {
                    throw "DBService.save expects a document object to save. Did you mean 'saveAll'?";
                }

                var request = {
                    url: COUCH_MOUNT + "/" + COUCH_DB,
                    data: doc,
                    method: "POST"
                };

                if (doc._id !== undefined) {
                    request.url += "/" + doc._id;
                    request.method = "PUT";
                }

                $http(request)
                    .then(function(response) {
                        doc._id = response.data.id;
                        doc._rev = response.data.rev;
                    })
                    .then(dedupe)
                    .then(removeDeleted);
            };

            this.listen = function(callback) {
                callbacks.push(callback);
                return function() {
                    callbacks.splice(callbacks.indexOf(callback), 1);
                };
            };

            return this;
        }
    )
    ;

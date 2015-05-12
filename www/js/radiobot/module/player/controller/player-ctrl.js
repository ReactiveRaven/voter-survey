angular.module(
    "radiobot.module.player.controller.player",
    [
        "cornercouch"
    ]
)
    .controller(
        "PlayerCtrl",
        function(
            $scope,
            cornercouch
        ) {
            $scope.db = cornercouch("/couchdb", "GET").getDB("radiobot");

            $scope.db.queryAll()
                .then(function(documents) {
                    console.log("documents", documents);
                });
        }
    );

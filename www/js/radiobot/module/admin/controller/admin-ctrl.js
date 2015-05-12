angular.module(
    "radiobot.module.admin.controller.admin",
    [
        "CornerCouch",
        "radiobot.constants",
        "radiobot.service.youtube",
        "radiobot.service.db",
        "radiobot.filter.not-deleted"
    ]
)
    .controller(
        "AdminCtrl",
        function(
            $scope, cornercouch, $http,
            YoutubeService, DBService,
            COUCH_MOUNT, COUCH_DB, API_KEY_YOUTUBE
        ){
            var youtube = new YoutubeService(API_KEY_YOUTUBE);
            $scope.DBService = DBService;
            $scope.db = DBService;

            $scope.username = localStorage.getItem("username") || "Guest";

            $scope.$watch("username", function() {
                localStorage.setItem("username", $scope.username);
            });

            $scope.tracks = [];

            $scope.lastSeq = 0;

            $scope.$watch("newtrack", function() {
                if ($scope.newtrack) {
                    youtube.gettingInfo($scope.newtrack)
                        .then(function(response) {
                            $scope.videotitle = response.snippet.title;
                        });
                }
            });

            $scope.addTrack = function() {
                if ($scope.classifyurl($scope.newtrack) === "???") {
                    alert("Sorry\nVideo provider not recognised.\nTry Youtube links.");
                    return false;
                }

                var videoid = $scope.extractid($scope.newtrack);

                if ($scope.db.rows.filter(function(track) { return track.trackid === videoid; }).length > 0) {
                    alert("Sorry\nYou've already added this track");
                    return false;
                }

                var doc = {};
                doc.user = $scope.username;
                doc.type = "track";
                doc.tracktype = $scope.classifyurl($scope.newtrack);
                doc.trackid = videoid;
                doc.upvotes = [];
                youtube.gettingInfo($scope.newtrack)
                    .then(function(response) {
                        doc.title = response.snippet.title;
                        var duration = response.contentDetails.duration.replace("PT", "");
                        doc.length = response.contentDetails
                            .duration
                            .replace("PT", "")
                            .match(/([0-9]+[HMS])/g)
                            .map(function(part) {
                                var multipliers = {
                                        H: 3600,
                                        M: 60,
                                        S: 1
                                    };
                                var multiplier = multipliers[part.replace(/[0-9]/g, "")];
                                return parseInt(part, 10) * multiplier;
                            })
                            .reduce(function(a, b) {
                                return a + b;
                            });
                        doc.youtubeInfo = response;
                        $scope.db.save(doc);
                    });
            };

            $scope.removeTrack = function(track) {
                track._deleted = true;
                $scope.db.save(track);
            };

            $scope.extractid = function(url) {
                url = url || "";
                var type = $scope.classifyurl(url);
                if (type === "Youtube") {
                    var matches = url.match(/[&?]v=([a-zA-Z0-9]+)/);
                    return matches && matches[1];
                } else {
                    return "???";
                }
            };

            $scope.classifyurl = function(url) {
                url = url || "";
                if (url.indexOf("youtube") > -1) {
                    return "Youtube";
                } else {
                    return "???";
                }
            };

        }
    );

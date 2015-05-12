angular.module(
    "radiobot.controller.bot",
    [
        "radiobot.service.playlist"
    ]
)
    .controller("BotCtrl", function(
        $scope,
        PlaylistService
    ) {
        $scope.tab = "admin";
        $scope.toggleAdmin = function() {
            $scope.tab = $scope.tab === "admin" ? "player" : "admin";
        };

        $scope.playlist = PlaylistService.getPlaylistItems;
    });

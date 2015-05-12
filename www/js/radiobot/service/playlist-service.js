angular.module(
    "radiobot.service.playlist",
    [
        "radiobot.service.db"
    ]
)
    .service("PlaylistService", function(DBService) {
        function PlaylistService() {
            this.getPlaylistItems = function(number) {

                var tracks = DBService.rows
                    .filter(function(row) {
                        return row.type === "track";
                    });

                var nowplaying = DBService.rows
                    .filter(function(row) {
                        return row.type === "nowplaying";
                    })
                    .reduce(function(a, b) {
                        return (
                            a.timestamp > b.timestamp ?
                                a :
                                b
                        );
                    }, []);

                var next = [];

                function pickNext() {
                    var myTracks = tracks.sort(function(a,b) {
                        var aScore = (
                            (a.upvotes || []).length -
                            (a.downvotes || []).length -
                            (
                                (a.plays || 0) + next.filter(function(x) {
                                    return x.value === a;
                                }).length
                            )
                        );
                        var bScore = (
                            (b.upvotes || []).length -
                            (b.downvotes || [] ).length -
                            (
                                (b.plays || 0) + next.filter(function(x) {
                                    return x.value === b;
                                }).length
                            )
                        );
                        console.log(aScore, a.title);
                        return bScore - aScore;
                    });
                    return myTracks[0];
                }


                while (next.length < number) {
                    next.push({value: pickNext()});
                }
                console.log("result", next);

                return next;
            };
        }

        return new PlaylistService();
    });

angular.module("radiobot.service.youtube", [])
    .service("YoutubeService", function($http) {
        function YoutubeService(_apikey_) {
            var YOUTUBE_API = "https://www.googleapis.com/youtube/v3";
            var apikey = _apikey_;
            if (!_apikey_) {
                throw "Must pass in your youtube api key";
            }

            this.extractKey = function(url) {
                url = url || "";
                if (url.indexOf("http") === 0) {
                    var matches = url.match(/[&?]v=([a-zA-Z0-9]+)/);
                    return matches && matches[1];
                }
                return url;
            };

            this.gettingInfo = function(url) {
                return $http.get(YOUTUBE_API + "/videos", {
                    params: {
                        part: "snippet,contentDetails,topicDetails",
                        id: this.extractKey(url),
                        key: apikey
                    }
                })
                    .then(function(response) {
                        return {
                            snippet: response.data.items[0].snippet,
                            contentDetails: response.data.items[0].contentDetails,
                            topicDetails: response.data.items[0].topicDetails
                        };
                    });
            };
        }

        return YoutubeService;
    });

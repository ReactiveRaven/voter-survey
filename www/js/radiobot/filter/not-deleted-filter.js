angular.module(
    "radiobot.filter.not-deleted",
    [
    ]
)
    .filter("NotDeleted", function() {
        return function(input) {
            return input._deleted !== true;
        };
    });

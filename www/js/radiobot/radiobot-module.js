angular.module(
    "radiobot",
    [
        "radiobot.module.player",
        "radiobot.module.admin",
        "radiobot.controller.bot"
    ]
)
    .run(function() {
        console.log("Run");
    });

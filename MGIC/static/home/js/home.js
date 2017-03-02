WinJS.Namespace.define("Home", {
    StatusMap: null,
    StatusMapJquery: null,
    ServerInfoTemplate: null,
    ServerInfo: null,
    LoadControls: function () {
        Home.StatusMapJquery = $("#statusMap");
        Home.ServerInfoTemplate = $("#serverInfoTemplate")[0].winControl;
        Home.ServerInfo = $("#serverInfo")[0];
    },
    Resize: function () {
        var mapHeight = Home.StatusMapJquery[0].clientWidth / 4 * 3;
        Home.StatusMapJquery.css("height", mapHeight);
    },
    Load: function () {
        Utils.processCSRFToken();
        WinJS.UI.processAll().done(function () {
            var splitView = document.querySelector(".splitView").winControl;
            new WinJS.UI._WinKeyboard(splitView.paneElement);
            Home.LoadControls();
            Common.Load(Home.LoadCallback)
        });
    },
    LoadCallback: function(){
        Home.StatusMap = new Microsoft.Maps.Map(Home.StatusMapJquery[0],
            {
                credentials: "AoSPvSw3rIurjqVaUl3Ellm4REcTDMbiQ9VaUGtXrXrmTD5XxmYj1CmmvJAN5U0D",
                mapTypeId: Microsoft.Maps.MapTypeId.auto,
                showDashboard: false,
                showScalebar: false
            });
        Home.Resize();
        for (var index = 0; index < Common.LocationSources.length; index++) {
            var currentLocationSource = Common.LocationSources[index];
            Home.ServerInfoTemplate.render(currentLocationSource).then(
                function (e) {
                    Home.ServerInfo.appendChild(e);
                });
            var mapLocation = new Microsoft.Maps.Location(currentLocationSource.Latitude, currentLocationSource.Longitude);
            var mapPin = new Microsoft.Maps.Pushpin(mapLocation, {
                icon: currentLocationSource.RunningState == "正常" ? "/static/images/running.png" : "/static/images/error.png",
                width: 25, height: 25, draggable: false
            });
            Home.StatusMap.entities.push(mapPin);
        }
    }
});
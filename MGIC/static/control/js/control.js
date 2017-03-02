WinJS.Namespace.define("Control", {
    WorksAll: null,
    WorksUpload: null,
    WorksWaiting: null,
    WorksProcessing: null,
    WorksFinished: null,
    WorksError: null,
    Head: null,
    WorkList: null,
    SelectedWorkID: null,
    DownloadFlyout: null,
    UploadFlyout: null,
    WorkStateToString: WinJS.Binding.initializer(
        function WorkStateToString(source, sourceProperty, dest, destProperty) {
            function setString() {
                switch (source.WorkState) {
                    case 0:
                        dest.textContent = "未上传文件";
                        break;
                    case 1:
                        dest.textContent = "等待中";
                        break;
                    case 2:
                        dest.textContent = "处理中";
                        break;
                    case 3:
                        dest.textContent = "已完成";
                        break;
                    case -1:
                        dest.textContent = "错误";
                        break;
                }
            }

            return WinJS.Binding.bind(source, {
                WorkState: setString
            });
        }
    ),
    WorkStateToColor: WinJS.Binding.initializer(
        function WorkStateToColor(source, sourceProperty, dest, destProperty) {
            function setColor() {
                switch (source.WorkState) {
                    case 0:
                        dest.style.color = "#FFFFFF";
                        break;
                    case 1:
                        dest.style.color = "#094AB2";
                        break;
                    case 2:
                        dest.style.color = "#D24726";
                        break;
                    case 3:
                        dest.style.color = "#008A00";
                        break;
                    case -1:
                        dest.style.color = "#AC193D";
                        break;
                }
            }

            return WinJS.Binding.bind(source, {
                WorkState: setColor
            });
        }
    ),
    SelectWork: function (workDiv) {
        var workDivJquery = $(workDiv);
        $(".work").removeClass("selected");
        workDivJquery.addClass("selected");
        Control.SelectedWorkID = workDivJquery.children(".work-id")[0].innerHTML;
        if (workDivJquery.find(".work-state")[0].innerHTML == "已完成") {
            Control.DownloadFlyout.showAt(window.event);
        }
        else if (workDivJquery.find(".work-state")[0].innerHTML == "未上传文件") {
            Control.UploadFlyout.showAt(window.event);
        }
    },
    GetWork: function () {
        Control.DownloadFlyout.hide();
        window.location = "/api/works/getresult/?id=" + Control.SelectedWorkID;
    },
    UploadWork: function () {
        Control.UploadFlyout.hide();
        NewWorkDialog.StepUploadShow(Control.SelectedWorkID);
    },
    LoadControls: function () {
        Control.Head = $("#head")[0];
        Control.WorkList = $("#workList");
        Control.DownloadFlyout = $("#downloadFlyout")[0].winControl;
        Control.UploadFlyout = $("#uploadFlyout")[0].winControl;
    },
    Resize: function () {
        Control.WorkList.css("height", document.body.clientHeight - Control.Head.clientHeight - 150);
    },
    Load: function () {
        Utils.processCSRFToken();
        $.get(API.GetWorks, function (data) {
            var worksUpload = [];
            var worksWaiting = [];
            var worksProcessing = [];
            var worksFinished = [];
            var worksError = [];
            for (var index = 0; index < data.length; index++) {
                var currentWork = data[index];
                switch (currentWork.WorkState) {
                    case 0:
                        worksUpload.push(currentWork);
                        break;
                    case 1:
                        worksWaiting.push(currentWork);
                        break;
                    case 2:
                        worksProcessing.push(currentWork);
                        break;
                    case 3:
                        worksFinished.push(currentWork);
                        break;
                    case -1:
                        worksError.push(currentWork);
                        break;
                }
            }
            Control.WorksAll = new WinJS.Binding.List(data);
            Control.WorksUpload = new WinJS.Binding.List(worksUpload);
            Control.WorksWaiting = new WinJS.Binding.List(worksWaiting);
            Control.WorksProcessing = new WinJS.Binding.List(worksProcessing);
            Control.WorksFinished = new WinJS.Binding.List(worksFinished);
            Control.WorksError = new WinJS.Binding.List(worksError);
            WinJS.UI.processAll().done(function () {
                var splitView = document.querySelector(".splitView").winControl;
                new WinJS.UI._WinKeyboard(splitView.paneElement);
                Control.LoadControls();
                Common.Load();
                Control.Resize();
            });
        });
    }
});
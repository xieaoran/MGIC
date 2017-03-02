WinJS.Namespace.define("Common", {
    LocationSources: [],
    LocationSource: WinJS.Binding.define({
        Id: 0,
        Name: "",
        Latitude: 0.0,
        Longitude: 0.0,
        RunningState: "",
        IPAddress: "",
        CPULoad: 0,
        MemoryLoad: 0,
        TotalMemory: 0,
        LastRefresh: ""
    }),
    WorkSizeSources: [],
    WorkSizeSource: WinJS.Binding.define({
        Id: 0,
        Name: "",
        ThreadCount: 0
    }),
    ContractSizeSources: [],
    ContractSizeSource: WinJS.Binding.define({
        Id: 0,
        Name: "",
        ThreadCount: 0
    }),
    RunningStateToColor: WinJS.Binding.initializer(
        function RunningStateToColor(source, sourceProperty, dest, destProperty) {
            function setColor() {
                dest.style.color = runningStateToColor(source.RunningState);
            }

            function runningStateToColor(runningState) {
                return runningState == "正常" ? "#00A600" : "#BF1E4B";
            }

            return WinJS.Binding.bind(source, {
                RunningState: setColor
            });
        }
    ),
    Load: function (callback) {
        SuccessDialog.LoadControls();
        ErrorDialog.LoadControls();
        LoginDialog.LoadControls();
        LogoutDialog.LoadControls();
        RegisterDialog.LoadControls();
        NewWorkDialog.LoadControls();
        $.get(API.GetAllLocations, function (locations) {
            for (var index = 0; index < locations.length; index++) {
                var currentLocation = locations[index];
                var currentLocationSource = new Common.LocationSource({
                    Id: currentLocation.Id,
                    Name: currentLocation.Name,
                    Latitude: currentLocation.Latitude,
                    Longitude: currentLocation.Longitude,
                    RunningState: currentLocation.RunningState ? "正常" : "异常",
                    IPAddress: currentLocation.IPAddress,
                    CPULoad: currentLocation.CPULoad,
                    MemoryLoad: currentLocation.MemoryLoad,
                    TotalMemory: currentLocation.TotalMemory,
                    LastRefresh: currentLocation.LastRefresh
                });
                Common.LocationSources.push(currentLocationSource);
                NewWorkDialog.ServerSelectTemplate.render(currentLocationSource).then(
                    function (e) {
                        NewWorkDialog.ServerSelect.appendChild(e.children[0]);
                    });
            }
        }).done(function () {
            $.get(API.GetAllWorkSizes, function (worksizes) {
                for (var index = 0; index < worksizes.length; index++) {
                    var currentWorkSize = worksizes[index];
                    var currentWorkSizeSource = new Common.WorkSizeSource({
                        Id: currentWorkSize.Id,
                        Name: currentWorkSize.Name + " (" + currentWorkSize.ThreadCount + " 线程数)",
                        ThreadCount: currentWorkSize.ThreadCount
                    });
                    Common.WorkSizeSources.push(currentWorkSizeSource);
                    NewWorkDialog.WorkSizeSelectTemplate.render(currentWorkSizeSource).then(
                        function (e) {
                            NewWorkDialog.WorkSizeSelect.appendChild(e.children[0]);
                        });
                }
            }).done(function () {
                $.get(API.GetAllContractSizes, function (contractsizes) {
                    for (var index = 0; index < contractsizes.length; index++) {
                        var currentContractSize = contractsizes[index];
                        var currentContractSizeSource = new Common.ContractSizeSource({
                            Id: currentContractSize.Id,
                            Name: currentContractSize.Name + " (" + currentContractSize.ThreadCount + " 线程数)",
                            ThreadCount: currentContractSize.ThreadCount
                        });
                        Common.ContractSizeSources.push(currentContractSizeSource);
                        RegisterDialog.ContractSizeSelectTemplate.render(currentContractSizeSource).then(
                            function (e) {
                                RegisterDialog.ContractSizeSelect.appendChild(e.children[0]);
                            });
                    }
                }).done(callback);
            });
        });
    }
});

WinJS.Namespace.define("NewWorkDialog", {
    StepBasic: null,
    StepBasicCallBack: function (e) {
        if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.none) {
            e.preventDefault();
        }
        else if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.primary) {
            $.post(API.NewWork, {
                csrfmiddlewaretoken: Utils.CSRFToken,
                name: NewWorkDialog.Name.value,
                location: NewWorkDialog.ServerSelect.value,
                worksize: NewWorkDialog.WorkSizeSelect.value
            }, function (data) {
                if (data.success) {
                    NewWorkDialog.StepUploadShow(data.work);
                }
                else {
                    ErrorDialog.Show(data.error);
                }
            });
        }
    },
    StepUpload: null,
    StepUploadShow: function (workId) {
        NewWorkDialog.WorkFileUpload.uploadifive({
            height: 30,
            uploadScript: API.UploadWorkFile,
            fileType: "application/x-zip-compressed",
            multi: false,
            buttonText: "上传",
            formData: {
                csrfmiddlewaretoken: Utils.CSRFToken,
                work: workId
            },
            onError: function (errorType) {
                ErrorDialog.Show(-3001);
            },
            onUploadComplete: function (file, data) {
                NewWorkDialog.StepUpload.hide();
                var dataJson = $.parseJSON(data);
                if (dataJson.success) {
                    SuccessDialog.Show(dataJson.info);
                }
                else {
                    ErrorDialog.Show(dataJson.error);
                }
            }
        });
        NewWorkDialog.StepUpload.show();
    },
    StepUploadCallBack: function (e) {
        if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.none) {
            e.preventDefault();
        }
    },
    Name: null,
    ServerSelectTemplate: null,
    ServerSelect: null,
    WorkSizeSelectTemplate: null,
    WorkSizeSelect: null,
    WorkFileUpload: null,
    LoadControls: function () {
        NewWorkDialog.StepBasic = $("#newWorkDialogBasic")[0].winControl;
        NewWorkDialog.StepBasic.addEventListener("beforehide", NewWorkDialog.StepBasicCallBack, false);
        NewWorkDialog.StepUpload = $("#newWorkDialogUpload")[0].winControl;
        NewWorkDialog.StepUpload.addEventListener("beforehide", NewWorkDialog.StepUploadCallBack, false);
        NewWorkDialog.Name = $("#name")[0];
        NewWorkDialog.ServerSelectTemplate = $("#serverSelectTemplate")[0].winControl;
        NewWorkDialog.ServerSelect = $("#serverSelect")[0];
        NewWorkDialog.WorkSizeSelectTemplate = $("#workSizeSelectTemplate")[0].winControl;
        NewWorkDialog.WorkSizeSelect = $("#workSizeSelect")[0];
        NewWorkDialog.WorkFileUpload = $("#workFileUpload");
    },
    Show: function () {
        if (Common.WorkSizeSources.length == 0) ErrorDialog.Show(-2004);
        else NewWorkDialog.StepBasic.show();
    }
});

WinJS.Namespace.define("ErrorDialog", {
    Dialog: null,
    ErrorMessage: null,
    LoadControls: function () {
        ErrorDialog.Dialog = $("#errorDialog")[0].winControl;
        ErrorDialog.ErrorMessage = $("#errorMessage")[0];
    },
    Errors: {
        "-1": "请求方式不正确，请按规定流程操作。",
        "-1001": "用户不存在，请核对用户名后重试。",
        "-1002": "密码错误，请核对密码后重试。",
        "-1003": "用户名已存在，请更换用户名后重试。",
        "-2001": "用户未登录，请登录后重试。",
        "-2002": "未找到指定的工作项ID，请创建新工作项后重试。",
        "-2003": "该工作项不是由当前登录的用户创建的，请使用正确的用户登录后重试。",
        "-2004": "您契约中的可用核心已被全部占用，请修改您的契约类型。",
        "-3001": "错误的文件类型，请重新选择一个zip格式的压缩文件。"
    },
    Show: function (errorId) {
        ErrorDialog.ErrorMessage.textContent = ErrorDialog.Errors[errorId];
        ErrorDialog.Dialog.show();
    }
});

WinJS.Namespace.define("SuccessDialog", {
    Dialog: null,
    SuccessMessage: null,
    LoadControls: function () {
        SuccessDialog.Dialog = $("#successDialog")[0].winControl;
        SuccessDialog.Dialog.addEventListener("beforehide", SuccessDialog.DialogCallBack, false);
        SuccessDialog.SuccessMessage = $("#successMessage")[0];
    },
    Infos: {
        "1001": "用户登录成功。",
        "1002": "注册新用户成功。",
        "3002": "工作项文件上传成功，您的工作项已进入等待队列，我们将尽快开始进行处理。"
    },
    Show: function (infoId) {
        SuccessDialog.SuccessMessage.textContent = SuccessDialog.Infos[infoId];
        SuccessDialog.Dialog.show();
    },
    DialogCallBack: function (e) {
        if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.none) {
            e.preventDefault();
        }
        else {
            location.reload(true);
        }
    }
});

WinJS.Namespace.define("LoginDialog", {
    Dialog: null,
    UserName: null,
    Password: null,
    LoadControls: function () {
        LoginDialog.Dialog = $("#loginDialog")[0].winControl;
        LoginDialog.Dialog.addEventListener("beforehide", LoginDialog.DialogCallBack, false);
        LoginDialog.UserName = $("#loginUsername")[0];
        LoginDialog.Password = $("#loginPassword")[0];
    },
    Show: function () {
        LoginDialog.Dialog.show();
    },
    DialogCallBack: function (e) {
        if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.none) {
            e.preventDefault();
        }
        else if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.primary) {
            $.post(API.UserLogin, {
                csrfmiddlewaretoken: Utils.CSRFToken,
                username: LoginDialog.UserName.value,
                password: sha256_digest(LoginDialog.Password.value)
            }, function (data) {
                if (data.success) {
                    SuccessDialog.Show(data.info);
                }
                else {
                    ErrorDialog.Show(data.error);
                }
            });
        }
    }
});

WinJS.Namespace.define("RegisterDialog", {
    Dialog: null,
    UserName: null,
    Password: null,
    ContractSizeSelect: null,
    ContractSizeSelectTemplate: null,
    LoadControls: function () {
        RegisterDialog.Dialog = $("#registerDialog")[0].winControl;
        RegisterDialog.Dialog.addEventListener("beforehide", RegisterDialog.DialogCallBack, false);
        RegisterDialog.UserName = $("#regUsername")[0];
        RegisterDialog.Password = $("#regPassword")[0];
        RegisterDialog.ContractSizeSelectTemplate = $("#contractSizeSelectTemplate")[0].winControl;
        RegisterDialog.ContractSizeSelect = $("#contractSizeSelect")[0];
    },
    Show: function () {
        RegisterDialog.Dialog.show();
    },
    DialogCallBack: function (e) {
        if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.none) {
            e.preventDefault();
        }
        else if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.primary) {
            $.post(API.UserRegister, {
                csrfmiddlewaretoken: Utils.CSRFToken,
                username: RegisterDialog.UserName.value,
                password: sha256_digest(RegisterDialog.Password.value),
                contract: RegisterDialog.ContractSizeSelect.value
            }, function (data) {
                if (data.success) {
                    SuccessDialog.Show(data.info);
                }
                else {
                    ErrorDialog.Show(data.error);
                }
            });
        }
    }
});

WinJS.Namespace.define("LogoutDialog",{
    Dialog: null,
    LoadControls: function () {
        LogoutDialog.Dialog = $("#logoutDialog")[0].winControl;
        LogoutDialog.Dialog.addEventListener("beforehide", LogoutDialog.DialogCallBack, false);
    },
    Show: function () {
        LogoutDialog.Dialog.show();
    },
    DialogCallBack: function (e) {
        if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.none) {
            e.preventDefault();
        }
        else if (e.detail.result == WinJS.UI.ContentDialog.DismissalResult.primary) {
            window.location = "/api/users/logout/";
        }
    }
});

WinJS.Namespace.define("Utils", {
    CSRFToken: null,
    processCSRFToken: function () {
        Utils.CSRFToken = $("input[name='csrfmiddlewaretoken']")[0].value;
    }
});

WinJS.Namespace.define("API", {
    UserLogin: "/api/users/login/",
    UserRegister: "/api/users/register/",
    GetAllLocations: "/api/locations/",
    GetAllWorkSizes: "/api/worksizes/",
    GetAllContractSizes: "/api/contractsizes/",
    GetWorks: "/api/works/",
    NewWork: "/api/works/new/",
    UploadWorkFile: "/api/works/uploadfile/"
});

WinJS.Utilities.markSupportedForProcessing(NewWorkDialog.Show);
WinJS.Utilities.markSupportedForProcessing(LoginDialog.Show);
WinJS.Utilities.markSupportedForProcessing(RegisterDialog.Show);
WinJS.Utilities.markSupportedForProcessing(LogoutDialog.Show);
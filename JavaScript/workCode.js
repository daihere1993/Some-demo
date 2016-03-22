$scope.parameters = [];
$scope.normalLists = [];
$scope.sendEmailLists = [];

$scope.parameterModel = (function () {
    var _rthis;
    var _inputWidget= {};
    //缓存列表，存放各个控件的destroy函数
    _inputWidget.destroyFnList = [];
    _inputWidget.disabledFnList = [];
    _inputWidget.listen = function (cashListType, fn) {
        this[cashListType].push(fn);
    };
    _inputWidget.trigger = function (cashListType) {
        for (var i = 0, fn; fn = this[cashListType][i ++];) {
            fn.apply(this, arguments);
        }
        this[cashListType] = [];
    };

    //初始化input控件的策略对象
    var _createWidgetStrategies = {
        "int": function (parameter) {
            var text = new Text({editable: true});
            text.setValue(parameter.value);
            var id = $scope.view.getGlobalId("parameter_"+ parameter.name);
            text.placeAt(id);
            text.startup();
            _inputWidget.listen("destroyFnList", function () {
                text.destroy();
            });
            _inputWidget.listen("disabledFnList", function () {
                text.set("disabled", arguments[1])
            });
        },
        "boolean": function (parameter) {
            var store = new Store({
                data: [
                    { name: "是", id: "true" },
                    { name: "否", id: "false" }
                ]
            });

            var id = $scope.view.getGlobalId("parameter_"+ parameter.name); 
            var comboBox = new ComboBox({
                value: parameter.value,
                store: store
            });
            comboBox.placeAt(id);
            comboBox.startup();
            _inputWidget.listen("destroyFnList", function () {
                comboBox.destroy();
            });
            _inputWidget.listen("disabledFnList", function () {
                comboBox.set("disabled", arguments[1])
            });

        },
        "date": function (parameter) {
            var dateBox = new DateTimeBox({editable: true});
            var id = $scope.view.getGlobalId("parameter_"+ parameter.name);
            dateBox.placeAt(id);
            dateBox.startup();
            _inputWidget.listen("destroyFnList", function () {
                dateBox.destroy();
            });
            _inputWidget.listen("disabledFnList", function () {
                dateBox.set("disabled", arguments[1])
            });
        }
    }
    return {
        createView: function (isFirstLoad) {
            _rthis = this;
            var def_manager = angular.fusion.defManager;
            def_manager.getTargetDefAsync($scope.modelName).then(function (def) {
                /*****************************************测试数据*****************************************/
                var lists = [
                    { name: "para1", value: "10" },
                    { name: "para2", value: "参数2" },
                    { name: "para3", value: "是" },
                    { name: "para4_email", value: "否" }
                ];
                /*****************************************测试数据*****************************************/
                if (!$scope.parameters.length) {
                    $scope.$apply(function () {
                        $scope.parameters = def.parameters;
                        array.forEach($scope.parameters, function (item, i) {
                            var strArr = $scope.parameters[i].name.split("_");
                            if (strArr[strArr.length - 1] === "email") {
                                $scope.sendEmailLists.push($scope.parameters[i]);
                            } else {
                                $scope.normalLists.push($scope.parameters[i]);
                            }
                        })
                    });
                }

                //clearView
                if (_inputWidget.destroyFnList.length) {
                    _inputWidget.trigger("destroyFnList");
                }

                array.forEach($scope.parameters, function (item, i) {
                    _createWidgetStrategies[$scope.parameters[i].type](lists[i]);
                })
            });
        },
        showInheritPara: function () {
            _inputWidget.trigger("disabledFnList", $scope.isInheritPara);
        }
    }  
})();
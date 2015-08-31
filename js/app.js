var autoComplete = angular.module('AutoComplete', ["ngAnimate"]);
autoComplete.controller("SearchCtrl", function ($scope, $http, $q) {

    $scope.items = [];
    $scope.loggedItems = [];
    $scope.btnClear = false;
    $scope.showSpinner = false;
    $scope.title = "";
    $scope.numberOfItems = 10;
    $scope.resultRow = "result-row";
    $scope.showItemDetail = false;
    $scope.selectedItemPortions = [];
    $scope.activePromise = null;

    //get logged food if there is any
    $scope.getRecent = function () {

        $scope.items = [];
        $scope.btnClear = true;

        var foodList = document.getElementById("result");
        if ($scope.loggedItems.length > 0) {
            foodList.className = "search-area";
            foodList.style.minHeight = "570px";
            foodList.style.maxHeight = "570px";
            foodList.style.transition = "0.3s";
        } else {
            foodList.className = "";
            foodList.style.minHeight = "0px";
            foodList.style.maxHeight = "0px";
            foodList.style.transition = "0.3s";
        }


        var searchResults = document.getElementById("searchResults");
        searchResults.className = "resultList";

        document.getElementById("searchArea").className = "search-area";

        $scope.result = "";
        $scope.title = "Logged data";

        for (var i = 0; i < $scope.loggedItems.length; i++) {
            $scope.items.push({
                class: "fa fa-clock-o",
                foodItem: $scope.loggedItems[i].foodItem,
                active: true
            });
        }
    };

    //clear the food list
    $scope.clearList = function () {
        var countriesList = document.getElementById("result");
        countriesList.style.minHeight = "0px";
        countriesList.style.maxHeight = "0px";
        document.getElementById("txtFoodName").value = "";
        $scope.btnClear = false;
        $scope.items = [];
        $scope.showSpinner = false;
    };

    //on input field change
    $scope.changeInput = function (event) {

        var input = document.getElementById("txtFoodName");

        if (input.value === "") {
            $scope.clearList();

        }

        var foodList = document.getElementById("result");
        foodList.className = "search-area";
        foodList.style.minHeight = "570px";
        foodList.style.maxHeight = "570px";
        foodList.style.transition = "0.3s";

        $scope.title = "";
        $scope.btnClear = true;
        $scope.showSpinner = true;

        $scope.items = [];

        var KeyID = event.keyCode; //check which key is pressed on the keyboard

        if (KeyID == 27) {
            //if ESC is pressed
            $scope.clearList();
            return false;
        }
        var promise;

        if (KeyID == 8) {
            //if backspace is pressed
            if (input.value === "") {
                $scope.clearList();
                return false;
            } else {
                promise = $scope.getData(input.value);
                promise.then(function (data) {
                    $scope.matchResults(data.data);
                }, function () {
                    $scope.items = [];
                });
            }
        } else {
            promise = $scope.getData(input.value);
            promise.then(function (data) {
                $scope.matchResults(data.data);
            }, function () {
                $scope.items = [];
            });
        }
    };

    $scope.getData = function (value) {

        //create a promise
        var currentPromise = $http.get("https://test.holmusk.com/food/search?q=" + value);
        $scope.activePromise = currentPromise;

        //self return function to get the data with a promise from the server
        return (function () {

            var deferred = $q.defer();
            currentPromise.then(function (data) {
                if (currentPromise === $scope.activePromise) {
                    deferred.resolve(data);
                    $scope.activePromise = null;
                }
            }).catch(function (e) {
                if (currentPromise === $scope.activePromise) {
                    deferred.reject(e);
                    $scope.activePromise = null;
                }
            });

            return deferred.promise;
        })();
    };

    $scope.matchResults = function (result) {
        var input = document.getElementById("txtFoodName");
        $scope.title = "Search results for " + input.value;
        $scope.showSpinner = false;
        if (result.length !== 0) {
            result.map(function (item) {
                $scope.items.push({
                    class: "fa fa-cutlery",
                    foodItem: item,
                    active: false
                });
            });
        }
        $scope.markItems();
    };

    //mark items as logged if they are in the log list
    $scope.markItems = function () {
        if ($scope.loggedItems.length !== 0) {
            for (var i = 0; i < $scope.items.length; i++) {
                for (var j = 0; j < $scope.loggedItems.length; j++) {
                    if ($scope.loggedItems[j].foodItem._id === $scope.items[i].foodItem._id) {
                        $scope.items[i].active = true;
                    }
                }
            }
        }
    };

    //save the food Item
    $scope.logFood = function (foodItem, index) {
        $scope.loggedItems.push(foodItem);
        $scope.items[index].active = true;
    };

    //show food item details
    $scope.itemDetails = function (selectedItem, index) {
        $scope.showItemDetail = true;
        $scope.loggedItemIndex = index;
        $scope.selectedMealName = selectedItem.name;
        $scope.selectedItemPortions = selectedItem.portions;
    };

    //delete food item from logged list
    $scope.deleteLoggedItem = function (itemIndex) {
        if (confirm("Are you sure you want to delete this log?") == true) {
            $scope.loggedItems.splice(itemIndex, 1);
            $scope.showItemDetail = false;
        } else {
            return false;
        }
    };

    //delete all food items from logged list
    $scope.deleteAllLoggedItems = function () {
        if (confirm("Are you sure you want to delete all items?") == true) {
            $scope.loggedItems = [];
            $scope.showItemDetail = false;
        } else {
            return false;
        }
    };
});
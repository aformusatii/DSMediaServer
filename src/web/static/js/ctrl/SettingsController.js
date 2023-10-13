/* *****************************************************************************
*  Settings Controller
* *****************************************************************************/
const SettingsController = function($rootScope, $scope, $route, $routeParams, $location, $http) {
    console.log('SettingsController');

    $rootScope.activeMenu = 'settings';

    $scope.loadConfiguration = function(callback) {
        loadConfiguration($scope, $http, callback);
    }

    $scope.saveConfiguration = function(content) {
        updateConfiguration($scope, $http, content);
    }
}

/* *****************************************************************************
*  HTTP Calls
* *****************************************************************************/
const loadConfiguration = function($scope, $http, callback) {
    $http({
        method: 'GET',
        url: '/configuration'
    }).then(function successCallback(response) {
        callback(response.data);

    }, function errorCallback(response) {
        showError(response);
    });
}

const updateConfiguration = function($scope, $http, content) {
    $http({
        method: 'POST',
        url: '/configuration',
        data: content,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        },
    }).then(function successCallback(response) {
        if (response.data.ok) {
            showInfo('Updated...');
        } else {
            showError(response.data);
        }

    }, function errorCallback(response) {
        showError(response);
    });
}
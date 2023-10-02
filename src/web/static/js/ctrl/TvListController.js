/* *****************************************************************************
*  Tv List Controller
* *****************************************************************************/
const TvListController = function($rootScope, $scope, $route, $routeParams, $location, $http) {
    console.log('TvListController');

    $rootScope.activeMenu = 'tvlist';

    $scope.scan = function() {
        scanForDevices($scope, $http);
    }

    $scope.sendWakeOnLan = function() {
        sendWakeOnLan($scope, $http);
    }

    $scope.setPlayback = function(play) {
        setPlayback($scope, $http, play);
    }

    $scope.updateDevice = function(device) {
        updateDevice($scope, $http, device);
    }

    const loadDevicesTimer = window.setInterval(loadDevices, 1000, $scope, $http);
    loadDevices($scope, $http);

    const getPlaybackTimer = window.setInterval(getPlayback, 5000, $scope, $http);
    getPlayback($scope, $http);

    this.$onDestroy = function() {
        window.clearInterval(loadDevicesTimer);
        window.clearInterval(getPlaybackTimer);
    };
}

const scanForDevices = function($scope, $http) {
    $http({
        method: 'POST',
        url: '/actions/scan',
        data: {}
    }).then(function successCallback(response) {
        if (response.data.ok) {
            showInfo('Started scanning...');
        } else {
            showError(response.data);
        }

    }, function errorCallback(response) {
        showError(response);
    });

}

const loadDevices = function($scope, $http) {
    $http({
        method: 'GET',
        url: '/devices'
    }).then(function successCallback(response) {
        console.log('response.data', response.data);

        $scope.devices = response.data;

    }, function errorCallback(response) {
        showError(response);
    });
}

const sendWakeOnLan = function($scope, $http) {
    $http({
        method: 'POST',
        url: '/actions/sendWakeOnLan',
        data: {}
    }).then(function successCallback(response) {
        if (response.data.ok) {
            showInfo('Sensing WakeOnLan message...');
        } else {
            showError(response.data);
        }

    }, function errorCallback(response) {
        showError(response);
    });
}

const setPlayback = function($scope, $http, play) {
    $http({
        method: 'POST',
        url: '/actions/playback',
        data: {
            play: play
        }
    }).then(function successCallback(response) {
        if (response.data.ok) {
            $scope.playback = response.data;
            showInfo('Sent playback command...');
        } else {
            showError(response.data);
        }

    }, function errorCallback(response) {
        showError(response);
    });
}

const getPlayback = function($scope, $http) {
    $http({
        method: 'GET',
        url: '/actions/playback'
    }).then(function successCallback(response) {
        $scope.playback = response.data;

    }, function errorCallback(response) {
        showError(response);
    });
}

const updateDevice = function($scope, $http, device) {
    $http({
        method: 'POST',
        url: `/devices/${device.key}`,
        data: {
            selected: device.selected
        }
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

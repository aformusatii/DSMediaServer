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

    // ------------------ Edit TV ------------------
    $scope.modalEditTv = {};
    $scope.modalEditTv.save = function(device) {
        updateDevice($scope, $http, device);
    }

    $scope.openEditTv = function(device) {
        $scope.modalEditTv.open(device);
    }

    // ------------------ Scheduler ------------------
    $scope.scheduler = {};
    $scope.modalScheduler = {};
    $scope.modalScheduler.save = function() {
        updateScheduler($scope, $http);
    }

    $scope.openScheduler = function() {
        getScheduler($scope, $http, function() {
            $scope.modalScheduler.open();
        });
    }

    getScheduler($scope, $http);

    // ------------------ Deletion ------------------
    $scope.deleteTv = function(device) {
        $rootScope.modalConfirm.open(`Are you sure you want to delete [${device.friendlyName}]?`, function() {
            deleteDevice($scope, $http, device);
        });
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

/* *****************************************************************************
*  HTTP Calls
* *****************************************************************************/
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
            selected: device.selected,
            wakeOnLanStrategy: device.wakeOnLanStrategy
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

const deleteDevice = function($scope, $http, device) {
    $http({
        method: 'DELETE',
        url: `/devices/${device.key}`
    }).then(function successCallback(response) {
        if (response.data.ok) {
            showInfo('Deleted...');
            loadDevices($scope, $http);
        } else {
            showError(response.data);
        }

    }, function errorCallback(response) {
        showError(response);
    });
}

const getScheduler = function($scope, $http, callback) {
    $http({
        method: 'GET',
        url: '/scheduler'
    }).then(function successCallback(response) {
        copyProperties(response.data, $scope.scheduler);

        if (callback) {
            callback();
        }
    }, function errorCallback(response) {
        showError(response);
    });
}

const updateScheduler = function($scope, $http) {
    $http({
        method: 'POST',
        url: '/scheduler',
        data: $scope.scheduler
    }).then(function successCallback(response) {
        if (response.data.ok) {
            showInfo('Scheduler updated...');
        } else {
            showError(response.data);
        }

    }, function errorCallback(response) {
        showError(response);
    });
}

/* *****************************************************************************
*  Video Files Controller
* *****************************************************************************/
const VideoFilesController = function($rootScope, $scope, $route, $routeParams, $location, $http) {
    console.log('VideoFilesController');

    $rootScope.activeMenu = 'videofiles';

    $scope.loadVideos = function() {
        loadVideos($scope, $http);
    }

    loadVideos($scope, $http);

    $scope.modalVideoTranscoder = {}
    $scope.transcodeMediaFiles = function() {
        $scope.modalVideoTranscoder.open($scope.videoData.rawInputFiles.filter(mediaFile => mediaFile.selected));
    }

    $scope.modalVideoTranscoder.done = function () {
        loadVideos($scope, $http);
    }

    $scope.copyMediaFiles = function() {
        sendGenericAction($scope, $http, $scope.videoData.rawInputFiles, 'copy');
    }

    $scope.deleteRawMediaFiles = function() {
        $rootScope.modalConfirm.open(`Are you sure you want to delete selected files?`, function() {
            sendGenericAction($scope, $http, $scope.videoData.rawInputFiles, 'delete');
        });
    }

    $scope.deleteProcessedMediaFiles = function() {
        $rootScope.modalConfirm.open(`Are you sure you want to delete selected files?`, function() {
            sendGenericAction($scope, $http, $scope.videoData.processedInputFiles, 'delete');
        });
    }

    $scope.onUploadComplete = function() {
        showInfo('Uploaded');
        loadVideos($scope, $http);
    }

    $scope.selectedVideoFile = function() {
        $scope.anyRawFilesSelected = false;
        $scope.videoData.rawInputFiles.forEach(file => {
            if (file.selected) {
                $scope.anyRawFilesSelected = true;
            }
        });

        $scope.anyProcessedFilesSelected = false;
        $scope.videoData.processedInputFiles.forEach(file => {
            if (file.selected) {
                $scope.anyProcessedFilesSelected = true;
            }
        });
    }
}

/* *****************************************************************************
*  HTTP Calls
* *****************************************************************************/
const loadVideos = function($scope, $http) {
    $http({
        method: 'GET',
        url: '/videos'
    }).then(function successCallback(response) {
        $scope.videoData = response.data;

        $scope.anyRawFilesSelected = false;
        $scope.anyProcessedFilesSelected = false;

    }, function errorCallback(response) {
        showError(response);
    });
}

const sendGenericAction = function($scope, $http, mediaFiles, action) {
    $http({
        method: 'POST',
        url: `/videos/do`,
        data: {
            action: action,
            mediaFiles: mediaFiles.filter(mediaFile => mediaFile.selected)
        }
    }).then(function successCallback(response) {
        if (response.data.ok) {
            showInfo(`Executed [${action}].`);
        } else {
            showError(response.data);
        }

        loadVideos($scope, $http);

    }, function errorCallback(response) {
        showError(response);
    });
}

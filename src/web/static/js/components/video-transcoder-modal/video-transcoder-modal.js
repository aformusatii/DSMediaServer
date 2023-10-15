THEAPP.component('videoTranscoderModal', {
    templateUrl: 'js/components/video-transcoder-modal/video-transcoder-modal.html',
    bindings: {
        controller: '&',
    },
    controller: function($element, $http, $scope) {
        this.$onInit=function() {
            const $this = this;
            const $modal = $element.find('.modal');
            const modal = new bootstrap.Modal($modal);

            $scope.inProgress = false;

            if ($this.controller) {
                const ctrl = $this.controller();

                ctrl.open = function(mediaFiles) {
                    $scope.mediaFiles = mediaFiles;

                    getTranscoders($scope, $http, function() {
                        modal.show();
                    });
                };

                $scope.startTranscoding = function() {
                    $scope.inProgress = true;
                    const transcoder = $scope.transcoders.filter(transcoder => transcoder.selected)[0];
                    transcodeVideoFiles($scope, $http, $scope.mediaFiles, transcoder, function() {
                        modal.hide();
                        ctrl.done();
                    });
                }

                $scope.selectTranscoder = function(transcoderId) {
                    $scope.transcoders.forEach(transcoder => {
                        transcoder.selected = (transcoder.id === transcoderId);
                    });
                }
            }
        }
    }
});

const getTranscoders = function($scope, $http, callback) {
    $http({
        method: 'GET',
        url: '/transcoders'
    }).then(function successCallback(response) {
        $scope.transcoders = response.data;
        callback();

    }, function errorCallback(response) {
        showError(response);
    });
}

const transcodeVideoFiles = function($scope, $http, mediaFiles, transcoder, callback) {
    $http({
        method: 'POST',
        url: `/videos/transcode`,
        data: {
            mediaFiles: mediaFiles,
            transcoder: transcoder,
        }
    }).then(function successCallback(response) {
        if (response.data.ok) {
            showInfo(`Transcoding finished.`);
            callback();
        } else {
            showError(response.data.exception);
        }
        $scope.inProgress = false;

    }, function errorCallback(response) {
        showError(response);
        $scope.inProgress = false;
    });
}
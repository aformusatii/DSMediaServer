THEAPP.component('fileUploader', {
    templateUrl: 'js/components/file-uploader/file-uploader.html',
    bindings: {
        onComplete: '&'
    },
    controller: function($element, $http, $scope) {
        this.$onInit=function() {
            const $this = this;
            $($element).find('.drag-and-drop-zone').dmUploader({
                url: '/videos/upload',
                maxFileSize: 1000000000, // 3 Megs max
                onComplete: function() {
                    if ($this.onComplete) {
                        $this.onComplete();
                    }
                },
                onFileSizeError: function(file) {
                    showError(`File [${file.name}] cannot be added: size excess limit`);
                }
            });
        }
    }
});
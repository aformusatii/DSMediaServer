THEAPP.component('tvEditModal', {
    templateUrl: 'js/components/edit-tv-modal/edit-tv-modal.html',
    bindings: {
        controller: '&'
    },
    controller: function($element, $http, $scope) {
        this.$onInit=function() {
            const $this = this;
            const $modal = $element.find('.modal');
            const modal = new bootstrap.Modal($modal);

            if ($this.controller) {
                const ctrl = $this.controller();

                ctrl.open = function(device) {
                    $scope.device = device;
                    modal.show();
                };

                $scope.saveInModal = function() {
                    ctrl.save($scope.device);
                    modal.hide();
                }
            }

            initEditTvModalProps($scope);
        }
    }
});

const initEditTvModalProps = function($scope) {
    $scope.deviceProperties = [
        {label: 'Friendly Name', property:'friendlyName', type: 'text'},
        {label: 'Model', property:'modelName', type: 'text'},
        {label: 'Model Desc.', property:'modelDescription', type: 'text'},
        {label: 'IP', property:'ip', type: 'text'},
        {label: 'MAC', property:'mac', type: 'text'},
        {label: 'Playback State', property:'playbackState', type: 'text'},
        {label: 'Connection State', property:'connectionState', type: 'text'},
        {label: 'WakeOnLan', property:'wakeOnLanStrategy', options: ['None', 'Default', 'CustomV2'], type: 'select'},
        {label: 'Position Info', property:'positionInfo', type: 'text'},
    ]
}
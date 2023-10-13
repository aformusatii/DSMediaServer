THEAPP.component('confirmationModal', {
    templateUrl: 'js/components/confirmation-modal/confirmation-modal.html',
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

                ctrl.open = function(message, callback) {
                    $scope.message = message;
                    $scope.callback = callback;
                    modal.show();
                };

                $scope.confirmAction = function() {
                    $scope.callback();
                    modal.hide();
                }
            }

            initEditTvModalProps($scope);
        }
    }
});
THEAPP.component('schedulerModal', {
    templateUrl: 'js/components/scheduler-modal/scheduler-modal.html',
    bindings: {
        controller: '&',
        scheduler: '<'
    },
    controller: function($element, $http, $scope) {
        this.$onInit=function() {
            const $this = this;
            const $modal = $element.find('.modal');
            const modal = new bootstrap.Modal($modal);

            if ($this.controller) {
                const ctrl = $this.controller();

                ctrl.open = function() {
                    modal.show();
                };

                $scope.saveInModal = function() {
                    ctrl.save();
                    modal.hide();
                }
            }

            $scope.scheduler = $this.scheduler;

            $scope.hours = [];
            for (let hour = 0; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    // Format the hour and minute as a string
                    const formattedHour = hour.toString().padStart(2, '0');
                    const formattedMinute = minute.toString().padStart(2, '0');

                    const time = `${formattedHour}:${formattedMinute}`;
                    $scope.hours.push(time);
                }
            }

            $scope.weekDays = [
                {index: 0, label: 'Mon'},
                {index: 1, label: 'Tue'},
                {index: 2, label: 'Wed'},
                {index: 3, label: 'Thu'},
                {index: 4, label: 'Fri'},
                {index: 5, label: 'Sat'},
                {index: 6, label: 'Sun'}
            ]
        }
    }
});
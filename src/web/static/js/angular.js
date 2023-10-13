/* *****************************************************************************
*  Init Angular App
* *****************************************************************************/
window.THEAPP = (function(angular) {
    'use strict';
    console.log('Init Angular Js App');

    const app = angular.module('ngDSMediaServer', ['ngRoute']);
    app
        .controller('DefaultController', DefaultController)
        .controller('TvListController', TvListController)
        .controller('VideoFilesController', VideoFilesController)
        .controller('SettingsController', SettingsController)

        .config(function($routeProvider, $locationProvider) {
            // see https://docs.angularjs.org/api/ngRoute/service/$route#examples
            $routeProvider.otherwise('/tvlist');
            $routeProvider
                .when('/tvlist', {
                    templateUrl: 'parts/tvlist.html',
                    controller: 'TvListController'
                })
                .when('/videofiles', {
                    templateUrl: 'parts/videofiles.html',
                    controller: 'VideoFilesController'
                })
                .when('/settings', {
                    templateUrl: 'parts/settings.html',
                    controller: 'SettingsController'
                });
        });

    angularJsInitHandlers.forEach(callback => {
        callback(app);
    });

    return app;

})(window.angular);

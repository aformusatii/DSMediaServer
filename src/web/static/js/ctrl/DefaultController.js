/* *****************************************************************************
*  Default Controller
* *****************************************************************************/
const DefaultController = function($rootScope, $scope, $route, $routeParams, $location, $http) {
    console.log('DefaultController');

    $rootScope.goto = function(url) {
        window.location = url;
    }
}
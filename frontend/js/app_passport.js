var passportApp = angular.module('passportApp', []);

passportApp.controller('profileController', ['$scope', '$http', function($scope, $http) {
   $scope.profile = false;
   $http.get('/profile').success(function(data) {
		console.log(data);
		if(!data.error) {
			$scope.profile = true;
			$scope.user = data.user;
		}

   });
 }]);

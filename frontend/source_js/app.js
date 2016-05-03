var app = angular.module('hf', ['ngRoute', '720kb.datepicker', '720kb.tooltips', 'hfControllers', 'hfServices']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController',
    activeTab: 'settings'
  }).
  when('/statistics', {
    templateUrl: 'partials/statistics.html',
    controller: 'StatisticsController',
    activeTab: 'statistics'
  }).
  when('/monthly', {
    templateUrl: 'partials/monthly.html',
    controller: 'MonthlyController',
    activeTab: 'monthly'
  }).
  when('/weekly', {
    templateUrl: 'partials/weekly.html',
    controller: 'WeeklyController',
    activeTab: 'weekly'
  }).
  when('/landing',{
    templateUrl: 'partials/landing.html',
    controller: 'LandingController'
  }).
  when('/signup',{
    templateUrl: 'partials/signup.html',
    controller: 'SignUpController'

  }).
  when('/login',{
      templateUrl: 'partials/login.html',
      controller: 'LoginController'
  }).
  otherwise({
    redirectTo: '/signup'
  });
}]);

// http://stackoverflow.com/questions/14703517/angular-js-set-element-height-on-page-load

app.directive('resize', ['$window', '$route', function ($window, $route) {
  return function (scope, element) {
    var w = angular.element($window);
    // var navbarHeight = $('.fixed-nav').height();
    var navbarHeight = 57;
    var changeHeight = function() {
      if($route.current.activeTab !== 'monthly') return;
      element.css('height', (w.height() - navbarHeight) + 'px' );
    };
    w.bind('resize', function () {
      changeHeight();
    });
    changeHeight();
  }
}]);

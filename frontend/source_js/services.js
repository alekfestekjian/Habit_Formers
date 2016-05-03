var hfServices = angular.module('hfServices', []);

// http://weblogs.asp.net/dwahlin/using-an-angularjs-factory-to-interact-with-a-restful-service

hfServices.factory('Database', ['$http', '$window', function($http, $window) {
    var database = {};

    function baseURL() {
        return "http://localhost:4000/api/";
        // return "http://107.170.29.15:4000/api/";
        // return $window.sessionStorage.baseurl;
    }

    database.getUsers = function() {
        return $http.get(baseURL() + "users");
    }

    database.getUser = function(id) {
        return $http.get(baseURL() + "users/" + id);
    }

    database.addUser = function(data) {
        return $http.post(baseURL() + "users", data);
    }

    database.updateUser = function(id, data) {
        return $http.put(baseURL() + "users/" + id, data);
    }

    database.deleteUser = function(user) {
        return $http.delete(baseURL() + "users/" + user._id);
    }

    database.getHabits = function() {
        return $http.get(baseURL() + "habits");
    }

    database.getHabitsByUser = function(id) {
        var params = {
            where : '{"userId" : "' + id + '"}'
        };
        return $http.get(baseURL() + "habits", {params : params});
    }

    database.getHabit = function(id) {
        return $http.get(baseURL() + "habits/" + id);
    }

    database.addHabit = function(habit) {
        return $http.post(baseURL() + "habits", habit);
    }

    database.updateHabit = function(habit) {
        return $http.put(baseURL() + "habits/" + habit._id, habit);
    }

    database.deleteHabit = function(habitID) {
        return $http.delete(baseURL() + "habits/" + habitID);
    }

    database.getBadges = function() {
        return $http.get(baseURL() + "badges");
    }

    return database;

}]);

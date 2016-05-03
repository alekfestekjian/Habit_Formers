var hfControllers = angular.module('hfControllers', ['chart.js']);

hfControllers.controller('NavController', ['$location','$http','$scope','$rootScope', 'Database', '$route',function($location,$http,$scope,$rootScope, Database, $route) {

	// $scope.user;
	$scope.$route = $route;
	$rootScope.show = false;

	$rootScope.user;
	$http.get('/profile').success(function(data) {
	  	if(!data.error) {
		  $rootScope.user = data.user;
	    }
 	});
}]);

hfControllers.controller('MonthlyController', ['$location','$http','$scope','$rootScope', 'Database', '$timeout', function($location,$http,$scope, $rootScope, Database, $timeout) {

	$rootScope.user;
	$http.get('/profile').success(function(data) {
	  	if(!data.error) {
		  $rootScope.user = data.user;
		  //console.log($rootScope.user)
		  if(!$rootScope.user){
			  console.log("NO USER");
			  console.log($location.path())
			  $rootScope.show = false
			  $location.path('/#/login');

		  }else{
			 getData();

		  }
	  	}
 	});

	$rootScope.show = true;
	$scope.show = true;
	$scope.habits;
	$scope.days;
	$scope.date = new Date();
	$scope.month;
	$scope.sixWeeks = false;
	$scope.user;

	var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	function getData() {
		Database.getUser($rootScope.user._id).success(function(data) {
			// $scope.user = data.data;
			$rootScope.user = data.data;
			Database.getHabitsByUser($rootScope.user._id).success(function(data) {
				$scope.habits = data.data;
				setMonth();
			})
			.error(function(data) {
				toastr.error(data.message);
			});
		})
		.error(function(data) {
			toastr.error(data.message);
		});
	}

	$scope.colorClass = function(index, day) {
		var thisDay = "";
		if(day) thisDay = (new Date((new Date(day.date)).toDateString()));
		return "color-" + index + (thisDay && thisDay > Date.now() ? " no-pointer" : "");
	}

	$scope.prevMonth = function() {
		$scope.date.setMonth($scope.date.getMonth() - 1);
		setMonth();
	}

	$scope.nextMonth = function() {
		$scope.date.setMonth($scope.date.getMonth() + 1);
		setMonth();
	}

	$scope.currMonth = function() {
		$scope.date = new Date();
		setMonth();
	}

	$scope.clearAddHabitForm = function() {
		$scope.newStartDate = $scope.newEndDate = $scope.newName =
			$scope.newRepeat = $scope.newRepeatInterval = $scope.newEnterNum =
			$scope.newPickDays = $scope.newNotes = "";
		$scope.newDays = [];
	}

	$scope.clearAddHabitForm();

	$scope.submitAddHabitForm = function() {
		if(!$scope.newStartDate) {
			toastr.error("You must enter a start date");
			return;
		}
		if(!$scope.newEndDate) {
			toastr.error("You must enter an end date");
			return;
		}
		if((new Date($scope.newStartDate)) > (new Date($scope.newEndDate))) {
			toastr.error("The start date should be before the end date");
			return;
		}
		if(!$scope.newName) {
			toastr.error("You must enter a name");
			return;
		}
		if($scope.newRepeat === "") {
			toastr.error("You must select a repeat option");
			return;
		}
		if($scope.newRepeat % 2 == 1 && !$scope.newRepeatInterval) {
			toastr.error("You must enter a repeat interval");
			return;
		}
		if($scope.newRepeat >= 2 && $scope.newDays.every(function(elem) { return !elem; })) {
			toastr.error("You must select at least one day");
			return;
		}

		if($scope.newRepeat % 2 == 0) $scope.newRepeatInterval = 1;

		var repeat = {};

		if($scope.newRepeat <= 1) {
			var theDay = (new Date($scope.newStartDate)).getDay();
			repeat = {
				option: 0,
				days: [theDay],
				interval: $scope.newRepeatInterval
			};
		}
		else {
			var repeatDays = [];
			$scope.newDays.forEach(function(elem, i) {
				if(elem) repeatDays.push(i);
			});
			repeat = {
				option: 1,
				days: repeatDays,
				interval: $scope.newRepeatInterval
			};
		}

		var habit = {
			name: $scope.newName,
			userId: $scope.user._id,
			repeat: repeat,
			start_date: $scope.newStartDate,
			end_date: $scope.newEndDate,
			note: $scope.newNotes
		};
		Database.addHabit(habit).success(function(data) {
			toastr.success("Successfully added new habit");
			getData();
			$('#newHabit').foundation('close');
			$scope.clearAddHabitForm();
		})
		.error(function(data) {
			toastr.error(data.message);
		});
	}

	$scope.changeCompletionStatus = function(oldHabit, currDay) {
		var thisDay = (new Date((new Date(currDay.date)).toDateString()));
		if(thisDay > Date.now()) return;
		var toast = toastr.info('Marking habit progress...', {
		  timeOut: 0,
		  extendedTimeOut: 0
		});
		Database.getHabit(oldHabit.id).success(function(data) {
			var habit = data.data;
			var dayIndex = -1;
			if(habit.complete_days) {
				for(var i = 0; i < habit.complete_days.length; i++) {
					if((new Date(currDay.date)).toDateString() === (new Date(habit.complete_days[i].date)).toDateString()) dayIndex = i;
				}
				if(dayIndex > -1) habit.complete_days.splice(dayIndex, 1);
			}
			else {
				habit.complete_days = [];
			}
			habit.complete_days.push({date: currDay.date, completed: !(oldHabit.completed)});
			Database.updateHabit(habit).success(function(habit) {
				getData();
				toastr.clear(toast);
			})
			.error(function(data){
				toastr.error(data.message);
				toastr.clear(toast);
			});
		})
		.error(function(data) {
			toastr.error(data.message);
			toastr.clear(toast);
		});
	}

	$scope.editHabit = function(habit) {
		$scope.editHabitID = habit._id;
		$scope.editStartDate = habit.start_date;
		$scope.editEndDate = habit.end_date;
		$scope.editName = habit.name;
		$scope.editNotes = habit.notes;
		$scope.editRepeat = 2 * habit.repeat.option + (habit.repeat.interval == 1 ? 0 : 1);
		$scope.editRepeatInterval = habit.repeat.interval;
		$scope.editEnterNum = ($scope.editRepeat % 2 == 1);
		$scope.editPickDays = ($scope.editRepeat >= 2);
		$scope.editDays = [0,0,0,0,0,0,0];
		if(habit.repeat.days) {
			habit.repeat.days.forEach(function(day) {
				$scope.editDays[day] = true;
			});
		}

		$('#editHabit').foundation('open');
	}

	$scope.clearEditHabitForm = function() {
		$scope.editStartDate = $scope.editEndDate = $scope.editName =
				$scope.editRepeat = $scope.editRepeatInterval = $scope.editEnterNum =
				$scope.editPickDays = $scope.editNotes = $scope.editHabitID = "";
		$scope.editDays = [];
	}

	$scope.clearEditHabitForm();

	$scope.showRepeatOptions = function() {
		$scope.newEnterNum = ($scope.newRepeat % 2 == 1);
		$scope.newPickDays = ($scope.newRepeat >= 2);
		$scope.editEnterNum = ($scope.editRepeat % 2 == 1);
		$scope.editPickDays = ($scope.editRepeat >= 2);
	}

	$scope.submitEditHabitForm = function() {
		if(!$scope.editStartDate) {
			toastr.error("You must enter a start date");
			return;
		}
		if(!$scope.editEndDate) {
			toastr.error("You must enter an end date");
			return;
		}
		if((new Date($scope.editStartDate)) > (new Date($scope.editEndDate))) {
			toastr.error("The start date should be before the end date");
			return;
		}
		if(!$scope.editName) {
			toastr.error("You must enter a name");
			return;
		}
		if($scope.editRepeat === "") {
			toastr.error("You must select a repeat option");
			return;
		}
		if($scope.editRepeat % 2 == 1 && !$scope.editRepeatInterval) {
			toastr.error("You must enter a repeat interval");
			return;
		}
		if($scope.editRepeat >= 2 && $scope.editDays.every(function(elem) { return !elem; })) {
			toastr.error("You must select at least one day");
			return;
		}

		if($scope.editRepeat % 2 == 0) $scope.editRepeatInterval = 1;

		var repeat = {};

		if($scope.editRepeat <= 1) {
			var theDay = (new Date($scope.editStartDate)).getDay();
			repeat = {
				option: 0,
				days: [theDay],
				interval: $scope.editRepeatInterval
			};
		}
		else {
			var repeatDays = [];
			$scope.editDays.forEach(function(elem, i) {
				if(elem) repeatDays.push(i);
			});
			repeat = {
				option: 1,
				days: repeatDays,
				interval: $scope.editRepeatInterval
			};
		}

		Database.getHabit($scope.editHabitID).success(function(data) {
			if(!data.data) return;
			var updatedHabit = data.data;

			updatedHabit.name = $scope.editName;
			updatedHabit.userId = $scope.user._id;
			updatedHabit.repeat = repeat;
			updatedHabit.start_date = $scope.editStartDate;
			updatedHabit.end_date = $scope.editEndDate;
			updatedHabit.note = $scope.editNotes;

			Database.updateHabit(updatedHabit).success(function(data) {
				toastr.success("Successfully updated habit");
				getData();
				$('#editHabit').foundation('close');
				$scope.clearEditHabitForm();
			})
			.error(function(data) {
				toastr.error(data.message);
			});
		})
		.error(function(data) {
			toastr.error(data.message);
		});
	}

	$scope.deleteHabit = function() {
		Database.deleteHabit($scope.editHabitID).success(function(data) {
			toastr.success('Habit successfully deleted');
			getData();
			$('#editHabit').foundation('close');
			$scope.clearEditHabitForm();
		})
		.error(function(data) {
			toastr.error(data.message);
		})
	}

	function setMonth() {
		$scope.month = $scope.date.toLocaleString("en-us", { month: "long" }) + ' ' + $scope.date.getFullYear();
		$scope.days = [];

		var firstDayDate = new Date($scope.date.getTime());
		firstDayDate.setDate(1);
		var firstDay = firstDayDate.getDay();
		var currDay = new Date();
		var today = new Date();

		var i = 0;
		while(i < firstDay) {
			currDay = new Date(firstDayDate.getTime());
			currDay.setTime(firstDayDate.getTime()-((firstDay - i)*24*3600000));
			$scope.days.push({
				date: currDay.toString(),
				dayNum: currDay.getDate(),
				dayName: days[currDay.getDay()],
				habits: [],
				past: true
			});
			i++;
		}

		currDay.setTime(firstDayDate.getTime());
		while(currDay.getMonth() == $scope.date.getMonth()) {
			if(currDay.getDate() == today.getDate() &&
				currDay.getMonth() == today.getMonth() &&
				currDay.getYear() == today.getYear()) {
				$scope.days.push({
					date: currDay.toString(),
					dayNum: currDay.getDate(),
					dayName: days[currDay.getDay()],
					habits: [],
					today: true
				});
			} else {
				$scope.days.push({
					date: currDay.toString(),
					dayNum: currDay.getDate(),
					dayName: days[currDay.getDay()],
					habits: []
				});
			}
			currDay.setTime(currDay.getTime()+(1*24*3600000));
		}

		while($scope.days.length % 7 != 0) {
			$scope.days.push({
				date: currDay.toString(),
				dayNum: currDay.getDate(),
				dayName: days[currDay.getDay()],
				habits: [],
				future: true
			});
			currDay.setTime(currDay.getTime()+(1*24*3600000));
		}

		if($scope.days.length / 7 > 5) {
			$scope.sixWeeks = true;
		} else {
			$scope.sixWeeks = false;
		}

		if($scope.days.length / 7 < 5) {
			$scope.fourWeeks = true;
		} else {
			$scope.fourWeeks = false;
		}

		renderHabits();
	}

	function renderHabits() {
		$scope.habits.forEach(function(habit, i) {

			if(habit.repeat.option == 0) {

				var habitStartDate = new Date(habit.start_date);
				var timeIncrement = (((habit.repeat.days[0] - habitStartDate.getDay() + 7) % 7)*24*3600000);
				habitStartDate.setTime(habitStartDate.getTime() + timeIncrement);

				$scope.days.forEach(function(day, j) {
					var thisDay = (new Date((new Date(day.date)).toDateString()));
					if(habitStartDate > thisDay) return;
					if((new Date(habit.end_date)) < thisDay) return;
					if((Math.round((thisDay - habitStartDate)/(1000*60*60*24)) % habit.repeat.interval) == 0) {
						$scope.days[j].habits.push({name: habit.name, num: i, id: habit._id, completed: false});
					}
				});

			} else {

				$scope.days.forEach(function(day, j) {
					var thisDay = (new Date((new Date(day.date)).toDateString()));
					if(new Date(habit.start_date) > thisDay) return;
					if((new Date(habit.end_date)) < thisDay) return;
					habit.repeat.days.forEach(function(day, k) {
						if(day == thisDay.getDay()) {
							$scope.days[j].habits.push({name: habit.name, num: i, id: habit._id, completed: false});
						}
					});
				});

			}

			habit.complete_days.forEach(function(complete, l) {
				if((new Date(complete.date)) < (new Date((new Date($scope.days[0].date)).getTime()-4*60*60*1000))) return;
				if((new Date(complete.date)) > (new Date($scope.days[$scope.days.length - 1].date))) return;

				var dayIndex = Math.round(((new Date(complete.date)).getTime() - (new Date($scope.days[0].date)).getTime())/(60*60*1000*24));
				var habitIndex = -1;
				if($scope.days[dayIndex].habits) {
					for(var m = 0; m < $scope.days[dayIndex].habits.length; m++) {
						if(habit._id === $scope.days[dayIndex].habits[m].id) {
							habitIndex = m;
						}
					}
					if(habitIndex > -1) $scope.days[dayIndex].habits.splice(habitIndex, 1);
				}
				$scope.days[dayIndex].habits.push({name: habit.name, num: i, id: habit._id, completed: complete.completed});
			});
		});

		// fix sizing of habits

		$timeout(function() {
			console.log($('.day').length);
			$('.day').each(function(index, item) {
				var numChildren = $(this).children('.calendarHabit').length;
				switch(numChildren) {
					case 6:
						$(this).children('.calendarHabit').width("33.3333333333333%");
						$(this).children('.calendarHabit').height("50%");
						break;

					case 5:
					case 7:
					case 8:
						$(this).children('.calendarHabit').width("25%");
						$(this).children('.calendarHabit').height("50%");
						break;

					case 4:
						$(this).children('.calendarHabit').width("50%");
						$(this).children('.calendarHabit').height("50%");
						break;

					case 1:
					case 2:
					case 3:
						$(this).children('.calendarHabit').width((100 / numChildren) + "%");
						$(this).children('.calendarHabit').height("100%");
						break;

					case 1:
						$(this).children('.calendarHabit').width("100%");
						$(this).children('.calendarHabit').height("100%");
						break;

					case 0:
					default:
						break;
				}
			});
		});
	}

}]);


hfControllers.controller('WeeklyController', ['$location','$http','$scope', '$rootScope','Database', function($location,$http, $scope, $rootScope, Database) {
	$rootScope.show = true

	function displayError(msg) {
		$scope.alert = msg;
	}

	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	$http.get('/profile').success(function(data) {
		if(!data.error) {
		  $rootScope.user = data.user;
		}
		if(!$rootScope.user){
			console.log("NO USER");
			console.log($location.path())
			$rootScope.show = false
			$location.path('/#/login');

		}else{
			(function init() {
				getData();
			})();
		}
	});
	// run on controller load

	function getData() {
		Database.getUser($rootScope.user._id).success(function(data) {
			$rootScope.user = data.data;
			Database.getHabitsByUser($rootScope.user._id).success(function(data) {
				$scope.habits = data.data;

				for (var i = 0; i < $scope.habits.length; i++) {
					$scope.habits[i].dateRange = (new Date($scope.habits[i].start_date)).toDateString() + '   to   ' + (new Date($scope.habits[i].end_date)).toDateString();
				}

				getDays();
			})
			.error(function(data) {
				toastr.error(data.message);
			});
		})
		.error(function(data) {
			toastr.error(data.message);
		});
	}

	/**
	 * Returns 7 days of the week and the tasks for those days
	 */
	function getDays() {
		var thisDate = new Date();
		var startDate = new Date();
		var endDate = new Date();
		var day = thisDate.getDay(); // 0 is sunday
		while (day > 0) {
			day = day - 1;
			startDate.setDate(startDate.getDate()-1);
		}
		$scope.startOfWeek = new Date(startDate);
		var day = thisDate.getDay(); // 0 is sunday
		while (day < 6) {
			day = day + 1;
			endDate.setDate(endDate.getDate()+1);
		}

		$scope.weekRangeString = months[thisDate.getMonth()] + " " + startDate.getDate() + " - " + endDate.getDate();

		$scope.date = thisDate;
		setMonth();
	}

	function setMonth() {
		var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		//$scope.month = $scope.date.toLocaleString("en-us", { month: "long" }) + ' ' + $scope.date.getFullYear();
		$scope.days = [];

		var firstDayDate = new Date($scope.date.getTime());
		firstDayDate.setDate(1);
		var firstDay = firstDayDate.getDay();
		var currDay = new Date();
		var today = new Date();

		var i = 0;
		while(i < firstDay) {
			currDay = new Date(firstDayDate.getTime());
			currDay.setTime(firstDayDate.getTime()-((firstDay - i)*24*3600000));
			$scope.days.push({
				date: currDay.toString(),
				dayNum: currDay.getDate(),
				dayName: days[currDay.getDay()],
				habits: [],
				past: true
			});
			i++;
		}

		currDay.setTime(firstDayDate.getTime());
		while(currDay.getMonth() == $scope.date.getMonth()) {
			if(currDay.getDate() == today.getDate() &&
				currDay.getMonth() == today.getMonth() &&
				currDay.getYear() == today.getYear()) {
				$scope.days.push({
					date: currDay.toString(),
					dayNum: currDay.getDate(),
					dayName: days[currDay.getDay()],
					habits: [],
					today: true
				});
			} else {
				$scope.days.push({
					date: currDay.toString(),
					dayNum: currDay.getDate(),
					dayName: days[currDay.getDay()],
					habits: []
				});
			}
			currDay.setTime(currDay.getTime()+(1*24*3600000));
		}

		while($scope.days.length % 7 != 0) {
			$scope.days.push({
				date: currDay.toString(),
				dayNum: currDay.getDate(),
				dayName: days[currDay.getDay()],
				habits: [],
				future: true
			});
			currDay.setTime(currDay.getTime()+(1*24*3600000));
		}

		if($scope.days.length / 7 > 5) {
			$scope.sixWeeks = true;
		} else {
			$scope.sixWeeks = false;
		}

		if($scope.days.length / 7 < 5) {
			$scope.fourWeeks = true;
		} else {
			$scope.fourWeeks = false;
		}
		renderHabits();
	}

	function renderHabits() {
		$scope.habits.forEach(function(habit, i) {

			if(habit.repeat.option == 0) {

				var habitStartDate = new Date(habit.start_date);
				var timeIncrement = (((habit.repeat.days[0] - habitStartDate.getDay() + 7) % 7)*24*3600000);
				habitStartDate.setTime(habitStartDate.getTime() + timeIncrement);

				$scope.days.forEach(function(day, j) {
					var thisDay = (new Date((new Date(day.date)).toDateString()));
					if(habitStartDate > thisDay) return;
					if((new Date(habit.end_date)) < thisDay) return;
					if((Math.round((thisDay - habitStartDate)/(1000*60*60*24)) % habit.repeat.interval) == 0) {
						$scope.days[j].habits.push({name: habit.name, num: i, id: habit._id, completed: false});
					}
				});

			} else {

				$scope.days.forEach(function(day, j) {
					var thisDay = (new Date((new Date(day.date)).toDateString()));
					if(new Date(habit.start_date) > thisDay) return;
					if((new Date(habit.end_date)) < thisDay) return;
					habit.repeat.days.forEach(function(day, k) {
						if(day == thisDay.getDay()) {
							$scope.days[j].habits.push({name: habit.name, num: i, id: habit._id, completed: false});
						}
					});
				});

			}

			habit.complete_days.forEach(function(complete, l) {
				if((new Date(complete.date)) < (new Date((new Date($scope.days[0].date)).getTime()-4*60*60*1000))) return;
				if((new Date(complete.date)) > (new Date($scope.days[$scope.days.length - 1].date))) return;

				var dayIndex = Math.round(((new Date(complete.date)).getTime() - (new Date($scope.days[0].date)).getTime())/(60*60*1000*24));
				var habitIndex = -1;
				if($scope.days[dayIndex].habits) {
					for(var m = 0; m < $scope.days[dayIndex].habits.length; m++) {
						if(habit._id === $scope.days[dayIndex].habits[m].id) {
							habitIndex = m;
						}
					}
					if(habitIndex > -1) $scope.days[dayIndex].habits.splice(habitIndex, 1);
				}
				$scope.days[dayIndex].habits.push({name: habit.name, num: i, id: habit._id, completed: complete.completed});
			});
		});
		//console.log($scope.days);
		setWeek();
	}

	function setWeek() {
		var startOfWeek = 0;
		$scope.weekdays = [];
		$scope.chartMap = {};
		$scope.labels = [];
		$scope.data = [];
		//console.log($scope.days);
		for (var i = 0; i < $scope.days.length; i++) {
			if ($scope.startOfWeek == $scope.days[i].date) {
				for (var j = i; j < i+7; j++) {
					$scope.weekdays.push($scope.days[j]);
					for (var k = 0; k < $scope.days[j].habits.length; k++) {
						if (!($scope.days[j].habits[k].name in $scope.chartMap)) {
							$scope.chartMap[$scope.days[j].habits[k].name] = 1;
						}
						else {
							$scope.chartMap[$scope.days[j].habits[k].name] = $scope.chartMap[$scope.days[j].habits[k].name] + 1;
						}
					}

				}
				break;
			}
		}

		for (key in $scope.chartMap) {
			$scope.labels.push(key);
			$scope.data.push($scope.chartMap[key]);
		}

		//console.log($scope.habits);
	}

}]);



hfControllers.controller('StatisticsController', ['$location','$http','$scope','$rootScope', 'Database', '$timeout', function($location,$http,$scope, $rootScope, Database, $timeout) {
	$rootScope.show = true;
	$scope.alert = '';

	function displayError(msg) {
		$scope.alert = msg;
	}

	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	$http.get('/profile').success(function(data) {
		if(!data.error) {
			//console.log(data.user);
		  $rootScope.user = data.user;
		}
		if(!$rootScope.user){
			console.log("NO USER");
			console.log($location.path())
			$rootScope.show = false
			$location.path('/#/login');

		}else{
			(function init() {
				getData();
			})();
		}
	});

	function getData() {
		Database.getUser($rootScope.user._id).success(function(data) {
			$rootScope.user = data.data;
			Database.getHabitsByUser($rootScope.user._id).success(function(data) {
				$scope.habits = data.data;
				Database.getBadges().success(function(data) {
					$scope.allBadges = data.data
					computeBadges();
					getDays();
				})
				.error(function(data) {
					toastr.error(data.message);
				});
			})
			.error(function(data) {
				toastr.error(data.message);
			});
		})
		.error(function(data) {
			toastr.error(data.message);
		});
	}

	function computeBadges() {
		$scope.badges = [];
		var completedCount = 0;
		for (var i = 0; i < $scope.habits.length; i++) {
			completedCount += $scope.habits[i].complete_days.length;
		}

		for (i = 0; i < $scope.allBadges.length; i++) {
			if ($scope.allBadges[i].completionBadge && completedCount >= $scope.allBadges[i].requiredValue) {
				$scope.badges.push($scope.allBadges[i]);
			}
			else if($scope.allBadges[i].completionBadge) {
				$scope.nextBadge = $scope.allBadges[i];
				$scope.nextBadgeCount = parseInt($scope.allBadges[i].requiredValue) - completedCount;
				break;
			}
		}
	}

	/**
	 * Returns 7 days of the week and the tasks for those days
	 */
	function getDays() {
		var thisDate = new Date();
		var startDate = new Date();
		var endDate = new Date();
		var day = thisDate.getDay(); // 0 is sunday
		while (day > 0) {
			day = day - 1;
			startDate.setDate(startDate.getDate()-1);
		}
		$scope.startOfWeek = new Date(startDate);
		var day = thisDate.getDay(); // 0 is sunday
		while (day < 6) {
			day = day + 1;
			endDate.setDate(endDate.getDate()+1);
		}

		$scope.weekRangeString = months[thisDate.getMonth()] + " " + startDate.getDate() + " - " + endDate.getDate();

		$scope.date = thisDate;
		setMonth();
	}

	function setMonth() {
		var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		//$scope.month = $scope.date.toLocaleString("en-us", { month: "long" }) + ' ' + $scope.date.getFullYear();
		$scope.days = [];

		var firstDayDate = new Date($scope.date.getTime());
		firstDayDate.setDate(1);
		var firstDay = firstDayDate.getDay();
		var currDay = new Date();
		var today = new Date();

		var i = 0;
		while(i < firstDay) {
			currDay = new Date(firstDayDate.getTime());
			currDay.setTime(firstDayDate.getTime()-((firstDay - i)*24*3600000));
			$scope.days.push({
				date: currDay.toString(),
				dayNum: currDay.getDate(),
				dayName: days[currDay.getDay()],
				habits: [],
				past: true
			});
			i++;
		}

		currDay.setTime(firstDayDate.getTime());
		while(currDay.getMonth() == $scope.date.getMonth()) {
			if(currDay.getDate() == today.getDate() &&
				currDay.getMonth() == today.getMonth() &&
				currDay.getYear() == today.getYear()) {
				$scope.days.push({
					date: currDay.toString(),
					dayNum: currDay.getDate(),
					dayName: days[currDay.getDay()],
					habits: [],
					today: true
				});
			} else {
				$scope.days.push({
					date: currDay.toString(),
					dayNum: currDay.getDate(),
					dayName: days[currDay.getDay()],
					habits: []
				});
			}
			currDay.setTime(currDay.getTime()+(1*24*3600000));
		}

		while($scope.days.length % 7 != 0) {
			$scope.days.push({
				date: currDay.toString(),
				dayNum: currDay.getDate(),
				dayName: days[currDay.getDay()],
				habits: [],
				future: true
			});
			currDay.setTime(currDay.getTime()+(1*24*3600000));
		}

		if($scope.days.length / 7 > 5) {
			$scope.sixWeeks = true;
		} else {
			$scope.sixWeeks = false;
		}

		if($scope.days.length / 7 < 5) {
			$scope.fourWeeks = true;
		} else {
			$scope.fourWeeks = false;
		}
		renderHabits();
	}

	function renderHabits() {
		$scope.habits.forEach(function(habit, i) {

			if(habit.repeat.option == 0) {

				var habitStartDate = new Date(habit.start_date);
				var timeIncrement = (((habit.repeat.days[0] - habitStartDate.getDay() + 7) % 7)*24*3600000);
				habitStartDate.setTime(habitStartDate.getTime() + timeIncrement);

				$scope.days.forEach(function(day, j) {
					var thisDay = (new Date((new Date(day.date)).toDateString()));
					if(habitStartDate > thisDay) return;
					if((new Date(habit.end_date)) < thisDay) return;
					if((Math.round((thisDay - habitStartDate)/(1000*60*60*24)) % habit.repeat.interval) == 0) {
						$scope.days[j].habits.push({name: habit.name, num: i, id: habit._id, completed: false});
					}
				});

			} else {

				$scope.days.forEach(function(day, j) {
					var thisDay = (new Date((new Date(day.date)).toDateString()));
					if(new Date(habit.start_date) > thisDay) return;
					if((new Date(habit.end_date)) < thisDay) return;
					habit.repeat.days.forEach(function(day, k) {
						if(day == thisDay.getDay()) {
							$scope.days[j].habits.push({name: habit.name, num: i, id: habit._id, completed: false});
						}
					});
				});

			}

			habit.complete_days.forEach(function(complete, l) {
				if((new Date(complete.date)) < (new Date((new Date($scope.days[0].date)).getTime()-8*60*60*1000))) return;
				if((new Date(complete.date)) > (new Date($scope.days[$scope.days.length - 1].date))) return;

				var dayIndex = Math.round(((new Date(complete.date)).getTime() - (new Date($scope.days[0].date)).getTime())/(60*60*1000*24));
				var habitIndex = -1;
				if($scope.days[dayIndex].habits) {
					for(var m = 0; m < $scope.days[dayIndex].habits.length; m++) {
						if(habit._id === $scope.days[dayIndex].habits[m].id) {
							habitIndex = m;
						}
					}
					if(habitIndex > -1) $scope.days[dayIndex].habits.splice(habitIndex, 1);
				}
				$scope.days[dayIndex].habits.push({name: habit.name, num: i, id: habit._id, completed: complete.completed});
			});
		});
		//console.log($scope.days);
		setWeek();
	}

	function setWeek() {
		var startOfWeek = 0;
		$scope.weekdays = [];
		$scope.chartMap = {};
		$scope.labels = [];
		$scope.data = [];
		//console.log($scope.days);
		for (var i = 0; i < $scope.days.length; i++) {
			if ($scope.startOfWeek == $scope.days[i].date) {
				for (var j = i; j < i+7; j++) {
					$scope.weekdays.push($scope.days[j]);
					for (var k = 0; k < $scope.days[j].habits.length; k++) {
						if (!($scope.days[j].habits[k].name in $scope.chartMap)) {
							$scope.chartMap[$scope.days[j].habits[k].name] = 1;
						}
						else {
							$scope.chartMap[$scope.days[j].habits[k].name] = $scope.chartMap[$scope.days[j].habits[k].name] + 1;
						}
					}

				}
				break;
			}
		}
		//console.log($scope.chartMap);
		for (key in $scope.chartMap) {
			$scope.labels.push(key);
			$scope.data.push($scope.chartMap[key]);
		}
	}

}]);
hfControllers.controller('SettingsController', ['$location','$http','$scope','$rootScope', 'Database',function($location,$http,$scope,$rootScope, Database) {
	$rootScope.show = true
	$rootScope.user;
	$http.get('/profile').success(function(data) {
		if(!data.error) {
		  $rootScope.user = data.user;
		}
		if(!$rootScope.user){
			console.log("NO USER");
			console.log($location.path())
			$location.path('/#/login');

		}
	});
	$scope.updateUser = function(newUser){
		if(newUser.name && newUser.name != ""){
			$rootScope.user.name = newUser.name

		}
		if(newUser.email && newUser.email != ""){
			$rootScope.user.email = newUser.email

		}
		if(newUser.phone && newUser.phone != ""){
			$rootScope.user.phone = newUser.phone

		}
		user = $rootScope.user
		Database.updateUser(user._id,user).success(function(data) {
		})
		.error(function(data){
			console.log("Couldn't update")
		});
	}
}]);


hfControllers.controller('LoginController', ['$location','$http','$scope', '$rootScope','Database',function($location,$http,$scope,$rootScope, Database) {
	$rootScope.show = false

}]);

hfControllers.controller('SignUpController', ['$location','$http','$scope','$rootScope','Database', function($location,$http,$scope,$rootScope, Database) {
	$rootScope.show = false

}]);

hfControllers.controller('LandingController', ['$location','$http','$scope', '$rootScope','Database',function($location,$http,$scope,$rootScope, Database) {
	$rootScope.show = false
}]);

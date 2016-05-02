var hfControllers = angular.module('hfControllers', ['chart.js']);

hfControllers.controller('NavController', ['$http','$scope','$rootScope', 'Database', '$route',function($http,$scope,$rootScope, Database, $route) {

	// $scope.user;
	$scope.$route = $route;
	$rootScope.show = false;
	$scope.profile = false;

	$rootScope.user;
	$http.get('/profile').success(function(data) {
	  	if(!data.error) {
		  $rootScope.user = data.user;
	  	}

 	});

	// Database.getUser($rootScope.user._id).success(function(data) { // need to see how this will be done
	// 	// $scope.user = data.data;
	// 	$rootScope.user = data.data;
	// })
	// .error(function(data) {
	// 	toastr.error(data.message);
	// });

}]);

hfControllers.controller('MonthlyController', ['$http','$scope','$rootScope', 'Database', '$timeout', function($http,$scope, $rootScope, Database, $timeout) {

	$rootScope.user;
	$http.get('/profile').success(function(data) {
	  	if(!data.error) {
		  $rootScope.user = data.user;
		  getData();
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
		Database.getUser($rootScope.user._id).success(function(data) { // need to see how this will be done
			// $scope.user = data.data;
			$rootScope.user = data.data;
			Database.getHabitsByUser($rootScope.user._id).success(function(data) { // need to see how this will be done
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
				if((new Date(complete.date)) < (new Date($scope.days[0].date))) return;
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


hfControllers.controller('WeeklyController', ['$scope', '$rootScope','Database', '$routeParams', function($rootScope,$scope, Database, $routeParams) {
	$rootScope.show = true

	$scope.id = $routeParams.id;
	$scope.alert = '';

	function displayError(msg) {
		$scope.alert = msg;
	}

	// run on controller load
	(function init() {
		getDays();
	})();

	/**
	 * Returns 7 days of the week and the tasks for those days
	 */
	function getDays() {
		$scope.weekRangeString = "August 20 - 26"
		$scope.days = [
			{
				date: 'Aug 20',
				tasks: []
			},
			{
				date: 'Aug 21',
				tasks: []
			},
			{
				date: 'Aug 22',
				tasks: []
			},
			{
				date: 'Aug 23',
				tasks: []
			},
			{
				date: 'Aug 24',
				tasks: []
			},
			{
				date: 'Aug 25',
				tasks: []
			},
			{
				date: 'Aug 26',
				tasks: []
			}
		]
	}
}]);



hfControllers.controller('StatisticsController', ['$scope','$rootScope', 'Database', '$routeParams', function($scope, $rootScope,Database, $routeParams) {
	$rootScope.show = true

	$scope.id = $routeParams.id;
	$scope.alert = '';

	function displayError(msg) {
		$scope.alert = msg;
	}


	// run on controller load
	(function init() {
		getEarnedBadges();
		getNextBadge();
		getDays();
	})();

	/**
	 * Returns a list of badge objects earned by the user.
	 */
	function getEarnedBadges() {
		/* What the real code should look like when the route is created
		Database.getBadges(id)
			.success(function(data) {
				$scope.badges = data.data;
			})
			.error(function(data) {
				displayMessage(data.message);
			});

		*/
		$scope.badges = [
			{
				name: "Habit Rabbit",
				description: "Completed 10 habits."
			},
			{
				name: "Big Hands",
				description: "Completed more than 7 habits in a week."
			},
			{
				name: "Habit Bronze Badge",
				description: "Completed 20 habits."
			}
		];
	}

	/**
	 * Returns the next badge a person can earn.
	 */
	function getNextBadge() {
		/* What the real code should look like when the route is created
		Database.getNextBadge(id)
			.success(function(data) {
				$scope.nextBadgeName = data.data.name;
				$scope.nextBadgeCount = data.data.count;
			})
			.error(function(data) {
				displayMessage(data.message);
			});
		*/
		$scope.nextBadgeName = "Habit Silver Badge"
		$scope.nextBadgeCount = "5";
		$scope.nextBadgeDesc = "Complete 30 habits.";
	}

	/**
	 * Returns 7 days of the week and the tasks for those days
	 */
	function getDays() {
		$scope.weekRangeString = "August 20 - 26"
		$scope.days = [
			{
				date: 'Aug 20',
				tasks: [{name: "yo"}, {name: "yo"}, {name: "yo"}]
			},
			{
				date: 'Aug 21',
				tasks: []
			},
			{
				date: 'Aug 22',
				tasks: []
			},
			{
				date: 'Aug 23',
				tasks: []
			},
			{
				date: 'Aug 24',
				tasks: []
			},
			{
				date: 'Aug 25',
				tasks: []
			},
			{
				date: 'Aug 26',
				tasks: []
			}
		]
	}

	$scope.labels = ["Brush my Teeth", "Do 100 pushups", "Write in journal"];
	$scope.data = [0.3, 0.5, 0.2];

}]);
hfControllers.controller('SettingsController', ['$http','$scope','$rootScope', 'Database',function($http,$scope,$rootScope, Database) {
	$rootScope.show = true
	$rootScope.user;
	$http.get('/profile').success(function(data) {
		if(!data.error) {
		  $rootScope.user = data.user;
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


hfControllers.controller('LoginController', ['$scope', '$rootScope','Database',function($scope,$rootScope, Database) {
	$rootScope.show = false

}]);

hfControllers.controller('SignUpController', ['$scope','$rootScope','Database', function($scope,$rootScope, Database) {
	$rootScope.show = false

}]);

hfControllers.controller('LandingController', ['$scope', '$rootScope','Database',function($scope,$rootScope, Database) {
	$rootScope.show = false
}]);

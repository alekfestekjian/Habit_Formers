var hfControllers=angular.module("hfControllers",["chart.js"]);hfControllers.controller("NavController",["$scope","$rootScope","Database","$route",function($scope,$rootScope,Database,$route){$scope.user,$scope.$route=$route,$rootScope.show=!1,Database.getUser("57197fbc4f1daf85187fad00").success(function(data){$scope.user=data.data}).error(function(data){toastr.error(data.message)})}]),hfControllers.controller("MonthlyController",["$scope","$rootScope","Database","$timeout",function($scope,$rootScope,Database,$timeout){function getData(){Database.getUser("57197fbc4f1daf85187fad00").success(function(data){$scope.user=data.data,Database.getHabitsByUser("57197fbc4f1daf85187fad00").success(function(data){$scope.habits=data.data,setMonth()}).error(function(data){toastr.error(data.message)})}).error(function(data){toastr.error(data.message)})}function setMonth(){$scope.month=$scope.date.toLocaleString("en-us",{month:"long"})+" "+$scope.date.getFullYear(),$scope.days=[];var firstDayDate=new Date($scope.date.getTime());firstDayDate.setDate(1);for(var firstDay=firstDayDate.getDay(),currDay=new Date,today=new Date,i=0;firstDay>i;)currDay=new Date(firstDayDate.getTime()),currDay.setTime(firstDayDate.getTime()-24*(firstDay-i)*36e5),$scope.days.push({date:currDay.toString(),dayNum:currDay.getDate(),dayName:days[currDay.getDay()],habits:[],past:!0}),i++;for(currDay.setTime(firstDayDate.getTime());currDay.getMonth()==$scope.date.getMonth();)currDay.getDate()==today.getDate()&&currDay.getMonth()==today.getMonth()&&currDay.getYear()==today.getYear()?$scope.days.push({date:currDay.toString(),dayNum:currDay.getDate(),dayName:days[currDay.getDay()],habits:[],today:!0}):$scope.days.push({date:currDay.toString(),dayNum:currDay.getDate(),dayName:days[currDay.getDay()],habits:[]}),currDay.setTime(currDay.getTime()+864e5);for(;$scope.days.length%7!=0;)$scope.days.push({date:currDay.toString(),dayNum:currDay.getDate(),dayName:days[currDay.getDay()],habits:[],future:!0}),currDay.setTime(currDay.getTime()+864e5);$scope.days.length/7>5?$scope.sixWeeks=!0:$scope.sixWeeks=!1,$scope.days.length/7<5?$scope.fourWeeks=!0:$scope.fourWeeks=!1,renderHabits()}function renderHabits(){$scope.habits.forEach(function(habit,i){if(0==habit.repeat.option){var habitStartDate=new Date(habit.start_date),timeIncrement=(habit.repeat.days[0]-habitStartDate.getDay()+7)%7*24*36e5;habitStartDate.setTime(habitStartDate.getTime()+timeIncrement),$scope.days.forEach(function(day,j){var thisDay=new Date(new Date(day.date).toDateString());habitStartDate>thisDay||new Date(habit.end_date)<thisDay||Math.round((thisDay-habitStartDate)/864e5)%habit.repeat.interval==0&&$scope.days[j].habits.push({name:habit.name,num:i,id:habit._id,completed:!1})})}else $scope.days.forEach(function(day,j){var thisDay=new Date(new Date(day.date).toDateString());new Date(habit.start_date)>thisDay||new Date(habit.end_date)<thisDay||habit.repeat.days.forEach(function(day,k){day==thisDay.getDay()&&$scope.days[j].habits.push({name:habit.name,num:i,id:habit._id,completed:!1})})});habit.complete_days.forEach(function(complete,l){if(!(new Date(complete.date)<new Date($scope.days[0].date)||new Date(complete.date)>new Date($scope.days[$scope.days.length-1].date))){var dayIndex=Math.round((new Date(complete.date).getTime()-new Date($scope.days[0].date).getTime())/864e5),habitIndex=-1;if($scope.days[dayIndex].habits){for(var m=0;m<$scope.days[dayIndex].habits.length;m++)habit._id===$scope.days[dayIndex].habits[m].id&&(habitIndex=m);habitIndex>-1&&$scope.days[dayIndex].habits.splice(habitIndex,1)}$scope.days[dayIndex].habits.push({name:habit.name,num:i,id:habit._id,completed:complete.completed})}})}),$timeout(function(){console.log($(".day").length),$(".day").each(function(index,item){var numChildren=$(this).children(".calendarHabit").length;switch(numChildren){case 6:$(this).children(".calendarHabit").width("33.3333333333333%"),$(this).children(".calendarHabit").height("50%");break;case 5:case 7:case 8:$(this).children(".calendarHabit").width("25%"),$(this).children(".calendarHabit").height("50%");break;case 4:$(this).children(".calendarHabit").width("50%"),$(this).children(".calendarHabit").height("50%");break;case 1:case 2:case 3:$(this).children(".calendarHabit").width(100/numChildren+"%"),$(this).children(".calendarHabit").height("100%");break;case 1:$(this).children(".calendarHabit").width("100%"),$(this).children(".calendarHabit").height("100%");break;case 0:}})})}$rootScope.show=!0,$scope.show=!0,$scope.habits,$scope.days,$scope.date=new Date,$scope.month,$scope.sixWeeks=!1,$scope.user;var days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];getData(),$scope.colorClass=function(index,day){var thisDay="";return day&&(thisDay=new Date(new Date(day.date).toDateString())),"color-"+index+(thisDay&&thisDay>Date.now()?" no-pointer":"")},$scope.prevMonth=function(){$scope.date.setMonth($scope.date.getMonth()-1),setMonth()},$scope.nextMonth=function(){$scope.date.setMonth($scope.date.getMonth()+1),setMonth()},$scope.currMonth=function(){$scope.date=new Date,setMonth()},$scope.clearAddHabitForm=function(){$scope.newStartDate=$scope.newEndDate=$scope.newName=$scope.newRepeat=$scope.newRepeatInterval=$scope.newEnterNum=$scope.newPickDays=$scope.newNotes="",$scope.newDays=[]},$scope.clearAddHabitForm(),$scope.submitAddHabitForm=function(){if(!$scope.newStartDate)return void toastr.error("You must enter a start date");if(!$scope.newEndDate)return void toastr.error("You must enter an end date");if(new Date($scope.newStartDate)>new Date($scope.newEndDate))return void toastr.error("The start date should be before the end date");if(!$scope.newName)return void toastr.error("You must enter a name");if(""===$scope.newRepeat)return void toastr.error("You must select a repeat option");if($scope.newRepeat%2==1&&!$scope.newRepeatInterval)return void toastr.error("You must enter a repeat interval");if($scope.newRepeat>=2&&$scope.newDays.every(function(elem){return!elem}))return void toastr.error("You must select at least one day");$scope.newRepeat%2==0&&($scope.newRepeatInterval=1);var repeat={};if($scope.newRepeat<=1){var theDay=new Date($scope.newStartDate).getDay();repeat={option:0,days:[theDay],interval:$scope.newRepeatInterval}}else{var repeatDays=[];$scope.newDays.forEach(function(elem,i){elem&&repeatDays.push(i)}),repeat={option:1,days:repeatDays,interval:$scope.newRepeatInterval}}var habit={name:$scope.newName,userId:$scope.user._id,repeat:repeat,start_date:$scope.newStartDate,end_date:$scope.newEndDate,note:$scope.newNotes};Database.addHabit(habit).success(function(data){toastr.success("Successfully added new habit"),getData(),$("#newHabit").foundation("close"),$scope.clearAddHabitForm()}).error(function(data){toastr.error(data.message)})},$scope.changeCompletionStatus=function(oldHabit,currDay){var thisDay=new Date(new Date(currDay.date).toDateString());if(!(thisDay>Date.now())){var toast=toastr.info("Marking habit progress...",{timeOut:0,extendedTimeOut:0});Database.getHabit(oldHabit.id).success(function(data){var habit=data.data,dayIndex=-1;if(habit.complete_days){for(var i=0;i<habit.complete_days.length;i++)new Date(currDay.date).toDateString()===new Date(habit.complete_days[i].date).toDateString()&&(dayIndex=i);dayIndex>-1&&habit.complete_days.splice(dayIndex,1)}else habit.complete_days=[];habit.complete_days.push({date:currDay.date,completed:!oldHabit.completed}),Database.updateHabit(habit).success(function(habit){getData(),toastr.clear(toast)}).error(function(data){toastr.error(data.message),toastr.clear(toast)})}).error(function(data){toastr.error(data.message),toastr.clear(toast)})}},$scope.editHabit=function(habit){$scope.editHabitID=habit._id,$scope.editStartDate=habit.start_date,$scope.editEndDate=habit.end_date,$scope.editName=habit.name,$scope.editNotes=habit.notes,$scope.editRepeat=2*habit.repeat.option+(1==habit.repeat.interval?0:1),$scope.editRepeatInterval=habit.repeat.interval,$scope.editEnterNum=$scope.editRepeat%2==1,$scope.editPickDays=$scope.editRepeat>=2,$scope.editDays=[0,0,0,0,0,0,0],habit.repeat.days&&habit.repeat.days.forEach(function(day){$scope.editDays[day]=!0}),$("#editHabit").foundation("open")},$scope.clearEditHabitForm=function(){$scope.editStartDate=$scope.editEndDate=$scope.editName=$scope.editRepeat=$scope.editRepeatInterval=$scope.editEnterNum=$scope.editPickDays=$scope.editNotes=$scope.editHabitID="",$scope.editDays=[]},$scope.clearEditHabitForm(),$scope.showRepeatOptions=function(){$scope.newEnterNum=$scope.newRepeat%2==1,$scope.newPickDays=$scope.newRepeat>=2,$scope.editEnterNum=$scope.editRepeat%2==1,$scope.editPickDays=$scope.editRepeat>=2},$scope.submitEditHabitForm=function(){if(!$scope.editStartDate)return void toastr.error("You must enter a start date");if(!$scope.editEndDate)return void toastr.error("You must enter an end date");if(new Date($scope.editStartDate)>new Date($scope.editEndDate))return void toastr.error("The start date should be before the end date");if(!$scope.editName)return void toastr.error("You must enter a name");if(""===$scope.editRepeat)return void toastr.error("You must select a repeat option");if($scope.editRepeat%2==1&&!$scope.editRepeatInterval)return void toastr.error("You must enter a repeat interval");if($scope.editRepeat>=2&&$scope.editDays.every(function(elem){return!elem}))return void toastr.error("You must select at least one day");$scope.editRepeat%2==0&&($scope.editRepeatInterval=1);var repeat={};if($scope.editRepeat<=1){var theDay=new Date($scope.editStartDate).getDay();repeat={option:0,days:[theDay],interval:$scope.editRepeatInterval}}else{var repeatDays=[];$scope.editDays.forEach(function(elem,i){elem&&repeatDays.push(i)}),repeat={option:1,days:repeatDays,interval:$scope.editRepeatInterval}}Database.getHabit($scope.editHabitID).success(function(data){if(data.data){var updatedHabit=data.data;updatedHabit.name=$scope.editName,updatedHabit.userId=$scope.user._id,updatedHabit.repeat=repeat,updatedHabit.start_date=$scope.editStartDate,updatedHabit.end_date=$scope.editEndDate,updatedHabit.note=$scope.editNotes,Database.updateHabit(updatedHabit).success(function(data){toastr.success("Successfully updated habit"),getData(),$("#editHabit").foundation("close"),$scope.clearEditHabitForm()}).error(function(data){toastr.error(data.message)})}}).error(function(data){toastr.error(data.message)})},$scope.deleteHabit=function(){console.log($scope.editHabitID),Database.deleteHabit($scope.editHabitID).success(function(data){toastr.success("Habit successfully deleted"),getData(),$("#editHabit").foundation("close"),$scope.clearEditHabitForm()}).error(function(data){toastr.error(data.message)})}}]),hfControllers.controller("WeeklyController",["$scope","Database","$routeParams",function($scope,Database,$routeParams){function getDays(){$scope.weekRangeString="August 20 - 26",$scope.days=[{date:"Aug 20",tasks:[]},{date:"Aug 21",tasks:[]},{date:"Aug 22",tasks:[]},{date:"Aug 23",tasks:[]},{date:"Aug 24",tasks:[]},{date:"Aug 25",tasks:[]},{date:"Aug 26",tasks:[]}]}$rootScope.show=!0,$scope.id=$routeParams.id,$scope.alert="",function(){getDays()}()}]),hfControllers.controller("SettingsController",["$scope","$rootScope","Database",function($scope,$rootScope,Database){$rootScope.show=!0}]),hfControllers.controller("LoginController",["$scope","$rootScope","Database",function($scope,$rootScope,Database){$rootScope.show=!1}]),hfControllers.controller("SignUpController",["$scope","$rootScope","Database",function($scope,$rootScope,Database){$rootScope.show=!1}]),hfControllers.controller("StatisticsController",["$scope","$rootScope","Database","$routeParams",function($scope,$rootScope,Database,$routeParams){function getEarnedBadges(){$scope.badges=[{name:"Habit Rabbit",description:"Completed 10 habits."},{name:"Big Hands",description:"Completed more than 7 habits in a week."},{name:"Habit Bronze Badge",description:"Completed 20 habits."}]}function getNextBadge(){$scope.nextBadgeName="Habit Silver Badge",$scope.nextBadgeCount="5",$scope.nextBadgeDesc="Complete 30 habits."}function getDays(){$scope.weekRangeString="August 20 - 26",$scope.days=[{date:"Aug 20",tasks:[{name:"yo"},{name:"yo"},{name:"yo"}]},{date:"Aug 21",tasks:[]},{date:"Aug 22",tasks:[]},{date:"Aug 23",tasks:[]},{date:"Aug 24",tasks:[]},{date:"Aug 25",tasks:[]},{date:"Aug 26",tasks:[]}]}$rootScope.show=!0,$scope.id=$routeParams.id,$scope.alert="",function(){getEarnedBadges(),getNextBadge(),getDays()}(),$scope.labels=["Brush my Teeth","Do 100 pushups","Write in journal"],$scope.data=[.3,.5,.2]}]),hfControllers.controller("LandingController",["$scope","$rootScope","Database",function($scope,$rootScope,Database){$rootScope.show=!1}]);
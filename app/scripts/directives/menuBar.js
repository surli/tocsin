'use strict';

angular.module('tocsinApp')
	.directive('menuBar', function ($rootScope, InitService) {
		return {
			templateUrl:'views/menuBar.html',
			restrict: 'E',
			controller: function( $scope) {
				 //&&&&&&&&&&&& set SpineFM Name

				// watch setting current config's Name, Space not allowed
				$scope.$watch('spineFMNewName', function() {
					if( $scope.spineFMNewName!== undefined && $scope.spineFMNewName!== null){
						$scope.spineFMNewName = $scope.spineFMNewName.replace(/[^a-zA-Z0-9_-]/g,'');
						// $scope.spineFMNewName = $scope.spineFMNewName.replace(/\s+/g,'_');
					}
				});
				$scope.getPreviousActions = function() {
					InitService.getPreviousActions($rootScope.SpineFMID).then(function (result) {
						var allPreviousActions = result.reverse();
						//$scope.lastAction = allPreviousActions.shift();
						$scope.previousActions = allPreviousActions.filter(function (item) { return item.description.toLowerCase().indexOf('propagate') === -1; });

					});
				};

				$scope.undoLastAction = function() {
					InitService.undoLastAction($rootScope.SpineFMID).then(function () {
						window.alert('Action '+$scope.lastAction.description+' undo! This page will now reload.');
						window.location.href = '/tocsin/';
					}, function () {
						window.alert('error when undoing the action '+$scope.lastAction.description);
					});
				};

				$scope.undoAction = function(step) {
					$scope.showUndoLoading = true;
					InitService.undoAction($rootScope.SpineFMID, step.id).then(function () {
						$scope.showUndoLoading = false;
						window.alert('Action '+step.description+' undo! This page will now reload.');
						window.location.href = '/tocsin/';
					}, function () {
						window.alert('error when undoing the action '+step.description);
						$scope.showUndoLoading = false;
					});
				};

				$scope.duplicate = function() {
					InitService.duplicate($rootScope.SpineFMID).then(function () {
						window.alert('Configuration duplicated !');
						window.location.href = '/tocsin/';
					}, function () {
						window.alert('Error when duplicating the configuration');
					});
				};

				/**
				 * set the spineFM instance's name
				 * @param name
				 */
				$scope.setSpineFMName = function(name){
					InitService.setSpineFMName($rootScope.SpineFMID, name).then(function(){
							$rootScope.name = name;
							console.log('spine fm name set');
						},
						function(){
							window.alert('set spineFM name failed');
						});
				} ;
				/**
				 * validate the choice in modal for setting SpineFMName
				 */
				$scope.changeSpineFMName = function () {

					if($scope.spineFMNewName  === null){
						window.alert('Give a name to your new instance');
					}
					else {
						$scope.setSpineFMName($scope.spineFMNewName);
						$scope.openSetSpineNameModal = false;
					}
				};
				/**
				 * open modal for setting SpineFMName
				 */
				$scope.openSetName = function () {
					$scope.openSetSpineNameModal = true;
				};
				/**
				 *  cancel setting SpineFMName
				 */

				$scope.cancelSetName = function(){
					if ($scope.spineFMNewName  !== null) {
						var quit = window.confirm('Êtes- vous sûr de vouloir annuler le changement de nom ?');
						if(quit){
							$scope.openSetSpineNameModal = false;
						}
					}
					else {
						$scope.openSetSpineNameModal = false;
					}
				};
				// &&&&& configure mouse action  &&&&&&
				$scope.openMouseConfigurationModal = function () {
					$scope.showMouseConfiguration = true;
				};
				$scope.closeMouseConfigurationModal = function () {
					$scope.showMouseConfiguration = false;
				};
				/**
				 *
				 */
				$scope.validateMouseConfiguration = function () {
					$scope.showMouseConfiguration = false;
					if ($rootScope.MouseConfigurationMode === 'allMenu') {
						$rootScope.mouseMode = {all : true, select:false, deselect:false};
					}
					else if ($rootScope.MouseConfigurationMode === 'selectMenu') {
						$rootScope.mouseMode = {all : false, select:true, deselect:false};
					}
					else if ($rootScope.MouseConfigurationMode === 'deselectMenu') {
						$rootScope.mouseMode = {all : false, select:false, deselect:true};
					}
					else {
						$rootScope.mouseMode = {all : true, select:false, deselect:false};
					}
					console.log($rootScope.mouseMode);
				};
				$scope.setMouseMode = function (mode) {
					if (mode && mode!== null) {
						$rootScope.MouseConfigurationMode = mode.toString();
					}
				};
			}
		};
	});

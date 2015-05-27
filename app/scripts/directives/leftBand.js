'use strict';

angular.module('tocsinApp')
	.directive('leftBand', function ($timeout, configManager, $rootScope, SpineFMConstants) {
		return {
			templateUrl:'views/leftBand.html',
			restrict: 'E',
			controller: function( $scope) {

				/**
				 * generate screen
				 */
				$scope.generate = function(){
					var action = window.confirm('Are you sure to generate the screen of configuration ?');
					if(action){
						$scope.showGenarationLoading = true;
						configManager.generate($rootScope.SpineFMID).then(function (status) {
								$scope.showGenarationLoading = false;
								if(status.toString() === 'true'){
									window.open(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+$rootScope.SpineFMID+'/model/download/');
								}
								else{
									window.alert('Failed to generate configuration !');
								}
							},
							function(){
								$scope.showGenarationLoading = false;
								window.alert('generate failed !');
							});
					}
				};

				/**
				 * check if generation is allowed
				 */
				$scope.checkIsGenerateAllowed = function(){
					configManager.checkIsGenerateAllowed($rootScope.SpineFMID).then(function (response) {
							if(response.toString() === 'false'){
								$rootScope.isGenerateAllowed = true;
							}
							else{
								$rootScope.isGenerateAllowed = false;
							}
						},
						function(){
							window.alert('checkIsGenerateAllowed failed');
						});
				};

				/**
				 * options for modals
				 * @type {{backdropFade: boolean, dialogFade: boolean, keyboard: boolean, backdropClick: boolean}}
				 */
				$scope.options = {
					backdropFade: true,
					dialogFade:true,
					keyboard: false,
					backdropClick: false
				};

				/**
				 * open help modal
				 */
				$scope.openHelpModal = function(){
					$scope.helpModal = true;
				};

				/**
				 * hide help modal
				 */
				$scope.closeHelpModal = function(){
					$scope.helpModal = false;
				};

				/**
				 *  close the modal shown when generating
				 */
				$scope.closeShowGenerationLoading = function(){
					$scope.showGenarationLoading = false;
				};

				/**
				 *  verify if the given DE are equal
				 * @param deA
				 * @param deB
				 * @returns {string}
				 */
				$scope.isSameDE =function(deA, deB){

					if(deA === deB) {
						return 'yes';
					}
					else {
						return 'no';
					}
				};

				/**
				 * verify if we can add a new element from the given DE
				 * @param de
				 * @returns {string}
				 */
				$scope.isAddNewAllowed  = function(de){
					if($rootScope.DEProperties){
						if($rootScope.DEProperties[de]){
							if($rootScope.DEProperties[de].multiplicityDE){
								var taille = $rootScope.configurations[de].partialConfig.number + $rootScope.configurations[de].validConfig.number;
								if($rootScope.DEProperties[de].multiplicityDE.upperBound === taille) {
									return 'false';
								}
								else {
									return 'true';
								}
							}
						}
					}
				};

				/**
				 * check if the given de has 'must create config' : nb config in de is less than required in multiplicity
				 * @param de
				 * @returns {boolean}
				 */
				$scope.hasConfigToCreate  = function(de){
					if($rootScope.DEProperties){
						if($rootScope.DEProperties[de]){
							if($rootScope.DEProperties[de].multiplicityDE) {
								var taille = $rootScope.configurations[de].partialConfig.number + $rootScope.configurations[de].validConfig.number;
								if($rootScope.DEProperties[de].multiplicityDE.lowerBound <= taille) {
									return false;
								}
								else {
									return true;
								}
							}
						}
					}
				};

				/**
				 * reinitialize the configuration (called when we choose to add new configuration of the current DE)
				 */
				$scope.reinitializeConfiguration = function(){
				};
			}
		};
	});

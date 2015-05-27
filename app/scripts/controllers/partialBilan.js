'use strict';

angular.module('tocsinApp')
    .controller('PartialBilanCtrl', function ($scope, $rootScope, $routeParams, configManager) {

        if($rootScope.SpineFMID === undefined){
            window.location.href = '#/';
            return;
        }
        $scope.domainElement = $routeParams.domainelement;
        $scope.deConfigurations = $rootScope.configurations[$scope.domainElement];
        $scope.compatiblesAndLinkedConfigs = [];
        $scope.listConfigurations = {linked : [] , valid : [], notValid : []};
        $scope.openSetSpineNameModal = false;
		$scope.showMouseConfiguration = false;
        $scope.helpModal = false;


        /**
         * create new config, called when button create is clicked
         */
        $scope.createNewConfig = function(){
            window.location.href = '#/de/'+$scope.domainElement;
        };
        /**
         * getLinked : get number of linked configurations of the given configID from the given DE
         * @param configID
         * @param currentDE
         * @returns {string}
         */
        $scope.getLinked = function(configID, currentDE){
            var linked = 0;
            if($rootScope.linkedConfig[configID]){
                for(var l = 0; l < $rootScope.linkedConfig[configID].length; l++) {
                    var linkedConf = $rootScope.linkedConfig[configID][l];
                    for(var m = 0; m < linkedConf.length; m++) {
                        var linkedID = linkedConf[m];
                        var linkedDomain = $scope.getConfigDE(linkedID);
                        if(linkedDomain === currentDE){
                            linked += 1 ;
                        }
                    }
                }
            }
            return linked;
        };

		/**
		 * get compatibles config //
		 * @param configID
		 * @param currentDE
		 * @returns {number}
		 */
		$scope.getCompatibles = function (configID, currentDE) {
			var compatibles = 0;
			if($rootScope.compatiblesConf[currentDE]){
				if($rootScope.compatiblesConf[currentDE].configCompatibles[configID]){
					compatibles = $rootScope.compatiblesConf[currentDE].configCompatibles[configID].length;
				}
			}
			return compatibles;
		};

		/**
		 * get the DE on the given config
		 * @param configID
		 * @returns {null}
		 */
		$scope.getConfigDE = function(configID){
			var response  = null;
			for(var de in $rootScope.configurations){
				var deConfig = $rootScope.configurations[de];
				for(var id in deConfig.validConfig.listConfigs){
					if(id === configID){
						response = de;
					}
				}
			}
			return response;
		};

		/**
		 * get the configs in the domain Element
		 * @returns {Array}
		 */

		$scope.getConfigs = function(){
			if($rootScope.configurations[$scope.domainElement]) {
				for(var configID in  $rootScope.configurations[$scope.domainElement].validConfig.listConfigs){
					if($rootScope.configurations[$scope.domainElement].validConfig.listConfigs[configID]) {
						var config = $rootScope.configurations[$scope.domainElement].validConfig.listConfigs[configID];
						if(config.isLinked === true) {
							$scope.listConfigurations.linked.push(config);
						}
						else {
							$scope.listConfigurations.valid.push(config);
						}
					}
				}
				for(var confID in  $rootScope.configurations[$scope.domainElement].partialConfig.listConfigs){
					if($rootScope.configurations[$scope.domainElement].partialConfig.listConfigs[confID]) {
						var configuration = $rootScope.configurations[$scope.domainElement].partialConfig.listConfigs[confID];
						$scope.listConfigurations.notValid.push(configuration);
					}
				}
			}
		};

		/**
		 * check if a configurations is linkable with a the given de's configurations
		 * @param configID
		 * @param de
		 * @returns {boolean}
		 */
		$scope.isConfigLinkable = function(configID, de){
			var isLinkable = false;
			configManager.checkIsConfigLinkable($rootScope.SpineFMID, configID, de).then(function (linkable) {
					isLinkable = linkable;
				},
				function(){
					//alert("Echec de check config compatible with");
			});

			return isLinkable;
		};

		/**
		 * get the color of the configuration
		 * @param config
		 */
		$scope.getConfigColor = function(config){
			var response = 'isPartial';
			if(config.isLinked === true){
				response  = 'linked';
			}
			else if(config.isLinked === false){
				response = 'notLinked';
			}
			else if(config.isValid === false){
				response = 'isPartial';
			}
			return response;
		};

		/**
		 * check if there are configs with the given status
		 * @param status
		 * @returns {boolean}
		 */
		$scope.hasConfigs = function(status) {
			return $scope.listConfigurations[status].length > 0;
		};

		/**
		 * start controller
		 */
		$scope.start = function(){
			$scope.getConfigs();
		};

// $$$$$$$$$$$$$$$$$$$$$$$$$  start partial bilan controller $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
		$scope.start();

    });

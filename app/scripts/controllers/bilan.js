'use strict';
/**
 * Controller for the Bilan view
 */
angular.module('tocsinApp').controller('BilanCtrl', function ($scope, $rootScope,$timeout , $routeParams,FMManager, configManager) {
    if($rootScope.SpineFMID === undefined){
        window.location.href = '#/';
        return;
    }
    $scope.domainElement = $routeParams.domainelement;
    $scope.deConfigurations = $rootScope.configurations[$scope.domainElement];
    $scope.configID = $routeParams.configID;
    $scope.ctxID = $routeParams.ctxID;
    $scope.currentConfig = $scope.deConfigurations.validConfig.listConfigs[$scope.configID];
    $scope.confNameChanged = false;
    $scope.newName = $scope.currentConfig.name; // name used for input text (in setting name)
    $scope.selectedConf = null;
    $scope.textTooltip = '';
    $scope.spineFMNewName = null;
    $scope.openSetSpineNameModal = false;
	$scope.showMouseConfiguration = false;
    $scope.isLinkableWith = [];
    $scope.helpModal = false;
    $scope.linkedWithLayout =false;
    $scope.isLinkedWith = [];
    $scope.hasLinkedConfig = false;
    $scope.openSetConfigNameModal = false;
    $scope.currentViewing = null;

    angular.copy($rootScope.deFeatures[$scope.domainElement], $scope.fm);

    /**
     * function for deleting unselect or deselect features and keeping only selected one
     * @param fm
     */
    $scope.getSelectedFeatures = function (fm){
        configManager.getFeatures($rootScope.SpineFMID, $scope.configID).then(function (fmState) {
                var deleteItems = {};
                var levelKey;
                var i;
                if(fm){
                    for (levelKey in fm.levels) {
                        deleteItems[levelKey] = [];
                        var level = fm.levels[levelKey];
                        for (i = 0; i < level.length; i++) {
                            for (var j = 0; j < fmState.length; j++) {
                                var featChanged = fmState[j];
                                var featDisplayed = level[i];
                                if(featChanged && featDisplayed){
                                    if (featChanged.name === featDisplayed.feature) {
                                        if (featChanged.state === 'SELECTED') {
                                            featDisplayed.state = featChanged.state;
                                        } else {
                                            deleteItems[levelKey].push(i);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    for (levelKey in fm.levels) {
                        for (i = 0; i < deleteItems[levelKey].length; i++) {
                            fm.levels[levelKey][deleteItems[levelKey][i]] = null;
                        }
                    }
                }
            },
            function(){
                window.alert('getFeatures Failed !');
            });
    };

	/**
	 * get the features in the given level
	 * @param level
	 * @returns {*}
	 */
	$scope.getLevel = function (level) {
		if ($scope.fm.levels) {
			return $scope.fm.levels[level];
		}
	};

	/**
	 * get all features
	 * @returns {*}
	 */
	$scope.getAllLevels = function () {
		var all = [];
		if ($scope.fm.levels) {
			for(var level in $scope.fm.levels){
				var features =  $scope.fm.levels[level];
				for(var i = 0; i<features.length; i++){
					if(features[i] !== null){
						all.push(features[i]);
					}
				}
			}
		}
		return all;
	};

    /**
     * initialize compatiblesConf by domain array
     * @param de
     */
    $scope.initCompatiblesConfigurations = function(de){

        $rootScope.compatiblesConf[de] = {
            configCompatibles : []
        };

    };

	/**
	 * getLevelLength : (only to check the number of levels we have to display)
	 * @param level
	 * @returns {*}
	 */

	$scope.getLevelLength = function (level) {
		var response;
		if ($scope.fm.levels) {
			if ($scope.fm.levels[level].length > 0) {
				response =  'OK';
			} else {
				response = 'NO';
			}
		}
		return response;
	};

    /**
     * open the modal view
     * @param de
     */
    $scope.open = function (de, configID) {
        $scope.currentViewing = $scope.getConfigByID(de,configID);
	    angular.copy($rootScope.deFeatures[de], $scope.fm);

        if(de === $scope.domainElement && configID === $scope.configID) { // check feature state in the config
            $scope.getSelectedFeatures($scope.fm);  // add the configID
            $scope.shouldBeOpen = true;
        }
        else {
            FMManager.initFMState($rootScope.SpineFMID, de, $scope.currentViewing.ctxID).then(function (fm) {
                    $scope.updateFMState(fm);
                    $scope.getSelectedFeatures($scope.fm);
                    $scope.shouldBeOpen = true;
                },
                // error for initFMState request
                function (fm) {
                    $scope.failedRequestAlert(fm.status, 'initFMState');
                });
        }
    };

    /**
     * close the modal view
     */
    $scope.close = function () {
        $scope.shouldBeOpen = false;
    };

	/**
	 * options for modal
	 * @type {{backdropFade: boolean, dialogFade: boolean, keyboard: boolean, show: boolean, backdropClick: boolean}}
	 */
	$scope.opt = {
		backdropFade: true,
		dialogFade:true,
		show: false
	};

	/**
	 *
	 * @param configID
	 * @param de
	 */
	$scope.isConfigLinkable = function(configID, de){
		$scope.isLinkableWith[de] = true;
		configManager.checkIsConfigLinkable($rootScope.SpineFMID, configID, de).then(function (linkable) {
				if(linkable.toString() === 'false' || $scope.isAddNewAllowed(de) === 'false'){
					$scope.isLinkableWith[de] = false;
				}
			},
			function (){
				window.alert('Echec de check config compatible with');
			});
	};
	$scope.getDEConfigurations = function(de){
		var config = [];
		if($rootScope.configurations[de]){
			for(var configID in $rootScope.configurations[de].validConfig.listConfigs){
				config.push(configID);
			}
		}
		return config;
	};

	/**
	 * check if we the given de has one config already  linked with the current config
	 * @param de
	 * @returns {boolean}
	 */
	$scope.isDEHasConfigLinked = function(de){
		var response = false;
		var configs = $scope.getDEConfigurations(de);

		if($rootScope.linkedConfig[$scope.configID] && configs.length > 0){
			for(var i=0; i<$rootScope.linkedConfig[$scope.configID].length; i++){
				var currentConfig = $rootScope.linkedConfig[$scope.configID][i];
				for(var k = 0; k<currentConfig.length; k++){
					if(configs.indexOf(currentConfig[k]) >= 0 && response === false){
						response = true;
					}
				}

			}
		}
		return response;
	};

	/**
	 * check if compatibles DEs must be shown or not
	 * @returns {boolean}
	 */
	$scope.showCompatiblesDES = function(){
		var response = [];
		if($rootScope.compatiblesDES[$scope.domainElement]){
			for(var i = 0; i< $rootScope.compatiblesDES[$scope.domainElement].length; i++) {
				var de = $rootScope.compatiblesDES[$scope.domainElement][i];
				if($scope.isLinkableWith[de]){
					response.push($scope.isLinkableWith[de]);
				}
			}
		}
		return $scope.currentConfig.isLinked === false || response.indexOf(true) >= 0;
	};

	/**
	 * get the DE on the given config
	 * @param configID
	 * @returns {null}
	 */
	$scope.getDEOfConfig = function(configID){
		var response  = null;
		for(var domain in $rootScope.configurations){
			var deConfig = $rootScope.configurations[domain];
			for(var id in deConfig.validConfig.listConfigs){
				if(id === configID){
					response = domain;
				}
			}
		}
		return response;
	};

	/**
	 * get compatibles configurations
	 * @param confID
	 * @param deTarget
	 */

	$scope.getConfigCompatibles = function(confID, deTarget){

		//var isLinkable = $scope.isConfigLinkable(confID, deTarget);
		configManager.checkIsConfigLinkable($rootScope.SpineFMID, confID, deTarget).then(function (linkable) {
				if(linkable.toString() === 'false') {
					$scope.isLinkableWith[deTarget] = false;
				}
				else if(linkable.toString() === 'true') {
					$scope.initCompatiblesConfigurations(deTarget);
					$scope.isLinkableWith[deTarget] = true;
					configManager.getLinkedConfigurations($rootScope.SpineFMID, deTarget, confID).then(function (hasLinked) {
							var multiplicity = $scope.getMultiplicityBetweenDE($scope.domainElement, deTarget);
							if(hasLinked.length  !==  multiplicity){
								configManager.getCompatiblesConfigurations($rootScope.SpineFMID, deTarget, confID).then(function (configCompatibles) {
										$rootScope.compatiblesConf[deTarget].configCompatibles[confID] = configCompatibles;
									},
									function(){
										//window.alert('Echec du chargement des configurations compatibles');
								});
							}
							else {
								$scope.isLinkableWith[deTarget] = false;
							}
						},
						function(){
							window.alert('get linked in compatibles failed');
						});
				}
			},
			function (){
				window.alert('Echec de check config compatible with');
			});
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
     * check if the current configuration is valid
     */
    $scope.checkConfigValidity = function () {
        FMManager.isConfigComplete($rootScope.SpineFMID, $scope.domainElement, $scope.ctxID).then(function (result) {
                $scope.configValid = result;
                $scope.currentConfig.isValid = result;
            },
            function (result) {
                window.alert('checkConfigValidity failed ' + result.status);
            });

    };

	/**
	 * get compatibles configs from all DE compliant
	 */
	$scope.getConfigInCompatiblesDES = function(){
		for(var i = 0; i< $rootScope.compatiblesDES[$scope.domainElement].length ;i++){
			var currentDE = $rootScope.compatiblesDES[$scope.domainElement][i];
			$scope.getConfigCompatibles($scope.configID, currentDE);
		}
		//$timeout(getCompatibles, 500);
		var showElements = function () {
			$scope.showProgress = false;
			$scope.showConfig = true;
		};
		$timeout(showElements, 1000);
	};

    /**
     * get the url of the given configuration ID
     * @param configID
     * @returns {string}
     */
    $scope.getConfigURL = function(configID){
        var url = '';
        for(var de in $rootScope.configurations){
            var deConfigs = $rootScope.configurations[de].validConfig.listConfigs;
            for(var currentConfigID in deConfigs){
                if(currentConfigID === configID){
                    url = deConfigs[currentConfigID].url;
                }
            }
        }
        return url;
    };

	/**
	 * get the name of the given configuration ID
	 * @param configID
	 * @returns {string}
	 */
	$scope.getConfigValue = function(configID){
		var name = '';
		for(var de in $rootScope.configurations){
			var deConfigs = $rootScope.configurations[de].validConfig.listConfigs;
			for(var currentConfigID in deConfigs){
				if(currentConfigID === configID){
					name = deConfigs[currentConfigID].name;
				}
			}
		}
		return name;
	};

	/**
	 * get the configuration object from DE and configID
	 * @param de
	 * @param configID
	 * @returns {{}}
	 */
	$scope.getConfigByID = function(de, configID){
		var config = {};
		if($rootScope.configurations[de]) {
			var deConfigs = $rootScope.configurations[de].validConfig.listConfigs;
			for(var currentConfigID in deConfigs){
				if(currentConfigID === configID){
					config = deConfigs[currentConfigID];
				}
			}
		}
		return config;
	};

    /** get linked configurations
     *
     * @param de
     * @param configID
     */
    $scope.getLinkedConfigurations = function(de, configID){
        $rootScope.linkedConfig[configID] = [];

        var successGetConfigCompatible = function (result) {
            if(result.length > 0){
                $scope.hasLinkedConfig = true;
                $rootScope.linkedConfig[configID].push(result);
            }
            else {
                $scope.checkMustLinkedConfig(de, configID, currentDE);

            }
        };

        var failGetConfigCompatible = function () {
            window.alert('Echec du chargement des configurations liées à '+ configID);
        };

        if($rootScope.compatiblesDES[de]){
            for(var i = 0; i < $rootScope.compatiblesDES[de].length ;i++){
                var currentDE = $rootScope.compatiblesDES[de][i];
                configManager.getLinkedConfigurations($rootScope.SpineFMID, currentDE, configID).then(
                    successGetConfigCompatible,
                    failGetConfigCompatible
                );
            }
        }
    };

	/**
	 * check configs which must be  linked and link them
	 * @param deSrc
	 * @param configID
	 * @param deTarget
	 */
    $scope.checkMustLinkedConfig = function (deSrc, configID, deTarget){
        if($rootScope.DEProperties[deSrc]){
            if($rootScope.DEProperties[deSrc].target){
                for(var i = 0; i < $rootScope.DEProperties[deSrc].target.length; i++){
                    var target = $rootScope.DEProperties[deSrc].target[i];
                    if(target !== null && target !== undefined){
                        if(target.de === deTarget) {
                            if(target.linkMultiplicity.lowerBound >= 1){
                                var hasConfig = $scope.isAddNewAllowed(deTarget);
                                if(hasConfig.toString() === 'false') {
                                    var configs = $scope.getDEConfigurations(deTarget);
                                    if(configs.length > 0){
                                        var myConfigID = configs[0];
                                        $scope.linkConfigurations(configID, myConfigID);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

	/**
	 * get multiplicity between given domains
	 * @param deSrc
	 * @param deTarget
	 * @returns {number}
	 */
	$scope.getMultiplicityBetweenDE = function(deSrc, deTarget) {
		var mult = 0;
		if($rootScope.DEProperties[deSrc]){
			if($rootScope.DEProperties[deSrc].target){
				for(var i = 0; i < $rootScope.DEProperties[deSrc].target.length; i++){
					var target = $rootScope.DEProperties[deSrc].target[i];
					if(target !== null && target !== undefined){
						if(target.de === deTarget) {
							mult = target.linkMultiplicity.upperBound;
						}
					}
				}
			}
		}
		return mult;
	};

	/**
	 * Verify if the given compatible DE has a multiplicity 1 or not with the current DE
	 * @param domain
	 * @returns {string}
	 */
	$scope.isUniqueChoice = function(domain){
		var response = 'false';

		if($rootScope.DEProperties[$scope.domainElement]){

			for(var i = 0; i< $rootScope.DEProperties[$scope.domainElement].target.length; i++){

				var target = $rootScope.DEProperties[$scope.domainElement].target[i];
				if(target.de === domain) {
					if(target.linkMultiplicity.upperBound === 1) {
						response = 'true';
					}
					else {
						response = 'false';
					}
				}
			}

		}
		return response;
	};

	/**
	 *  get the compatibles DE which have configurations
	 * @returns {Array}
	 */
	$scope.getDEWithConfigs = function(){
		var des = [];
		for(var i = 0; i< $rootScope.compatiblesDES[$scope.domainElement].length ;i++){
			var currentDE = $rootScope.compatiblesDES[$scope.domainElement][i];

			des.push(currentDE);
		}
		return des;
	};

    /**
     * link 2 given configurations
     * @param configSource
     * @param configTarget
     */
    $scope.linkConfigurations = function(configSource, configTarget) {
        var alreadyLinked = 0;
        if(configSource !== null && configTarget !== null) {
            for(var r = 0; r < $rootScope.links.length; r++){
                var link = $rootScope.links[r];
                if(link.source === configSource && link.target === configTarget){
                    alreadyLinked += 1 ;
                }
                else if(link.source === configTarget && link.target === configSource){
                    alreadyLinked += 1 ;
                }
            }
            if($rootScope.linkedConfig[configSource]) {
                if($rootScope.linkedConfig[configSource].indexOf(configTarget) >= 0){
                    alreadyLinked += 1;
                    return;
                }
            }
            if($rootScope.linkedConfig[configTarget]) {
                if($rootScope.linkedConfig[configTarget].indexOf(configSource) >= 0){
                    alreadyLinked += 1;
                    return;
                }
            }
            if(alreadyLinked === 0) {
                configManager.linkConfigurations($rootScope.SpineFMID, configSource, configTarget).then(function (result) {

                        $rootScope.links.push({'source':configSource, 'target': configTarget});
		                if(result.deletedContext){
			                $scope.handleChanges(result);
		                }
		                var deSrc = $scope.getDEOfConfig(configSource);
		                var deTarget = $scope.getDEOfConfig(configTarget);
		                if(deSrc !== null && deTarget !== null) {
			                $scope.updateConfigState(configSource, deSrc, configTarget, deTarget);
		                }
                    },
                    function(){
                        //window.alert(' link configurations failed');
                });
            }
        }

    };

	/**
	 * update fm state before showing modal view
	 * @param fmState
	 */
	$scope.updateFMState = function (fmState) {
		// levels are key of an object, not an array
		for (var levelKey in $scope.fm.levels) {
			var level = $scope.fm.levels[levelKey];
			for (var i = 0; i < level.length; i++) {
				for (var j = 0; j < fmState.length; j++) {
					var featChanged = fmState[j];
					var featDisplayed = level[i];
					if(featChanged && featDisplayed){
						if (featChanged.name === featDisplayed.feature) {
							featDisplayed.state = featChanged.state;
						}
					}
				}
			}
		}
	};

	/**
	 * update config  state when linked
	 * @param configSrc
	 * @param configTarget
	 */
	$scope.updateConfigState = function(configSrc, deSrc, configTarget, deTarget){

		if($rootScope.configurations[deSrc]){
			if($rootScope.configurations[deSrc].validConfig.listConfigs[configSrc]){

				configManager.checkIsConfigLinked($rootScope.SpineFMID, configSrc).then( function(linked) {
						if(linked.toString() === 'true') {
							$rootScope.configurations[deSrc].validConfig.listConfigs[configSrc].isLinked = true;
							var noNewAllowed = $scope.isAddNewAllowed(deSrc);
							if(noNewAllowed.toString() === 'false') {
								if ($rootScope.validConfigs[deSrc].linked === 1) {
									$rootScope.validConfigs[deSrc].linked += 0;
									$rootScope.validConfigs[deSrc].notLinked += 0;
								}
								else{
									$rootScope.validConfigs[deSrc].linked += 1;
									$rootScope.validConfigs[deSrc].notLinked += -1;
								}
							}
							else{
								$rootScope.validConfigs[deSrc].linked += 1;
								$rootScope.validConfigs[deSrc].notLinked += -1;
							}
						}
					}
				);

			}
		}
		if($rootScope.configurations[deTarget]) {
			if($rootScope.configurations[deTarget].validConfig.listConfigs[configTarget]){

				configManager.checkIsConfigLinked($rootScope.SpineFMID, configTarget).then( function(isLinked) {
						if(isLinked.toString() === 'true') {
							$rootScope.configurations[deTarget].validConfig.listConfigs[configTarget].isLinked = true;
							var noNewAllowed = $scope.isAddNewAllowed(deTarget);
							if(noNewAllowed.toString() === 'false') {
								if ($rootScope.validConfigs[deTarget].linked === 1) {
									$rootScope.validConfigs[deTarget].linked += 0;
									$rootScope.validConfigs[deTarget].notLinked += 0;
								}
								else{
									$rootScope.validConfigs[deTarget].linked += 1;
									$rootScope.validConfigs[deTarget].notLinked += -1;
								}
							}
							else {
								$rootScope.validConfigs[deTarget].linked += 1;
								$rootScope.validConfigs[deTarget].notLinked += -1;
							}
						}
					}
				);

			}
		}
		window.alert('Configuration linked');
		$scope.initBilan();


	};

    /**
     * check if the given configuration is linked
     * @param configID
     * @returns {boolean}
     */
    $scope.isConfigLinked = function(configID){
        var isLinked= false;
        configManager.checkIsConfigLinked($rootScope.SpineFMID, configID).then(function (linked) {
                isLinked = linked;
            },
            function(){
                window.alert('Echec de check config compatible with');
            });

        return isLinked;
    };

	/**
	 *  handle change Context when we link configurations between them
	 * @param change
	 */
	$scope.handleChanges = function(change){

		var ctxIDToDelete = change.deletedContext;
		var newCtxID = change.replacedBy;

		for(var de in $rootScope.configurations){
			var deConfig = $rootScope.configurations[de];
			if(deConfig.partialConfig.listConfigs[ctxIDToDelete] !== undefined){
				var config = deConfig.partialConfig.listConfigs[ctxIDToDelete];

				if(deConfig.partialConfig.listConfigs[newCtxID] === undefined){
					config.url = '#/de/'+de+'/ctx/'+newCtxID;
					config.ctxID =  newCtxID;
					$rootScope.configurations[de].partialConfig.listConfigs[newCtxID] = config;
					delete $rootScope.configurations[de].partialConfig.listConfigs[ctxIDToDelete];
				}
			}
		}

	};

	/**
	 * clone a valid configuration
	 */
	$scope.cloneValidConfiguration = function(){
		configManager.cloneValidConfiguration($rootScope.SpineFMID, $scope.configID).then(function (result) {
				var newConfigID  = result.configID;
				var newCtx = result.ctxID;
				var de = result.de;
				$scope.addClone(de, newCtx, newConfigID);

			},
			function(){
				window.alert('clone valid failed !');
			});
	};

	/**
	 * add a cloned configuration
	 * @param de
	 * @param ctxID
	 * @param configID
	 */
	$scope.addClone = function(de, ctxID, configID){

		FMManager.getConfName($rootScope.SpineFMID, de, ctxID).then(function (name) {                                                                                //TODO get conf name
				$scope.deConfigurations.validConfig.number += 1;
				$scope.deConfigurations.validConfig.listConfigs[configID] = {'url': '#/bilan/'+$scope.domainElement+'/ctx/'+ctxID+'/'+configID+'/', 'name': name, ctxID: configID};
				window.alert(' Configuration Duplicated');
			},
			function(){
				window.alert(' get clone config name Failed');
			});
	};

	/**
	 * set the selected configuration to link with
	 * @param selected
	 */
	$scope.setSelectedConf = function(selected){
		$scope.selectedConf = selected;
	};

    /**
     * create a context by his ID and the DE
     * @param id
     */
    $scope.getConfigName = function(id){

        FMManager.getValidConfigName($rootScope.SpineFMID, id).then(function (name) {

                console.log('Get config name '+name);
            },
            function () {
                window.alert(' get config name failed');
            }
        );

    };

	// watch setting current config's Name, Space not allowed
	$scope.$watch('newName', function() {
		if($scope.newName!== null){
			$scope.newName= $scope.newName.replace(/[^a-zA-Z0-9_-]/g,'');
			//$scope.newName= $scope.newName.replace(/\s+/g,'_');
		}
	});

	/**
	 * changing the current configuration's name
	 */
	$scope.changeConfigName = function () {
		if($scope.newName === $scope.currentConfig.name){
			return;
		}
		else{
			$scope.currentConfig.name = $scope.newName;
			FMManager.setValidConfigName($rootScope.SpineFMID, $scope.configID, $scope.currentConfig.name).then(function (result) {
					console.log(result);
					//$scope.confNameChanged = result;
				},
				function () {
					window.alert('Set config name failed');
				});
		}
	};

	/**
	 * check if the given de has configs compatibles with the current one
	 * @param de
	 * @returns {boolean}
	 */
	$scope.hasConfigsCompatibles = function(de){
		if($rootScope.compatiblesConf[de]){
			if($rootScope.compatiblesConf[de].configCompatibles[$scope.configID]){
				return $rootScope.compatiblesConf[de].configCompatibles[$scope.configID].length > 0;
			}
			else{
				return false;
			}
		}
	};

    /**
     * cancel setting config name modal
     */
    $scope.cancelSetConfigName = function() {
        $scope.openSetConfigNameModal = false;
    };

	/**
	 * open setting config name modal
	 */
	$scope.openSetConfigName = function() {
		$scope.openSetConfigNameModal = true;
	};

	/**
	 * Validate change config name
	 */
	$scope.validateConfigName = function() {
		if($scope.newName === $scope.currentConfig.name) {
			$scope.openSetConfigNameModal = false;
		}
		else {
			if($rootScope.ConfigsName.indexOf($scope.newName) < 0) {
				FMManager.setValidConfigName($rootScope.SpineFMID, $scope.configID, $scope.newName).then(function (result) {
						console.log(result);
						if($rootScope.ConfigsName.indexOf($scope.currentConfig.name) > 0) {
							$rootScope.ConfigsName[$rootScope.ConfigsName.indexOf($scope.currentConfig.name)] = $scope.newName;
						}
						else {
							$rootScope.ConfigsName.push($scope.newName);
						}
						$scope.currentConfig.name = $scope.newName;
						$scope.openSetConfigNameModal = false;
						//$scope.confNameChanged = result;
					},
					function () {
						window.alert('Set config name failed');
					});
			}
			else {
				window.alert('This name is already given to a configuration, please choose another one');
			}
		}
	};

	/**
	 * Lunch bilan view
	 */
	$scope.initBilan = function() {
		$scope.showProgress = true;
		$scope.getConfigInCompatiblesDES();
		$timeout(function someWork(){
			$scope.getLinkedConfigurations($scope.domainElement, $scope.configID);
		}, 1000);
		$scope.checkIsGenerateAllowed();
	};

//$$$$$$$$$$$$$$$$$$$$$$$ start bilan controller $$$$$$$$$$$$$$$$$$$$$$$
    $scope.initBilan();
});

'use strict';

/**
 * Controller for the configuration view
 */

angular.module('tocsinApp').controller('configurationCtrl', function ($rootScope, $scope, $routeParams, $timeout, FMManager, configManager) {

	if($rootScope.SpineFMID === undefined){
		window.location.href = '#/';
		return;
	}
	$scope.fmSelectedState = {};
	$scope.domainElement = $routeParams.domainelement;
	$scope.configValid = false;
	$scope.confNameChanged = false;
	$scope.myOption = null;
	$scope.showConfigsDE = false;
	$scope.showSelect  = [];
	$scope.selectedDE = null;
	$rootScope.createdFromClone = [];
	$scope.choiceInModal = false;
	$scope.spineFMNewName = null;
	$scope.openSetSpineNameModal = false;
	$scope.selectedFeatures = [];
	$scope.helpModal = false;
	$scope.showExplication = false;
	$scope.deselectedFeatures = [];
	$scope.showGenarationLoading = false;
	$scope.showMouseConfiguration = false;
	$scope.showInitImage = true;
	$scope.showLoading = false; // show loading spinner
	$scope.justLoaded = false; // check if current page is just loaded
	$scope.isVisible = false; // modal opened when adding new configuration
	$scope.showInfoLevel = []; // showInfo for accordion
	$scope.configOldName = '';
	$scope.hasConfigToLink = false;
	$scope.toFinalize = false; // check if we must finalize config or not
	$scope.openSetConfigNameModal = false; // modal to set config name when validating config
	$scope.linkableConfig = {};
	$rootScope.mouseMode = {all : true, select:false, deselect:false};
	$rootScope.MouseConfigurationMode = 'allMenu';

	$scope.deConfigurations = $rootScope.configurations[$scope.domainElement];

	// clone object of the feature model used
	angular.copy($rootScope.deFeatures[$scope.domainElement], $scope.fm);

	/**
	 * initialize the configuration controller
	 */
	$scope.initController = function() {

		if ($routeParams.ctxID) {
			$scope.isVisible = false;
			$scope.showProgress = true;
			if($routeParams.deTarget){
				$scope.handleExistingContext($routeParams.deTarget, $routeParams.ctxID);
				$scope.getOption($routeParams.deTarget, $routeParams.ctxID);
			}
			else{
				$scope.handleExistingContext(null, $routeParams.ctxID);
			}

		} else {
			var prop = $scope.getPropositions();
			if(prop.length > 0) {
				$scope.isVisible = true;
				$scope.initShowSelect();
				//$scope.showProgress = true;
			} else {
				$scope.createNewContext($scope.domainElement);
			}
		}
		$scope.initShowLevel();
	};
	/**
	 *
	 */
	$scope.initShowLevel = function(){
		if($rootScope.zones[$scope.domainElement]) {
			$scope.showInfoLevel = [$rootScope.zones[$scope.domainElement].length];
			for(var i = 0 ; i < $rootScope.zones[$scope.domainElement].length; i++) {
				if(i === 0) {
					$scope.showInfoLevel[i] = true;
				}
				else {
					$scope.showInfoLevel[i] = false;
				}
			}
		}
	};
	/**
	 * set configuration name : create   new configuration of the given de in the given context id (and say if it's a clone or not)
	 * @param id
	 * @param de
	 * @param isClone
	 */
	$scope.setConfigurationName = function(id, de, isClone) {

		FMManager.getConfName($rootScope.SpineFMID, de, id).then(function (name) {
				$scope.ctxID = id;
				$scope.deConfigurations.partialConfig.number += 1;
				$scope.deConfigurations.partialConfig.listConfigs[id] = {'name': name, 'isValid': false, de:$scope.domainElement, 'url': '#/de/'+$scope.domainElement+'/ctx/'+id, ctxID:id};
				$rootScope.ConfigsName.push(name);
				if(isClone === false) {
					$scope.currentConfig = $scope.deConfigurations.partialConfig.listConfigs[id];
					$scope.getInitFMState();
					if($routeParams.ctxID && $rootScope.configsToLink.indexOf($scope.currentConfig)<0){
						if($routeParams.ctxID !== $rootScope.globalCtxID ){
							$rootScope.configsToLink.push($scope.currentConfig);
							console.log('Same contexte OK');
						}

					}
				}
				$scope.checkCompleteZone();

			},
			function (name) {
				$scope.failedRequestAlert(name.status, 'getConfName');
			}
		);
	};

	/**
	 * check complete zone for opening them
	 */
	$scope.checkCompleteZone = function() {

		if ($scope.fm.levels) {
			for(var key in $scope.fm.levels) {
				var isNotComplete = $scope.hasFeaturesToSelect(key);
				if(isNotComplete === false) {
					$scope.setInfoVisibility(key);
					$scope.handleCompleteZone(key);
				}
			}
		}
	};
	/**
	 * display an existing context or create a new context with an ID of a compatible configurations
	 * @param ctxID
	 */
	$scope.handleExistingContext = function (deSrc, ctxID){
		console.log('Handle existing context for '+deSrc+' ctx : '+ctxID);

		$scope.currentConfig = $scope.deConfigurations.partialConfig.listConfigs[ctxID];
		if ($scope.currentConfig === undefined) {       // Case we create a new context with a ID from a compatible config

			console.log('If the current config is undefined...');

			if(ctxID === $rootScope.globalCtxID){
			    console.log('We are in a global context...');
			    //if it's globalCTXID
				if($rootScope.DEProperties[$scope.domainElement].multiplicityDE.upperBound === 1){
					$scope.setConfigurationName(ctxID, $scope.domainElement, false);
				}
				else{
					$scope.createNewContext($scope.domainElement);
				}
			}
			else{
			    console.log('If we are in a local context...');
				// clone before
				if($rootScope.DEProperties[$scope.domainElement].multiplicityDE.upperBound === 1){       //
					$scope.setConfigurationName($rootScope.globalCtxID, $scope.domainElement, false);
				}
				else{
					if(deSrc !== undefined || deSrc !== null){
						if($rootScope.DEProperties[deSrc]){
							if($rootScope.DEProperties[deSrc].target){
								var clone = function(id, domain){
									configManager.cloneConfigurationToLink($rootScope.SpineFMID, id, domain).then(function (result) {
											$rootScope.createdFromClone[ctxID] = {ctxTarget :result, deTarget:$scope.domainElement, deSrc : domain};
											$scope.setConfigurationName(result, $scope.domainElement, false);
										},
										function(){
											window.alert('clone config to link failed !');
										});
								};

								var relation;
								for (var j = 0; j < $rootScope.DEProperties[$scope.domainElement].target.length; j++) {
									if ($rootScope.DEProperties[$scope.domainElement].target[j].de === deSrc) {
										relation = $rootScope.DEProperties[$scope.domainElement].target[j];
										if (relation.linkMultiplicity.upperBound === -1){
											$scope.createNewContext($scope.domainElement);
										} else {
											for(var i = 0; i < $rootScope.DEProperties[deSrc].target.length; i++){
												if($rootScope.DEProperties[deSrc].target[i].de === $scope.domainElement){
													relation = $rootScope.DEProperties[deSrc].target[i];
													if(relation.linkMultiplicity.upperBound === -1){
														clone(ctxID, deSrc);
													} else {
														$scope.setConfigurationName(ctxID, $scope.domainElement, false);
													}
												}
											}
										}
									}
								}
							}
						}
					}
					else {
						$scope.setConfigurationName(ctxID, $scope.domainElement, false);
					}
				} //
			}
		}
		else {
			console.log('if the current config is defined we only display the existing context');
			// displaying an existing context
			$scope.ctxID = ctxID;
			$scope.getInitFMState();

		}
		$scope.showConfig = true;
	};

	/**
	 * Create a new context
	 * @param de
	 */
	$scope.createNewContext = function(de){
		if($rootScope.DEProperties[de].multiplicityDE.upperBound === 1){       //
			$scope.setConfigurationName($rootScope.globalCtxID, $scope.domainElement, false);
		}

		else {
			FMManager.initContext($rootScope.SpineFMID).then(function (id) {

					$scope.setConfigurationName(id, $scope.domainElement, false);
				},
				// error on initContexte request
				function (id) {
					$scope.failedRequestAlert(id.status, 'initContexte');
				}
			);
		}
		$scope.showConfig = true;
	};

	/**
	 * initialize showSelect property for each compatibles domain element
	 */
	$scope.initShowSelect = function(){
		for(var j = 0; j< $rootScope.compatiblesDES[$scope.domainElement].length ;j++){
			var de = $rootScope.compatiblesDES[$scope.domainElement][j];
			$scope.showSelect[de] = false;
		}
	};
	/**
	 *  getLevel : get features in the given level
	 * @param level
	 * @returns {*}
	 */
	$scope.getLevel = function (level) {
		if ($scope.fm.levels) {
			var features = [];
			for(var i =0; i< $scope.fm.levels[level].length; i++){
				var feat = $scope.fm.levels[level][i];
				if(feat !== null){
					if(feat.state !== 'DESELECTED'){
						features.push(feat);
					}
				}
			}
			return features ;
		}
	};
	/**
	 * get selected features in the current FM
	 * @returns {Array}
	 */
	$scope.getSelectedFeatures = function(){
		if ($scope.fm.levels) {
			for(var key = 0; key < 4; key++){
				if($scope.fm.levels[key]){
					var level = $scope.fm.levels[key];

					for(var i =0; i< level.length; i++){
						var feat = level[i];
						if(feat.state === 'SELECTED'){
							$scope.selectedFeatures.push(feat);
						}
					}
				}
			}
		}
	};
	/**
	 * get deselected features in the current FM
	 * @returns {Array}
	 */
	$scope.getDeselectedFeatures = function(){
		$scope.deselectedFeatures = [];
		if ($scope.fm.levels) {
			for(var key = 0; key < 4; key++){
				if($scope.fm.levels[key]){
					var level = $scope.fm.levels[key];

					for(var i =0; i< level.length; i++){
						var feat = level[i];
						if(feat !== undefined && feat !== null) {
							if(feat.state === 'DESELECTED'){
								if($scope.deselectedFeatures.indexOf(feat) < 0){
									$scope.deselectedFeatures.push(feat);
								}
							}
						}
					}
				}
			}
		}
	};

	/**
	 * getLevelLength (only to check the number of levels we have to display)
	 * @param level
	 * @returns {*}
	 */
	$scope.getLevelLength = function (level) {
		var response;
		if ($scope.fm.levels) {
			if($scope.fm.levels[level].length > 0) {
				response =  'OK';
			}
			else {
				response = 'NO';
			}
		}
		return response;
	};

	/**
	 * check if level has unselected feature(s)
	 * @param level
	 * @returns {boolean}
	 */
	$scope.hasFeaturesToSelect = function (level) {
		var features = [];
		if ($scope.fm.levels) {
			for(var i =0; i< $scope.fm.levels[level].length; i++){
				var feat = $scope.fm.levels[level][i];
				if(feat !== null){
					if(feat.state === 'UNSELECTED'){
						features.push(feat);
					}
				}
			}
		}
		return features.length > 0 ;
	};

	/**
	 * handle accordion visibility of a complete zone
	 * @param level
	 */
	$scope.handleCompleteZone = function(level){
		if ($scope.fm.levels) {
			for(var key in $scope.fm.levels) {
				if(key !== level){
					var isNotComplete = $scope.hasFeaturesToSelect(key);
					if(isNotComplete === true){
						$scope.setInfoVisibility(key);
						return;
					}
				}
			}
		}
	};
	/**
	 * get compatibles configurations of the given domain element
	 */
	$scope.getPropositions = function(){
		var propositions  = [];
		var domains = $scope.getDEWithConfigs();
		if(domains.length > 0){
			for(var i = 0; i< domains.length; i++){
				var currentDE = domains[i];

				for(var ctxID in  $rootScope.configurations[currentDE].partialConfig.listConfigs){  //TODO requests for getting compatibles conf
					if($rootScope.configurations[currentDE].partialConfig.listConfigs[ctxID]) {
						var configName = $rootScope.configurations[currentDE].partialConfig.listConfigs[ctxID].name;
						propositions.push(configName);
					}
				}

				for(var configID in  $rootScope.configurations[currentDE].validConfig.listConfigs){  //TODO requests for getting compatibles conf
					if($rootScope.configurations[currentDE].validConfig.listConfigs[configID]) {
						var config = $rootScope.configurations[currentDE].validConfig.listConfigs[configID];
						if(config.isLinked !== true) {
							propositions.push(config.name);
						}
					}
				}
			}
		}
		return propositions;
	};

	/**
	 * get all compatibles config from the given domain
	 * @param de
	 */
	$scope.getConfigs = function(de){
		console.log('Appel de la fonction getconfigs');
		var configs  = [];
		var config;
		if(de){
			if($rootScope.configurations[de]) {
				for(var ctxID in  $rootScope.configurations[de].partialConfig.listConfigs){
					if($rootScope.configurations[de].partialConfig.listConfigs[ctxID]) {
						config = $rootScope.configurations[de].partialConfig.listConfigs[ctxID];
						configs.push(config);
					}
				}
				var getCompatibles = function (conf) {
					configManager.checkIsConfigLinkable($rootScope.SpineFMID, conf.configID, $scope.domainElement).then(function (linkable) {
							if (linkable.toString() === 'true') {
								configs.push(conf);
							}
						},
						function(){
							//window.alert('Echec du chargement des configurations compatibles');
					});
				};
				console.log($rootScope.configurations[de].validConfig.listConfigs);

				for(var configID in  $rootScope.configurations[de].validConfig.listConfigs){
					if($rootScope.configurations[de].validConfig.listConfigs[configID]) {
						var current =  $rootScope.configurations[de].validConfig.listConfigs[configID];
						getCompatibles(current);
					}
				}
			}
		}
		console.log('retour get configs');
		console.log(configs);
		$scope.linkableConfig[de] = configs;
	};

	/**
	 * get the given de's config with the given ctxID (context)
	 * @param de
	 * @param ctxID
	 */
	$scope.getOption = function(de, ctxID) {
		if($rootScope.configurations[de]) {
			for(var key in $rootScope.configurations[de].validConfig.listConfigs) {
				var myConfig = $rootScope.configurations[de].validConfig.listConfigs[key];
				if(myConfig.ctxID === ctxID){
					$scope.myOption = myConfig;
					$scope.hasConfigToLink = true;
				}
			}
		}
	};

	/**
	 * handle selection in modal view
	 */
	$scope.handleSelection = function(){

		if($scope.myOption === null || $scope.showConfigsDE === false) {
			$scope.createNewContext($scope.domainElement);
		}

		else {
			$scope.hasConfigToLink = true;
			$rootScope.configsToLink.push($scope.myOption);
			console.log('selected option');
			console.log($scope.myOption);
			console.log($scope.selectedDE);
			$scope.handleExistingContext($scope.selectedDE, $scope.myOption.ctxID);
		}
	};

	/**
	 * validate the choice in 'select compatible config ' modal view
	 */
	$scope.validate = function () {
		if($scope.showConfigsDE === true && $scope.myOption === null){
			window.alert('Veuillez choisir une configuration Avant de valider !');
		}
		else {
			$scope.handleSelection();
			$scope.isVisible = false;
		}
	};

	/**
	 * close 'select compatible config ' modal
	 */
	$scope.cancel = function(){
		$scope.isVisible = false;
		$scope.showProgress = true;
		$scope.showConfig = false;
	};

	/**
	 * options for modals
	 * @type {{backdropFade: boolean, dialogFade: boolean, keyboard: boolean, show: boolean, backdropClick: boolean}}
	 */
	$scope.opt = {
		backdropFade: true,
		dialogFade:true,
		keyboard: false,
		show: false,
		backdropClick: false
	};
	/**
	 * the callback for clicked features : setting selection/deselection
	 * @param feature
	 */

	$scope.selectFeature = function (feature, level) {
		$scope.showProgress = true;
		if ($rootScope.mouseMode.all === true || $rootScope.mouseMode.select === true) {
			if (feature.state === 'UNSELECTED' || feature.state === 'undefined') {
				$scope.showLoading = true;
				$scope.showInitImage = false;
				feature.state = 'SELECTED';
				$scope.changeState(feature.feature, 'select', level);
			}
		}
		else if ($rootScope.mouseMode.deselect === true) {
			if (feature.state === 'UNSELECTED' || feature.state === 'undefined') {
				$scope.showLoading = true;
				$scope.showInitImage = false;
				feature.state = 'DESELECTED';
				$scope.changeState(feature.feature, 'deselect', level);
			}
		}
		$scope.showProgress = false;
	};
	/**
	 * the callback for right clicked features : setting deselection
	 * @param feature
	 */
	$scope.deselectFeature = function (feature, level) {
		$scope.showProgress = true;
		if ($rootScope.mouseMode.all === true) {
			if (feature.state === 'UNSELECTED' || feature.state === 'undefined') {
				$scope.showLoading = true;
				$scope.showInitImage = false;
				feature.state = 'DESELECTED';
				$scope.changeState(feature.feature, 'deselect', level);
			}
		}
		$scope.showProgress = false;
	};

	/**
	 *  alert the user before reloading the page
	 * @param event
	 * @returns {string}
	 */

	window.onbeforeunload = function (event) {
		var message = 'Recharger la page risque de vous faire perdre des données, êtes vous sûr de vouloir continuer ?';
		if (typeof event === 'undefined') {
			event = window.event;
		}
		if (event) {
			event.returnValue = message;
		}
		//return message;
	};
	/**
	 * change the state of the feature (select/deselect)
	 * @param featureName
	 * @param state
	 */
	$scope.changeState = function (featureName, state, level) {

		var wait = function(){
			$scope.showLoading = false;
		};
		if($scope.ctxID) {
			FMManager.doAction($rootScope.SpineFMID, $scope.domainElement, $scope.ctxID, featureName, state).then(function (fm) {
					$scope.updateFMState(fm, false);
					$timeout(wait, 500);
					//$scope.showConfig = true;
					$scope.getDeselectedFeatures();
					$scope.getSelectedFeatures();
					if($scope.hasFeaturesToSelect(level) === false) {
						$scope.handleCompleteZone(level);
					}
					$scope.justLoaded = true;
					$scope.clock = 10;
					$scope.progressStyle = { width: '50'};

				},
				// error for doActionOnFM request
				function (fm){
					$scope.failedRequestAlert(fm.status, 'doActionOnFM');
				});
		}
		var stop = 0;
		$timeout(function someWork(){
			if(stop === 5){
				$scope.justLoaded = false;
			}
			stop += 1;
			$timeout(someWork, 1000);
		},1000);
	};

	/**
	 * get the initial state of features in the selected domaineElement
	 */
	$scope.getInitFMState = function () {
		FMManager.initFMState($rootScope.SpineFMID, $scope.domainElement, $scope.ctxID).then(function (fm) {
				console.log('FM STATE LOADED');
				$scope.updateFMState(fm, true);
			},
			// error for initFMState request
			function (fm) {
				$scope.failedRequestAlert(fm.status, 'initFMState');
			});
	};

	/**
	 * show explanations in 'select compatible config modal'
	 */
	$scope.showExplain = function(){
		if($scope.showExplication === true){
			$scope.showExplication = false;
		}
		else{
			$scope.showExplication = true;
		}
	};
	/**
	 * update states of features at start level
	 * @param fmState
	 * @param isNew
	 */

	$scope.updateFMState = function (fmState, isNew) {
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
		$scope.checkConfigValidity();
		$scope.getDeselectedFeatures();
		if(isNew === true){
			//$('.progress').remove();
			$scope.showProgress = false;
			$scope.showConfig = true;
		}
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
				$scope.failedRequestAlert(result.status, 'checkConfigValidity');
			});

	};
	// watch setting current config's Name, Space not allowed
	$scope.$watch('currentConfig.name', function() {
		if($scope.currentConfig){
			if($scope.currentConfig.name !== null){
				$scope.currentConfig.name = $scope.currentConfig.name.replace(/[^a-zA-Z0-9_-]/g,'');
			}
		}
	});

	/**
	 * changing the current configuration's name
	 */
	$scope.changeConfName = function () {
		FMManager.setConfName($rootScope.SpineFMID, $scope.domainElement, $scope.ctxID, $scope.currentConfig.name).then(function (result) {
				$scope.confNameChanged = result;
			},
			function (result) {
				$scope.failedRequestAlert(result.status, 'setConfName');
			});
	};

	/**
	 * Open bilan view of the current config
	 * @param url
	 */
	$scope.openBilanView = function(url){
		window.location.href = url;
	};

	/**
	 * finalize: called when the user press on Finalize button to validate the current configuration
	 */
	$scope.finalize = function () {
		configManager.create($rootScope.SpineFMID, $scope.domainElement, $scope.ctxID).then(function (result) {
				$scope.currentConfig.url = '#/bilan/'+$scope.domainElement+'/ctx/'+$scope.ctxID+'/'+result;
				$scope.deConfigurations.partialConfig.number -= 1;
				$scope.deConfigurations.validConfig.number += 1;
				$rootScope.validConfigs[$scope.domainElement].notLinked += 1;
				$scope.deConfigurations.validConfig.listConfigs[result] = {'url': '#/bilan/'+$scope.domainElement+'/ctx/'+$scope.ctxID+'/'+result, 'name': $scope.currentConfig.name, ctxID: $scope.ctxID, de:$scope.domainElement, configID:result, isLinked:false};
				$scope.checkConfigToLink($scope.domainElement,result);
				delete $scope.deConfigurations.partialConfig.listConfigs[$scope.ctxID];

			},
			function (result) {
				$scope.failedRequestAlert(result.status, 'finalize');
			});
	};

	/**
	 * set info visibility in accordion object
	 */
	$scope.setInfoVisibility = function(level){
		if($scope.showInfoLevel.length > level) {
			if($rootScope.accordionType === 'openOne'){
				for(var i = 0; i < $scope.showInfoLevel.length; i++) {
					if(i === level) {
						if($scope.showInfoLevel[i] === false || $scope.hasFeaturesToSelect(i) === false) {

							$scope.showInfoLevel[i] = true;
						}
						else {
							$scope.showInfoLevel[i] = false;
							$scope.showInfoLevel[0] = true;
						}
					}
					else{
						$scope.showInfoLevel[i] = false;
					}
				}
			}
			else if($rootScope.accordionType === 'normal'){
				for(var j = 0; j < $scope.showInfoLevel.length; j++){
					if(j === level) {
						if($scope.showInfoLevel[j] === false) {

							$scope.showInfoLevel[j] = true;
						}
						else {
							$scope.showInfoLevel[j] = false;
						}
					}
				}

			}
		}

	};

	/**
	 *
	 * @param feature
	 * @returns {boolean}
	 */
	$scope.hasLogo = function(feature){
		if($rootScope.images[feature]){
			return true;
		}
		else {
			return false;
		}
	};
	/**
	 * Error handling when request failed
	 * @param status
	 * @param funct
	 */
	$scope.failedRequestAlert = function (status, funct) {

		if (status === 404) {
			window.alert(funct +' => ERROR 404 : request failed');
		}

		else if(status === 405){
			window.alert(funct +' =>ERROR 405 : request failed');
		}
		else if(status === 500){
			window.alert(funct +' => ERROR 500 : request failed');
		}

	};

	/**
	 * check configurations to link when we finalize one config
	 * @param configID
	 *  @param de
	 */
	$scope.checkConfigToLink = function(de, configID){
		var linking = false;
		if($routeParams.ctxID === $rootScope.globalCtxID){  // config create from global ctx
			for(var k = 0; k< $rootScope.compatiblesDES[de].length ;k++){
				var domain = $rootScope.compatiblesDES[de][k];
				for(var key in $rootScope.configurations[domain].validConfig.listConfigs) {
					var myConfig = $rootScope.configurations[domain].validConfig.listConfigs[key];
					if(myConfig.ctxID === $rootScope.globalCtxID){
						$scope.linkConfigurations(de, configID, domain, myConfig.configID);
						linking = true;
					}
				}
			}
		}
		else if($scope.ctxID === $rootScope.globalCtxID){
			if($routeParams.ctxID){
				if($routeParams.ctxID !== $rootScope.globalCtxID){
					for(var l = 0; l< $rootScope.compatiblesDES[de].length ;l++){
						var mydomain = $rootScope.compatiblesDES[de][l];
						for(var id in $rootScope.configurations[mydomain].validConfig.listConfigs) {
							var cf = $rootScope.configurations[mydomain].validConfig.listConfigs[id];
							if(cf.ctxID === $routeParams.ctxID){
								$scope.linkConfigurations(de, configID, mydomain, cf.configID);
								linking = true;
							}
						}
						for(var contextID in $rootScope.configurations[mydomain].partialConfig.listConfigs) {
							var context = $rootScope.configurations[mydomain].partialConfig.listConfigs[contextID];
							if(context.ctxID === $routeParams.ctxID){
								$rootScope.configsToLinkWithGlobal.push({ctxIDTarget:context.ctxID, de:de , configID:configID});
							}
						}
					}
				}
			}
		}
		else {
			var evaluatedCtx = [];
			for(var i = 0; i < $rootScope.configsToLink.length; i++){
				var currentConfig = $rootScope.configsToLink[i];
				if(evaluatedCtx.indexOf(currentConfig.ctxID) < 0) {
					if($scope.ctxID === currentConfig.ctxID) {

						var alreadyDo = [];
						for(var j = 0; j< $rootScope.compatiblesDES[de].length ;j++) {
							var currentDE = $rootScope.compatiblesDES[de][j];
							if(currentConfig.configID){    // case valid config is checked in modal view
								if($rootScope.configurations[currentDE].validConfig.listConfigs[currentConfig.configID]) {

									if(alreadyDo.indexOf(currentConfig.configID) < 0){
										$scope.linkConfigurations(de, configID, currentDE,currentConfig.configID);
										alreadyDo.push(currentConfig.configID);
									}
								}
							}
							else {
								var done = [];
								for(var confID in $rootScope.configurations[currentDE].validConfig.listConfigs) {
									if($rootScope.configurations[currentDE].validConfig.listConfigs[confID].ctxID === currentConfig.ctxID) {
										if(done.indexOf(confID) < 0){
											$scope.linkConfigurations(de,configID, currentDE,confID);
											done.push(confID);
										}
									}
								}
							}
						}
					}
				}
				evaluatedCtx.push(currentConfig.ctxID);
			}
			if($rootScope.configsToLinkWithGlobal.length >=0){
				var evaluatedConfig = [];
				for(var h = 0; h<$rootScope.configsToLinkWithGlobal.length; h++){
					var toLink = $rootScope.configsToLinkWithGlobal[h];
					if(toLink.ctxIDTarget === $scope.ctxID){
						if(evaluatedConfig.indexOf(toLink.configID) < 0) {
							$scope.linkConfigurations(de,configID, toLink.de,toLink.configID);
							linking = true;
							evaluatedConfig.push(toLink.configID);
						}
					}
				}
			}
			if($rootScope.createdFromClone.length >= 0){
				var linkedClone = [];
				for(var ctxSrc in $rootScope.createdFromClone){
					var target = $rootScope.createdFromClone[ctxSrc];
					if(ctxSrc === $scope.ctxID) {
						var myConf = $scope.getConfigOfContext(target.ctxTarget, target.deTarget);
						if(myConf !== null) {
							if(linkedClone.indexOf(myConf.configID) < 0){
								$scope.linkConfigurations(de,configID, target.deTarget, myConf.configID);
								linking = true;
								linkedClone.push(myConf.configID);
							}
						}
					}
					else if(target.ctxTarget === $scope.ctxID){
						var conf = $scope.getConfigOfContext(ctxSrc, target.deSrc);
						if(conf !== null){
							if(linkedClone.indexOf(conf.configID) < 0){
								$scope.linkConfigurations(de,configID, target.deTarget, conf.configID);
								linking = true;
								linkedClone.push(conf.configID);
							}
						}
					}
				}
			}
		}
		if(linking === false || !$routeParams.ctxID){
			$scope.checkIsGenerateAllowed();
			$scope.openBilanView($scope.currentConfig.url);
		}
	};

	/**
	 * get config from the given context
	 * @param ctxID
	 * @param de
	 * @returns {null}
	 */
	$scope.getConfigOfContext = function(ctxID, de){
		var config = null;
		if($rootScope.configurations[de]){
			for(var confID in $rootScope.configurations[de].validConfig.listConfigs) {
				if($rootScope.configurations[de].validConfig.listConfigs[confID].ctxID === ctxID){
					config = $rootScope.configurations[de].validConfig.listConfigs[confID];
				}
			}
		}
		return config;
	};

	/**
	 * check if a configurations is linkable with a the given de's configurations
	 * @param configID
	 * @param de
	 * @returns {boolean}
	 */
	$scope.isConfigLinkable = function(configID, de){
		$rootScope.isLinkableWith[de] = true;
		configManager.checkIsConfigLinkable($rootScope.SpineFMID, configID, de).then(function (linkable) {
				$rootScope.isLinkableWith[de] = linkable;
			},
			function (){
				window.alert('Echec de check config compatible with');
			});
	};

	/**
	 * reinitialize the configuration (called when we choose to add new configuration of the current DE)
	 */
	$scope.reinitializeConfiguration = function(){
		angular.copy($rootScope.deFeatures[$scope.domainElement], $scope.fm);
		$scope.initController();
	};

	/**
	 * get the given level name (for accordions)
	 * @param level
	 * @returns {null}
	 */
	$scope.getLevelName = function(level){
		var name = null;
		if($rootScope.zones[$scope.domainElement]){
			for(var i = 0; i < $rootScope.zones[$scope.domainElement].length; i++){
				var zone = $rootScope.zones[$scope.domainElement][i];
				if(zone.level.toString() === level.toString()){
					name = zone.name;
				}
			}
		}
		return name;
	};

	/**
	 * get accordion properties for the given level
	 * @param level
	 * @returns {*}
	 */
	$scope.getLevelAccordion = function(level){
		var accordion = null;
		if($rootScope.zones[$scope.domainElement]){
			for(var i = 0; i < $rootScope.zones[$scope.domainElement].length; i++){
				var zone = $rootScope.zones[$scope.domainElement][i];
				if(zone.level.toString() === level.toString()){
					accordion = zone.accordion;
				}
			}
		}
		return accordion;
	};

	/**
	 * get the given level description
	 * @param level
	 * @returns {null}
	 */
	$scope.getLevelDescription = function(level){
		var description = null;
		if($rootScope.zones[$scope.domainElement]){
			for(var i = 0; i < $rootScope.zones[$scope.domainElement].length; i++){
				var zone = $rootScope.zones[$scope.domainElement][i];
				if(zone.level.toString() === level.toString()){
					description = zone.description;
				}
			}
		}
		return description ;
	};

	/**
	 *  get the compatibles DE which have configurations
	 * @returns {Array}
	 */
	$scope.getDEWithConfigs = function(){
		var des = [];
		for(var i = 0; i< $rootScope.compatiblesDES[$scope.domainElement].length ;i++){
			var currentDE = $rootScope.compatiblesDES[$scope.domainElement][i];
			if($rootScope.configurations[currentDE].partialConfig.listConfigs.length > 0){

				des.push(currentDE);
			}
			else{
				for(var configID in $rootScope.configurations[currentDE].validConfig.listConfigs) {
					var config = $rootScope.configurations[currentDE].validConfig.listConfigs[configID];
					if(config.isLinked === false) {

						if(des.indexOf(currentDE) < 0) {
							des.push(currentDE);
						}
					}
				}
			}
		}
		return des;
	};

	/**
	 *  show the select menu which have as content the connected configurations
	 */
	$scope.showSelectInModal = function(de){
		$scope.showConfigsDE = true;
		for(var domain in $scope.showSelect){
			if(domain === de){
				$scope.getConfigs(de);
				$scope.showSelect[domain]  = true;
			}
			else{
				$scope.showSelect[domain]  = false;
			}
		}
		$scope.choiceInModal = true;
	};

	/**
	 * hide the select menu which have as content the connected configurations
	 */
	$scope.hideSelectInModal = function(){

		$scope.setOption(null);
		$scope.showConfigsDE = false;
		$scope.choiceInModal = true;
		for(var domain in $scope.showSelect){
			$scope.showSelect[domain]  = false;
		}
	};

	/**
	 * clone configuration to link
	 */
	$scope.cloneConfigurationToLink = function(ctxID, de){
		configManager.cloneConfigurationToLink($rootScope.SpineFMID, ctxID, de).then(function (result) {
				window.alert(result);
			},
			function(){
				window.alert('clone config to link failed !');
			});
	};
	/**
	 * clone a partial configuration
	 */
	$scope.clonePartialConfiguration = function(){
		configManager.clonePartialConfiguration($rootScope.SpineFMID, $scope.domainElement, $scope.ctxID).then(function (result) {

				$scope.setConfigurationName(result, $scope.domainElement, true);
				window.alert('Configuration dupliquée sous L\'ID '+ result +' avec succès');
			},
			function(){
				window.alert('clone partial failed !');
			});
	};

	/**
	 * set the option chosen by user in modal view
	 * @param option
	 */
	$scope.setOption = function (option, de){
		$scope.myOption = option;
		$scope.selectedDE = de;
	};

	/**
	 *  link the two given configurations
	 * @param deSource
	 * @param configSource
	 * @param deTarget
	 * @param configTarget
	 */
	$scope.linkConfigurations = function(deSource, configSource, deTarget, configTarget){
		if(configSource !== null && configTarget !== null){
			configManager.linkConfigurations($rootScope.SpineFMID, configSource, configTarget).then(function (result) {

					console.log(result);
					$rootScope.links.push({'source':configSource, 'target': configTarget});
					//$scope.isConfigLinked(deSource,configSource);
					if($rootScope.configurations[deSource]) {
						if($rootScope.configurations[deSource].validConfig.listConfigs[configSource]) {
							if($rootScope.configurations[deSource].validConfig.listConfigs[configSource].isLinked === false) {
								configManager.checkIsConfigLinked($rootScope.SpineFMID, configSource).then(function (linkedSource) {
										if(linkedSource.toString() === 'true') {

											$rootScope.configurations[deSource].validConfig.listConfigs[configSource].isLinked = true;
											$rootScope.validConfigs[deSource].linked += 1;
											$rootScope.validConfigs[deSource].notLinked -= 1;
										}

									},
									function(){
										window.alert('Echec de check config is linked');
									});
							}
						}
					}
					if($rootScope.configurations[deTarget]) {
						if($rootScope.configurations[deTarget].validConfig.listConfigs[configTarget]) {
							if($rootScope.configurations[deTarget].validConfig.listConfigs[configTarget].isLinked === false) {
								configManager.checkIsConfigLinked($rootScope.SpineFMID, configTarget).then(function (linkedTarget) {
										if(linkedTarget.toString() === 'true') {

											$rootScope.configurations[deTarget].validConfig.listConfigs[configTarget].isLinked = true;
											$rootScope.validConfigs[deTarget].linked += 1;
											$rootScope.validConfigs[deTarget].notLinked -= 1;
										}

									},
									function(){
										window.alert('Echec de check config is linked');
									});
							}
						}
					}
					$scope.checkIsGenerateAllowed();
					$scope.openBilanView($scope.currentConfig.url);
				},
				function(){
					window.alert(' link configurations failed');
				});
		}
	};
	/** check if the given config is already linked or not
	 * @param de
	 * @param configID
	 * @returns {boolean}
	 */
	$scope.isConfigLinked = function(de, configID){
		if($rootScope.configurations[de].validConfig.listConfigs[configID]){
			configManager.checkIsConfigLinked($rootScope.SpineFMID, configID).then(function (linked) {
					if(linked.toString() === 'true') {

						$rootScope.configurations[de].validConfig.listConfigs[configID].isLinked = true;
						$rootScope.validConfigs[de].linked += 1;
						$rootScope.validConfigs[de].notLinked -= 1;
					}

				},
				function(){
					window.alert('Echec de check config is linked');
				});
		}
	};

	/**
	 * show trash icon which contains deselected features / hide when there's not deselected features
	 * @returns {boolean}
	 */
	$scope.showTrashIcon = function(){
		return $scope.deselectedFeatures.length > 0;
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
		$scope.configOldName = $scope.currentConfig.name ;
		$scope.openSetConfigNameModal = true;
	};

	/**
	 *
	 */
	$scope.validateConfigName = function() {
		if($scope.currentConfig.name === $scope.configOldName) {
			$scope.openSetConfigNameModal = false;
			$scope.finalize();
		}
		else {
			if($rootScope.ConfigsName.indexOf($scope.currentConfig.name) < 0) {
				FMManager.setConfName($rootScope.SpineFMID, $scope.domainElement, $scope.ctxID, $scope.currentConfig.name).then(function (result) {
						console.log('config name changed '+ result);
						if($rootScope.ConfigsName.indexOf($scope.configOldName) > 0) {
							$rootScope.ConfigsName[$rootScope.ConfigsName.indexOf($scope.configOldName)] = $scope.currentConfig.name;
						}
						else {
							$rootScope.ConfigsName.push($scope.currentConfig.name);
						}
						$scope.openSetConfigNameModal = false;
						$scope.finalize();
					},
					function (result) {
						$scope.failedRequestAlert(result.status, 'setConfName');
					});
			}
			else {
				window.alert('This name is already given to a configuration, please choose another one');
			}
		}
	};

	/**
	 * set mouse behaviour
	 * @param mode
	 */
	$scope.setMouseBehaviour = function (mode) {
		if (mode && mode!== null) {
			$rootScope.MouseConfigurationMode = mode.toString();
			$scope.changeMouseMode($rootScope.MouseConfigurationMode);
		}
	};

	/**
	 * change mouse click event behaviour ( select/deselect or all )
	 * @param mode
	 */
	$scope.changeMouseMode = function (mode) {
		$scope.showMouseConfiguration = false;
		if (mode === 'allMenu') {
			$rootScope.mouseMode = {all : true, select:false, deselect:false};
		}
		else if (mode === 'selectMenu') {
			$rootScope.mouseMode = {all : false, select:true, deselect:false};
		}
		else if (mode === 'deselectMenu') {
			$rootScope.mouseMode = {all : false, select:false, deselect:true};
		}
		else {
			$rootScope.mouseMode = {all : true, select:false, deselect:false};
		}
		console.log($rootScope.mouseMode);
	};

	/**
	 * check which mode is activated for the mouse click behaviour
	 * @param mode
	 * @returns {string}
	 */
	$scope.isModeActive =  function (mode) {
		if (mode === $rootScope.MouseConfigurationMode) {
			return 'active';
		}
		else {
			return '';
		}
	};

	//$$$$$$$$$$$$$$$$$$$$$$$ start configuration controller $$$$$$$$$$$$$$$$$$$$$$$
	// before launching controller we verify first if we are not testing (because we don't need to start controller when testing)
	if ($rootScope.testConfiguration  === undefined) {
		$scope.initController();
	}
});
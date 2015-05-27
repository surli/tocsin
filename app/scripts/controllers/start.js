'use strict';
/**
 * Controller Start for start view and initialisation of different properties in domain Elements and their FMs
 */
angular.module('tocsinApp').controller('StartCtrl', function ($scope, $rootScope, InitService, configManager, $filter) {
	$rootScope.version = '0.0.2';
	$rootScope.defaultLevel = 1;
	$rootScope.fm = {};
	$rootScope.deFeatures = {};
	$scope.featuresEvaluated = {};
	$scope.annotations = {};
	$scope.unique = []; //features unique by domain element
	$rootScope.domainElements = [];
	$rootScope.configurations = {};
	$rootScope.validConfigs = {};
	$rootScope.SpineFMID = undefined;
	$rootScope.DEProperties = {};
	$rootScope.multiplicity = {};
	$rootScope.compteurs = [3];
	$rootScope.bounds = [];
	$rootScope.linkedConfig  = [];
	$rootScope.compatiblesDES = [];
	$rootScope.configsToLinkWithGlobal = []; // partial config to link with global
	$rootScope.globalCtxID = '';
	$rootScope.colorsState = {};
	$rootScope.descriptionDES = {};
	$rootScope.configsToLink = [];
	$rootScope.zones = [];
	$rootScope.listSpineFM = [];
	$rootScope.links = [];
	$rootScope.hasConfigs = false;
	$scope.hasInstances = false;
	$scope.isNew = true;
	$rootScope.compatiblesConf  = {}; // compatibles configs of configID in a specific compatible de
	$scope.configure = false;
	$scope.showProgress = false;
	$scope.spineFMName =null;
	$rootScope.name =null;
	$scope.isOpen = false;
	$scope.helpModal = false;
	$rootScope.isGenerateAllowed = true;
	$scope.openSetSpineNameModal = false;
	$scope.unavailableService = false; // true if service is unavailable
	$scope.spineFMNewName = null;
	$rootScope.accordionType = '';
	$rootScope.images = [];
    $rootScope.ConfigsName = [];
	$scope.predicate = '-modificationDate';
	$scope.instances = []; // spineFM instances in DataTable format
	$rootScope.mouseMode = {all : true, select:false, deselect:false}; // mouse event for selection/deselection
	$scope.showMouseConfiguration = false;
	$rootScope.MouseConfigurationMode = 'allMenu';
	$rootScope.deselectMenu = 'deselectMenu';
	$rootScope.selectMenu = 'selectMenu';
	$rootScope.allMenu = 'allMenu';
	$scope.annotationPath = 'http://spinefm.unice.fr/annotations';
	$scope.modelPath = '/var/yourcast/MSPL/MultipleSoftwareProductLine.xmi';
	$scope.confDescription = '';

	/**
	 * Iitialize start view
	 */
	$scope.start = function(){
		InitService.initList().then(function(result){
				console.log(result);
				$rootScope.listSpineFM = result;

				if($rootScope.listSpineFM.length > 0) {
					$scope.hasInstances = true;
					$scope.handleInstancesFormat();
					var pTable = $('#spineFMInstances').dataTable({ // table with different parameters
						'aaData': $scope.instances,
						'sPaginationType': 'bootstrap',
						'iDisplayLength': 10,
						'aLengthMenu': [[5, 10, 25, -1], [5, 10, 25, 'All']],
						'aoColumns': [
							{ 'mDataProp': 'name', 'aTargets':[0]},
							{ 'mDataProp': 'creationDate', 'aTargets':[1] },
							{ 'mDataProp': 'modificationDate', 'aTargets':[2] },
							{ 'mDataProp': 'modelID', 'aTargets':[3] },
							{ 'mDataProp': 'description', 'aTargets':[4] }
						]
					});
					$('table td').live('click',function(){
						var aPos = pTable.fnGetPosition(this);
						var aData = pTable.fnGetData(aPos[0]);
						$scope.handleExistingInstance(aData);
					});
				}
			},
			// error handling
			function(){
				window.alert('Unavailable service, please re-try later !');
				$scope.isNew = false;
				$scope.unavailableService = true;

			});


	};

	/**
	 * pre-load all images (feature's logo)
	 * @param feat
	 * @param imgsrc
	 */
	$scope.loadImage =  function(feat, imgsrc) {
		var image = new Image();
		image.onload = function(){ // always fires the event.
			image.src = imgsrc;
		};
		// handle failure
		image.onerror = function(){
			return;
		};
		//image.src = imgsrc;
		if(imgsrc !== undefined && imgsrc !== ''){
			image.src = imgsrc;
			$rootScope.images[feat] = image;
		}
	};

	/**
	 * change spineFM instances format for dataTables (properties in row)
	 */
	$scope.handleInstancesFormat = function(){
		for(var i = 0; i<$rootScope.listSpineFM.length; i++){
			var instance = $rootScope.listSpineFM[i];
			var created = $filter('date')(instance.creationDate, 'medium');
			var modified = $filter('date')(instance.modificationDate, 'medium');
			var name = '' ;
			if(instance.description  === undefined || instance.description  === null) {
				name = 'UNKNOWN';
			}
			else {
				name = instance.description;
			}
			$scope.instances.push({id: instance.uid, name:name, modificationDate:modified, creationDate:created});
		}
	};

	/**
	 * compute an existing spineFM instance
	 * @param choice
	 */
	$scope.handleExistingInstance = function(choice){
		$rootScope.SpineFMID = choice.id;
		$rootScope.name = choice.name;
		$scope.isNew = false;
		$scope.hasInstances = false;
		$scope.initStartController(true);
	};

	/**
	 * creating a  new SpineFM instance
	 */
	$scope.createNewInstance = function(){
		$scope.isNew = false;
		$scope.hasInstances = false;
		$scope.showProgress  = true;
		if(!$rootScope.SpineFMID && $rootScope.compteurs[0] !== 'false') {
			var args = [$scope.modelPath, $scope.confDescription];
			InitService.initSpineFM(args).then(function (reponse) {
					var result = reponse.data;
					console.log(result);
					$scope.spineFMObject = result;
					$rootScope.SpineFMID  = result.id;
					$scope.setSpineFMNewName();
					$scope.initStartController(false);
				},
				// error handling  for initSpineFM
				function(result){
					$rootScope.compteurs[0] = 'false';
					$scope.createNewInstance();
					$scope.failedRequest(result.status, 'initSpineFM') ;

				}
			);
		}
	};

	/**
	 * set the spineFM instance's name
	 */
	$scope.setSpineFMNewName = function(){
		InitService.setSpineFMName($rootScope.SpineFMID, $rootScope.name).then(function(){
				console.log('spine fm name set');
			},
			function(){
				window.alert('set spineFM name failed');
			});
	};

	/**
	 * initialize the controller
	 */
	$scope.initStartController = function(exist) {

		$scope.showProgress = true;
		$scope.initDomainElements($rootScope.SpineFMID, exist);
		$scope.initProperties();
		$scope.getGlobalCtxID();
		$scope.initColors();
		$scope.initDescription();
		$scope.initLinks();

	};


	/**
	 * initialize domain elements
	 * @param id
	 * @param exist
	 */
	$scope.initDomainElements = function(id, exist) {

		if( $rootScope.compteurs[2] === 'false'){
			window.alert('Impossible d\'avoir les domain element, réessayez plus tard!');
			$scope.unavailableService = true;
		}

		InitService.initDES(id).then(function (des) {
				$rootScope.domainElements = des.sort();
				$scope.featuremodels = {};
				$scope.initFeatureModels(des, exist);

			},
			//error handling for initDES
			function(des){
				$rootScope.compteurs[2] = 'false';
				$scope.failedRequest(des.status, 'initDES') ;
				$scope.initDomainElements(id, exist);

			}
		);

	};
	/**
	 *  initialize bounds properties
	 * @param de
	 */
	$scope.initBounds =  function(de) {
		InitService.initBounds().get({SpineFMID: $rootScope.SpineFMID, DomainElement: de}, function (bounds) {

				$rootScope.bounds[de] = bounds;
			},
			// handle request error
			function(bounds){
				$scope.failedRequest(bounds.status, 'initBounds') ;
			});
	};

	/**
	 * get linked configurations
	 */
	$scope.initLinks = function(){
		InitService.getLinks($rootScope.SpineFMID).then(function (links) {

				$rootScope.links = links;
			},
			function(){
				window.alert('Echec du chargement des configs liées');
			});
	};

	/**
	 * Initialize the configuration dictionary
	 * @param de
	 */
	$scope.initConfigurationsDictionary = function(de) {
		$rootScope.configurations[de] = {
			'partialConfig': {
				listConfigs: {},
				number: 0
			},
			'validConfig': {
				listConfigs: {},
				number: 0
			}
		};

		$rootScope.validConfigs[de] = {
			linked:0,
			notLinked:0
		};
	};

	/**
	 * initialize multiplicity
	 * @param de
	 */
	$scope.initMultiplicityDictionary = function(de) {
		$rootScope.multiplicity[de] = {
			'target': {
				de : '',
				multiplicity: {}
			}
		};
	};

	/**
	 * progress bar
	 */
	var progress = setInterval(function() {
		var $bar = $('.bar');

		if ($bar.width()>=400) {
			$scope.showConfig = true;
			clearInterval(progress);
			$('.progress').removeClass('active');
			$('.progress').remove();
		} else {
			$bar.width($bar.width()+10);
		}
		$bar.text(Math.floor($bar.width()/8) + '%');
	}, 800);

	/**
	 * Initialize the Feature models in the given domain elements
	 * @param des
	 * @param exist
	 */
	$scope.initFeatureModels = function(des, exist) {
		angular.forEach(des, function (de) {
				if($rootScope.compteurs[1] === 'false'){
					window.alert('Impossible d\'avoir les Feature Models, réessayez plus tard !');
				}

				$scope.initConfigurationsDictionary(de);
				$scope.initMultiplicityDictionary(de);
				//$scope.initBounds(de);
				$scope.getCompatiblesDES(de);
				InitService.initAnnotations($scope.annotationPath, de).then(
					function (result) {
						var AnnotationResult = result.data;
						$scope.annotations[de] = AnnotationResult;
						$rootScope.zones[de] = AnnotationResult.zones;
						$rootScope.accordionType = AnnotationResult.accordionBehaviour ;
						$scope.getUnique (de, AnnotationResult);
						InitService.initFM().get({SpineFMID:$rootScope.SpineFMID, DomainElement: de}, function (FMResult) {
							$scope.featuremodels[de] = FMResult;
							$rootScope.fm[de] = FMResult;
							$scope.computeAnnotations(de);
						});
					},
					// error handling for initAnnotations
					function () {
						InitService.initFM().get({SpineFMID: $rootScope.SpineFMID, DomainElement: de}, function (FMResult) {
							$scope.featuremodels[de] = FMResult;
							$rootScope.fm[de] = FMResult;
							$rootScope.zones[de] = [{'accordion':false,'description':'All features','level':1,'name':de}];
							$scope.annotations[de] = {'rulesRecursive': [{'explication':'','feature':de.charAt(0).toUpperCase()+de.substr(1).toLowerCase(),'getChildren':true,'level':1,'treeLevel':1}]};
							$scope.getUnique (de, $scope.annotations[de]);
							$scope.computeAnnotations(de);
						});
					});
			},
			// error handling for initFM
			function(de){
				$rootScope.compteurs[1] = 'false';
				$scope.failedRequest(de.status, 'initFM') ;
				$scope.initFeatureModels(des, exist);
			});

		if(exist === true){
			$scope.getSpineFMStatus();
		}
	};

	/**
	 * get unique
	 * @param de
	 * @param annotations
	 */
	$scope.getUnique = function(de, annotations){
		var unik = [];
		if (annotations.rulesFeatureUnique) {
			for (var j = 0; j < $scope.annotations[de].rulesFeatureUnique.length ; j++) {
				var myrule = $scope.annotations[de].rulesFeatureUnique[j];
				unik.push(myrule.feature);
			}
		}
		$scope.unique[de] = unik;
	};

	/**
	 * get linked configurations
	 * @param de
	 * @param configID
	 */
	$scope.getLinkedConfigurations = function(configID, de){
		$rootScope.linkedConfig[configID] = [];

		var successGetConfigCompatible = function (result) {
			if(result.length > 0){
				$scope.hasLinkedConfig = true;
				$rootScope.linkedConfig[configID].push(result);
			}

		};

		var failGetConfigCompatible = function () {
			window.alert('Echec du chargement des configurations liées à '+ configID);
		};
		configManager.getLinkedConfigurations($rootScope.SpineFMID, de, configID).then(
			successGetConfigCompatible,
			failGetConfigCompatible
		);
	};

	/**
	 * get colors for different configuration state
	 */
	$scope.initColors = function() {
		InitService.initColors().get(function (color) {
				$rootScope.colorsState = color;
			},

			function(){
				window.alert('init colors failed');
				$scope.unavailableService = true;
			});
	};

	/**
	 * get description of different DE
	 */
	$scope.initDescription = function() {
		InitService.initDescription().get(function (desc) {
				$rootScope.descriptionDES = desc;
			},

			function(){
				window.alert('init description of DES failed');
			});
	};

	/**
	 * Compute annotations : link features with their annotations
	 * @param de
	 */
	$scope.computeAnnotations = function (de) {
		var annotedFeatures = {};
		var annotedFeaturesUnique = {};
		var annotedFeaturesSimple = {};
		$scope.featuresEvaluated[de] = [];
		//var nbFeatures = $scope.getFeatures(de).length;
		console.log(de);
		console.log($rootScope.zones[de]);


		annotedFeatures.levels = $scope.initLevels($rootScope.zones[de]);
		annotedFeaturesUnique.levels = $scope.initLevels($rootScope.zones[de]);
		annotedFeaturesSimple.levels = $scope.initLevels($rootScope.zones[de]);
		var result = [];
		//
		$scope.computeAnnotationRecursiveRules(de, annotedFeatures);
		$scope.computeAnnotationRulesFeatureUnique(de, annotedFeaturesUnique);
		$scope.computeSimpleFeatures(de, annotedFeaturesSimple);

		console.log('annotedfeatures');
		console.log(annotedFeatures);

		result.push(annotedFeatures);
		result.push(annotedFeaturesUnique);
		result.push(annotedFeaturesSimple);

		$rootScope.deFeatures[de] = $scope.concatFeatures(result, de);
		// show configs
		$scope.showProgress = false;
		$scope.configure = true;
		console.log('DE Annote : '+de);
		console.log($rootScope.deFeatures[de]);
	};

	/**
	 * init levels by zones
	 * @param zones
	 * @returns {{}}
	 */
	$scope.initLevels = function(zones) {
		var level = {};
		for (var i = 1; i< zones.length +1 ; i++) {
			level[i] = [];
		}
		return level;
	};

	$scope.getDescription = function (de) {
		if ($rootScope.descriptionDES[de] !== undefined) {
			return  $rootScope.descriptionDES[de];
		} else {
			return '';
		}
	};

	/**
	 *  put features in a same object
	 * @param annotedFeatures
	 * @returns {{}}
	 */
	$scope.concatFeatures = function(annotedFeatures, de){
		var feat = {};
		feat.levels = $scope.initLevels($rootScope.zones[de]);
		for(var index = 0; index <annotedFeatures.length; index++){
			var annoted = annotedFeatures[index];
			for(var key = 1; key < $rootScope.zones[de].length +1; key++){
				if(annoted.levels[key]){
					var level = annoted.levels[key];

					for(var i =0; i< level.length; i++){
						feat.levels[key].push(level[i]);
					}
				}
			}
		}
		return feat;
	};

	/**
	 * get the number of features after annotate
	 * @param annoted
	 */
	$scope.getNBFeatures = function(annotedFeatures){
		var size = 0;
		for(var index = 0; index <annotedFeatures.length; index++){
			var annoted = annotedFeatures[index];
			for(var key = 0; key < 4; key++){
				if(annoted.levels[key]){
					size += annoted.levels[key].length;
				}
			}
		}
		return size;
	};

	/**
	 * Link recursive rules with the right features( which depend on the level of children we have chosen)
	 * @param de
	 * @param annotedF
	 */
	$scope.computeAnnotationRecursiveRules = function (de, annotedF) {
		var currentFM = $rootScope.fm[de];

		if ($scope.annotations[de]) {
			for (var k = 0; k < $scope.annotations[de].rulesRecursive.length; k++) {
				var recursive = $scope.annotations[de].rulesRecursive[k];
				console.log(recursive);

				var subFeatures = $scope.getSubFeatures(de, recursive);
				console.log(subFeatures);
				for (var i = 0; i < subFeatures.length ; i++) {
					var unik = $scope.unique[de];
					if (unik.indexOf(subFeatures[i].name) < 0) {
						$scope.annotateRecursiveFeatures(annotedF, currentFM, recursive, subFeatures[i]);
						$scope.featuresEvaluated[de].push(subFeatures[i].name);
					}

					else{
						if ($scope.annotations[de].rulesFeatureUnique) {
							for (var j = 0; j < $scope.annotations[de].rulesFeatureUnique.length ; j++) {
								var myrule = $scope.annotations[de].rulesFeatureUnique[j];

								if (subFeatures[i].name === myrule.feature && $scope.featuresEvaluated[de].indexOf(subFeatures[i].name) < 0) {

									$scope.annotateRecursiveRules(annotedF, currentFM, recursive, myrule);
									$scope.featuresEvaluated[de].push(subFeatures[i].name);

								}
							}
						}
					}
				}
			}
		}
	};

	/**
	 * Link features with the right annotations (FeatureUnique)
	 * @param de
	 * @param annotedF
	 */
	$scope.computeAnnotationRulesFeatureUnique = function (de, annotedF) {
		var features =  $scope.getFeatures(de);
		var currentFM = $rootScope.fm[de];
		//var allFeatures = $scope.getFeatures(de);
		if($scope.unique[de]){
			var unique = $scope.unique[de];
			if(unique.length > 0){
				if ($scope.annotations[de]) {
					for (var i = 0; i < $scope.annotations[de].rulesFeatureUnique.length ; i++) {
						var myrule = $scope.annotations[de].rulesFeatureUnique[i];
						for (var j = 0; j < features.length; j++) {

							if (features[j].name === myrule.feature) {
								if($scope.featuresEvaluated[de].indexOf(features[j].name) < 0){

									$scope.annotateRulesFeatureUnique(annotedF, currentFM, myrule);
									$scope.featuresEvaluated[de].push(features[j].name);
								}
							}
						}

					}
				}
			}
		}
	};

	/**
	 * compute features without linked annotations
	 * @param de
	 * @param annotedF
	 */
	$scope.computeSimpleFeatures = function (de, annotedF) {
		var currentFM = $rootScope.fm[de];
		var allFeatures = $scope.getFeatures(de);
		if($scope.unique[de]){
			var unik  = $scope.unique[de];
			for (var j = 0; j < allFeatures.length; j++) {
				if (unik.indexOf(allFeatures[j].name) < 0) {
					if ($scope.featuresEvaluated[de].indexOf(allFeatures[j].name) < 0) {
						$scope.addFeature(annotedF, currentFM, allFeatures[j]);
					}
				}
			}
		}

	};

	/**
	 *  annotate features whith the unique rules in annotations
	 * @param annotedF
	 * @param feature
	 * @param rule
	 */
	$scope.annotateRulesFeatureUnique = function (annotedF, feature, rule) {
		annotedF.nom = feature.name;
		annotedF.concept = feature.concept;

		if (rule.level && rule.logo) {
			if(rule.level <= 0 ){
				annotedF.levels[0].push({feature: rule.feature, logo: rule.logo, explication: rule.explication, state: 'UNSELECTED'});
			}
			else{
				annotedF.levels[rule.level].push({feature: rule.feature, logo: rule.logo, explication: rule.explication, state: 'UNSELECTED'});
			}
			$scope.loadImage(rule.feature, rule.logo);
		}
		else if (!rule.logo) {
			annotedF.levels[rule.level].push({feature: rule.feature, explication: rule.explication, state: 'UNSELECTED'});
		}

	};

	/**
	 * Annotate features which have recursive rules
	 * @param annotedF
	 * @param feature
	 * @param recursive
	 * @param rule
	 */

	$scope.annotateRecursiveRules = function (annotedF, feature, recursive, rule) {
		annotedF.nom = feature.name;
		annotedF.concept = feature.concept;
		if (rule === null) {
			if(recursive.logo){
				annotedF.levels[recursive.level].push({feature: recursive.feature, logo: recursive.logo, explication: recursive.explication, state: 'UNSELECTED' });
			}
			else{
				annotedF.levels[recursive.level].push({feature: recursive.feature, explication: recursive.explication, state: 'UNSELECTED' });
			}
			$scope.loadImage(recursive.feature, recursive.logo);
		}
		else {
			if(rule.logo){
				annotedF.levels[recursive.level].push({feature: rule.feature, logo: rule.logo, explication: rule.explication, state: 'UNSELECTED'});
			}
			else if (recursive.logo) {
				annotedF.levels[recursive.level].push({feature: rule.feature, logo: recursive.logo, explication: rule.explication, state: 'UNSELECTED'});
			}
			else {
				annotedF.levels[recursive.level].push({feature: rule.feature, explication: rule.explication, state: 'UNSELECTED'});
			}
			$scope.loadImage(rule.feature, rule.logo);
		}
	};

	/**
	 * Annotate features without feature unique rules in the recursive rules without
	 * @param annotedF
	 * @param feature
	 * @param recursive
	 * @param child
	 */
	$scope.annotateRecursiveFeatures = function (annotedF, feature, recursive, child) {
		annotedF.nom = feature.name;
		annotedF.concept = feature.concept;
		$scope.loadImage(recursive.feature, recursive.logo);
		annotedF.levels[recursive.level].push({feature: child.name, logo: recursive.logo, explication: recursive.explication, state: 'UNSELECTED' });

	};

	/**
	 * add features without annotations
	 * @param annotedF
	 * @param fm
	 * @param feature
	 */

	$scope.addFeature = function (annotedF, fm, feature) {
		annotedF.nom = fm.name;
		annotedF.concept = fm.concept;
		annotedF.levels[$rootScope.defaultLevel].push({feature: feature.name, explication: '', state: 'UNSELECTED'});
	};


	/**
	 *  Find all features in the selected FM
	 * @param feature
	 * @param destination
	 * @returns {*}
	 */
	$scope.findAllFeatures = function (feature, destination) {

		if (feature.groups.length > 0) {
			for (var i = 0; i < feature.groups.length; i++) {

				for (var j = 0; j < feature.groups[i].children.length; j++) {
					if(destination.indexOf(feature.groups[i].children[j]) < 0 ){
						destination.push(feature.groups[i].children[j]);
						var sub = [];
						$scope.getAllSubLevel(feature.groups[i].children[j], sub);
						$scope.concat(destination, sub);
						//$scope.findAllFeatures(feature.groups[i].children[j], destination);
					}
				}
			}
		}
	};

	/**
	 * get All feature's sub level
	 * @param feature
	 * @param destination
	 */
	$scope.getAllSubLevel  = function(feature, destination){
		if(feature.groups){
			for (var i = 0; i < feature.groups.length; i++) {
				for (var j = 0; j < feature.groups[i].children.length; j++) {
					if(destination.indexOf(feature.groups[i].children[j]) < 0){
						destination.push(feature.groups[i].children[j]);
						$scope.getAllSubLevel(feature.groups[i].children[j], destination);
					}
				}
			}
		}
	};

	/**
	 * Find sub Features of a selected feature
	 * @param feature
	 * @param destination
	 * @param level
	 * @param getChildren
	 * @returns {*}
	 */
	$scope.findSubFeatures = function (feature, destination, level) {
		if(level <= 1){
			for (var z = 0; z< feature.groups.length; z++) {
				for (var r = 0; r < feature.groups[z].children.length; r++) {
					destination.push(feature.groups[z].children[r]);
				}
			}
		}
		else {
			for (var k = 0; k< feature.groups.length; k++) {
				var ht = level -1;
				for (var l = 0; l < feature.groups[k].children.length; l++) {
					$scope.findSubFeatures(feature.groups[k].children[l],destination,ht);
				}
			}
		}
	};

	/**
	 * get all Features in the DE
	 * @param de
	 * @returns {Array}
	 */
	$scope.getFeatures = function (de) {
		var currentFM = $rootScope.fm[de];
		var features = [];

		for (var j = 0; j < currentFM.root.groups.length; j++) {
			var grp = currentFM.root.groups[j];

			for (var k = 0; k < grp.children.length;k++) {
				var child = grp.children[k];
				$scope.findAllFeatures(child, features);
			}
		}
		return features;
		//}
	};

	/**
	 * get the given feature's sub features
	 * @param feature
	 * @returns {Array}
	 */
	$scope.getlevelSubFeatures = function (feature) {
		var destination = [];
		for (var i = 0; i < feature.groups.length; i++) {
			for (var j = 0; j < feature.groups[i].children.length; j++) {
				destination.push(feature.groups[i].children[j]);

			}
		}
		return destination;
	};

	/**
	 * concat 2 list of features
	 * @param destination
	 * @param sub
	 */
	$scope.concat = function (destination, sub){
		for(var i =0; i< sub.length; i++){
			if(destination.indexOf(sub[i]) <0){
				destination.push(sub[i]);
			}
		}
	};

	/**
	 * get sub features by mode (level of sub features)
	 * @param de
	 * @param rule
	 * @returns {Array}
	 */
	$scope.getSubFeatures = function (de, rule) {
		var currentFM = $rootScope.fm[de];
		var subFeatures = [];

		if (currentFM.root.name === rule.feature || rule.feature === 'root') {
			if (rule.treeLevel) {
				if (rule.getChildren === true) {
					$scope.findAllFeatures(currentFM.root,subFeatures);
				} else if(rule.getChildren === false){
					$scope.findSubFeatures(currentFM.root, subFeatures, rule.treeLevel);
				}
			} else {
				$scope.findAllFeatures(currentFM.root,subFeatures);
			}
		} else {

			for (var j = 0; j < currentFM.root.groups.length; j++) {
				var grp = currentFM.root.groups[j];

				for (var k = 0; k < grp.children.length; k++) {

					if (grp.children[k].name === rule.feature) {

						if (rule.treeLevel) {
							if (rule.getChildren === true) {
								$scope.findAllFeatures(grp.children[k], subFeatures);
							}
							else if (rule.getChildren === false) {
								$scope.findSubFeatures(grp.children[k], subFeatures, rule.treeLevel);
							}
						}

						else {
							$scope.findAllFeatures(grp.children[k], subFeatures);
						}

					}
				}
			}
		}
		return subFeatures;
	};


	/**
	 * get Recursive rule from the feature name and the level of children
	 * @param de
	 * @param featureName
	 * @returns {*}
	 */
	$scope.getRecursiveRule = function (de, featureName) {
		var rule;
		for (var i = 0; i < $scope.annotations[de].rulesRecursive.length ; i++) {

			if ($scope.annotations[de].rulesRecursive[i].feature === featureName) {

				rule = $scope.annotations[de].rulesRecursive[i];
			}

			return rule;
		}
	};

	/**
	 * set the default level for simple features (with not linked annotation)
	 * @param level
	 */
	$scope.seDefaultLevel = function (level) {

		$rootScope.defaultLevel = level;
	};

	/**
	 * Error handling when request failed
	 * @param status
	 * @param funct
	 */
	$scope.failedRequest = function (status, funct) {

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
	 *  Get the connected DE of each domain element
	 * @param de
	 */
	$scope.getCompatiblesDES = function(de){

		InitService.getCompatiblesDES($rootScope.SpineFMID, de).then(function (deCompatibles) {

				$rootScope.compatiblesDES[de]= deCompatibles;
				for(var i = 0; i< $rootScope.compatiblesDES[de].length; i++){
					$scope.getMultiplicityBetweenDE(de, $rootScope.compatiblesDES[de][i]);
				}
			},
			function(){
				window.alert('Echec du chargement des domaines compatibles avec '+de);
			});

	};

	/**
	 * get the global context ID
	 */
	$scope.getGlobalCtxID = function(){
		InitService.getGlobalContextID($rootScope.SpineFMID).then(function (globalCtxID) {

				$rootScope.globalCtxID = globalCtxID;
			},
			function(){
				window.alert('Echec du chargement de globalCtxID');
				$scope.unavailableService = true;
			});
	};

	/**
	 * get multiplicity between Domain Element
	 * @param source
	 * @param target
	 */
	$scope.getMultiplicityBetweenDE = function (source, target){
		InitService.getMultiplicity($rootScope.SpineFMID, source, target).then(function (mult) {

				$rootScope.multiplicity[source].target = {de: target, multiplicity: mult};
			},
			function(){
				window.alert('Echec du chargement de globalCtxID');
			});
	};

	/**
	 * get the structure with different links between DE
	 */
	$scope.initProperties = function(){
		InitService.getModel($rootScope.SpineFMID).then(function (model) {

				$rootScope.DEProperties = model;
			},
			function(){
				window.alert('Echec du chargement des liens entre DE');
				$scope.unavailableService = true;
			});
	};

	/**
	 * open the modal to give the new configuration name
	 */
	$scope.open = function () {
		$scope.isOpen = true;
	};

	/**
	 * validate the choice in modal view for new instance's name
	 */
	$scope.validate = function () {

		if($scope.spineFMName  === null){
			window.alert('Veuillez donner un nom ou une description à votre nouvelle instance !');
		}
		else {
			$rootScope.name = $scope.spineFMName;
			$scope.createNewInstance();
			$scope.isOpen = false;
		}
	};

	// watch setting spineFM Name, Space not allowed
	$scope.$watch('spineFMName', function() {
		if($scope.spineFMName !== null){
			//$scope.spineFMName= $scope.spineFMName.replace(/\s+/g,'_');
			$scope.spineFMName= $scope.spineFMName.replace(/[^a-zA-Z0-9_-]/g,'');
		}
	});

	/**
	 * close  modal view for new instance's name
	 */
	$scope.cancel = function(){
		$scope.isOpen = false;
	};

	/**
	 * get instance's status and update it
	 */
	$scope.getSpineFMStatus = function(){
		InitService.getConfigurationStatus($rootScope.SpineFMID).then(function (status) {

				$scope.hasConfigs(status);
				$scope.updateSpineFMStatus(status);
			},
			function(){
				window.alert('Echec du chargement de l\'état de la configuration');
			});
	};

	/**
	 * check if the current spineFM instance has at least one config
	 * used before checking generation
	 */
	$scope.hasConfigs = function(status){
		$rootScope.hasConfigs =  status.partialConfigs.length > 0 || status.validConfigs.length > 0;
	};

	/**
	 * update the status of configurations in the session
	 * @param status
	 */
	$scope.updateSpineFMStatus = function(status){

		if(status.partialConfigs) {
			for(var i = 0; i< status.partialConfigs.length; i++){
				var currentDE =  status.partialConfigs[i].de;
				var currentCtxID = status.partialConfigs[i].ctxID;

				$rootScope.configurations[currentDE].partialConfig.listConfigs[currentCtxID] = {name:status.partialConfigs[i].name, 'isValid': false, ctxID:currentCtxID, url:'#/de/'+currentDE+'/ctx/'+currentCtxID} ;
				$rootScope.configurations[currentDE].partialConfig.number += 1;
                $rootScope.ConfigsName.push(status.partialConfigs[i].name);
			}
		}

		if(status.validConfigs){

			for(var y = 0; y < status.validConfigs.length; y++){
				var currentValidDE =  status.validConfigs[y].de;
				var currentConfigID = status.validConfigs[y].configID;
				var name =  status.validConfigs[y].name;
                $rootScope.ConfigsName.push(name);
				var ctxID = status.validConfigs[y].ctxID;
				$rootScope.configurations[currentValidDE].validConfig.listConfigs[currentConfigID] = {name:name, ctxID:ctxID , url:'#/bilan/'+currentValidDE+'/ctx/'+ctxID +'/'+currentConfigID, configID:currentConfigID, isLinked : false} ;
				$scope.isConfigLinked(currentValidDE, currentConfigID);
				$rootScope.configurations[currentValidDE].validConfig.number += 1;
				$scope.getConfigCompatibles(currentValidDE, currentConfigID);

			}

		}
		if($rootScope.hasConfigs === true){
			$scope.checkIsGenerateAllowed();
		}
	};



	/**
	 * initialize compatiblesConf by domain
	 * @param de
	 */
	$scope.initCompatiblesConfigurations = function(de){

		$rootScope.compatiblesConf[de] = {
			configCompatibles : []
		};

	};

	/**
	 * check if config is linked
	 * @param configID
	 * @param de
	 * @returns {boolean}
	 */
	$scope.isConfigLinked = function(de,configID){
		configManager.checkIsConfigLinked($rootScope.SpineFMID, configID).then(function (linked) {
				if(linked.toString() === 'true') {
					$rootScope.configurations[de].validConfig.listConfigs[configID].isLinked = true;
					$rootScope.validConfigs[de].linked += 1;
				}
				else {
					$rootScope.validConfigs[de].notLinked += 1;
				}

			},
			function(){
				window.alert('Echec de check config compatible with');
			});
	};

	/** get compatibles configurations
	 *
	 * @param de
	 * @param confID
	 */
	$scope.getConfigCompatibles = function(de, confID){

		var successGetConfigCompatible = function (configCompatibles) {

			$rootScope.compatiblesConf[currentDE].configCompatibles[confID] = configCompatibles;
		};

		var failGetConfigCompatible =  function(){
			window.alert('Echec du chargement des configurations compatibles');
		};

		var successCheckisConfigLinkable = function (linkable) {

			if(linkable  === true){
				configManager.getCompatiblesConfigurations($rootScope.SpineFMID, currentDE, confID).then(
					successGetConfigCompatible,
					failGetConfigCompatible
				);
			}
		};

		var failCheckIsConfigLinkable = function(){
			window.alert('Echec de check config compatible with');
		};

		if($rootScope.compatiblesDES[de]){
			for(var i = 0; i< $rootScope.compatiblesDES[de].length ;i++){
				var currentDE = $rootScope.compatiblesDES[de][i];
				$scope.getLinkedConfigurations(confID, currentDE);
				$scope.initCompatiblesConfigurations(currentDE);
				configManager.checkIsConfigLinkable($rootScope.SpineFMID, confID, currentDE).then(
					successCheckisConfigLinkable,
					failCheckIsConfigLinkable
				);

			}
		}
	};

// $$$$$$$$$$$$$$$$$$$$$$$$$  start controller $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
	// before launching controller we verify first if we are not testing (because we don't need to start controller when testing)
	if ($rootScope.test === undefined) {
		$scope.start();
	}

});
angular.module('tocsinApp').controller.$inject = ['$scope', '$rootScope', 'InitService', 'configManager', '$timeout', '$filter'];
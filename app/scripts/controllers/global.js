'use strict';

angular.module('tocsinApp')
	.controller('GlobalCtrl', function ($scope, $rootScope, configManager) {
		if($rootScope.SpineFMID === undefined){
			window.location.href = '#/';
			return;
		}
		$scope.displayConfigNames = false;
		$scope.spineFMNewName = null;
		$scope.openSetSpineNameModal = false;
		$scope.selectedNode = null;
		$scope.showInfo = false;
		$scope.isNodeSelected = false;
		$scope.selectedState = '';
		$scope.showGenarationLoading = false;
		$scope.showMouseConfiguration = false;
		$scope.helpModal = false;
		$scope.compatiblesConfigs = [];
		$scope.info = '';   // info to display in accordion body
		$scope.header = ''; // info to display on accordion header


		/**
		 * set info visibility in accordion object
		 */
		$scope.setInfoVisibility = function(){
			if($scope.showInfo === false){
				$scope.showInfo = true;
			}
			else{
				$scope.showInfo =false;
			}
		};
		/**
		 * get the number of created configs
		 * @returns {number}
		 */
		$scope.getNbConfigsTotal = function(){
			var total = 0;
			for(var de in $rootScope.configurations){
				total += $rootScope.configurations[de].partialConfig.number;
				total += $rootScope.configurations[de].validConfig.number;
			}
			return total;
		};

		/**
		 * get properties of selected node to display on top (in accordion)
		 * @param node
		 */
		$scope.getInfoFromSelectedNode = function(node){
			$scope.isNodeSelected = true;
			$scope.header = node.de + ' : '+ node.name;
			var prop = $scope.getProperties(node);
			$scope.info = $scope.getDEToLinkText(prop.deToLink);
			$scope.info += prop.nbConfigCompatibles  + ' configuration(s) compatible(s)';
			if(node.isValid === false){
				$scope.selectedState = $rootScope.colorsState.notFinishedConfig;
			}
			else{
				if(node.isLinked === true){
					$scope.selectedState = $rootScope.colorsState.finishedLinkedConfig;
				}
				else{
					$scope.selectedState = $rootScope.colorsState.finishedNotLinkedConfig;
				}
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
		 * get DE of the linked Configurations
		 * @param configSrc
		 */
		$scope.getDESOfLinkedConfig = function(configSrc){
			var domain = [];
			for(var i = 0; i< $rootScope.links.length; i++){
				var link = $rootScope.links[i];
				if(link.source === configSrc){
					var currentDE = $scope.getDEOfConfig(link.target);
					domain.push(currentDE);
				}
				else if(link.target === configSrc){
					var myDE = $scope.getDEOfConfig(link.source);
					domain.push(myDE);
				}
			}
			return domain;
		};

		/**
		 * get the DE on the given config
		 * @param configID
		 * @returns {null}
		 */
		$scope.getDEOfConfig = function(configID){
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
		 * get text of unlinked config
		 * @param toLink
		 * @returns {string}
		 */
		$scope.getDEToLinkText = function(toLink){
			var text = '';
			if(toLink.length> 0){
				text = 'Liens absents : [';
				for(var z = 0; z<toLink.length; z++){
					if(z === toLink.length -1){
						text += toLink[z] + '] ; ';
					}
					else{
						text += toLink[z]+ ', ';
					}
				}
			}
			return text;
		};

		/**
		 * get the given node's properties
		 * @param node
		 * @returns {{nbConfigCompatibles: number, deToLink: Array}}
		 */
		$scope.getProperties = function(node){
			var nb = 0;
			var toLink = [];
			var properties = {nbConfigCompatibles : 0, deToLink:[]};
			if($rootScope.compatiblesDES[node.de]) {
				if(node.isValid === false){
					toLink = $rootScope.compatiblesDES[node.de];
					for(var t = 0; t< $rootScope.compatiblesDES[node.de].length; t++ ){
						var de = $rootScope.compatiblesDES[node.de][t];
						if($rootScope.configurations[de]){
							nb += $rootScope.configurations[de].partialConfig.number;
							nb += $rootScope.validConfigs[de].linked;
							nb += $rootScope.validConfigs[de].notLinked;
						}
					}
				}
				else{
					for(var i = 0; i< $rootScope.compatiblesDES[node.de].length; i++ ){
						var linkedDES = $scope.getDESOfLinkedConfig(node.id);
						var currentDE = $rootScope.compatiblesDES[node.de][i];
						if(linkedDES.indexOf(currentDE) < 0){
							toLink.push(currentDE);
						}
						var compt = $scope.getConfigCompatibles(currentDE, node.id);
						nb += compt.length;
					}
				}
				properties.nbConfigCompatibles = nb;
				properties.deToLink = toLink;
			}
			return properties;
		};

		/**
		 * display all node's names
		 */
		$scope.displayNames = function(){
			var allCircles = document.getElementsByTagName('circle');
			if($scope.displayConfigNames === true){
				$scope.displayConfigNames = false;
				for (var i = 0 ; i < allCircles.length; i++) { $(allCircles[i]).data('tooltipsy').hide(); }
			}
			else {
				$scope.displayConfigNames = true;
				for(var y = 0 ; y < allCircles.length; y++) { $(allCircles[y]).data('tooltipsy').show(); }

			}
		} ;

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
					window.alert('Echec de check config compatible with');
				});

			return isLinkable;
		};

		/**
		 * Get configs from the given domain which are compatibles with the given config
		 * @param DeTarget
		 * @param confID
		 */
		$scope.getConfigCompatibles = function(DeTarget, confID){

			var compatibles = [];
			var isLinkable = $scope.isConfigLinkable(confID, DeTarget);
			if(isLinkable === true){
				configManager.getCompatiblesConfigurations($rootScope.SpineFMID, DeTarget, confID).then(function (configCompatibles) {

						compatibles = configCompatibles;
					},
					function(){
						window.alert('Echec du chargement des configurations compatibles');
					});
			}


			return compatibles;
		};

		/**
		 * handle compatibles configs between nodes
		 */
		$scope.handleCompatiblesConfigurations = function(nodes){
			for(var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (node.isValid === true) {
					$scope.compatiblesConfigs[node.id] = [];
					if($rootScope.compatiblesDES[node.de]) {
						for(var j = 0; j < $rootScope.compatiblesDES[node.de].length; j++) {
							var domain = $rootScope.compatiblesDES[node.de][j];
							$scope.checkCompatiblesConfigurations(node, domain);
						}
					}
				}
			}
		};

		/**
		 * check compatibles configurations
		 * @param node
		 * @param de
		 */
		$scope.checkCompatiblesConfigurations = function (node, de) {
			configManager.checkIsConfigLinkable($rootScope.SpineFMID, node.id, de).then(function (linkable) {
					if(linkable.toString() === 'true') {
						configManager.getLinkedConfigurations($rootScope.SpineFMID, de, node.id).then(function (linkedConfigs) {
								var multiplicity = $scope.getMultiplicityBetweenDE(node.de, de);
								if(linkedConfigs.length  !==  multiplicity){
									configManager.getCompatiblesConfigurations($rootScope.SpineFMID, de, node.id).then(function (configCompatibles) {
											for(var i=0; i < configCompatibles.length; i++) {
												$scope.compatiblesConfigs[node.id].push(configCompatibles[i]);
											}
										},
										function(){
											//window.alert('Echec du chargement des configurations compatibles');
									});
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
		 * link 2 given configurations
		 * @param deSource
		 * @param configSource
		 * @param deTarget
		 * @param configTarget
		 */
		$scope.linkConfigurations = function(deSource, configSource, deTarget, configTarget){

			configManager.linkConfigurations($rootScope.SpineFMID, configSource, configTarget).then(function (result) {

					$rootScope.links.push({'source':configSource, 'target': configTarget});
					$scope.checkIsLinked(deSource,configSource);
					$scope.checkIsLinked(deTarget,configTarget);
					if(result.deletedContext){
						$scope.handleChanges(result);
					}
				},
				function(){
					window.alert(' link configurations failed');
				});
		};


		/**
		 * check if config is linked
		 * @param de
		 * @param configID
		 */
		$scope.checkIsLinked = function(de, configID){
			if($rootScope.configurations[de].validConfig.listConfigs[configID]){
				configManager.checkIsConfigLinked($rootScope.SpineFMID, configID).then(function (linked) {
						if(linked.toString() === 'true') {

							$rootScope.configurations[de].validConfig.listConfigs[configID].isLinked = true;
							var noNewAllowed = $scope.isAddNewAllowed(de);
							if(noNewAllowed.toString() === 'false') {
								if ($rootScope.validConfigs[de].linked === 1) {
									$rootScope.validConfigs[de].linked += 0;
									$rootScope.validConfigs[de].notLinked += 0;
								}
								else{
									$rootScope.validConfigs[de].linked += 1;
									$rootScope.validConfigs[de].notLinked += -1;
								}
							}
							else {
								$rootScope.validConfigs[de].linked += 1;
								$rootScope.validConfigs[de].notLinked += -1;
							}
						}


					},
					function(){
						window.alert('Echec de check config is linked');
					});
			}
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
		 *  check if the given config is linked or not
		 * @param configID
		 * @returns {boolean}
		 */
		$scope.isConfigLinked = function(configID){
			var isLinked= false;
			configManager.checkIsConfigLinked($rootScope.SpineFMID, configID).then(function (linked) {
					isLinked = linked;
				},
				function(){
					window.alert('Echec de is linked');
				});

			return isLinked;
		};

		/**
		 *   Get multiplicity between given domains
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


// $$$$$$$$$$$$$$$$$$$$$$$$$  START D3 $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
		/**
		 * active context menu (on right click)
		 */
		$('#d3viz').contextMenu('context-menu-1', {
			'Link ': {
				click: function() {
					if($scope.selectedNode !== null){
						dragLine
							.style('marker-end', 'url(#end-arrow)')
							.classed('hidden', false)
							.attr('d', 'M' +$scope.selectedNode.x + ',' + $scope.selectedNode.y + 'L' + $scope.selectedNode.x + ',' + $scope.selectedNode.y);
					}
				},
				klass: 'menu-item-1' // a custom css class for this menu item (usable for styling)
			},
			'See configuration': {
				click: function() {
					if($scope.selectedNode !== null){
						window.location.href = $scope.selectedNode.url;
					}
				},
				klass: 'menu-item-1' // a custom css class for this menu item (usable for styling)
			},
			'See Domain assessment': {
				click: function(){
					if($scope.selectedNode !== null){
						window.location.href = '#/bilan/'+$scope.selectedNode.de;
					}
				},
				klass: 'second-menu-item'
			}
		});


		var isCompatiblesWithSelectedNode = function(selectedNode, currentNode) {
			var response = false;
			if(selectedNode !== null && currentNode!== null) {
				if ($scope.compatiblesConfigs[selectedNode.id]){
					response = $scope.compatiblesConfigs[selectedNode.id].indexOf(currentNode.id) >= 0;
				}
				else if ($scope.compatiblesConfigs[currentNode.id]) {
					response = $scope.compatiblesConfigs[currentNode.id].indexOf(selectedNode.id) >= 0;
				}
			}
			return response;
		};

		var getColorOfConfig = function(config){
			var color;
			if(config.isValid === true){
				if(config.isLinked === true){
					color = 'green';
				}
				else {
					color = 'orange';
				}
			}
			else{
				color = 'red';
			}
			return color;
		};

		var getListOfNodes = function () {
			var num = 0;
			var result = [];
			for (var i = 0; i < $rootScope.domainElements.length; i++) {
				var de = $rootScope.domainElements[i];
				var symbol = de.substring(0,1).toUpperCase();
				var listConfigs = $rootScope.configurations[de].validConfig.listConfigs;
				var partialConfigs = $rootScope.configurations[de].partialConfig.listConfigs;
				for (var configID in listConfigs) {
					result.push({'number': symbol+num, 'id':configID, 'name':listConfigs[configID].name, 'de':de, 'isLinked':listConfigs[configID].isLinked, isValid: true, 'ctxID':listConfigs[configID].ctxID, 'url': listConfigs[configID].url });
					num += 1;
				}

				for (var partialID in partialConfigs) {
					result.push({'number': symbol+num, 'id':partialConfigs[partialID].name, 'name':partialConfigs[partialID].name, 'ctxID':partialConfigs[partialID].ctxID, 'de':de, isValid: false, 'url': partialConfigs[partialID].url });
					num += 1;
				}
			}
			return result;
		};

		var getConfigsLinked = function(noeuds) {
			var result = [];

			for(var i = 0; i< $rootScope.links.length; i++){
				var link = $rootScope.links[i];
				var nodeSource = null;
				var nodeTarget = null;
				for(var y = 0; y < noeuds.length; y++){
					var node = noeuds[y];
					if(node.id === link.source){
						nodeSource = node;
					}
					else  if(node.id === link.target){
						nodeTarget = node;
					}
				}

				if(nodeSource !== null && nodeTarget !== null){

					result.push({source:nodeSource, target: nodeTarget, left:false, right:true, isPartial:false});

				}
			}
			for(var z = 0; z<$rootScope.configsToLink.length; z++){
				var toLink = $rootScope.configsToLink[z];
				var nodeSrc = null;
				var nodeTg = null;
				for(var t = 0; t < noeuds.length; t++){
					var currentNode = noeuds[t];
					if(currentNode.id === toLink.configID){
						nodeSrc = currentNode;
					}
					else if(currentNode.ctxID === toLink.ctxID){
						nodeTg = currentNode;
					}
				}

				if(nodeSrc !== null && nodeTg !== null){

					result.push({source:nodeSrc, target: nodeTg, left:false, right:true, isPartial:true});

				}
			}
			return result;
		};

		// set up SVG for D3
		var width  = 400,
			height = 500;

		var divViz = document.getElementById('d3viz');
		var svg = d3.select(divViz)
			.append('svg')
			.attr('width', divViz.offsetWidth)
			.attr('height', 500);

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
		var nodes = getListOfNodes();
		var	links = getConfigsLinked(nodes);
		$scope.checkIsGenerateAllowed();
		$scope.header =  'Nombre de configurations : '+ $scope.getNbConfigsTotal();

		function tick() {
			// draw directed edges with proper padding from node centers
			path.attr('d', function(d) {
				var deltaX = d.target.x - d.source.x,
					deltaY = d.target.y - d.source.y,
					dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
					normX = deltaX / dist,
					normY = deltaY / dist,
					sourcePadding = d.left ? 17 : 12,
					targetPadding = d.right ? 17 : 12,
					sourceX = d.source.x + (sourcePadding * normX),
					sourceY = d.source.y + (sourcePadding * normY),
					targetX = d.target.x - (targetPadding * normX),
					targetY = d.target.y - (targetPadding * normY);
				return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
			});

			circle.attr('transform', function(d) {
				return 'translate(' + d.x + ',' + d.y + ')';
			});
		}

// init D3 force layout
		var force = d3.layout.force()
			.nodes(nodes)
			.links(links)
			.size([width, height])
			.linkDistance(150)
			.charge(-500)
			.on('tick', tick);

// define arrow markers for graph links
		svg.append('svg:defs').append('svg:marker')
			.attr('id', 'end-arrow')
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 6)
			.attr('markerWidth', 3)
			.attr('markerHeight', 3)
			.attr('orient', 'auto')
			.append('svg:path')
			.attr('d', 'M0,-5L10,0L0,5')
			.attr('fill', '#000');

		svg.append('svg:defs').append('svg:marker')
			.attr('id', 'start-arrow')
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 4)
			.attr('markerWidth', 3)
			.attr('markerHeight', 3)
			.attr('orient', 'auto')
			.append('svg:path')
			.attr('d', 'M10,-5L0,0L10,5')
			.attr('fill', '#000');

// line displayed when dragging new nodes
		var dragLine = svg.append('svg:path')
			.attr('class', 'link dragline hidden')
			.attr('d', 'M0,0L0,0');

// handles to link and node element groups
		var path = svg.append('svg:g').selectAll('path'),
			circle = svg.append('svg:g').selectAll('g');


// mouse event vars
		var selectedNode = null,
			selectedLink = null,
			mousedownLink = null,
			mousedownNode = null,
			mouseupNode = null,
			mouseoverNode  = null;

		function resetMouseVars() {
			mousedownNode = null;
			mouseupNode = null;
			mousedownLink = null,
			mouseoverNode  = null;
		}

// update force layout (called automatically each iteration)


// update graph (called when needed)
		function restart() {

			// path (link) group
			path = path.data(links);

			// update existing links

			path.classed('selected', function(d) { return (d === selectedLink || d.isPartial === true); })
				.style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
				.style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


			// add new links
			path.enter().append('svg:path')
				.attr('class', 'link')
				.classed('selected', function(d) { return (d === selectedLink || d.isPartial === true); })
				.style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
				.style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
				.on('mousedown', function(d) {
					if(d3.event.ctrlKey) {
						return;
					}

					// select link
					mousedownLink = d;
					if(mousedownLink === selectedLink) {
						selectedLink = null;
					}
					else {
						selectedLink = mousedownLink;
					}
					selectedNode = null;
					restart();
				});

			// remove old links
			path.exit().remove();


			// circle (node) group
			// NB: the function arg is crucial here! nodes are known by id, not by index!
			circle = circle.data(nodes, function(d) { return d.id; });

			// update existing nodes (reflexive & selected visual states)
			circle.selectAll('circle')
				.style('fill', function(d) {
					var isCompatibleWithSelected = isCompatiblesWithSelectedNode(selectedNode,d);
					return (d === selectedNode || isCompatibleWithSelected === true) ? d3.rgb(getColorOfConfig(d)).brighter().toString() : getColorOfConfig(d);
				});

			// add new nodes
			var g = circle.enter().append('svg:g');

			g.append('svg:circle')
				.attr('class', 'node')
				.attr('r', 20)
				.attr('title', function(d) { return 'Name : '+d.name; })
				.style('fill', function(d) {
					var isCompatibleWithSelected = isCompatiblesWithSelectedNode(selectedNode,d);
					return (d === selectedNode || isCompatibleWithSelected === true) ? d3.rgb(getColorOfConfig(d)).brighter().toString() : getColorOfConfig(d);
				})
				.style('stroke', function() { return 'grey'; })
				//.style('stroke', function(d) { return d3.rgb(getColorOfConfig(d)).darker().toString(); })
				.on('mouseover', function(d) {
					mouseoverNode = d;
					if(!mousedownNode || d === mousedownNode) {
						return;
					}
					// enlarge target node
					d3.select(this).attr('transform', 'scale(1.1)');

				})
				.on('mouseout', function(d) {
					if(!mousedownNode || d === mousedownNode) {
						return;
					}
					// unenlarge target node
					d3.select(this).attr('transform', '');
				})
				.on('mousedown', function(d) {

					if(d3.event.ctrlKey) {
						return;
					}
					$scope.getInfoFromSelectedNode(d);

					// select node
					mousedownNode = d;
					$scope.selectedNode = d;
					if(mousedownNode === selectedNode) {
						selectedNode = null;
					}
					else {
						selectedNode = mousedownNode;
					}
					selectedLink = null;

					// reposition drag line
					if(mousedownNode.isValid === false){
						dragLine
							.style('marker-end', 'url(#end-arrow)')
							.classed('hidden', true)
							.attr('d', 'M' + mousedownNode.x + ',' + mousedownNode.y + 'L' + mousedownNode.x + ',' + mousedownNode.y);
					}


					restart();
				})
				.on('mouseup', function(d) {
					if(!mousedownNode) {
						return;
					}

					// needed by FF
					dragLine
						.classed('hidden', true)
						.style('marker-end', '');

					// check for drag-to-self
					mouseupNode = d;
					if(mouseupNode === mousedownNode) { resetMouseVars(); return; }

					// check if the 2 configs are not in the same de
					if(mousedownNode.de === mouseupNode.de){
						window.alert('Opération interdite pour les configurations d\'un même domaine');
						resetMouseVars();
						return;
					}

					var isCompatibles = isCompatiblesWithSelectedNode(mousedownNode, mouseupNode);
					if(isCompatibles === false){
						window.alert('Configurations incompatibles');
						resetMouseVars();
						return;
					}
					// unenlarge target node
					d3.select(this).attr('transform', '');

					// add link to graph (update if exists)
					// NB: links are strictly source < target; arrows separately specified by booleans
					var source, target, direction;
					if(mousedownNode.number < mouseupNode.number) {
						source = mousedownNode;
						target = mouseupNode;
						direction = 'right';
					} else {
						source = mouseupNode;
						target = mousedownNode;
						direction = 'left';
					}

					var link;
					link = links.filter(function(l) {
						return (l.source === source && l.target === target);
					})[0];

					if(link) {
						link[direction] = true;
					} else {
						link = {source: source, target: target, left: false, right: false , isPartial:false};
						link[direction] = true;
						links.push(link);
						$scope.linkConfigurations(source.de,source.id, target.de,target.id);
						$scope.checkIsGenerateAllowed();
					}

					// select new link
					selectedLink = link;
					selectedNode = null;
					restart();
				});

			// show node IDs
			g.append('svg:text')
				.attr('x', 0)
				.attr('y', 4)
				.attr('class', 'id')
				.text(function(d) {
					return d.number;
				});

			// remove old nodes
			circle.exit().remove();
			$('svg circle').tooltipsy({
				alignTo: 'element',
				className: 'tipsy-inner'
			});
			// set the graph in motion
			force.start();
		}

		/**
		 * mouse down callback
		 */
		function mousedown() {
			if(mousedownNode === null){
				$scope.isNodeSelected = false;
				$scope.header =  'Nombre de configurations '+ $scope.getNbConfigsTotal();
				$scope.info = '';
			}
			console.log('Mousedown desactive');
		}

		/**
		 * mouse over callback
		 */
		function mouseover() {
			console.log('MouseOver desactive');
		}

		/**
		 * mouse move callback
		 */
		function mousemove() {
			if(!mousedownNode) {
				return;
			}

			// update drag line
			var self = divViz;
			dragLine.attr('d', 'M' + mousedownNode.x + ',' + mousedownNode.y + 'L' + d3.mouse(self)[0] + ',' + d3.mouse(self)[1]);

			restart();
		}

		/**
		 * mouse up callback
		 */
		function mouseup() {
			if(mousedownNode) {
				// hide drag line
				dragLine
					.classed('hidden', true)
					.style('marker-end', '');
			}

			// because :active only works in WebKit?
			svg.classed('active', false);

			// clear mouse event vars
			resetMouseVars();
		}


// app starts here
		svg.on('mousedown', mousedown)
			.on('mousemove', mousemove)
			.on('mouseover', mouseover)
			.on('mouseup', mouseup);
		d3.select(window);
			//.on('keydown', keydown)
			//.on('keyup', keyup);
		restart();
		$scope.handleCompatiblesConfigurations(nodes);
		circle.exit().remove();
	});
// $$$$$$$$$$$$$$$$$$$$$$$$$  END D3 $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

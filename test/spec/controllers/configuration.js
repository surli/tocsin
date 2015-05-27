'use strict';

window.describe('Controller: configurationCtrl', function ()  {
	window.beforeEach(module('tocsinApp'));

	var ConfigurationCtrl,routeParams, httpBackend, constants,
		scope, rootScope;

	// Initialize the controller and a mock scope
	window.beforeEach(window.inject(function ($controller, $rootScope, $httpBackend, SpineFMConstants) {
		scope = $rootScope.$new();
		rootScope = $rootScope;
		constants = SpineFMConstants;
		// initialize rootScope properties
		rootScope.testConfiguration = 1;
		rootScope.SpineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';
		rootScope.compatiblesDES = [];
		rootScope.domainElements = ['behaviour', 'layout', 'renderer','source','zone'];
		rootScope.configurations = {};
		rootScope.deFeatures = {};
		rootScope.DEProperties = {};
		rootScope.zones = {};
		rootScope.ConfigsName = [];
		routeParams = {};
		httpBackend = $httpBackend;
		scope.fm  = {levels : {}};
		ConfigurationCtrl = $controller('configurationCtrl', {
			$scope: scope,
			$rootScope: rootScope
		});
		for (var i = 0; i< rootScope.domainElements.length; i++){
			var de = rootScope.domainElements[i];
			rootScope.configurations[de] = {
				'partialConfig': {
					listConfigs: {},
					number: 0
				},
				'validConfig': {
					listConfigs: {},
					number: 0
				}
			};
		}
	}));

	window.afterEach(function() {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});

	window.it('should ctxID in routeParams undefined', function() {
		scope.domainElement = 'source';
		window.expect(routeParams.ctxID).toBe(undefined);
	});
	window.it('should send all initialisation requests and not show modal to choose context', function() {
		scope.domainElement = 'source';
		scope.deConfigurations = {'partialConfig': {
			listConfigs: {},
			number: 0
		},
			'validConfig': {
				listConfigs: {},
				number: 0
			}
		};
		var resultCtxID = 'source_3';
		var resultName = 'Partial_Source_43';
		var resultFM = {};
		var resultValid = false;
		rootScope.compatiblesDES[scope.domainElement] = ['renderer'];
		//routeParams.ctxID = 'source_3';
		rootScope.DEProperties[scope.domainElement] = {multiplicityDE : {upperBound : -1, lowerBound:1}};
		//initContext
		httpBackend.expectPUT(constants.DOMAIN_URL+':'+constants.PORT+'/'+constants.PATH+'/'+rootScope.SpineFMID+'/ctx/create').respond(resultCtxID);
		//setConfName
		httpBackend.expectGET(constants.DOMAIN_URL+':'+constants.PORT+'/'+constants.PATH+'/'+rootScope.SpineFMID+'/fm/ctx/'+resultCtxID+'/'+scope.domainElement+'/name').respond(resultName);
		//initFMState
		httpBackend.expectGET(constants.DOMAIN_URL+':'+constants.PORT+'/'+constants.PATH+'/'+rootScope.SpineFMID+'/fm/ctx/'+resultCtxID+'/'+scope.domainElement+'/').respond(resultFM);
		//isConfigComplete
		httpBackend.expectGET(constants.DOMAIN_URL+':'+constants.PORT+'/'+constants.PATH+'/'+rootScope.SpineFMID+'/fm/ctx/'+resultCtxID+'/'+scope.domainElement+'/isvalid').respond(resultValid);
		/**
		 * function to test
		 */
		scope.initController();
		httpBackend.flush();
		window.expect(scope.isVisible).toBe(false);
	});
});

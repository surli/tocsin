'use strict';

window.describe('Controller: StartCtrl', function ()  {
	window.beforeEach(module('tocsinApp'));

	/*window.it('should have a StartCtrl controller', function() {
		window.expect().toBe(undefined);
	});*/
	var StartCtrl,httpBackend, constants;
	var scope , rootScope;
	// Initialize the controller and a mock scope
	window.beforeEach(window.inject(function ($controller, $rootScope, $httpBackend, SpineFMConstants) {
		scope = $rootScope.$new();
		rootScope = $rootScope;
		rootScope.test = 1;
		constants = SpineFMConstants;
		httpBackend = $httpBackend;
		StartCtrl = $controller('StartCtrl', {
			$scope: scope,
			$rootScope: rootScope
		});
	}));

	window.afterEach(function() {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});

	window.it('should have compatiblesDES list with no element', function() {
		window.expect(scope.compatiblesDES.length).toBe(0);
	});
	window.it('should have a no instances', function() {
		var result  =[];
		httpBackend.expectGET(constants.DOMAIN_URL+':'+constants.PORT+'/'+constants.PATH+'/list').respond(result);
		scope.start();
		httpBackend.flush();
		window.expect(scope.hasInstances).toBe(false);
	});
	window.it('should have instances', function() {
		var result = [{uid:'123' , description:'instance1', modificationDate: 10040034, creationDate:100442},
			{uid:'123' , description:'instance2', modificationDate: 104434, creationDate:10242},
			{uid:'323' , description:'instance3', modificationDate: 1014434, creationDate:100034},
			{uid:'345' , description:'instance4', modificationDate: 1003233, creationDate:100042}
		];
		httpBackend.expectGET(constants.DOMAIN_URL+':'+constants.PORT+'/'+constants.PATH+'/list').respond(result);
		scope.start();
		httpBackend.flush();
		window.expect(scope.hasInstances).toBe(true);
	});
	/*window.it('should initialize domain elements', function() {
		rootScope.SpineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';
		var result  =['source', 'renderer', 'behaviour', 'zone', 'layout'];
		//var spineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';
		httpBackend.expectGET('http://localhost:8080/spinefm-rest-service/rest/'+rootScope.SpineFMID+'/model/des/').respond(result);
		httpBackend.expectGET('http://localhost:8080/spinefm-rest-service/rest/'+rootScope.SpineFMID+'/model/des/').respond(result);
		scope.initDomainElements(rootScope.SpineFMID, false);
		httpBackend.flush();
		window.expect(scope.hasInstances).toBe(false);
	});*/
});

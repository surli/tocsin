'use strict';

window.describe('Service: configManager', function () {

	// load the service's module
	window.beforeEach(module('tocsinApp'));

	// instantiate service
	var managerConfig;
	var httpBackend;
	window.beforeEach(window.inject(function ($httpBackend, configManager) {
		managerConfig = configManager;
		httpBackend = $httpBackend;
	}));
	window.afterEach(function() {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});

	window.it('should have a linkConfigurations function', function () {
		window.expect(angular.isFunction(managerConfig.linkConfigurations)).toBe(true);
	});

	window.it('should have a getCompatiblesConfigurations function', function () {
		window.expect(angular.isFunction(managerConfig.getCompatiblesConfigurations)).toBe(true);
	});

	/**
	 *
	 */
	window. it('should check if the given configuration is linked', function (){
		//set up some data for the http call to return and test later.
		var returnData = {result : true};
		var configID = 'source_3';
		var spineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';

		//expectGET to make sure this is called once.
		httpBackend.expectGET('http://localhost:8080/spinefm-rest-service/rest/'+spineFMID+'/config/'+configID+'/isLinked/').respond(returnData);
		//create an object with a function to spy on.
		var test = {
			handler: function() {}
		};

		//set up a spy for the callback handler.
		window.spyOn(test, 'handler');

		//make the call.
		var returnedPromise = managerConfig.checkIsConfigLinked(spineFMID, configID);

		//use the spying handler on to handle the resolution of the promise.
		returnedPromise.then(test.handler);

		//flush the backend to "execute" the request to do the expectedGET assertion.
		httpBackend.flush();

		//check your spy to see if it's been called with the returned value.
		window.expect(test.handler).toHaveBeenCalledWith(returnData);
	});

	/**
	 *
	 */
	window. it('should generate screen', function (){
		var generateResult = {result : true};
		var spineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';
		httpBackend.expectPUT('http://localhost:8080/spinefm-rest-service/rest/'+spineFMID+'/model/generate/').respond(generateResult);
		//create an object with a function to spy on.
		var test = {
			handler: function() {}
		};

		window.spyOn(test, 'handler');

		var returnedPromise = managerConfig.generate(spineFMID);

		returnedPromise.then(test.handler);

		httpBackend.flush();
		window.expect(test.handler).toHaveBeenCalledWith(generateResult);
	});
});

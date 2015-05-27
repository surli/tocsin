'use strict';

window.describe('Service: FMManager', function () {

	// load the service's module
	window.beforeEach(module('tocsinApp'));

	// instantiate service
	var fmManager;
	var httpBackend;
	window.beforeEach(window.inject(function ($httpBackend, FMManager) {
		fmManager = FMManager;
		httpBackend = $httpBackend;
	}));
	window.afterEach(function() {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});

	window.it('should have a doAction function', function () {
		window.expect(angular.isFunction(fmManager.doAction)).toBe(true);
	});

	window.it('should have an initFMState function', function () {
		window.expect(angular.isFunction(fmManager.initFMState)).toBe(true);
	});

	/**
	 *
	 */
	window. it('should initialize context', function (){
		var initCtx = {ctxID : 'source_35'};
		var spineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';
		httpBackend.expectPUT('http://localhost:8080/spinefm-rest-service/rest/'+spineFMID+'/ctx/create').respond(initCtx);
		//create an object with a function to spy on.
		var test = {
			handler: function() {}
		};

		window.spyOn(test, 'handler');

		var returnedPromise = fmManager.initContext(spineFMID, name);

		returnedPromise.then(test.handler);

		httpBackend.flush();
		window.expect(test.handler).toHaveBeenCalledWith(initCtx);
	});
	/**
	 *
	 */
	window. it('should check if the given configuration is complete', function (){
		//set up some data for the http call to return and test later.
		var returnData = {result : true};
		var ctxID = 'source_35';
		var spineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';
		var de = 'source';

		//expectGET to make sure this is called once.
		httpBackend.expectGET('http://localhost:8080/spinefm-rest-service/rest/'+spineFMID+'/fm/ctx/'+ctxID+'/'+de+'/isvalid').respond(returnData);
		//create an object with a function to spy on.
		var test = {
			handler: function() {}
		};

		//set up a spy for the callback handler.
		window.spyOn(test, 'handler');

		//make the call.
		var returnedPromise = fmManager.isConfigComplete(spineFMID, de, ctxID);

		//use the spying handler on to handle the resolution of the promise.
		returnedPromise.then(test.handler);

		httpBackend.flush();

		//check your spy to see if it's been called with the returned value.
		window.expect(test.handler).toHaveBeenCalledWith(returnData);
	});

});

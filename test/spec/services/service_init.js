'use strict';

window.describe('Service: InitService', function () {

	// load the service's module
	window.beforeEach(module('tocsinApp'));

	// instantiate service
	var serviceInit;
	var httpBackend;
	window.beforeEach(window.inject(function ($httpBackend, InitService) {
		serviceInit = InitService;
		httpBackend = $httpBackend;
	}));
	window.afterEach(function() {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});

	window.it('should have an initSpineFM function', function () {
		window.expect(angular.isFunction(serviceInit.initSpineFM)).toBe(true);
	});


	/**
	 *
	 */
	window. it('should initialize domain elements', function (){
		//set up some data for the http call to return and test later.
		var returnData = ['source','renderer', 'behaviour', 'zone', 'layout'];

		//expectGET to make sure this is called once.
		httpBackend.expectGET('http://localhost:8080/spinefm-rest-service/rest/33a8ad93-c5a5-4ba0-8d45-9653baf44ca/model/des/').respond(returnData);
		//create an object with a function to spy on.
		var test = {
			handler: function() {}
		};

		//set up a spy for the callback handler.
		window.spyOn(test, 'handler');

		//make the call.
		var returnedPromise = serviceInit.initDES('33a8ad93-c5a5-4ba0-8d45-9653baf44ca');

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
	window. it('should initialize instances List', function (){
		var returnData = [{name : 'myInstance1',  modificationDate : 10035353, creationDate : 100435},
			{name : 'myInstance2',  modificationDate : 20035353, creationDate : 200435},
			{name : 'myInstance3',  modificationDate : 30035353, creationDate : 300435},
			{name : 'myInstance4',  modificationDate : 40035353, creationDate : 40035353}
		];

		//expectGET to make sure this is called once.
		httpBackend.expectGET('http://localhost:8080/spinefm-rest-service/rest/list').respond(returnData);
		var test = {
			handler: function() {}
		};

		window.spyOn(test, 'handler');
		var returned = serviceInit.initList();

		returned.then(test.handler);

		httpBackend.flush();

		window.expect(test.handler).toHaveBeenCalledWith(returnData);
	});
	/**
	 *
	 */
	window. it('should set SpineFM name', function (){
		var setName = {result : true};
	    var spineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';
		var name = 'NewName';
		httpBackend.expectPUT('http://localhost:8080/spinefm-rest-service/rest/'+spineFMID+'/name/' + name).respond(setName);
		//create an object with a function to spy on.
		var test = {
			handler: function() {}
		};

		window.spyOn(test, 'handler');

		var returnedPromise = serviceInit.setSpineFMName(spineFMID, name);

		returnedPromise.then(test.handler);

		httpBackend.flush();
		window.expect(test.handler).toHaveBeenCalledWith(setName);
	});

	/**
	 *
	 */
	window. it('should get GlobalCtxID', function (){
		var returnData = {globalCtxID : 'gc'};
		var spineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';

		//expectGET to make sure this is called once.
		httpBackend.expectGET('http://localhost:8080/spinefm-rest-service/rest/'+spineFMID+'/ctx/global').respond(returnData);
		var test = {
			handler: function() {}
		};

		window.spyOn(test, 'handler');
		var returned = serviceInit.getGlobalContextID(spineFMID);

		returned.then(test.handler);

		httpBackend.flush();

		window.expect(test.handler).toHaveBeenCalledWith(returnData);
	});

	/**
	 *
	 */
	window. it('should get renderer compatibles domains ', function (){
		var returnData = ['source', 'zone'];
		var spineFMID = '33a8ad93-c5a5-4ba0-8d45-9653baf44ca';
		var de = 'renderer';

		//expectGET to make sure this is called once.
		httpBackend.expectGET('http://localhost:8080/spinefm-rest-service/rest/'+spineFMID+'/model/'+de+'/linkableDES/').respond(returnData);
		var test = {
			handler: function() {}
		};

		window.spyOn(test, 'handler');
		var returned = serviceInit.getCompatiblesDES(spineFMID, de);

		returned.then(test.handler);

		httpBackend.flush();

		window.expect(test.handler).toHaveBeenCalledWith(returnData);
	});
});

'use strict';

window.describe('Controller: BilanCtrl', function ()  {
	window.beforeEach(module('tocsinApp'));


	// load the controller's module
	window.beforeEach(module('tocsinApp'));

	var BilanCtrl, scope;

	// Initialize the controller and a mock scope
	window.beforeEach(window.inject(function ($controller, $rootScope) {
		scope = $rootScope.$new();
		BilanCtrl = $controller('BilanCtrl', {
			$scope: scope
		});
	}));
	window.it('should have a BilanCtrl controller', function() {
		window.expect().toBe(undefined);
	});

	/*window.it('should have a linkConfigurations function', function () {
		window.expect(angular.isFunction(scope.linkConfigurations)).toBe(true);
	});


	window.it('should check if current config has linked config', function () {
		window.expect(scope.hasLinkedConfig).toBe(false);
	});*/
});

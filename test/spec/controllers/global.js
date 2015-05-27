'use strict';

window.describe('Controller: GlobalCtrl', function ()  {
	window.beforeEach(module('tocsinApp'));

	var GlobalCtrl,
		scope;

	// Initialize the controller and a mock scope
	window.beforeEach(window.inject(function ($controller, $rootScope) {
		scope = $rootScope.$new();
		GlobalCtrl = $controller('GlobalCtrl', {
			$scope: scope
		});
	}));

	window.it('should have a GlobalCtrl controller', function() {
		window.expect().toBe(undefined);
	});
});

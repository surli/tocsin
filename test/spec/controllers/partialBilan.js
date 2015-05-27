'use strict';

window.describe('Controller: PartialBilanCtrl', function ()  {
	window.beforeEach(module('tocsinApp'));

	var PartialBilanCtrl,
		scope;

	// Initialize the controller and a mock scope
	window.beforeEach(window.inject(function ($controller, $rootScope) {
		scope = $rootScope.$new();
		PartialBilanCtrl = $controller('PartialBilanCtrl', {
			$scope: scope
		});
	}));

	window.it('should have a PartialBilanCtrl controller', function() {
		window.expect().toBe(undefined);
	});
});

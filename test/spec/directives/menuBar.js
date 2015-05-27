'use strict';

window.describe('Directive: menuBar', function () {
	window.beforeEach(module('tocsinApp'));

	var element, scope;

	window.beforeEach('should have the correct amount of domains in domainElements list ', window.inject(function ($rootScope, $compile) {
		element = angular.element('<div ng-repeat="de in domainElements">'+
			'<a class="dropdown-toggle" role="button" href="#" style="text-transform: capitalize ; color: #ffffff">'+
			'<h4>{{de}} <b class="caret" style="border-top-color: #ffffff;border-bottom-color: #ffffff;"></b></h4></a></div>');

		scope = $rootScope;

		scope.domainElements = ['source', 'renderer', 'behaviour', 'zone', 'layout'];
		element = $compile(element)($rootScope);
		scope.$digest();
		window.expect(element.find('h4').length).toBe(5);
	}));
	/*
	* window.it('should have the correct amount of domainElements in the list', function() {
	 var list = element.find('li');
	 window.expect(list.length).toBe(5);
	 });*/
});

'use strict';

window.describe('Directive: leftBand', function () {
	window.beforeEach(module('tocsinApp'));

	var element, scope;

	window.beforeEach('should have the correct amount of domains in domainElements list', window.inject(function ($rootScope, $compile) {
		element = angular.element('<ul class="nav nav-list" ng-repeat="de in domainElements">'+
		'<li class="nav-header"> <a href="#/bilan/{{de}}/">{{de}} <span class="label label-inverse" ng-show="hasConfigToCreate(de)">'+
			'to create </span></a></li></ul>');
		scope = $rootScope;
		scope.domainElements = ['source', 'renderer', 'behaviour', 'zone', 'layout'];
		element = $compile(element)($rootScope);
		scope.$digest();
		window.expect(element.find('li').length).toBe(5);
	}));
});

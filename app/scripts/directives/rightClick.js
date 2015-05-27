'use strict';

angular.module('tocsinApp')
  .directive('rightClick',  function($parse) {
		return function(scope, element, attr) {
			element.bind('contextmenu', function(event) {
				event.preventDefault();
				var fn = $parse(attr.rightClick);
				scope.$apply(function() {
					fn(scope, {
						$event: event
					});
				});
				return false;
			});
		};
	});

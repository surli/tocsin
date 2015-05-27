'use strict';

angular.module('tocsinApp', ['ui.bootstrap','ngResource'])
	.config(function ($routeProvider, $httpProvider) {
		delete $httpProvider.defaults.headers.common['X-Requested-With'];
		$routeProvider
			.when('/', {
				templateUrl: 'views/start.html',
				controller: 'StartCtrl'
			})
			.when('/error', {
				templateUrl: 'views/error404.html',
				controller: 'StartCtrl'
			})
			.when('/de/:domainelement', {
				templateUrl: 'views/configuration.html',
				controller: 'configurationCtrl',
				reloadOnSearch: false
			})
			.when('/de/:domainelement/ctx/:ctxID', {
				templateUrl: 'views/configuration.html',
				controller: 'configurationCtrl',
				reloadOnSearch: false
			})
			.when('/de/:domainelement/ctx/:deTarget/:ctxID', {
				templateUrl: 'views/configuration.html',
				controller: 'configurationCtrl',
				reloadOnSearch: false
			})
			.when('/bilan/:domainelement/ctx/:ctxID/:configID', {
				templateUrl: 'views/bilan.html',
				controller: 'BilanCtrl'
			})
			.when('/bilan/:domainelement/', {
				templateUrl: 'views/partialBilan.html',
				controller: 'PartialBilanCtrl'
			})
			.when('/global', {
				templateUrl: 'views/global.html',
				controller: 'GlobalCtrl'
			})

		  .otherwise({redirectTo: '/error'});
	});

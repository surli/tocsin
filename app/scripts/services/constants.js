'use strict';

angular.module('tocsinApp').factory('SpineFMConstants', function () {
	return {
		DOMAIN_URL: 'http://spinefm.unice.fr', //'http://localhost',
		PORT: '8080',
		PATH: 'spinefm-rest-service/rest',
		ANNOTATION_DOMAIN_URL: 'http://'+document.location.hostname,
		ANNOTATION_PORT: document.location.port,
		ANNOTATION_PATH: document.location.pathname+'resources/annotations',
		PROPERTY_PATH: document.location.pathname+'resources/properties',
		IMAGES_CONFIGURATION_PATH: document.location.pathname+'images/configuration'
	};
});

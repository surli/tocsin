//noinspection JSHint
'use strict';

angular.module('tocsinApp').factory('InitService', function ($http, $resource, SpineFMConstants) {
	return {
		initSpineFM: function (configDescription) {
			return $http.post(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/',configDescription);
		},
		initDES: function(spineFMID) {
			// $http returns a promise, which has a then function, which also returns a promise
			return $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/model/des/').then(function (response) {
				return response.data;
			});
		},
		initFM: function() {
			return $resource(SpineFMConstants.DOMAIN_URL+'\\:'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/:SpineFMID/fm/global/:DomainElement',{}, {get: {method:'GET',isArray:false}});
		},
		setSpineFMName: function(spineFMID, name) {
			return $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/name/'+name).then(function (response) {
				return response.data;
			});
		},
		initAnnotations: function(annotationPath,DomainElement) {
			return $http.get(annotationPath+'/annotation_'+DomainElement+'.json');
		},

		initColors: function() {
			return $resource(SpineFMConstants.ANNOTATION_DOMAIN_URL+'\\:'+SpineFMConstants.ANNOTATION_PORT+SpineFMConstants.PROPERTY_PATH+'/colorsByState.json',{}, {get: {method:'GET',isArray:false}});
		},
		initDescription: function() {
			return $resource(SpineFMConstants.ANNOTATION_DOMAIN_URL+'\\:'+SpineFMConstants.ANNOTATION_PORT+SpineFMConstants.PROPERTY_PATH+'/description.json',{}, {get: {method:'GET',isArray:false}});
		},
		initList: function() {
			return $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/list').then(function (response) {
				return response.data;
			});
			//return $resource(SpineFMConstants.DOMAIN_URL+'\\:'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/list',{}, {get: {method:'GET',isArray:true}});
		},

		initBounds: function() {
			return $resource(SpineFMConstants.DOMAIN_URL+'\\:'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/:SpineFMID/model/:DomainElement/multiplicity',{}, {get: {method:'GET',isArray:false}});
		},

		getCompatiblesDES : function(spineFMID, de){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/model/'+de+'/linkableDES/').then(function(response) {
				return response.data;
			});
		},
		getGlobalContextID : function(spineFMID){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/ctx/global').then(function(response) {
				return response.data;
			});
		},
		getMultiplicity : function(spineFMID, deSource, deTarget){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/model/asso/multiplicity/source/'+deSource+'/target/'+deTarget+'/').then(function(response) {
				return response.data;
			});
		},
		getConfigurationStatus : function(spineFMID){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/status/').then(function(response) {
				return response.data;
			});
		},
		getModel : function(spineFMID){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/model/').then(function(response) {
				return response.data;
			});
		},
		getLinks : function(spineFMID){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/links/').then(function(response) {
				return response.data;
			});
		},
		getPreviousActions: function(spineFMID) {
			return $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/command/').then(function (response) {
				return response.data;
			});
		},
		undoLastAction: function(spineFMID) {
			return $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/command/undo/').then(function (response) {
				return response.data;
			});
		},
		undoAction: function(spineFMID, stepID) {
			return $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/command/undo/'+stepID).then(function (response) {
				return response.data;
			});
		},
		duplicate: function(spineFMID) {
			return $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/model/duplicate/').then(function (response) {
				return response.data;
			});
		}
	};
});






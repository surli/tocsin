//noinspection JSHint
'use strict';

angular.module('tocsinApp').factory('FMManager', function ($http, SpineFMConstants) {
	return {
		doAction: function (spineFMID, de, ctxID, featureName, act) {
			return $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/fm/ctx/'+ctxID+'/'+de+'/'+act+'/'+featureName+'/').then(function(response) {
				return response.data;
			});
		},
		initFMState: function (spineFMID, de, ctxID) {
			return $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/fm/ctx/'+ctxID+'/'+de+'/').then(function(response) {
				return response.data;
			});
		},
		isConfigComplete: function (spineFMID, de, ctxID) {
			return $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/fm/ctx/'+ctxID+'/'+de+'/isvalid').then(function(response) {
				return response.data;
			});
		},
		getConfName: function (spineFMID, de, ctxID) {
			return $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/fm/ctx/'+ctxID+'/'+de+'/name').then(function(response) {
				return response.data;
			});
		},
		setConfName: function (spineFMID, de, ctxID, name) {
			return $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/fm/ctx/'+ctxID+'/'+de+'/name/', name).then(function(response) {
				return response.data;
			});
		},

		getValidConfigName: function (spineFMID, configID) {
			return $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/'+configID+'/name').then(function(response) {
				return response.data;
			});
		},
		setValidConfigName: function (spineFMID, configID, name) {
			return $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/'+configID+'/name/'+name).then(function(response) {
				return response.data;
			});
		},
		initContext: function(spineFMID) {
			return $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/ctx/create').then(function(response) {
				return response.data;
			});
		}
	};
});
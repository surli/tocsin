'use strict';

angular.module('tocsinApp').factory('configManager', function ($http, SpineFMConstants) {
	return {
		create: function (spineFMID, de, ctxID) {
			return $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/create/'+de+'/'+ctxID+'/').then(function(response) {
				return response.data;
			});
		},

		getFeatures: function (spineFMID, configID) {
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/'+configID+'/features/').then(function(response) {
				return response.data;
			});
		} ,

		getCompatiblesConfigurations : function(spineFMID, de, confID){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/'+confID+'/compliant/'+de+'/').then(function(response) {
				return response.data;
			});
		},

		getLinkedConfigurations : function(spineFMID, de, confID){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/'+confID+'/linked/'+de+'/').then(function(response) {
				return response.data;
			});                                                                //TODO concat result from isLinked and isLinkable
		},

		checkIsConfigLinkable : function(spineFMID, configID, de){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/'+configID+'/isLinkableWith/'+de+'/').then(function(response) {
				return response.data;
			});
			//return $resource(SpineFMConstants.DOMAIN_URL+'\\:'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/:SpineFMID/config/:ConfigID/isLinkableWith/:DomainElement',{}, {get: {method:'GET',isArray:false}});

		},
		linkConfigurations : function(spineFMID, configIDSource, configIDTarget){
			var url = SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/link/source/'+configIDSource+'/target/'+configIDTarget+'/';
			var promise = $http({method:'PUT', url:url})
				.success(function (response) {
					return response.data;
				})
				.error(function () {
					return {'status': false};
				});

			return promise;
			/*return  $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/link/source/'+configIDSource+'/target/'+configIDTarget+'/').then(function(response) {
				return response.data;
			}); */
		},

		checkIsConfigLinked : function(spineFMID, configID){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/'+configID+'/isLinked/').then(function(response) {
				return response.data;
			});
			//return $resource(SpineFMConstants.DOMAIN_URL+'\\:'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/:SpineFMID/config/:ConfigID/isLinked/','', {get: {method:'GET',isArray:false}});
		},
		setSpineFMName : function(spineFMID, name){
			return  $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/name/', name).then(function(response) {
				return response.data;
			});
		},

		cloneValidConfiguration : function(spineFMID, configID){
			return  $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/'+configID+'/clone/').then(function(response) {
				return response.data;
			});
		},

		clonePartialConfiguration : function(spineFMID, de, ctxID){
			return  $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/'+de+'/'+ctxID+'/clone/').then(function(response) {
				return response.data;
			});
		},
		cloneConfigurationToLink : function(spineFMID, ctxID, de){
			return  $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/ctx/clone/'+ctxID+'/'+de+'/').then(function(response) {
				return response.data;
			});
		},
		checkIsGenerateAllowed : function(spineFMID){
			return  $http.get(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/config/isValid').then(function(response) {
				return response.data;
			});
		},
		generate : function(spineFMID){
			return  $http.put(SpineFMConstants.DOMAIN_URL+':'+SpineFMConstants.PORT+'/'+SpineFMConstants.PATH+'/'+spineFMID+'/model/generate/').then(function(response) {
				return response.data;
			});
		}
	};
});

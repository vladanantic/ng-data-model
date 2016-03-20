/**
 * @name    Horisen Data
 * @desc 
 */

(function (angular) {
    'use strict';

    angular
        .module('horisen.data', []); 

})(window.angular);

/**
 * @name    dataModel
 * @desc    The service to save and maintenance data into storage object
 */

(function (angular) {
    'use strict'; 

    angular
        .module('horisen.data')
        .factory('dataModel', dataModelFactory); 

    function dataModelFactory(){
        var dataStore = {};
        
        function dataModel(storeName){
            if (!storeName || typeof storeName !== 'string' || storeName == '')
                return null;
            
            this.storeName = storeName;
            
            if (angular.isUndefined(dataStore[this.storeName])){
                dataStore[this.storeName] = this.initStore();
            }
        };
        
        dataModel.prototype = {
            initStore: function(){
                var store = {
                        attr: {
                            changed: false,
                            valid: false,
                            saved: false
                        },
                        data: {},
                        dataState: {},
                        res: {}
                    };
                    
                return store;
            },
            
            setStore: function(store){
                if (store && typeof(store) === 'object')
                    dataStore[this.storeName] = store;
            },
            
            getStore: function(){
                if (angular.isUndefined(dataStore[this.storeName])){
                    return null;
                } else {
                    return dataStore[this.storeName];
                }
            },
            
            setData: function(data){
                var store = this.getStore();
                
                if (store && data && typeof(data) === 'object')
                    store.data = data;
            },
            
            getData: function(){
                var store = this.getStore();
                
                if (store){
                    return store.data;
                } else {
                    return {};
                }
            },
            
            hasData: function(){
                var store = this.getStore();
                return (store && !angular.equals(store.data, {}));
            },
            
            changed: function(prm){
                var store = this.getStore();
                
                if (store && typeof(prm) === 'boolean'){
                    store.attr.changed = prm;
                } else {
                    return store.attr.changed;
                }
            },
            
            valid: function(prm){
                var store = this.getStore();
                
                if (store && typeof(prm) === 'boolean'){
                    store.attr.valid = prm;
                } else {
                    return store.attr.valid;
                }
            },
            
            saved: function(prm){
                var store = this.getStore();
                
                if (store && typeof(prm) === 'boolean'){
                    store.attr.saved = prm;
                } else {
                    return store.attr.saved;
                }
            }
            
        };
        
        return dataModel;
    }
})(window.angular);
/**
 * @name API Service
 * @desc 
 */

(function (angular) {
    'use strict';

    angular
        .module('horisen.data')
        .factory('apiResource', apiResource);
        
    apiResource.$inject = ['$resource'];
    
    function apiResource($resource){
        
        function resourceFactory(url, paramDefaults, actions, optionsDefaults) {
            var baseResource = $resource(url, paramDefaults, actions, optionsDefaults);
            
            function Resource(value) {
                angular.copy(value || {}, this);
            };

            Resource.prototype.toJSON = function () {
                var data = angular.extend({}, this);
                delete data.$promise;
                delete data.$resolved;
                return data;
            };
            
            angular.forEach(baseResource, function (val, key) {
                Resource[key] = function () {
                    return val.apply(baseResource, arguments);
                };

                Resource.prototype['$' + key] = function (params, success, error) {
                    if (angular.isFunction(params)) {
                        error = success;
                        success = params;
                        params = {};
                    }

                    var successResponse = function (responseBody, responseHeaders) {
                        (success || angular.noop)(responseBody, responseHeaders);
                    };

                    var errorResponse = function (responseBody) {
                        (error || angular.noop)(responseBody);
                    };

                    var result = Resource[key].call(this, params, this, successResponse, errorResponse);
                    var response = result.$promise || result;

                    return response;
                };
            });

            Resource.bind = function (additionalParamDefaults) {
                return resourceFactory(url, angular.extend({}, paramDefaults, additionalParamDefaults), actions);
            };

            return Resource;
        }
        
        return resourceFactory;
    }

})(window.angular);
'use strict';

var _ = require('lodash');
var promiseLib;

exports.set = function(promiseLib) {

    if (promiseLib) {
        promiseLib = parsePromiseLib(promiseLib);
    } else {
        // if not ES6
        if (typeof(Promise) === 'undefined') {
            throw new TypeError('Promise library must be specified.');
        }
        promiseLib = parsePromiseLib(Promise);
    }

    return promiseLib;
};

exports.promisify = function(func) {
    // return require('bluebird').promisify(func);
    if (!promiseLib) { promiseLib = parsePromiseLib(Promise); }

    return function () {
        var args = Array.prototype.slice.call(arguments);
        return new Promise(function (resolve, reject) {
            args.push(function (err, res) {
                if (err) { reject(err); }
                else { resolve(res); }
            });
            func.apply(null, args);
        });
    };
};

function parsePromiseLib(promiseLib) {

    if (_.isFunction(promiseLib) || _.isObject(promiseLib)) {
        var root = promiseLib.Promise instanceof Function ? promiseLib.Promise : promiseLib,
            methods = ['resolve', 'reject', 'all'],
            success = true;

        var promise = function(func) {
            return new root(func);
        };

        _.forEach(methods, function(method) {
            promise[method] = root[method];
            success = success && root[method] instanceof Function;
        });

        if (success) {
            return promise;
        }
    } else {
        throw new TypeError('Invalid promise library specified.')
    }
}

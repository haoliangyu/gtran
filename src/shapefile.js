'use strict';

var promiseLib = require('./promise.js');
var _ = require('lodash');
var fs = require('fs');
var Promise, readShp, createShp, writeFile;

exports.setPromiseLib = setPromiseLib;

exports.toGeoJson = function(fileName, options) {
    if (!Promise) { setPromiseLib(); }

    var promise = new Promise(function(resolve, rejiect) {
        if(!fs.statSync(fileName)) { reject('Given shapefile does not exist.'); }

        var fileNameWithoutExt = fileName;
        if(_.endsWith(fileNameWithoutExt, '.shp')) {
            fileNameWithoutExt = fileNameWithoutExt.replace('.shp', '');
        }

        return readShp(fileNameWithoutExt).then(function(err, geojson) {
            if(err) { reject(err); }

            resolve(geojson);
        })
    });

    return promise;
};

exports.fromGeoJson = function(geojson, fileName, options) {
    if (!Promise) { setPromiseLib(); }

    var promise = new Promise(function(resolve, reject) {
        try {
            var geoms = [];
            var properties = [];
            geojson.features.forEach(function(feature) {
                geoms.push(feature.geometry.coordinates);

                for (var key in feature.properties) {
                    if (feature.properties.hasOwnProperty(key) &&
                        (feature.properties[key] === null ||
                        feature.properties[key] === '' ||
                        feature.properties[key] === undefined)) {
                        feature.properties[key] = ' ';
                    }
                }
                properties.push(feature.properties);
            });

            var geomType;
            switch(geojson.features[0].geometry['type'].toUpperCase()) {
                case 'POINT':
                case 'MULTIPOINT':
                    geomType = 'POINT';
                    break;
                case 'POLYLINE':
                case 'MULTIPOLYLINE':
                    geomType = 'POLYLINE';
                    break;
                case 'POLYGON':
                case 'MULTIPOLYGON':
                    geomType = 'POLYGON';
                    break;
                default:
                    reject('Given geometry type is not supported');
            }

            return createShp(properties, geomType, geoms)
                   .then(function(files) {
                        if (fileName) {
                            var fileNameWithoutExt = fileName;
                            if(_.endsWith(fileNameWithoutExt, '.shp')) {
                                fileNameWithoutExt = fileNameWithoutExt.replace('.shp', '');
                            }

                            var writeTasks = [
                                writeFile(fileNameWithoutExt + '.shp', toBuffer(files.shp.buffer)),
                                writeFile(fileNameWithoutExt + '.shx', toBuffer(files.shx.buffer)),
                                writeFile(fileNameWithoutExt + '.dbf', toBuffer(files.dbf.buffer))
                            ];

                            return Promise.all(writeTasks)
                                .then(function() {
                                    resolve([
                                        fileNameWithoutExt + '.shp',
                                        fileNameWithoutExt + '.shx',
                                        fileNameWithoutExt + '.dbf'
                                    ]);
                                });
                        } else {
                            resolve([
                                { data: toBuffer(files.shp.buffer), format: 'shp' },
                                { data: toBuffer(files.shx.buffer), format: 'shx'},
                                { data: toBuffer(files.dbf.buffer), format: 'dbf'}
                            ]);
                        }
                   });

        } catch(ex) {
            reject(ex);
        }
    });

    return promise;
}

function toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength),
        view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) { buffer[i] = view[i]; }
    return buffer;
}

function setPromiseLib(lib) {
    Promise = promiseLib.set(lib);
    readShp = promiseLib.promisify(require('shapefile').read);
    createShp = promiseLib.promisify(require('shp-write').write);
    writeFile = promiseLib.promisify(fs.writeFile);
}

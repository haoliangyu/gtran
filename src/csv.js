'use strict';

var promiseLib = require('./promise.js');
var fs = require('fs');
var csvParser = require('csv-parse');
var _ = require('lodash');

var Promise, writeFile, fileStat;

exports.setPromiseLib = setPromiseLib;

exports.fromGeoJson = function(geojson, fileName, options) {
    if (!Promise) { setPromiseLib(); }

    if(geojson.features.length == 0) {
        return Promise.reject('No feautre is found at the input geojson.')
    }

    var promise = new Promise(function(resolve, reject) {
        // get headers and I assume all features have the same attribute definition
        var attributeNames = _.keys(geojson.features[0].properties);

        // write csv file
        var csvData = [];
        csvData.push(attributeNames.join(',') + ',x,y/n');

        _.forEach(geojson.features, function(feature) {
            if(feature.geometry.type !== 'POINT') { return; }

            var attributes = [];
            _.forEach(attributeNames, function(name) {
                attributes.push((feature.properties[name].toString()));
            });

            attributes.push(feature.geometry.coordinates[0].toString());
            attributes.push(feature.geometry.coordinates[1].toString());

            csvData.push(attributes)
        });

        csvData = csvData.join('\n');

        if(fileName) {
            var fileNameWithExt = fileName;
            if(!_.endsWith(fileNameWithExt, '.csv')) { fileNameWithExt += '.csv'; }

            writeFile(fileNameWithExt, csvData);
            resolve(fileNameWithExt);
        } else {
            resolve({ data: csvData, format: 'csv' });
        }
    });

    return promise;
};

exports.toGeoJson = function(fileName, options) {
    if (!Promise) { setPromiseLib(); }

    var promise = new Promise(function(resolve, reject) {
        if(!_.has(options, 'projection.x') || !_.has(options, 'projection.y')) {
            reject('Coordinate columns are not specified.');
        }

        if(!fs.statSync(fileName)) {
            reject('Given csv file does not exist.');
        }

        var geojson = {
                type: 'FeatureCollection',
                features: []
            };

        var parser = csvParser({
                columns: true,
                auto_parse: true,
                skip_empty_lines: true
            }, function(err, data) {
                if(err) { reject(err); }

                _.forEach(data, function(line) {
                    var feature = {
                        type: 'Feature',
                        properties: line,
                        geometry: {
                            type: 'POINT',
                            coordinates: [line[options.projection.x],
                                          line[options.projection.y]]
                        }
                    };
                    geojson.features.push(feature);
                });

                resolve(geojson);
            });

        fs.createReadStream(fileName, {}).pipe(parser);
    });

    return promise;
}

function setPromiseLib(lib) {
    Promise = promiseLib.set(lib);
    writeFile = promiseLib.promisify(fs.writeFile);
    fileStat = promiseLib.promisify(fs.statSync);
}

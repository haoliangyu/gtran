var Promise = require('bluebird');
var fs = require('fs');
var csv = require('csv');
var _ = require('lodash');

var writeFile = Promise.promisify(fs.writeFile);
var readFile = Promise.promisify(fs.createReadStream);
var fileExists = Promise.promisify(fs.exists);

exports.fromGeoJson = function(geojson, options) {
    if(geojson.features.length == 0) {
        return Promise.reject('No feautre is found at the input geojson.')
    }

    var promise = new Promise(function(resolve, reject) {
        // get headers and I assume all features have the same attribute definition
        var attributeNames = _.keys(geojson.features[0].properties);

        // write csv file
        var csv = [];
        csv.push(attributeNames.join(',') + ',x,y/n');

        _.forEach(geojson.features, function(feature) {
            if(feature.geometry.type !== 'POINT') { return; }

            var attributes = [];
            _.forEach(attributeNames, function(name) {
                attributes.push((feature.properties[name].toString()));
            });

            attributes.push(feature.geometry.coordinates[0].toString());
            attributes.push(feature.geometry.coordinates[1].toString());

            csv.push(attributes)
        });

        csv = csv.join('\n');

        if(_.has(options, 'fileName')) {
            var fileNameWithExt = options.fileName;
            if(!_.endsWith(fileNameWithExt, '.csv')) { fileNameWithExt += '.csv'; }

            writeFile(fileNameWithExt, csv);
            resolve(fileNameWithExt);
        } else {
            resolve({ data: csv, format: 'csv' });
        }
    });

    return promise;
};

exports.toGeoJson = function(fileName, options) {
    if(!_.has(options, 'projection.x') || !_.has(options, 'projection.y')) {
        return Promise.reject('Coordinate columns are not specified.');
    }

    return fileExists(fileName)
        .then(function(exists) {
            if(!exists) {
                return Promise.reject('Input csv file does not exist.')
            }

            return readFile(fileName);
        })
        .then(function(dataStream) {
            var headerNames = [],
                geojson = {
                    type: 'FeatureCollection',
                    features: []
                },
                xIndex, yIndex;

            csv()
            .from.stream(dataStream)
            .on('record', function(row, index){
                if(index == 0) {
                    Array.prototype.push.apply(headerNames, row);

                    xIndex = _.indexOf(headerNames, options.projection.x);
                    yIndex = _.indexOf(headerNames, options.projection.y);
                    if(xIndex == -1 || yIndex == -1) {
                           return Promise.reject('Coordinate column is not found.');
                       }
                }

                var feature = {
                    type: 'Feature',
                    properties: [],
                    geometry: {
                        type: 'POINT',
                        coordinates: [parseFloat(row[xIndex]), parseFloat(row[yIndex])]
                    }
                };

                _.forEach(function(column, index) {
                    feature.properties[headerNames[index]] = row[index];
                });

                geojson.features.push(feature);
            })
            .on('end', function(count){
                return Promise.resolve(geojson);
            })
            .on('error', function(error){
                return Promise.reject(error.message);
            });
        });
}

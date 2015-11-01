var Promise = require('bluebird');
var fs = require('fs');
var csv = require('csv');
var _ = require('lodash');

var writeFile = Promise.promisify(fs.writeFile);
var fileStat = Promise.promisify(fs.statSync);

exports.fromGeoJson = function(geojson, fileName, options) {
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

    var promise = new Promise(function(resolve, reject) {
        if(!_.has(options, 'projection.x') || !_.has(options, 'projection.y')) {
            reject('Coordinate columns are not specified.');
        }

        if(!fs.statSync(fileName)) {
            reject('Input csv file does not exist.');
        }

        var geojson = {
                type: 'FeatureCollection',
                features: []
            };

        var parser = csv.parse({
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
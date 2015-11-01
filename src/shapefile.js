var Promise = require('bluebird');
var _ = require('lodash');

var writeShp = Promise.promisify(require('shp-write').write);
var writeFile = Promise.promisify(require('fs').writeFile);

exports.toGeoJson = function(fileName) {

};

exports.fromGeoJson = function(geojson, fileName, options) {

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

            return writeShp(properties, geomType, geoms)
                   .then(function(files) {
                        if (fileName) {
                            var fileNameWithoutExt = fileName;
                            if(_.endsWith(fileNameWithoutExt, '.shp')) {
                                fileNameWithoutExt = fileNameWithoutExt.replace('.shp', '');
                            }

                            writeTasks = [
                                writeFile(fileNameWithoutExt + '.shp', toBuffer(files.shp.buffer))
                                .then(function() { Promise.resolve(fileNameWithoutExt + '.shp'); }),
                                writeFile(fileNameWithoutExt + '.shx', toBuffer(files.shx.buffer))
                                .then(function() { Promise.resolve(fileNameWithoutExt + '.shx'); }),
                                writeFile(fileNameWithoutExt + '.dbf', toBuffer(files.dbf.buffer))
                                .then(function() { Promise.resolve(fileNameWithoutExt + '.dbf'); })
                            ];

                            return Promise.all(writeTasks);
                        } else {
                            Promise.resolve([
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

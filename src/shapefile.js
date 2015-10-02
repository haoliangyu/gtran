var Promise = require('promise');

var writeShp = Promise.denodeify(require('shp-write').write);
var writeFile = Promise.denodeify(require('fs').writeFile);

exports.toShp = function(geojson, fileName) {

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
                case 'MULTIPOLYLINE'
                    geomType = 'POLYLINE'
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
                        if (fileName !== undefined) {
                            writeTasks = [
                                writeFile(fileName + '.shp', toBuffer(files.shp.buffer)),
                                writeFile(fileName + '.shx', toBuffer(files.shx.buffer)),
                                writeFile(fileName + '.dbf', toBuffer(files.dbf.buffer))
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
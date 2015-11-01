var Promise = require("bluebird");
var tokml = require('tokml');
var path = require('path');
var _ = require('lodash');

var writeFile = Promise.promisify(require('fs').writeFile);

// When converting kml to geojson, properties are not guarrented.
// For now only the geometry will be captured.
exports.toGeoJson = function(fileName) {

};

exports.fromGeoJson = function(geojson, options) {

    var promise = new Promise(function(resolve, reject) {
        try {
            var kmlGeoJson = JSON.parse(JSON.stringify(geojson));

            for(var feature in kmlGeoJson.feature) {
                var description = '';
                for(var key in feature.properties) {
                    description += key + '=' + feature.properties[key] + '\n';
                }
                feature.kmlDescription = description;
            }

            var kmlContent = tokml(kmlGeoJson, {
                name: 'Name',
                description: 'kmlDescription'
            });

            if(_.has(options, 'fileName')) {
                var fileNameWithExt = options.fileName;
                if(!_.endsWith(fileNameWithExt, '.kml')) { fileNameWithExt += '.kml'; }

                writeFile(fileNameWithExt, kmlContent);
                resolve(fileNameWithExt);
            } else {
                resolve({
                    data: kmlContent,
                    format: 'kml'
                });
            }
        } catch(ex) {
            reject(ex);
        }
    });

    return promise;
};

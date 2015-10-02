var Promise = require('promise');
var tokml = require('tokml');
var path = require('path');
var JSZip = require('jszip');

var writeFile = Promise.denodeify(require('fs').writeFile);

exports.toKml = function(geojson, fileName) {

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

            if(fileName) {
                return writeFile(fileName + '.kml', kmlContent);
            } else {
                return Promise.resolve({
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

exports.toKmz = function(geojson, fileName) {
    return exports.toKml(geojson)
           .then(function(result) {
                var zip = new JSZip();
                zip.file('doc.kml', result.data);

                var buffer = zip.generate({type:"nodebuffer"});
                if(fileName) {
                    return writeFile(fileName + '.kmz', buffer);
                } else {
                    return Promise.resolve(buffer);
                }
           });
};
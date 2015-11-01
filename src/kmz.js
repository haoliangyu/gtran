var JSZip = require('jszip');
var kml = require('./kml.js');
var _ = require('lodash');
var Promise = require('bluebird');

var writeFile = Promise.promisify(require('fs').writeFile);

exports.fromGeoJson = function(geojson, fileName, options) {
    return kml.fromGeoJson(geojson).then(function(file) {
        var zip = new JSZip();
        zip.file('doc.kml', file.data);

        var buffer = zip.generate({type:"nodebuffer"});
        if(fileName) {
            var fileNameWithExt = fileName;
            if(!_.endsWith(fileNameWithExt, '.kmz')) { fileNameWithExt += '.kmz'; }

            writeFile(fileNameWithExt, buffer);
            return Promise.resolve(fileNameWithExt);
        } else {
            return Promise.resolve({
                data: buffer,
                format: 'kmz'
            });
        }
    })
};

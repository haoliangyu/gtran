var JSZip = require('jszip');
var kml = require('./kml.js');
var _ = require('lodash');
var Promise = require('bluebird');

var writeFile = Promise.promisify(require('fs').writeFile);

exports.fromGeoJson = function(geojson, options) {
    return kml.fromGeoJson(geojson).then(function(file) {
        var zip = new JSZip();
        zip.file('doc.kml', file.data);

        var buffer = zip.generate({type:"nodebuffer"});
        if(_.has(options, 'fileName')) {
            var fileNameWithExt = options.fileName;
            if(!_.endsWith(fileNameWithExt, '.kmz')) { fileNameWithExt += '.kmz'; }

            writeFile(options.fileName + '.kmz', buffer);
            resolve(fileNameWithExt);
        } else {
            return Promise.resolve({
                data: buffer,
                format: 'kmz'
            });
        }
    })
};

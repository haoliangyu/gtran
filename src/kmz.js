'use strict';

var JSZip = require('jszip');
var kml = require('./kml.js');
var _ = require('lodash');
var promiseLib = require('./promise.js');

var Promise, writeFile;

exports.setPromiseLib = setPromiseLib;

exports.fromGeoJson = function(geojson, fileName, options) {
    if (!Promise) { setPromiseLib(); }

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

function setPromiseLib(lib) {
    Promise = promiseLib.set(lib);
    writeFile = promiseLib.promisify(require('fs').writeFile);

    kml.setPromiseLib(lib);
}

var shapefile = require('gtran-shapefile');
var kml = require('gtran-kml');
var kmz = require('gtran-kmz');
var csv = require('gtran-csv');
var topo = require('gtran-topojson');

// specify promise lib
exports.setPromiseLib = function(promiseLib) {
  shapefile.setPromiseLib(promiseLib);
  kml.setPromiseLib(promiseLib);
  kmz.setPromiseLib(promiseLib);
  csv.setPromiseLib(promiseLib);
  topo.setPromiseLib(promiseLib);
};

// Shapefile Import/Export
exports.toShp = shapefile.fromGeoJson;
exports.fromShp = shapefile.toGeoJson;

// KML Import/Export
exports.toKml = kml.fromGeoJson;
exports.fromKml = kml.toGeoJson;

// KMZ Export
exports.toKmz = kmz.fromGeoJson;

// CSV Import/Export
exports.toCSV = csv.fromGeoJson;
exports.fromCSV = csv.toGeoJson;

// Topojson Export
exports.toTopo = topo.fromGeoJson;

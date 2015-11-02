var gpipe = require('../src/gpipe.js');
var fs = require('fs');
var logger = require('log4js').getLogger();

var chai = require('chai');
var expect = chai.expect;

describe('KML module', function() {

    var saveName = 'test.kml';

    var kmlData = 'test/data/test.kml';

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"POINT","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': { 'id': 1 }
        }]
    };

    it('should save the geojson as a KML file.', function() {
        gpipe.toKml(geojson, saveName).then(function(file) {
            expect(file).to.be.equal(saveName);

            if(fs.statSync(saveName)) { fs.unlinkSync(saveName); }
        })
        .catch(function(err) {
            logger.error(err);
        });
    });

    it('should load the kml file and convert it into a geojson.', function() {
        gpipe.fromKml(kmlData).then(function(geojson) {
            expect(geojson.features.length).to.be.equal(4);
        })
        .catch(function(err) {
            logger.error(err);
        });
    });

});

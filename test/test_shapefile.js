var gpipe = require('../src/gpipe.js');
var _ = require('lodash');
var fs = require('fs');
var logger = require('log4js').getLogger();

var chai = require('chai');
var expect = chai.expect;

describe('Shapefile module', function() {

    var saveName = 'test.shp';

    var testData = 'test/data/test_POINT.shp';

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"POINT","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': { 'id': 1 }
        }]
    };

    it('should save the geojson as a shapefile', function() {
        gpipe.toShp(geojson, saveName).then(function(files) {
            expect(files.length).to.be.equal(3);

            _.forEach(files, function(file) {
                if(fs.statSync(file)) { fs.unlinkSync(file); }
            });
        })
        .catch(function(err) {
            logger.error(err);
        });
    })

    it('should read the shapefile and return a geojson', function() {
        gpipe.fromShp(testData).then(function(geojson) {
            expect(geojson.features.length).to.be.equal(1);
            expect(geojson.features[0].properties).to.have.property('id');
            expect(geojson.features[0].properties.id).to.be.equal(1);
        })
        .catch(function(err) {
            logger.error(err);
        });
    });

});

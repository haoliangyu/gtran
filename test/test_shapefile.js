var gpipe = require('../src/gpipe.js');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should;

describe('Shapefile module', function() {

    var saveName = 'test.shp';

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
        });
    })

});

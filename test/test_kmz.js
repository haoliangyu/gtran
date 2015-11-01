var gpipe = require('../src/gpipe.js');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should;

describe('KMZ module', function() {

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"Point","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': { 'id': 1 }
        }]
    };

    it('should save the geojson as a KMZ', function() {
        gpipe.toKmz(geojson).then(function(file) {
            expect(file.data).to.be.not.equal(undefined);
        });
    });

});

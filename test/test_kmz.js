var gpipe = require('../src/gpipe.js');
var fs = require('fs');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should;

describe('KMZ module', function() {

    var saveName = 'test.kmz';

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"POINT","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': { 'id': 1 }
        }]
    };

    it('should save the geojson as a KMZ', function() {
        gpipe.toKmz(geojson, saveName).then(function(file) {
            expect(file).to.be.equal(saveName);

            if(fs.statSync(saveName)) { fs.unlinkSync(saveName); }
        });
    });

});

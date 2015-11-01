var gpipe = require('../src/gpipe.js');
var fs = require('fs');
var Promise = require('bluebird');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should;

var fileStat = Promise.promisify(fs.stat);

describe('CSV module', function() {

    var saveName = 'test.csv';

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"POINT","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': { 'id': 1 }
        }]
    };

    it('should save the geojson as a csv', function() {
        gpipe.toCSV(geojson, {
            fileName: saveName
        })
        .then(function(filePath) {
            return fileStat(filePath);
        })
        .then(function(stat) {
            expect(stat).to.exist;

            if(stat) {
                fs.unlinkSync(saveName);
            }
        });
    });


});

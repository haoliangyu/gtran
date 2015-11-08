var gtran = require('../src/gtran.js');
var fs = require('fs');
var Promise = require('bluebird');
var logger = require('log4js').getLogger();

var chai = require('chai');
var expect = chai.expect;

var fileWrite = Promise.promisify(fs.writeFile);

describe('CSV module', function() {

    var saveName = 'test.csv';

    var csvData = 'ID,X,Y\n1,-78,65\n1,-78,66\n';

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"POINT","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': { 'id': 1 }
        }]
    };

    it('should save the geojson as a csv file with bluebird', function() {
        gtran.setPromiseLib(require('bluebird'));
        gtran.toCSV(geojson, saveName)
        .then(function(filePath) {
            var stat = fs.statSync(filePath);
            expect(stat).to.exist;

            if(stat) { fs.unlinkSync(saveName); }
        })
        .catch(function(err) {
            logger.error(err);
        });
    });

    it('should load the csv file and convert it into a geojson', function() {
        // Create csv file first
        fileWrite(saveName, csvData)
        .then(function() {
            return gtran.fromCSV(saveName, { projection: { x: 'X', y: 'Y' }});
        })
        .then(function(geojson) {
            expect(geojson).to.exist;
            expect(geojson.features.length).to.be.equal(2);
        })
        .catch(function(err) {
            logger.error(err);
        })
        .finally(function() {
            if(fs.statSync(saveName)) {
                fs.unlinkSync(saveName);
            }
        });
    });
});

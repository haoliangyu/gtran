var gpipe = require('../src/gpipe.js');
var fs = require('fs');
var Promise = require('bluebird');
var logger = require('log4js').getLogger();

var chai = require('chai');
var expect = chai.expect;
var should = chai.should;

var fileStat = Promise.promisify(fs.stat);
var fileWrite = Promise.promisify(fs.writeFile);

describe('CSV module', function() {

    var saveName = 'test.csv';

    var csvData = 'ID,X,Y\n1,-78,65\n1,-78,66\n'

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"POINT","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': { 'id': 1 }
        }]
    };

    it('should save the geojson as a csv file', function() {
        gpipe.toCSV(geojson, { fileName: saveName })
        .then(function(filePath) {
            return fileStat(filePath);
        })
        .then(function(stat) {
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
            return gpipe.fromCSV(saveName, { projection: { x: 'X', y: 'Y' }});
        })
        .then(function(geojson) {
            expect(geojson).to.exist;
            expect(geojson.features.length).to.be.equal(2);
        })
        .catch(function(err) {
            logger.error(err);
        })
        .finally(function() {
            fileStat(saveName).then(function(stat) {
                if(stat) { fs.unlinkSync(saveName); }
            });
        });
    });
});

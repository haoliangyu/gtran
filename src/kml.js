var Promise = require("bluebird");
var tokml = require('tokml');
var _ = require('lodash');
var fs = require('fs');
var et = require('elementtree');

var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);

exports.toGeoJson = function(fileName, options) {
    var promise = new Promise(function(resolve, reject) {
        if(!fs.statSync(fileName)) { reject('Give KML file does not exist.'); }

        var encoding = 'utf-8';
        if(_.has(options, 'encoding')) { encoding = options.encoding; }

        return readFile(fileName, encoding).then(function(data) {
            var etree = et.parse(data),
                geojson = {
                    'type': 'FeatureCollection',
                    'features': []
                };

            var schemas = findSchemas(etree);
            var placemarks = etree.findall('.//Placemark');
            _.forEach(placemarks, function(placemark) {
                geojson.features.push({
                    type: 'feature',
                    geometry: getGeometry(placemark),
                    properties: getProperties(placemark, schemas)
                });
            });

            resolve(geojson);
        });
    });

    return promise;
};

exports.fromGeoJson = function(geojson, fileName, options) {

    var promise = new Promise(function(resolve, reject) {
        try {
            var kmlGeoJson = JSON.parse(JSON.stringify(geojson));

            for(var feature in kmlGeoJson.feature) {
                var description = '';
                for(var key in feature.properties) {
                    description += key + '=' + feature.properties[key] + '\n';
                }
                feature.kmlDescription = description;
            }

            var kmlContent = tokml(kmlGeoJson, {
                name: 'Name',
                description: 'kmlDescription'
            });

            if(fileName) {
                var fileNameWithExt = fileName;
                if(!_.endsWith(fileNameWithExt, '.kml')) { fileNameWithExt += '.kml'; }

                writeFile(fileNameWithExt, kmlContent);
                resolve(fileNameWithExt);
            } else {
                resolve({
                    data: kmlContent,
                    format: 'kml'
                });
            }
        } catch(ex) {
            reject(ex);
        }
    });

    return promise;
};

function getGeometry(placemark) {
    var geomTag = placemark.find('./Point');
    if(geomTag) {
        return createGeometry('POINT', geomTag.findtext('./coordinates'));
    }

    geomTag = placemark.find('./LineString');
    if(geomTag) {
        return createGeometry('POLYLINE', geomTag.findtext('./coordinates'));
    }

    geomTag = placemark.find('./Polygon');
    if(geomTag) {
        var outRingCoors = geomTag.findtext('./outerBoundaryIs/LinearRing/coordinates');
        var inRingsCoors = _.map(geomTag.findall('./innerBoundaryIs/LinearRing/coordinates'),
                                function(innerRing) {
                                    return innerRing.text;
                                })

        return createGeometry('POLYGON', outRingCoors, inRingsCoors);
    }
}

function createGeometry(geomType, outerCoorStr, innerCoorStr) {
    return {
        type: geomType,
        coordinates: getCoordinates(outerCoorStr, innerCoorStr);
    };
}

function getCoordinates(outCoorsdStr, inCoordsStrs) {
    var pointStrs = outCoorsdStr.split(' ');

    if (pointStrs.length == 1) {
        var coors = pointStrs[0].split(',');
        return [parseFloat(coors[0]), parseFloat(coors[1])];
    } else {
         var outPoints = [];
        _.forEach(pointStrs, function(pointStr) {
            var coors = pointStr.split(',');
            outPoints.push([parseFloat(coors[0]), parseFloat(coors[1])]);
        });

        if (!inCoordsStrs) { return outPoints; }

        var allPoints = [outPoints];
        _.forEach(inCoordsStrs, function (coordsStr) {
            var inPoints = [],
                pointStrs = coordsStr.split(' ');

            _.forEach(pointStrs, function(coordsStr) {
                var coors = coordsStr.split(',');
                inPoints.push([parseFloat(coors[0]), parseFloat(coors[1])]);
            });

            allPoints.push(inPoints);
        });

        return allPoints;
    }
}

function findSchemas(rootnode) {
    var schemaNodes = rootnode.findall('./kml/Document/Schema');

    // considering if we have more than one schema
    if(schemaNodes.length > 0) {
        var schemas = {};
        _.forEach(schemaNodes, function(schemaNode) {
            var schema = {};

            // get the type of field
            _.forEach(schemaNode.findall('./SimpleField'), function(fieldNode) {
                schema[fieldNode.attrib.name] = fieldNode.attrib.type;
            });

            schemas[schemaNode.attrib.id] = schema;
        });

        return schemas;
    }
}

function getProperties(placemark, schemas) {
    var properties = {};

    // name
    var name = placemark.findtext('./name');
    if(name) { properties.name = name; }

    // description
    var description = placemark.findtext('./description');
    if(description) { properties.description = description; }

    // schema data
    if(schemas) {
        var schemaDatasets = placemark.findall('./ExtendedData/SchemaData');
        _.forEach(schemaDatasets, function(schemaDataset) {
            var schema = schemas[schemaDataset.attrib.schemaURl.replace('#', '')],
                fields = schemaDataset.findall('./SimpleData');
            _.forEach(fields, function(field) {
                properties[field.attrib.name] = convert(field.text, schema[field.attrib.name];)
            });
        });
    }

    // simple data
    var fields = placemark.findall('./ExtendedData/Data');
    _.forEach(fields, function(field) {
        properties[field.attrib.name] = field.findtext('./value');
    });

    return properties;
}

function convert(value, toType) {
    switch(toType) {
        case 'int':
        case 'uint':
        case 'short':
        case 'ushort'
            return parseInt(value);
        case 'float':
        case 'double':
            return parseFloat(value);
        case 'bool':
            return value.toLowerCase() === 'true';
        default:
            return value;
    };
}

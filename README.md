# gpipe

Handling geospatial data formats is trivial? Try gpipe!

**gpipe** is a package that trying to make the geospatial data read/write simple and manageable.

## Feature

* **Multi-format support** - One package for all formats.

* **Simple functions** - Only two categories of functions: from() and to().

* **Promised** - gpipe is promised by bluebird and it is happy to adapt to your choice of promise library.

* **GeoJson input/output** - Get the GeoJson from file and turn it into whatever you want.

## Supported Formats

* CSV (point data only)

* KML

* KMZ (write only)

* Shapefile

## Function

gpipe provides two basic categories of function: from[format]() and to[format]().

* **from\[formatName\](fileName [, options])**

    Read the geospatial data file and return a GeoJson object.

* **to\[formatName\](geojson, fileName [,options])**

    Write the GeoJson object into a data file with given path and format. If the fileName is not given, it returns file data ready for transfer or writting.

A full list of available functions:

* **.fromCSV(fileName, options)** - Columns projection is required. Please see the sample.

* **.toCSV(geojson, fileName)**

* **.fromKML(fileName)**

* **.toKML(geojson, fileName)**

* **.toKMZ(geojson, fileName)**

* **.fromShp(fileName)**

* **.toShp(geojson, fileName)**

## Sample

```
var gpipe = require('gpipe'),
    geojson;

# Shapefile
gpipe.fromShp('tes.shp')
.then(function(object) {
    geojson = object;
});

gpipe.toShp(geojson, 'save.shp')
.then(function(fileNames) {
    console.log('SHP files have been saved at:' + fileNames.toString());
});

# CSV
# If the test.csv has two columns: latitude and longitude
gpipe.fromCSV('test.csv', {
    projection: { x: longitude, y: latitude }
})
.then(function(object) {
    geojson = object;
});
```

## Dependency

This package is powered by theses awesome packages

* [csv-parse](https://github.com/wdavidw/node-csv-parse)

* [shapefile](https://github.com/mbostock/shapefile)

* [shp-write](https://github.com/mapbox/shp-write)

* [tokml](https://github.com/mapbox/tokml)

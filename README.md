# 👾 XYZ Space Invader 👾

XYZ Space Invader is a [HERE XYZ](https://here.xyz) Space and tag visualization and exploration tool. It lets you slice and dice data in an XYZ Space so you can figure out what's going on in your geodata, and quickly make a nice looking map that you can share with your friends.

It can be invoked from the [HERE CLI](https://www.here.xyz/cli/) using `here xyz show SPACEID -v`. The URL maintains the current view state, making it easy to share your map.

It uses [tangram.js](https://github.com/tangrams/tangram) to display, filter, and analyze XYZ spaces, large or small. You can list tags in use, filter by them, and analyze features by property value. Have 100 million features? You can use tags to pull out and view specific data so your laptop fan doesn't get sad. 

## Keyboard Shortcuts

### Hide and show
- `b`: toggle building visibility
- `r`: toggle road visibility
- `w`: move polygons below water

### Bigger and smaller
- `l`: adjust size of lines
- `p`: adjust size of points

### Multiple basemaps
- `m`: change the basemap

#### Adjust colors
- `o`: add outlines to polygons
- `c`: use random colors

These shortcuts can also be accessed by clicking the labels in the main info pane on the top left. Your selections will be saved in the URL query, making it easy to share your map view.

## XYZ Tags

Tags are a powerful feature of XYZ Spaces, and are especially useful with large datasets or complex spaces. XYZ Space Invader keeps tracks of and counts all tags seen in vector tiles using the tangram.js [queryFeatures](https://tangrams.readthedocs.io/en/latest/API-Reference/Javascript-API/#queryfeatures) API.

## Property Analysis

Click on a GeoJSON property to get a count and range of values in the viewport, and generate unique colors, or color ranges for values.

## Local installation

- the first time: `npm install`
- then `npm start` afterwards

Netlify will automatically generate this if you make a branch in this repo.

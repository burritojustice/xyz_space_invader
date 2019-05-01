# 👾 XYZ Space Invader 👾

XYZ Space Invader is a XYZ Space and tag visualization and exploration tool. It lets you slice and dice data in an XYZ Space.

It uses [tangram.js](https://github.com/tangrams/tangram) to display, filter, and analyze XYZ spaces, large or small. You can list tags in use, filter by them, and analyze features by property value. 

XYZ Space Invader can be invoked from the HERE CLI using `here xyz show SPACEID -v`. The URL maintains the current view state, making it easy to share your map.

## Keyboard Shortcuts for map state

### Hide and show
- `b`: toggle building visibility
- `r`: toggle road visibility
- `w`: move polygons below water

### Bigger and smaller
- `l`: adjust size of lines
- `p`: adjust size of points

### Multiple basemaps
- `m`: switch the basemap

#### Adjust colors
- `o`: add outlines to polygons
- `c`: use random colors

These shortcuts can also be accessed by clicking the labels in the main info pane on the top left. Your selections will be saved in the URL query, making it easy to share your map view.

## XYZ Tags

Tags are a powerful feature of XYZ Spaces, especially with large datasets. XYZ Space Invader keeps tracks of and counts all tags seen in vector tiles using the tangram.js [queryFeatures](https://tangrams.readthedocs.io/en/latest/API-Reference/Javascript-API/#queryfeatures) API.

## Property Analysis

Click on a GeoJSON property to get a count and unique colors for the range of values in the viewport.

## Installation

XYZ Space Invader uses [Svelte](https://svelte.dev/). If installing locally, you will need to generate the AppUI.js using

`npm build run`

Netlify will automatically generate this if you make a branch in this repo.


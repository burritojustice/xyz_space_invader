# 👾 XYZ Space Invader 👾

XYZ Space Invader is a [HERE XYZ](https://here.xyz) Space and tag visualization and exploration tool. It lets you slice and dice data in an XYZ Space so you can figure out what's going on in your geodata, and quickly make a nice looking map that you can share with your friends.

It can be invoked from the [HERE CLI](https://www.here.xyz/cli/) using `here xyz show SPACEID -v`. The URL maintains the current view state, making it easy to share your map.

It uses [tangram.js](https://github.com/tangrams/tangram) to display, filter, and analyze XYZ spaces, large or small. You can list tags in use, filter by them, and analyze features by property value. Have 100 million features? You can use tags to pull out and view specific data so your laptop fan doesn't get sad. 

There are five ways to color objects in Space Invader:

- by geometry
  - points are red, lines are yellow, polygons purple
- feature hash
  - every feature gets a unique color based on a hash of the entire feature
  - useful for distinguishing adjacent features (especially polygons and points)
  - note that colors may repeat across features
- property hash
  - every unique value of a chosen property gets a different color
  - useful for seeing the distribution of property values
  - note that colors may repeat across features
- value rank
  - features are colored by the frequency of property values across a color palette
  - best for a discrete number of qualitative text values
  - various color palettes can be chosen (including Viris and Colorbrewer) and colors will be unique
  - a list of unique value sorted by count is generated
- value range
  - features are colored by based on their relation to min and max values of features visible in the viewport
  - average and median values are calculated
  - standard deviation and sigmas can be used to generate meaningful color distributuion when outliers are present
  - outliers can be hidden
  - different color palettes can be chosen (including Viris and Colorbrewer)

## Keyboard Shortcuts

### Hide and show
- `b`: toggle building visibility
- `v`: toggle road and road name visibility (v is for "Via")
- `w`: move polygons below or above water
- `n`: toggle place names

### Bigger and smaller
- `l`: adjust size of lines
- `p`: adjust size of points (big, medium, small, smaller)
- `o`: toggle feature outlines (none, grey, white, black)


These shortcuts can also be accessed by clicking the labels in the top left info page. Your selections will be saved in the URL query, making it easy to share your map view.

## XYZ Tags

Tags are a powerful feature of XYZ Spaces, and are especially useful with large datasets or complex spaces. XYZ Space Invader keeps tracks of and counts all tags seen in vector tiles using the tangram.js [queryFeatures](https://tangrams.readthedocs.io/en/latest/API-Reference/Javascript-API/#queryfeatures) API.

## Multiple basemaps

20 different basemaps are available, depending on your dataviz needs

## Local installation

- the first time: `npm install`
- then `npm start` afterwards

Netlify will automatically generate this if you make a branch in this repo.

data.js
	This script contains some code for combining several datasets together. At this moment the script is not used anymore.
	
filter.js
	This script lets you filter out the data entries from a set that you want. You specify which entry names you want to extract, which name to give to the new dataset, and the color to be used to draw the data.
	
groupby.js
	Does almost the same is the filter script, only this one does a sql group by on the X values.

linegraph.js
	This script uses D3.js to draw a linegraph from a dataset.
	
lines.js
	This script is like a controller for all the linegraphs. He holds them, and pushes the changes to a graph.
	
read.js
	This script reads a json file.
var sketch = require('sketch/dom');
var Settings = require('sketch/settings');
var UI = require('sketch/ui');
var document = sketch.Document.getSelectedDocument();
var selection = document.selectedLayers;
var type = selection.layers[0].type;
var parent = selection.layers[0].parent;
var children = selection.layers[0].layers;
var layers = [];
var code = [];

////////////////////////////////////////////////////////////////////////////////

var clipboard = {
	// store the pasetboard object
	pasteBoard: null,

	// save the pasteboard object
	init: function() {
		this.pasteBoard = NSPasteboard.generalPasteboard();
	},
	// set the clipboard to the given text
	set: function(text) {
		if (typeof text === 'undefined') return null;

		if (!this.pasteBoard)
			this.init();

		this.pasteBoard.declareTypes_owner([NSPasteboardTypeString], null);
		this.pasteBoard.setString_forType(text, NSPasteboardTypeString);

		return true;
	},
	// get text from the clipbaoard
	get: function() {
		if (!this.pasteBoard)
			this.init();

		var text = this.pasteBoard.stringForType(NSPasteboardTypeString);

		return text.toString();
	}
};

////////////////////////////////////////////////////////////////////////////////

var onRun = function(context) {
	if (type !== 'Artboard') {
		findParentArtboard();
	}
	orderLayers(context);
};

var findParentArtboard = function(){
	/* Search up the layers until we find the parent artboard */
	while (parent && parent.type !== "Artboard"){
  	parent = parent.parent
	}
	children = parent.layers[0].layers;
}

var orderLayers = function(context){

	if (children.length == 1) {
		children = selection.layers[0].layers[0].layers;
	}

	children.forEach(layer => {
		layers.push(layer);
	});
	layers.sort(function(a, b) {
    return b.frame.y - a.frame.y;
  });
  copyLayers();
}

var copyLayers = function(){

	/* Loop through the layers on the artboard */
	layers.forEach(layer => {
		if (layer.type == 'SymbolInstance') {
			var symbolMaster = document.getSymbolMasterWithID(layer.symbolId);
			var partialName = symbolMaster.name;
			var layerName = partialName + " ";
			var overrides = layer.overrides;

			/* Loop through the overrides of each symbol layer, ignore everything but strings and images */
			  overrides.forEach(override => {
			    if(override.property == "stringValue" || override.property == "image"){
			      var layerID = override.path;
			      if(layerID.includes("/")){
			        var trueID = layerID.split("/")
			        var length = trueID.length - 1
			        trueID = trueID[length]
							/* If a layer is hidden or lock don't add it to the code output */
								if(!document.getLayerWithID(trueID).hidden && !document.getLayerWithID(trueID).locked){
                  var option = document.getLayerWithID(trueID).name.toLowerCase();
                  layerName += option + '="true" ';
                  }
			      }else if(!document.getLayerWithID(override.path).hidden && !document.getLayerWithID(override.path).locked){
			        var option = document.getLayerWithID(override.path).name.toLowerCase();
			        layerName += option + '="true" ';
			      }
			    }
			  })

				/* For section headers get the override value and add it to the partial code to be displayed */
				if(partialName === 'section-header'){
					layerName += 'title_txt="' + overrides[3].value + '" ';
					if(!overrides[1].isDefault){
						layerName += 'description_txt="' + overrides[1].value + '" ';
					}
				}

			layerName = layerName.slice(0, -1)
			layerName = cleanString(layerName)
			code.push('{{> ' + layerName + ' }}');
		}
	});

	var prettyLayers = code.reverse().toString().split(",").join("\n");

	clipboard.set(prettyLayers);
	UI.message('Foundation code copied to clipboard');

};

var cleanString = function(string){
	var uniqueList = string.split(' ').filter(function(item,i,allItems){
    return i == allItems.indexOf(item);
	}).join(' ');
	return uniqueList;
};

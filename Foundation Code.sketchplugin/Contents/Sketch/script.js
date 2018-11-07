var sketch = require('sketch/dom');
var Settings = require('sketch/settings');
var UI = require('sketch/ui');
var document = sketch.Document.getSelectedDocument();
var selection = document.selectedLayers;
var type = selection.layers[0].type;
var parent = selection.layers[0].parent;
var children = parent.layers[0].layers;
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
	while (parent && parent.type !== "Artboard"){
  	parent = parent.parent
	}
	children = parent.layers[0].layers;
}

var orderLayers = function(context){

	if (children.length == 1) {
		children = parent.layers[0].layers[0].layers;
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

	layers.forEach(layer => {
		if (layer.type == 'SymbolInstance') {
			var layerName = layer.name + " ";
			var overrides = layer.overrides

			  overrides.forEach(override => {
			    if(override.property == "stringValue" || override.property == "image"){
			      var layerID = override.path;
			      if(layerID.includes("/")){
			        var trueID = layerID.split("/")
			        var length = trueID.length - 1
			        trueID = trueID[length]
								if(!document.getLayerWithID(trueID).hidden){
                  var option = document.getLayerWithID(trueID).name.toLowerCase();
                  layerName += option + '="true" ';
                  }
			      }else if(!document.getLayerWithID(override.path).hidden){
			        var option = document.getLayerWithID(override.path).name.toLowerCase();
			        layerName += option + '="true" ';
			      }
			    }
			  })

			layerName = layerName.slice(0, -1)
			layerName = cleanString(layerName)
			code.push('{{> ' + layerName + ' }}');
		}
	});

	var prettyLayers = code.reverse().toString().split(",").join("\n");

	clipboard.set(prettyLayers);
	UI.message('Foundation code copied to clipboard');

	//UI.alert('Foundation Code', prettyLayers);

	//log(code);
};

var cleanString = function(string){
	var uniqueList = string.split(' ').filter(function(item,i,allItems){
    return i == allItems.indexOf(item);
	}).join(' ');
	return uniqueList;
};

var sketch = require('sketch/dom');
var Settings = require('sketch/settings');
var UI = require('sketch/ui');
var document = sketch.Document.getSelectedDocument();
var selection = document.selectedLayers;
var type = selection.layers[0].type;
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
		UI.message("Please select the artboard and run this command again");
		return;
	}
	orderLayers(context);
};

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

	layers.forEach(layer => {
		if (layer.type == 'SymbolInstance') {
			var symbolMaster = document.getSymbolMasterWithID(layer.symbolId)
			var layerName = symbolMaster.name;
			var modifiers;
			if (layerName.includes('/')) {
				layerName = layerName.split('/');
				if (layerName[1].includes('+')) {
					modifiers = layerName[1].split('+');
					var modifierString = '';
					for (i = 0; i < modifiers.length; i++) {
						modifierString += modifiers[i] + '="true" ';
					}
				}else{
						modifierString = layerName[1] + '="true" ';
				}

				if (layerName[0] == "section-header") {
					if(layer.overrides.length > 2){
							modifierString += 'description_txt="' + layer.overrides[1].value + '" ';
					}
					modifierString += 'title_txt="' + layer.overrides[0].value + '" ';
				}

				if(layerName[0] == "story-colorblock-text"){
						if(layer.overrides.length > 2){
							modifierString += 'deck_txt="' + layer.overrides[2].value + '" ';
						}
						modifierString += 'title_txt="' + layer.overrides[1].value + '" ';
				}

				if (layerName[0] == "header-horizontal" || layerName[0] == "header-stacked") {
					if(modifiers[1] == 'title'){
							modifierString += 'title_txt="' + layer.overrides[1].value + '" ';
					}
				}
				//log(modifierString);
				layerName = layerName[0] + " " + modifierString;
			}
			//log(layerName);
			code.push('{{> ' + layerName + ' }}');
		}
	});

	var prettyLayers = code.reverse().toString().split(",").join("\n");

	clipboard.set(prettyLayers);
	UI.message('Foundation code copied to clipboard');

	//UI.alert('Foundation Code', prettyLayers);

	//log(code);
};

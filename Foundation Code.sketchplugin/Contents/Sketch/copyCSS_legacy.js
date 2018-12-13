var css = ``;
var count = 0;
var sketch, document, selection;

function onRun(context) {

	sketch = context.api();
	document = sketch.selectedDocument;
	selection = document.selectedLayers;

	selection.iterate(function(layer) {
		processLayerRecursively(layer);
	});

};

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

function processLayerRecursively (layer, parent) {

	var sketchObject = layer.sketchObject;

	if (sketchObject.isVisible() && sketchObject.class() != MSSliceLayer && sketchObject.class() != MSLayerGroup) {

		if (layer.isShape) {
			if (isRectangle(sketchObject) || isCircle(sketchObject)) {
				css += layerWithPropertiesCode(sketchObject);
			} else {
				css += layerCode(sketchObject) + '\n';
			}

		} else if (layer.isText) {
			css += textLayerCode(sketchObject) + '\n';
		} else {
			css += layerCode(sketchObject) + '\n';
		}
	}
	count++;
	if(count == selection.length){
		sketch.message("CSS Properties Copied to Clipboard");
		clipboard.set(css);
	}
};

////////////////////////////////////////////////////////////////////////////////

function layerWithPropertiesCode(layer) {

	if(layer.name() == 'button'){
		var cssCode = 'table.button table td{ \n';
	}else if(layer.name() == "body-bg"){
		var cssCode = 'html, body, table.body{ \n';
	}else if(layer.name() == "header-bg-inverse"){
		var cssCode = 'table.row.header-bg-inverse{ \n';
	}else if(layer.name() == "header-bg"){
		var cssCode = 'table.row.header-bg{ \n';
	}else{
		var cssCode = '.' + layer.name() + '{ \n';
	}

	var fill = topFill(layer.style());
	if (fill == null) {
		cssCode += '  background-color: transparent; \n';
	} else {
		cssCode += '  background-color: ' + hexColor(fill.color()) + '; \n';
	}

	var opacity = layer.style().contextSettings().opacity();
	if (opacity != 1) {
		cssCode += '  opacity: ' + opacity + '; \n';
	}

	cssCode += '} \n';

	return cssCode;
}

//------------------------------------------------------------------------------

function textLayerCode(layer) {

	var cssCode = '.' + layer.name() + '{ \n';

	cssCode += '  font-size: ' + layer.fontSize() + 'px; \n';
	cssCode += '  font-family: "' + layer.font().familyName() + '"; \n';

	var fontStyle = getFontStyle(layer);
	if (fontStyle.slope != "") {
		cssCode += '  font-style: ' + fontStyle.slope + '; \n';
	}

	if (fontStyle.weight != "") {
		cssCode += '  font-weight: ' + fontStyle.weight + '; \n';
	}

	if (layer.lineHeight() != 0) {
		cssCode += '  line-height: ' + layer.lineHeight() + 'px; \n';
	}

	switch (layer.textAlignment()) {
		case 1:
			cssCode += '  text-align: right; \n';
			break;
		case 2:
			cssCode += '  text-align: center; \n';
			break;
		default:
			cssCode += '  text-align: left; \n';
	}

	if (layer.styleAttributes().MSAttributedStringTextTransformAttribute == 1) {
		cssCode += '  text-transform: uppercase; \n';
	}

	if (layer.styleAttributes().MSAttributedStringTextTransformAttribute == 2) {
		cssCode += '  text-transform: lowercase; \n';
	}

	cssCode += '  color: ' + hexColor(layer.textColor()) + ' !important; \n';

	var opacity = layer.style().contextSettings().opacity();
	if (opacity != 1) {
		cssCode += '  opacity: ' + opacity + '; \n';
	}

	cssCode += '} \n';

	return cssCode;
}

//------------------------------------------------------------------------------

function layerCode(layer) {

	var cssCode = '.' + layer.name() + '{ \n';

	var opacity = layer.style().contextSettings().opacity();
	if (opacity != 1) {
		cssCode += '  opacity: ' + opacity + '; \n';
	}

	cssCode += '} \n';

	return cssCode;
}

////////////////////////////////////////////////////////////////////////////////

function topFill(style) {
	var fills = style.enabledFills();

	var i, len, fill = null;
	for (i = 0, len = fills.length; i < len; i++) {
		var fillType = fills[i].fillType();
		if (fillType == 0) {
			fill = fills[i];
		}
	}

	return fill;
}

function topBorder(style) {
	var borders = style.enabledBorders();

	var i, len, border = null;
	for (i = 0, len = borders.length; i < len; i++) {
		var fillType = borders[i].fillType();
		if (fillType == 0) {
			border = borders[i];
		}
	}

	return border;
}

function topShadow(style) {
	var shadows = style.enabledShadows();
	var len = shadows.length;

	if (len == 0) {
		return null;
	} else {
		return shadows[len - 1];
	}
}

////////////////////////////////////////////////////////////////////////////////

function isRectangle(layer) {
	var layerCount = layer.layers().count();
	var layerClass = layer.layers()[0].class();

	if (layerCount == 1 && layerClass == MSRectangleShape) {
		return true;
	} else {
		return false;
	}
}

function isCircle(layer) {
	var layerCount = layer.layers().count();
	var layerClass = layer.layers()[0].class();
	var width = layer.frame().width();
	var height = layer.frame().height();

	if (layerCount == 1 && layerClass == MSOvalShape && width == height) {
		return true;
	} else {
		return false;
	}
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function hexColor(color){
    var red = Math.round(color.red() * 255);
	var green = Math.round(color.green() * 255);
	var blue = Math.round(color.blue() * 255);
    return "#" + componentToHex(red) + componentToHex(green) + componentToHex(blue);
}

function trim(str) {
	return str.replace(/^\s+|\s+$/gm, '');
}

function rgbaToHex(rgba) {
	var parts = rgba.substring(rgba.indexOf("(")).split(","),
		r = parseInt(trim(parts[0].substring(1)), 10),
		g = parseInt(trim(parts[1]), 10),
		b = parseInt(trim(parts[2]), 10),
		a = parseFloat(trim(parts[3].substring(0, parts[3].length - 1))).toFixed(2);

	return ('#' + r.toString(16) + g.toString(16) + b.toString(16) + (a * 255).toString(16).substring(0, 2));
}

function getFontStyle(layer) {

	var fontWeights = {
		"thin": 100,
		"extralight": 200,
		"ultralight": 200,
		"light": 300,
		"book": 400,
		"normal": 400,
		"regular": 400,
		"roman": 400,
		"medium": 500,
		"semibold": 600,
		"demibold": 600,
		"bold": 700,
		"boldmt": 700,
		"psboldmt": 700,
		"extrabold": 800,
		"ultrabold": 800,
		"black": 900,
		"heavy": 900
	};

	var fontFamily = layer.font().familyName().replace(/ /g, "");
	var fontName = layer.fontPostscriptName().replace(/-/g, "");
	var val = fontName.replace(fontFamily, "").toLowerCase();

	var fontWeight = "",
		fontSlope = "";

	if (val.includes("italic")) {
		fontSlope = 'italic';
		val = val.replace("italic", "");
	}

	if (val.includes("oblique")) {
		fontSlope = 'italic';
		val = val.replace("oblique", "");
	}

	if (fontWeights[val] != undefined) {
		fontWeight = fontWeights[val];
	}

	return {
		weight: fontWeight,
		slope: fontSlope
	};
}

////////////////////////////////////////////////////////////////////////////////

function camelize(str) {
	str = str.replace(/-/g, " ");
	str = str.replace(/[^a-zA-Z0-9$_ ]/g, "");
	str = str.trim();
	if (str == "") {
		str = "layer";
	} else if (firstCharIsInvalid(str)) {
		str = "layer_" + str;
	}
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index == 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

function firstCharIsInvalid(str) {
	return str.charAt(0).match(/[^a-z$_]/i);
}

function uniqueLayerName(name) {
	if (layerNames[name] > 0) {
		var count = ++layerNames[name];
		return name + "_" + count;
	} else {
		layerNames[name] = 1;
		return name;
	}
}

function fileNameFromPath(str) {
	return str.split('/').pop().trim();
}

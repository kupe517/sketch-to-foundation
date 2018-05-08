var sketch = context.api();
var document = sketch.selectedDocument
var page = document.selectedPage
var sel = sketch.selectedDocument.selectedLayers;
var layers = [];
var overrides = [];
sel.iterate(function(layer){
    var sublayers = layer.sketchObject.layers();
    for(var i = 0 ; sublayers.length > i ; ++i){

        //overrides.push(sublayers[i].overrides());
        if( !isEmpty(sublayers[i].overrides()) ){
            log(sublayers[i].overrides());
            //var temp = sublayers[i].overrides();
            //log(temp[1]);
            //overrides.push(sublayers[i].overrides());

            //overrides[i] = sublayers[i].overrides() ;

            //var chunks = sublayers[i].overrides().toString().split(" = ");
            //var arr = [chunks.shift(), chunks.join(' ')];
            //var key = arr[0].replace(/ /g, '').replace(/(\r\n|\n|\r)/gm,"").replace(/\\/g, "")
            //var val = arr[1].replace(/(\r\n|\n|\r)/gm,"").replace(/\\/g, "|")
            //log(key + " = " + val)

            //overrides[key] = val ;

        }


        //log(sublayers[i].overrides());
        sublayers[i].overridePoints().forEach(function(overridePoint){
            log(overridePoint.layerName() + " = ");
            //log(overridePoint.isSymbolOverride());
            if( ("Something Special" in overrides) ) {
                log('found');
            }
            //log(overridePoint.layerID() + " = " + overridePoint.layerName())
        });
        if(sublayers[i].name() == 'story-colorblock-text-inverse'){
            layers.push('{{> ' + sublayers[i].name() + ' bg-color="#000000" style="color-block-inverted" }}');
        }else{
            layers.push('{{> ' + sublayers[i].name() + ' }}');
        }
    }
});

//log(overrides.hasOwnProperty('013747C0-354E-443B-A6A4-EBF2E6012DD8'))

log(overrides)

for( var i = 0, len = overrides.length; i < len; i++ ) {
    if( overrides[i][0] === '8B202B77-0728-4BFF-A283-4D93F3EB82D0' ) {
        log('found')
    }
    log(overrides[i][0])
}

var prettyLayers = layers.reverse().toString().split(",").join("\n");

//var artboard = page.newArtboard({name: 'Foundation Code' })

// var layer = page.newText({alignment: NSTextAlignmentLeft, systemFontSize: 36, text: prettyLayers})

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}


var A={b:3,a:undefined}
if(A['a']){
    console.log('A.a');
}
if(A['c']!=undefined){
    console.log(A.c)
}

if("string"==typeof true){console.log("the typeof true is string")}
console.log(JSON.parse('{"yes":true,"ok":"undefined","pos":32,"k":null}'))
var stage=this.stage; 
//val("var jsonObj = " + fileJson);
var jsonObj=JSON.parse(fileJson);
stage.clear();
for (var k in jsonObj)
     "childs" != k && (stage[k] = jsonObj[k]);//set the properties except the scences
var scenes = jsonObj.childs;
var me=this;
scenes.forEach(function(a) {
        var b = new JTopo.Scene(stage);
        for (var c in a)// a is a scene
           "childs" != c && (b[c] = a[c]),
           "background" == c && (b.background = a[c]);
        var d = a.childs;// d is the collection of elements such such as textNode,svgNode and so on
        d.forEach(function(n) {
                               var c = null
                               , t = n.elementType;
                                c=JTopo.createNode(t,n,b);
                               if(c)  b.add(c);
                             })
        me.tabSheetsManager.appendTab(b);                     
                    });
     

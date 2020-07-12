
"use strict"
import {EventDispatcher,CURRENT_SCENE_CHANGE,EditorEvent,CommonUtilities} from './common.js'
import {ToolManager} from './toolManager.js'
import{TabSheetsManager} from './tabsheet.js'
import {SvgService} from './symbols.js'
////////////////function PageFormat()////////////////////////
function PageFormat(){

} 
PageFormat.DefaultPageA4={width:210,height:297,direction:"V",pageUpSpace:20,pageScale:4.44,//DEll 1336*768
                                    pageDownSpace:20,pageLeftSpace:30,pageRightSpace:30,spaceBetweenPages:10};


    
/////////class Page///////////////////////////////////////
class Page{
    
    constructor(editor,sceneName,pageFormat){
        this.editor=editor;
        this.pageFormat=pageFormat;
        this.sceneName=sceneName;
        this.page_id="";
        this.createPage();
        
        this.dpiMm=CommonUtilities.getScrDpiPerMm();
        this.EventDispatcher=new EventDispatcher();
        console.log(this.dpiMm['x']);
        console.log(this.dpiMm['y']);

    }
    createPage(){
   
    var p=this;
    var canvas=this.editor.canvas;
   
    this.pageBoxWidth=this.pageFormat.width*this.pageFormat.pageScale;
    canvas.width=this.pageBoxWidth;
   
    this.pageBoxheight=this.pageFormat.height*this.pageFormat.pageScale;
    canvas.height+=this.pageBoxheight+this.pageFormat.spaceBetweenPages;
    this.totalHeight=canvas.height;
    /*
    var pft=this.pageFormat;
    
    var pageBox=new this.editor.jtopo.DisplayElement();
     pageBox.paint=function(cxt2d){
     cxt2d.lineWidth =1;
     cxt2d.strokeStyle = "#cccccc";//线条的颜色
     cxt2d.strokeRect(1.5,p.totalHeight-p.pageBoxheight-pft.spaceBetweenPages+1.5,
                                                         p.pageBoxWidth-2,p.pageBoxheight);
    
    }
    this.pageBox=pageBox;
    this.editor.scenes[this.sceneName].add(pageBox);
    //this.cx,this.cy;//leftDown coordinates
    this.cx=this.pageFormat.pageLeftSpace*this.pageFormat.pageScale;
    this.cy=this.totalHeight-this.pageFormat.pageDownSpace*this.pageFormat.pageScale;
    this.pageEditRegionWidth=(this.pageFormat.width-this.pageFormat.pageLeftSpace-this.pageFormat.pageRightSpace)*this.pageFormat.pageScale;
    this.pageEditRegionHeight=(this.pageFormat.height-this.pageFormat.pageUpSpace-this.pageFormat.pageDownSpace)*this.pageFormat.pageScale;
    */
    /*
    var editRegion=new this.editor.jtopo.DisplayElement();
    editRegion.paint=function(cxt2d){
        cxt2d.strokeStyle="#dddddd";
        cxt2d.lineWidth=0;
        cxt2d.moveTo(p.cx,p.cy);
        cxt2d.lineTo(p.cx,p.cy-30); 
        cxt2d.moveTo(p.cx,p.cy);
        cxt2d.lineTo(p.cx-30,p.cy);
        
        
        cxt2d.moveTo(p.cx+p.pageEditRegionWidth,p.cy);
        cxt2d.lineTo(p.cx+p.pageEditRegionWidth,p.cy-30) ;
        cxt2d.moveTo(p.cx+p.pageEditRegionWidth,p.cy);
        cxt2d.lineTo(p.cx+p.pageEditRegionWidth+30,p.cy);
        
        cxt2d.moveTo(p.cx+p.pageEditRegionWidth,p.cy-p.pageEditRegionHeight);
        cxt2d.lineTo(p.cx+p.pageEditRegionWidth,p.cy-p.pageEditRegionHeight-30);
        cxt2d.moveTo(p.cx+p.pageEditRegionWidth,p.cy-p.pageEditRegionHeight);
        cxt2d.lineTo(p.cx+p.pageEditRegionWidth+30,p.cy-p.pageEditRegionHeight);
        
        cxt2d.moveTo(p.cx,p.cy-p.pageEditRegionHeight);
        cxt2d.lineTo(p.cx,p.cy-p.pageEditRegionHeight-30);
        cxt2d.moveTo(p.cx,p.cy-p.pageEditRegionHeight);
        cxt2d.lineTo(p.cx-30,p.cy-p.pageEditRegionHeight);
        cxt2d.stroke();
    }
    this.editor.scenes[this.sceneName].add(editRegion);
    this.editRegion=editRegion;*/
   
 }
 setPageDirection(direction){
    //direction:"H"(horizontal) or "V" (vertical )
    if(this.pageFormat.direction==direction) return;
    else this.pageFormat.direction=direction;
    var event={eventname:"pageDirectionChanged",sourceObject:this};
    notify(event,this);

 }
 addeventlistener(listener,eventname,handler){
 this.EventDispatcher.subscrible(listener,eventname,handler);
 }
 notify(event){
    this.EventDispatcher.publish(event);
 }
 
}

//////////////////////class MyEditor////////////////////
class MyEditor{
    addEventListener(listener,eventname,handler){
        this.eventDispatcher.subscrible(listener,eventname,handler)
    }
    dispatchEvent(event){
        this.eventDispatcher.publish(event);  
    }
    initilize(){
      this.pageSizes=[];
      var pageA4={width:210,height:297};
      this.pageSizes['A4']=pageA4; 
      this.pageScale=3; 
      this.pageUpSpace=20;this.pageDownSpace=20;
      this.pageLeftSpace=30;this.pageRightSpace=30;
      this.pageBorderWidth=1;
      this.spaceBetweenPages=50;
      this.pagesCount=new Array();
      
      var sObject = document.getElementById("svgObject");
      $('#svgObject').ready(function() {

        var svgDom = sObject.contentDocument;
        SvgService.setSvgDomDrawFunc(svgDom);
        JTopo.svgDom=svgDom;

    });
      /* sObject.addEventListener("load",function() {
        var svgDom = sObject.contentDocument;
        SvgService.setSvgDomDrawFunc(svgDom);
        JTopo.svgDom=svgDom;})*/

    }
    constructor(workAreaID,jtopo){   
        this.eventDispatcher=new EventDispatcher();
        this.jtopo=jtopo ;
        var canvas=$( " <canvas id='canvas' ></canvas>");
        canvas.addClass("editorCanvas");
        this.canvas=$(canvas)[0]; 
        this.canvas.width=0;this.canvas.height=10;
        this.cxt2d=this.canvas.getContext('2d');
        this.stage=new this.jtopo.Stage(this.canvas);
        this.username="dml";console.log("statement for debug");;
        this.scenes={};
        var workArea=$('#'+workAreaID);
        this.toolManager=new ToolManager(workArea,this);       
        this.tabSheetsManager=new TabSheetsManager(workArea,this);
        var canvasWrapper=$("<div></div>");
        canvasWrapper.addClass("wrapper");
        workArea.append(canvasWrapper);
        canvasWrapper.append(canvas);
        this.createTab("pageScene");
        //this.stage.mode="edit"   ;// you must set stage's mode after scene added        
        this.toolManager.createTools(this.currentScene); 
        this.pages=new Array();//
        this.initilize();
        this.addPage(this,"pageScene",PageFormat.DefaultPageA4);
    }
    setCursor(cursor){
        this.stage.cursor=cursor;
    }
    getCurrentScene(){return this.currentScene;}    
    addPage(editor,sceneName,pageFormat)//pageType:A4,B5,...
    {  
       var page=new Page(editor,sceneName,pageFormat);
       this.pages[page.page_id]=page;
        
    }
    deletePage(page){
        
    }
    addElement(page,ele){
       page.add(ele);
    }
    createScene(tabname){
        let t,ok;
        if(!tabname){//设默认名
            
            for(let k=1;;k++)
            { t=`tab-${k}`;
              ok=true; 
              for(name in this.scenes){
               if(t==name) {ok=false;break;}
              }
              if(ok) {tabname=t;break};
            }
        }
        
        for(name in this.scenes){
            if(tabname==name){ alert(`${tabname}命名冲突`); throw `${tabname}命名冲突`;return false;}
         }
        var scene= new this.jtopo.Scene(); 
        scene.name=tabname;
        this.scenes[tabname]=scene;
        scene.mode="edit";
        return scene;
    }
    setCurrentScene(focusScene){
        for(let s in this.scenes){
            if(this.scenes[s]===focusScene) this.scenes[s].visible=true;
            else this.scenes[s].visible=false;
        };
        var previousScene=this.currentScene;
        this.dispatchEvent(new EditorEvent(this,CURRENT_SCENE_CHANGE,focusScene,previousScene));
        this.currentScene=focusScene;
    }
    createTab(tabname){
        var scene=this.createScene(tabname);
        scene.setEditor(this);
        this.stage.add(scene);
        this.tabSheetsManager.appendTab(scene)

    }
    setStageCursor(cursor){
       this.stage.cursor=cursor;
    }
    removeAllScenes(){
        this.scenes={};
        this.tabSheetsManager.removeAllTabs();
    }
    loadFileFromJson(fileJson){
        this.removeAllScenes();
        var stage=this.stage; 
        stage.clear();
        var jsonObj=JSON.parse(fileJson);
        
        for (var k in jsonObj)
             "childs" != k && (stage[k] = jsonObj[k]);//set the properties except the scences
        var scenes = jsonObj.childs;
        var me=this;
        scenes.forEach(function(a) {
                var b = new JTopo.Scene(stage);
                b.setEditor(me);
                for (var c in a)// a is a scene
                   "childs" != c && (b[c] = a[c]),
                   "background" == c && (b.background = a[c]);
                var d = a.childs;// d is the collection of elements such such as textNode,svgNode and so on
                d.forEach(function(n) {
                                       var c = null
                                       , t = n.elementType;
                                        c=JTopo.createNode(t,n);
                                       if(c)  b.add(c);
                                     })
                me.scenes[b.name]=b;
                me.tabSheetsManager.appendTab(b);                     
                            });
             
       
    }
  

}

export {MyEditor}
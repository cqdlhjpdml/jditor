"use strict"
var NEED_STROKE=true;//if NEED_STROKE==false ,not to strok when draw
const NOTHING=null;
import{Node_PopMenu} from './menu.js'
import{PropPanelFactory} from './ui-property.js'
/////////////////////////
class SvgDrawService{
  static svgMatrixToArray(svgMatrix){
    if(!svgMatrix)return null;
    var ctmArray=[svgMatrix.a,svgMatrix.b,svgMatrix.c,svgMatrix.d,svgMatrix.e,svgMatrix.f]
    return ctmArray;
  }
 
 
  
  /////////////////////////
  static handleCss(svgDom,ele,ctx2d){
    function handleClass(svgDom,classname,ctx2d){
      var css=svgDom.myStyles[classname];
      for(let prop in css){
        switch(prop){
          case "fill":
            ctx2d.fillStyle=css[prop];
          　break;
          case "font-size":
            ctx2d.font=ctx2d.font +' '+css[prop];
            break;
          case "font-family":
            ctx2d.font=ctx2d.font +' '+css[prop];
            break;
            case "stroke":
              let strokeStyle=css[prop].replace(/(^\s*)|(\s*$)/g, "");
              if(strokeStyle!='none') {ctx2d.strokeStyle=strokeStyle;NEED_STROKE=true;}
              else NEED_STROKE=false;
              break;
          default:
            break;

        }
      }

    }
    //---------
    if(!ele.classList) return;
    var clist=ele.classList
    for(let i=0;i<clist.length;i++){
      let classname=clist[i];
      handleClass(svgDom,classname,ctx2d)
    }
       
  }

  ///////////////////////////////////
  static handleAttributes(ele,ctx2d){
     
     var attrs=ele.attributes;
     for( let attr in attrs){
       switch(attrs[attr].name){
         case "font-size":
          ctx2d.font=ctx2d.font +' '+attrs[attr].nodeValue;
          break;
        case "font-family":
          ctx2d.font=ctx2d.font +' '+attrs[attr].nodeValue;
          break;
         case "fill":
          if(attrs[attr].nodeValue!='none')ctx2d.fillStyle=attrs[attr].nodeValue;
          break;
         case "stroke":
          let strokeStyle=attrs[attr].nodeValue.replace(/(^\s*)|(\s*$)/g, "");
          if(strokeStyle!='none') {ctx2d.strokeStyle=strokeStyle;NEED_STROKE=true;}
          else NEED_STROKE=false;
          break;
       }
     }
       
        
  }
  ///////////////////////////////////
  static getTransform(ts){
    var trans=[] ,k=0;
    var ctm;
    var ts=ts.toLowerCase();
     var length=ts.length;
     var state='cmd';
     for(let i=0;i<length||state=='record';i++)
     { 
       switch(state){
         case 'cmd':
          ctm=new Object();
          ctm.command='';
          for(;i<length;i++)
           if(ts.charAt(i)!='(' ){  if(ts.charAt(i)!=' '&&ts.charAt(i)!='\t') ctm.command=ctm.command+ts.charAt(i)}
           else break;
          if(i==length) throw("transform string sytax error! ");
          state='content';
          break;
        case 'content':
          ctm.content='';
          for(;i<length;i++) 
            if(ts.charAt(i)!=')') ctm.content=ctm.content+ts.charAt(i);
            else break;
          state='record';
          break;
        case 'record':
          trans[k++]=ctm;
          state='cmd';
          break;
        default:
          break;    
       }
       //////////////////////
      
     }
 
     return trans;
  } 
  ///////////////////////////////   
  static handlTransforms(transformStr,ctx2d){
      if(!transformStr) return null;
      var trans=SvgDrawService.getTransform(transformStr)
      for(let i=0;i<trans.length;i++){
        var ctmArray=trans[i].content.split(",");
        switch(trans[i].command){
          case "matrix":
            for(let k=0;k<ctmArray.length;k++) ctmArray[k]=parseFloat(ctmArray[k]);
            ctx2d.transform(ctmArray[0],ctmArray[1],ctmArray[2],ctmArray[3],ctmArray[4],ctmArray[5]);
            break;
           case 'translate': 
            var tx=parseFloat(ctmArray[0]);
            var ty=parseFloat(ctmArray[1]);
            ctx2d.translate(tx,ty);
           break;
           default:
             break;
        }
      }
  }
  static transform(point,ctm){
      var x=point.x;
      var y=point.y;
      x=x*ctm[0]+y*ctm[2]+ctm[4];
      y=x*ctm[1]+y*ctm[3]+ctm[5];
      point.x=x;point.y=y;
      return point;
  }
  static getDrawFunc(cmd){
          
          var funcs=new Array();
          funcs['default']=function(){
             // console.log("this element not surpported!")
   
          }
          funcs['path']=function(ctx2d,drawInfos){
            function getdata(){
              var data='';
              var ctrls=['-',',',' ','M','m','V','v','L','l','C','c',
              'S','s','Q','q','T','t','Z','z','H','h','A','a'];
              for(;pos<len;)
              {
                if(ctrls.includes(d[pos])) {
                  switch(d[pos]){
                   case '-' :
                      if(data.length==0) 
                        data=data+d[pos++]; //数字开始的负号
                      else
                       return data;  
                      break;
                    case ',':
                    case ' ':
                      pos++;
                      return data; 
                       
                    default:
                      
                      return data;
                  }
                   
                }
                else
                data=data+d[pos++]; //一位数字
               }
               return data;
            }
            ////////////////////
            let pathCmd='';         
            let pos=0;
            let d=this.getAttribute('d'),len=d.length;
            //"M342.235,274.75c16.542-11.613-9.099-22.903-52.929-15.806 
            //c5.788-12.904-57.895-20.322-77.747-2.582
            //c-4.134-10.322-81.873-8.064-72.774,5.806
            //c-26.468-7.096-71.126,6.775-43.834,20.323 
            //c-27.292,5.161-21.503,22.581,13.229,22.903
            //c-5.785,7.741,14.891,18.063,59.549,11.29
            //c0,5.482,35.563,20.967,65.337,0.967 
            //c6.617,9.677,62.853,17.418,71.127-0.967
            //c15.711,3.87,64.507,1.289,48.792-17.419 
            //C367.046,297.331,391.858,277.008,342.235,274.75
            //z"
            
            var cx,cy,X,Y;
            ctx2d.save();
            ctx2d.beginPath();
            SvgDrawService.handlTransforms(this.getAttribute('transform'),ctx2d);
            SvgDrawService.handleCss(drawInfos.svgDom,this,ctx2d);
            SvgDrawService.handleAttributes(this,ctx2d);
            for(;pos<len;){
              pathCmd=d[pos++];
              
              switch(pathCmd){
                case 'A':
                 function  radian( ux, uy, vx, vy ) {
                       var  dot = ux * vx + uy * vy;
                       var  mod = Math.sqrt( ( ux * ux + uy * uy ) * ( vx * vx + vy * vy ) );
                       var  rad = Math.acos( dot / mod );
                       if( ux * vy - uy * vx < 0.0 ) {
                              rad = -rad;
                       }
                       return rad;
                 }
                // svg : [A | a] (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
                // x1 y1 rx ry φ fA fS x2 y2
                // sample :  svgArcToCenterParam(200,200,50,50,0,1,1,300,200)
                function svgArcToCenterParam(x1, y1, rx, ry, phi, fA, fS, x2, y2) {
                     var cx, cy, startAngle, deltaAngle, endAngle;
                     var PIx2 = Math.PI * 2.0;
                     if (rx < 0) {
                        rx = -rx;
                     }
                     if (ry < 0) {
                        ry = -ry;
                     }
                     if (rx == 0.0 || ry == 0.0) { // invalid arguments
                             throw Error('rx and ry can not be 0');
                     }
                     var s_phi = Math.sin(phi);
                     var c_phi = Math.cos(phi);
                     var hd_x = (x1 - x2) / 2.0; // half diff of x
                     var hd_y = (y1 - y2) / 2.0; // half diff of y
                     var hs_x = (x1 + x2) / 2.0; // half sum of x
                     var hs_y = (y1 + y2) / 2.0; // half sum of y
                     // eq.5.1
                     var x1_ = c_phi * hd_x + s_phi * hd_y;
                     var y1_ = c_phi * hd_y - s_phi * hd_x;
                     // eq.6.2 Correction of out-of-range radii
                     //   Step 3: Ensure radii are large enough
                     var lambda = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
                     if (lambda > 1) {
                        rx = rx * Math.sqrt(lambda);
                        ry = ry * Math.sqrt(lambda);
                     }
                     var rxry = rx * ry;
                     var rxy1_ = rx * y1_;
                     var ryx1_ = ry * x1_;
                     var sum_of_sq = rxy1_ * rxy1_ + ryx1_ * ryx1_; // sum of square
                     if (!sum_of_sq) {
                       throw Error('start point can not be same as end point');
                     }
                     var coe = Math.sqrt(Math.abs((rxry * rxry - sum_of_sq) / sum_of_sq));
                     if (fA == fS) { coe = -coe; }
                     // eq.5.2
                    var cx_ = coe * rxy1_ / ry;
                    var cy_ = -coe * ryx1_ / rx;
                    // eq.5.3
                    cx = c_phi * cx_ - s_phi * cy_ + hs_x;
                    cy = s_phi * cx_ + c_phi * cy_ + hs_y;
                    var xcr1 = (x1_ - cx_) / rx;
                    var xcr2 = (x1_ + cx_) / rx;
                    var ycr1 = (y1_ - cy_) / ry;
                    var ycr2 = (y1_ + cy_) / ry;
                    // eq.5.5
                    startAngle = radian(1.0, 0.0, xcr1, ycr1);
                    // eq.5.6
                    deltaAngle = radian(xcr1, ycr1, -xcr2, -ycr2);
                    while (deltaAngle > PIx2) { deltaAngle -= PIx2; }
                    while (deltaAngle < 0.0) { deltaAngle += PIx2; }
                    if (fS == false || fS == 0) { deltaAngle -= PIx2; }
                    endAngle = startAngle + deltaAngle;
                    while (endAngle > PIx2) { endAngle -= PIx2; }
                    while (endAngle < 0.0) { endAngle += PIx2; }
                    var outputObj = { /* cx, cy, startAngle, deltaAngle */
                           cx: cx,
                           cy: cy,
                           startAngle: startAngle,
                           deltaAngle: deltaAngle,
                           endAngle: endAngle,
                          
                     }
                      return outputObj;

                   }
                   //rx ry x-axis-rotation large-arc-flag sweep-flag x y
                   
                   let rx=parseFloat(getdata());
                   let ry=parseFloat(getdata());
                   let phi=parseFloat(getdata());
                   let fA=parseInt(getdata());
                   let fS=parseInt(getdata());
                   let xto=parseFloat(getdata());
                   let yto=parseFloat(getdata());
                   let out=svgArcToCenterParam(cx, cy, rx, ry, phi, fA, fS, xto, yto);
                   
                   //ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
                   //anticlockwise的定义与SVG的arc中的fS逻辑定义相反
                   //参数的意思：(圆心x,圆心y,半径x,半径y,旋转的角度，起始角，结果角，顺时针还是逆时针)
                   ctx2d.ellipse(out.cx,out.cy,rx,ry,phi,out.startAngle,out.endAngle,!fS);
                   cx=xto;cy=yto;
                   break;
                case 'M':
                  X=parseFloat(getdata());
                  Y=parseFloat(getdata());
                  ctx2d.moveTo(X,Y);
                  cx=X,cy=Y;
                  break;
                case 'l':
                  X=parseFloat(getdata())+cx;
                  Y=parseFloat(getdata())+cy;
                  ctx2d.lineTo(X,Y);
                  cx=X,cy=Y;
                   break;
                case 'L':
                   X=parseFloat(getdata());
                   Y=parseFloat(getdata());
                   ctx2d.lineTo(X,Y);
                   cx=X,cy=Y;
                   break;
                case 'c':
                  let x1=parseFloat(getdata())+cx;
                  let y1=parseFloat(getdata())+cy;
                  let x2=parseFloat(getdata())+cx;
                  let y2=parseFloat(getdata())+cy;
                  let end_x=parseFloat(getdata())+cx;
                  let end_y=parseFloat(getdata())+cy;
                  ctx2d.bezierCurveTo(x1,y1,x2,y2,end_x,end_y);
                  cx=end_x,cy=end_y;
                  break;
                case 'C':

                  let X1=parseFloat(getdata());
                  let Y1=parseFloat(getdata());
                  let X2=parseFloat(getdata());
                  let Y2=parseFloat(getdata());
                  let END_X=parseFloat(getdata());
                  let END_Y=parseFloat(getdata());
                  ctx2d.bezierCurveTo(X1,Y1,X2,Y2,END_X,END_Y);
                  cx=END_X,cy=END_Y;
                  break;
                  case 'Z':
                  case 'z':
                    ctx2d.closePath();
                    break;
                
              }
            }
           
            if(this.getAttribute('fill')&&this.getAttribute('fill')!='none')ctx2d.fill();
            ctx2d.setTransform(1, 0, 0, 1, 0, 0)
            if(NEED_STROKE)  ctx2d.stroke();
            ctx2d.restore();
          }
          //-------------
          funcs['line']=function(ctx2d,drawInfos){
            let x1=this.x1.baseVal.value,y1=this.y1.baseVal.value,
            x2=this.x2.baseVal.value,y2=this.y2.baseVal.value;
            ctx2d.save();
            SvgDrawService.handlTransforms(this.getAttribute('transform'),ctx2d);
            SvgDrawService.handleCss(drawInfos.svgDom,this,ctx2d);
            SvgDrawService.handleAttributes(this,ctx2d);
            ctx2d.beginPath();
            ctx2d.moveTo(x1, y1);
            ctx2d.lineTo(x2, y2);
            
            ctx2d.setTransform(1, 0, 0, 1, 0, 0)
            if(NEED_STROKE)  ctx2d.stroke();
            ctx2d.restore();
          }
          //----------
          funcs['polyline']=function(ctx2d,drawInos){
            let points=this.points;
            
            let len=points.length;
            ctx2d.save();
            ctx2d.lineWidth=1.5;          
            SvgDrawService.handlTransforms(this.getAttribute('transform'),ctx2d);
            SvgDrawService.handleCss(drawInfos.svgDom,this,ctx2d);
            SvgDrawService.handleAttributes(this,ctx2d); 
            ctx2d.beginPath();
            var startX =points[0].x;
            var startY =points[0].y;
            
            ctx2d.moveTo(startX, startY);
            for(var i = 1; i < len;i++) {
            var newX =points[i].x;
            var newY =points[i].y;
            ctx2d.lineTo(newX, newY);
            }
            
      
            if(this.getAttribute('fill')&&this.getAttribute('fill')!='none')ctx2d.fill();
            ctx2d.setTransform(1, 0, 0, 1, 0, 0)
            if(NEED_STROKE)  ctx2d.stroke();
            ctx2d.restore();
          }
          //----------line end
          funcs['polygon']=function(ctx2d,drawInfos){ 

            let points=this.points;
           
            let len=points.length;
            ctx2d.save();
                      
            SvgDrawService.handlTransforms(this.getAttribute('transform'),ctx2d);
            SvgDrawService.handleCss(drawInfos.svgDom,this,ctx2d);
            SvgDrawService.handleAttributes(this,ctx2d); 
            ctx2d.beginPath();
            var startX =points[0].x;
            var startY =points[0].y;
            
            ctx2d.moveTo(startX, startY);
            for(var i = 1; i < len;i++) {
            var newX =points[i].x;
            var newY =points[i].y;
            ctx2d.lineTo(newX, newY);
            }
            ctx2d.closePath();
            
            if(this.getAttribute('fill')&&this.getAttribute('fill')!='none')ctx2d.fill();
            ctx2d.setTransform(1, 0, 0, 1, 0, 0)
            if(NEED_STROKE)  ctx2d.stroke();
            ctx2d.restore();

         }
          //----------polygon end
          funcs['circle']=function(ctx2d,drawInfos){
            var x=parseFloat(this.getAttribute('cx'));
            var y=parseFloat(this.getAttribute('cy'));
            var r=this.r.baseVal.value;
           
            ctx2d.save();
            
            SvgDrawService.handlTransforms(this.getAttribute('transform'),ctx2d);
            SvgDrawService.handleCss(drawInfos.svgDom,this,ctx2d);
            SvgDrawService.handleAttributes(this,ctx2d); 
            
            ctx2d.beginPath();
            ctx2d.strokeStyle=this.attributes["stroke"];
            ctx2d.arc(x,y, r, 0, Math.PI*2);
            
            if(this.getAttribute('fill')&&this.getAttribute('fill')!='none')ctx2d.fill();
            ctx2d.setTransform(1, 0, 0, 1, 0, 0)
            if(NEED_STROKE)  ctx2d.stroke();
            ctx2d.closePath();
            ctx2d.restore();

          }
           //----------Circle end
          funcs['text']=function(ctx2d,drawInfos){
              
              var x=parseFloat(this.getAttribute('x'));
              var y=parseFloat(this.getAttribute('y'));
              ctx2d.save();
              SvgDrawService.handlTransforms(this.getAttribute('transform'),ctx2d);
              SvgDrawService.handleCss(drawInfos.svgDom,this,ctx2d);
              SvgDrawService.handleAttributes(this,ctx2d);
              var text=this.textContent.replace(/(^\s*)|(\s*$)/g, "");
             
              
              if(this.getAttribute("writing-mode")=="tb")
                {ctx2d.fillTextVertical(text, x, y) }
              else 
                 {ctx2d.strokeText(text,x,y);}
              ctx2d.restore();
          }
          //-----------------
          funcs['rect']=function(ctx2d,drawInfos){
          //rect svg description:<rect x="145" y="338" width="93" height="30" fill="none" fill-opacity="0" stroke="#000000" transform="matrix(1,0,0,1,0,-0.125)" />
              var x=parseFloat(this.getAttribute('x'));
              var y=parseFloat(this.getAttribute('y'));
              var width=parseFloat(this.getAttribute('width'));
              var height=parseFloat(this.getAttribute('height'));
             
              ctx2d.save();
              SvgDrawService.handlTransforms(this.getAttribute('transform'),ctx2d);
              SvgDrawService.handleCss(drawInfos.svgDom,this,ctx2d);
              SvgDrawService.handleAttributes(this,ctx2d); 
              ctx2d.beginPath();
              ctx2d.rect(x,y, width,height);
              
              if(this.getAttribute('fill')&&this.getAttribute('fill')!='none')ctx2d.fill();
              ctx2d.setTransform(1, 0, 0, 1, 0, 0)
              if(NEED_STROKE)  ctx2d.stroke();
              ctx2d.closePath();
              ctx2d.restore();
          }
          //----------rect end----------------------
          funcs['g']=function(ctx2d,drawInfos){
             ctx2d.save();
             ctx2d.lineWidth=1.5;//default width
                  
             if(this.parentNode.nodeName!="g"){
             var box=this.getClientRects()[0];
             ctx2d.translate(-box.x,-box.y);//将符号左上角定位原始坐标原点
             }
             SvgDrawService.handlTransforms(this.getAttribute('transform'),ctx2d);
             SvgDrawService.handleCss(drawInfos.svgDom,this,ctx2d);
             SvgDrawService.handleAttributes(this,ctx2d);
             for(var i=0;i<this.childNodes.length;i++){
              this.childNodes[i].draw(ctx2d,drawInfos);
             }
             ctx2d.restore();
            
          }
         if(funcs[cmd]) return funcs[cmd];
         else return  funcs['default'];
   
     }
     /////////getDrawFunc end  ////////////////
}
class SvgService{
  
  static  parseSvgDomStyle(svgDom){
    svgDom.myStyles={};
    var cssRules=svgDom.styleSheets[0].cssRules;
    let length=cssRules.length;
    
    if(length==0) return;
   
    for(let i=0;i<length;i++){
      let rule=cssRules[i];
      let classname=rule.selectorText.replace(".","");
      let cssText=rule.cssText;
      cssText='{'+cssText.split("{")[1];
     
      cssText=cssText.replace("{","");
      cssText=cssText.replace("}","");
      cssText=cssText.toLowerCase();
      var css=cssText.split(";")
      var styles={};
      for(let k=0;k<css.length;k++){
        let c=css[k].split(":");
        c[0]=c[0].replace(/(^\s*)|(\s*$)/g, "");
       
        if(c[0]&&c[1])styles[c[0]]=c[1].replace(/(^(\s*"))|(\s*")$/g,"");;
      }
      
      svgDom.myStyles[classname]=styles;
      } 
  }
  static setSvgDomDrawFunc(root){
        
    if(!root) return null;
    if(root){       
      root.draw=SvgDrawService.getDrawFunc(root.nodeName);
      for(var i=0;i<root.childNodes.length;i++){
         var child =root.childNodes[i];
         if(child.childNodes.length>0) {this.setSvgDomDrawFunc(child);continue;}
         child.draw=SvgDrawService.getDrawFunc(child.nodeName);
      }
   }
   return root;
  

   }
 
}
//////////////////////////////////
function SvgNode(selector,text,svgDom){
  this.selector=selector;
  this.text=text;
  this.lineColor="#000000";
  //this.ctx2d=ctx2d;
  this.svgDom=svgDom
  this.getSvgElementsBox=function(){
      var wrapBox={},box;
      if(this.svgElements.length==0) return null;
      box=this.svgElements[0].getClientRects()[0];
      for(let prop in box){//clone
        wrapBox[prop]=box[prop];
      }
      for(let i=1;i<this.svgElements.length;i++)
      {  
          if(!this.svgElements[i].getClientRects) continue;
          box=this.svgElements[i].getClientRects()[0];
          if(box.left<wrapBox.left) wrapBox.left=box.left;
          if(box.top<wrapBox.top) wrapBox.top=box.top;
          if(box.right>wrapBox.right) wrapBox.right=box.right;
          if(box.bottom>wrapBox.bottom) wrapBox.bottom=box.bottom;
      }
    
      wrapBox.x=wrapBox.left;wrapBox.y=wrapBox.top;
      wrapBox.width=wrapBox.right-wrapBox.left;
      wrapBox.height=wrapBox.bottom-wrapBox.top;
      return wrapBox;
     
  }
  this.initialize=function(selector,text){
     
    SvgNode.prototype.initialize.apply(this,null);
    this.lineColor="black";
    this.lineWidth=1;
    this.font="12 宋体"
    this.fontColor="grey"
    this.selectedHandler = function(b) {//override
      SvgNode.prototype.selectedHandler.apply(this,arguments);
      
      this.selectedLocation = {
        x: this.x,
        y: this.y,
        width:this.width,
        height:this.height,
        svgScaleX:this.svgScaleX,
        svgScaleY:this.svgScaleY,
        rotate:this.rotate
     };
    
     };
      if(text) this.text=text;
      else this.text="未命名";
      this.lineColor="black";
      this.selector=selector;
      this.elementType="SvgNode";
      var properties="svgScaleX,svgScaleY,selector".split(",");
      this.serializedProperties=this.serializedProperties.concat(properties);
      this.toFill=false;//not to fill the node's background
      this.borderwidth=0;//not to draw the border;
      this.svgElements=this.svgDom.querySelectorAll(selector);
      var svgElementsBox=this.getSvgElementsBox();
      this.setSize(svgElementsBox.width,svgElementsBox.height);
      this.originalSize=this.getSize();
      this.onResize(this.onResizeHandler);//when node's box scaling,set the svg symbol's scale
      this.svgScaleX=1;
      this.svgScaleY=1;
  }
  this.customPaint=function(ctx2d){
          ctx2d.save();
          ctx2d.translate(-this.width/2,-this.height/2);//group符号的draw函娄中会将符号左向角定位到原始坐标原点，scene绘制符号前会将原点移到符号矩形框中心,此语句再将原点移到矩形框的左上角
          ctx2d.transform(this.svgScaleX,0,0,this.svgScaleY,0,0);
          for(var i=0;i<this.svgElements.length;i++){
             var oneEle = this.svgElements[i];
             var drawInfos={svgDom:this.svgDom};
             oneEle.draw(ctx2d,drawInfos);
          }
          ctx2d.restore();
  }
  this.onResizeHandler=function(event){
       
        this.svgScaleX=this.getSize().width/this.originalSize.width;
        this.svgScaleY=this.getSize().height/this.originalSize.height;
        
  }
   
  this.initialize(selector,text);
  var me=this;
  this.dbclick(function(event){
      var panel=PropPanelFactory.getPropPanelInstance("属性设置",me);
      panel.show(event);
  });
    
  this.setPopmenu(Node_PopMenu);
}
SvgNode.prototype=new JTopo.EditorNode();
JTopo.SvgNode=SvgNode;
export {SvgService}

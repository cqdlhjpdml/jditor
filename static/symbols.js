"use strict"

const NOTHING=null;

/////////////////////////
class SvgDrawService{
  static svgMatrixToArray(svgMatrix){
    if(!svgMatrix)return null;
    var ctmArray=[svgMatrix.a,svgMatrix.b,svgMatrix.c,svgMatrix.d,svgMatrix.e,svgMatrix.f]
    return ctmArray;
  }
  static matrixStringToArray(matrixString){
      if(!matrixString) return null;
      var infos=matrixString.split("("); 
      var command=infos[0];
      infos[1]=infos[1].slice(0,-1);
      var ctmArray=infos[1].split(",")
     
      
      switch(command){
        case "matrix":
        for(let k=0;k<ctmArray.length;k++) ctmArray[k]=parseFloat(ctmArray[k]);
        return ctmArray;
      } 
      return null;
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
          var fillStyle='none';
          function setCtx2dStyle(svgEle,ctx2d){
            var fillStyle=svgEle.getAttribute('fill');
            if(fillStyle!='none')ctx2d.fillStyle=fillStyle;
            ctx2d.strokeStyle=svgEle.getAttribute('stroke');

          }     
          var funcs=new Array();
          funcs['default']=function(){
             // console.log("this element not surpported!")
   
          }
          funcs['path']=function(ctx2d,drawInfos){
            function getdata(){
              var data='';
              var ctrls=['-',',',' ','M','m','V','v','L','l','C','c',
              'S','s','Q','q','T','t','Z','z','H','h'];
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
            let ctm=SvgDrawService.matrixStringToArray(this.getAttribute('transform'));
            var cx,cy,X,Y;
            ctx2d.save();
            ctx2d.beginPath();
            if(ctm)
                ctx2d.transform(ctm[0],ctm[1],ctm[2],ctm[3],ctm[4],ctm[5]);
            
            for(;pos<len;){
              pathCmd=d[pos++];
             
              switch(pathCmd){
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
            setCtx2dStyle(this,ctx2d);
            if(this.getAttribute('fill')!='none')ctx2d.fill();
            ctx2d.stroke();
            ctx2d.restore();
          }
          //-------------
          funcs['line']=function(ctx2d,drawInfos){
            let x1=this.x1.baseVal.value,y1=this.y1.baseVal.value,
            x2=this.x2.baseVal.value,y2=this.y2.baseVal.value;
            let ctm=SvgDrawService.matrixStringToArray(this.getAttribute('transform'));
            ctx2d.save();
            if(ctm)
                ctx2d.transform(ctm[0],ctm[1],ctm[2],ctm[3],ctm[4],ctm[5]);
            ctx2d.beginPath();
            ctx2d.moveTo(x1, y1);
            ctx2d.lineTo(x2, y2);
            setCtx2dStyle(this,ctx2d)
            ctx2d.stroke();
            ctx2d.restore();
          }
          //----------line end
          funcs['polygon']=function(ctx2d,drawInfos){ 

            let points=this.points;
            let ctm=SvgDrawService.matrixStringToArray(this.getAttribute('transform')); 
            let len=points.length;
            ctx2d.save();
                      
            if(ctm)
                ctx2d.transform(ctm[0],ctm[1],ctm[2],ctm[3],ctm[4],ctm[5]);
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
            setCtx2dStyle(this,ctx2d)
            if(this.getAttribute('fill')!='none')ctx2d.fill();
            ctx2d.stroke();
            ctx2d.restore();

         }
          //----------polygon end
          funcs['circle']=function(ctx2d,drawInfos){
            var x=parseFloat(this.getAttribute('cx'));
            var y=parseFloat(this.getAttribute('cy'));
            var r=this.r.baseVal.value;
            var ctm=SvgDrawService.matrixStringToArray(this.getAttribute('transform'));
            ctx2d.save();
            
            if(ctm)
              ctx2d.transform(ctm[0],ctm[1],ctm[2],ctm[3],ctm[4],ctm[5]);
            ctx2d.beginPath();
            ctx2d.strokeStyle=this.attributes["stroke"];
            ctx2d.arc(x,y, r, 0, Math.PI*2);
            setCtx2dStyle(this,ctx2d);
            if(this.getAttribute('fill')!='none')ctx2d.fill();
            ctx2d.stroke();
            ctx2d.closePath();
            ctx2d.restore();

          }
           //----------Circle end
          funcs['text']=function(ctx2d,drawInfos){
              var x=parseFloat(this.getAttribute('x'));
              var y=parseFloat(this.getAttribute('y'));
              var ctm=SvgDrawService.matrixStringToArray(this.getAttribute('transform'));

              ctx2d.save();
              
              if(ctm)
                { 
                  ctx2d.transform(ctm[0],ctm[1],ctm[2],ctm[3],ctm[4],ctm[5]);}
             
                  var text=this.textContent;
              ctx2d.font=this.attributes["font-size"].nodeValue+ 'px ' +this.attributes["font-family"].nodeValue;
              ctx2d.strokeStyle=this.attributes["stroke"];
              ctx2d.textAlign = "left";
              setCtx2dStyle(this,ctx2d)
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
              var ctm=SvgDrawService.matrixStringToArray(this.getAttribute('transform'));
              ctx2d.save();
              if(ctm)  ctx2d.transform(ctm[0],ctm[1],ctm[2],ctm[3],ctm[4],ctm[5]);
              ctx2d.beginPath();
              ctx2d.rect(x,y, width,height);
              setCtx2dStyle(this,ctx2d); 
              if(fillStyle!='none')ctx2d.fill();
              ctx2d.stroke();
              ctx2d.closePath();
              ctx2d.restore();
          }
          //----------rect end----------------------
          funcs['g']=function(ctx2d,drawInfos){
             ctx2d.save();
             setCtx2dStyle(this,ctx2d);         
             if(this.parentNode.nodeName!="g"){
             var box=this.getClientRects()[0];
             ctx2d.translate(-box.x,-box.y);
             }
             var ctm=SvgDrawService.matrixStringToArray(this.getAttribute('transform'));
             if(ctm)
               ctx2d.transform(ctm[0],ctm[1],ctm[2],ctm[3],ctm[4],ctm[5]);
             
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
function SvgNode(selector,text){
  this.selector=selector;
  this.text=text;
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
      this.text=text;
      this.selector=selector;
      this.elementType="SvgNode";
      var properties="svgScaleX,svgScaleY,selector".split(",");
      this.serializedProperties=this.serializedProperties.concat(properties);
      this.toFill=false;//not to fill the node's background
      this.borderwidth=0;//not to draw the border;
      this.svgElements=JTopo.svgDom.querySelectorAll(selector);
      var svgElementsBox=this.getSvgElementsBox();
      this.setSize(svgElementsBox.width,svgElementsBox.height);
      this.originalSize=this.getSize();
      this.onResize(this.onResizeHandler);//when node's box scaling,set the svg symbol's scale
      this.svgScaleX=1;
      this.svgScaleY=1;
  }
     this.customPaint=function(ctx2d){
          ctx2d.save();
          
          ctx2d.translate(-this.width/2,-this.height/2);
          
          ctx2d.transform(this.svgScaleX,0,0,this.svgScaleY,0,0);
          for(var i=0;i<this.svgElements.length;i++){
             var oneEle = this.svgElements[i];
             var drawInfos={center_x:this.cx,center_y:this.cy};
             oneEle.draw(ctx2d,drawInfos);
          }
          ctx2d.restore();
     }
    this.onResizeHandler=function(event){
       
        this.svgScaleX=this.getSize().width/this.originalSize.width;
        this.svgScaleY=this.getSize().height/this.originalSize.height;
        
    }
    this.initialize(selector,text);
  
}
SvgNode.prototype=new JTopo.Node();
JTopo.SvgNode=SvgNode;
//////////////////////////////// 

//////////////////////////////
/*this is a native implement of SVGDraw,but not finished yet
class SvgSymbols extends SymbolsLoader{
  constructor(symbolSrc){
    super(symbolSrc);
      
  }
  
  getDrawFunc(cmd){
   var eles=new Array();
    //<polygon points="190.25 241.75,220 231,219.75 270.5,190.25 260.75" fill="#FFFFFF" stroke="#000000" 
    //stroke-opacity="1" stroke-width="0.25" class="turbine" transform="matrix(2.19,0,0,1.31,-239.099,-77.732)" 
    //xmlns="http://www.w3.org/2000/svg" />
       
      
       
       
      
       var funcs=new Array();
       funcs['default']=function(){
           var f=function (){};
           f.prototype.draw=function(){};
           return f;

       }
       //////polygon begin  //////
       /////call :   for(oneEle of this.svgEles){  oneEle['draw'](ctx2d);}
      
       funcs['polygon']=function(ctx2d,oneEle,drawInfos){ 
           //container---container Rect's info=[center_x,center_y,width,height]
            
            let points=oneEle['points'].split(/[\s,]+/) ; 
            let len=points.length;
            let k=0;
            for(;k<len;k++) points[k]=parseFloat(points[k]);
            
            ctx2d.save();
            let transform=oneEle['transform'];
            var transformedPoints=new Array(); 
            var transformed=null;
           
               //         a  c  e
//matrix      //          b  d  f
               //         0  0  1
              // transform="matrix(a,b,c,d,e,f)"        
                var infos=transform.split("(");
                var command=infos[0];
                infos[1]=infos[1].slice(0,-1);
                var datas=infos[1].split(",")
               
                
                switch(command){
                  case "matrix":
                  transformed=true;
                  for(k=0;k<datas.length;k++) datas[k]=parseFloat(datas[k]);
                  
                  for(k=0;k<points.length;)
                  {
                      transformedPoints[k]=datas[0]*points[k]+datas[2]*points[k+1]+datas[4]*1;
                      transformedPoints[k+1]=datas[1]*points[k]+datas[3]*points[k+1]+datas[5]*1;
                      k=k+2;
                  }

                 ctx2d.transform(datas[0],datas[1],datas[2],datas[3],0,0);//0,0 ---ingores the translate action,it has been
                                                                           //fineshed by user's codes.
                 
                  break;
                  default:
                }
                
            
            
            let min_x=points[0],min_y=points[1];
            let max_x=points[0],max_y=points[1]; 
            k=2;
            for(;k<len;){
                if(points[k]<min_x) min_x=points[k];
                if(points[k]>max_x) max_x=points[k];
                k++;
                if(points[k]<min_y) min_y=points[k];
                if(points[k]>max_y) max_y=points[k];
                k++;
            } 
               
           // ctx2d.transform(zomm_scale_x,0,0,zomm_scale_y,0,0);//0,0 ---ingores the translate action,it has been
                                                                           //fineshed by user's codes.
           // ctx2d.transform(zomm_scale_x*datas[0],datas[1],datas[2],zomm_scale_y*datas[3],0,0);//0,0 ---ingores the translate action,it has been
           //                                                                //fineshed by user's codes.
            let sym_cx=(min_x+max_x)/2-min_x;
            let sym_cy=(min_y+max_y)/2-min_y;
            let dx=sym_cx-drawInfos.center_x,dy=sym_cy-drawInfos.center_y;
            for(let k=0;k<len;){
                points[k]=points[k]- min_x-dx;k++;
                points[k]=points[k]- min_y-dy;k++
            } 
            

            ctx2d.beginPath();
            var startX =parseInt(points[0]);
            var startY =parseInt(points[1]);
            ctx2d.moveTo(startX, startY);
            for(var i = 2; i < len;) {
            var newX =parseInt(points[i++]);
            var newY =parseInt(points[i++]);
            ctx2d.lineTo(newX, newY);
            }
            ctx2d.closePath();
            ctx2d.stroke();
            ctx2d.restore();
      }
       /////////polygon end
      if(funcs[cmd]) return funcs[cmd];
      else return  funcs['default'];

  }
  /////////getDrawFunc end  ////////////////
  parser(cmd ,srcObj){
    var svg=new Array(); 
    svg['cmd']=cmd;
    for(var ch=srcObj.current();[' ','\n','\t','\r'].indexOf(ch)!=-1;srcObj.cursorForward(),ch=srcObj.current());
     var attrname='',value='';
     for(;;srcObj.cursorForward()){
         if(srcObj.current()=='/'&&srcObj.getNext()=='>'){srcObj.cursorForward();srcObj.cursorForward();break;}
         if(srcObj.current()=='>'){srcObj.cursorForward();break;}
         if(srcObj.current()==' ')continue;
         for(;srcObj.current()!='=';srcObj.cursorForward()) attrname=attrname+srcObj.current();
         srcObj.cursorForward();
         if(srcObj.current()=="'"||srcObj.current()=='"') {var quote=srcObj.current();srcObj.cursorForward();}
         else  break;
         for(;srcObj.current()!=quote;srcObj.cursorForward())   value=value+srcObj.current();
        
         svg[attrname]=value; 
         attrname='';value='';   

     }
   
    
    return svg;
    
 }
 //--------------------
 
 //--------------------------
 genSymbols(){
    var svgEles=new Array();
    var srcObj={symbolSrc:this.symbolSrc,pos:0,
              cursorForward: function(){this.pos++;},
              cursorBackward:function(){this.pos--;},
              current: function(){var pos=this.pos;return this.symbolSrc[pos] ;},
              len:function(){return this.symbolSrc.length},
              isEnd:function(){return this.pos==this.symbolSrc.length;},
              sub:function(begin,end){var subStr='';
                for(var i=begin;i<=end;i++) subStr+=this.symbolSrc[i] ;
                return subStr;
               },
             getchar:function(position){return this.symbolSrc[position]},
             getNext:function(){return this.symbolSrc[this.pos+1]},
             getPosition:function(){return this.pos;}            }
    
    this.genSvgSymbols(svgEles,srcObj);
    var me=this;
    var symbolsObj={symbols:svgEles,draw:function (ctx2d,drawInfos){
        for(let oneEle of this.symbols){
            if(drawInfos.classSelector) if(oneEle['class']!=drawInfos.classSelector) break;
            me.getDrawFunc(oneEle['cmd'])(ctx2d,oneEle,drawInfos);
        }
      }
    }
    this.symbolsObj=symbolsObj;
    return symbolsObj;
 }
 //svg Sample:<polygon points="190.25 241.75,220 231,219.75 270.5,190.25 260.75" fill="#FFFFFF" 
 //stroke="#000000" stroke-opacity="1" stroke-width="0.25" class="turbine" 
 //transform="matrix(2.19,0,0,1.31,-239.099,-77.732)" />
//	<text x="195" y="251" xml:space="preserve" font-family="Microsoft YaHei UI" font-size="12"
// fill="#FFFFFF" stroke="#000000" stroke-opacity="1" baseline-shift="baseline" 
//transform="matrix(1.05,0,0,0.981,-32.628,9.535)" class="turbine">
//turbine	</text>     
  genSvgSymbols(node,srcObj){
           
      for(var ch=srcObj.current();[' ','\n','\t','\r'].indexOf(ch)!=-1;srcObj.cursorForward(),ch=srcObj.current());
      for(;!srcObj.isEnd();srcObj.cursorForward()){
        for(ch=srcObj.current();[' ','\n','\t','\r'].indexOf(ch)!=-1;srcObj.cursorForward(),ch=srcObj.current());
        if(srcObj.current()!='<') return null;//文法错
        if(srcObj.current()&&srcObj.getNext()=='/') break;//task searching brother finished;
        var cmd='';
             srcObj.cursorForward();
             for(;srcObj.current()!=' '&&srcObj.current()!='>';srcObj.cursorForward()){
                 var cmd=cmd+srcObj.current();;
            }     
            var oneSvg=this.parser(cmd,srcObj);
            node.push(oneSvg);
            if(oneSvg==null) return;/////?????????
            var k=srcObj.getPosition()-2,endWord='';
            endWord=srcObj.sub(k,k+1);
            if(endWord=='/>') continue;//parse brothers
            k=srcObj.getPosition();
            if(srcObj.getchar(k)!='/'){//not end with '/>',now to parse childs or content
            var content='';  
             for(ch=srcObj.current();[' ','\n','\t','\r'].indexOf(ch)!=-1;srcObj.cursorForward(),ch=srcObj.current());
                var ch=srcObj.getNext();
                if(ch=='/') {
                    content=NOTHING,oneSvg['content']=content;}
                else if(srcObj.current()=='<'){
                    
                    var childs=new Array();
                    this.genSvgSymbols(childs,srcObj);
                    oneSvg['childs']=childs;
                }
                   else {
                        
                        //some content
                        for(srcObj.cursorBackward();srcObj.current()!='<';srcObj.cursorForward()) content=content+srcObj.current();
                        
        
                        oneSvg['content']=content; 
                       }
               
                               
                for(ch=srcObj.current();[' ','\n','\t','\r'].indexOf(ch)!=-1;srcObj.cursorForward(),ch=srcObj.current());
                
                if(srcObj.current()!='<') return null;//语法错误
                srcObj.cursorForward();
                if(srcObj.current()!='/') return null;//语法错误
                srcObj.cursorForward();
                var k=0;
                for(;srcObj.current()!='>';srcObj.cursorForward(),k++)  if(cmd[k]!=srcObj.current()) return null;//文法错误         
                k++; 
            }  

      }
  }
}
/////////////class ParserFactory///////////////
*/

/////////////class ParserFactory///////////////






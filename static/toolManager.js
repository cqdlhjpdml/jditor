var tools_config=[
    {name:"开始",caption:"开始",toolItems:[ 
                                           {  caption:"保存",
                                              icon:"save.png",
                                              tooltips:"保存",
                                              toolClass:SaveTool
                                           },

                                           { caption:"打开",
                                             icon:"load.png",
                                             tooltips:"打开",
                                             toolClass:OpenFileTool
                                           },
                                           { caption:"追加标签页",
                                             icon:"appendTab.png",
                                             tooltips:"追加标签页",
                                             toolClass:AppendTabTool
                                           },
                                           {  caption:"撤销",
                                             icon:"undo.gif",
                                             tooltips:"撤销",
                                             toolClass:UndoTool
                                           },

                                          {caption:"重做",
                                           icon:"redo.gif",
                                           tooltips:"载入",
                                           toolClass:RedoTool
                                           },
                                            {  caption:"文本框",
                                                icon:"text.png",
                                                tooltips:"插入文本框",
                                                toolClass:TextBoxTool
                                            },
                                            
                                            {  caption:"图片",
                                                icon:"image.png",
                                                tooltips:"插入文本框",
                                                toolClass:ImageTool
                                            },

                                            {caption:"热力系统",
                                             icon:"thermal.png", 
                                             industry:"thermal",
                                             tooltips:"热力系统",
                                             toolClass:ToolsPanel
                                            },
                                            {caption:"自然",
                                            icon:"nature.png", 
                                            industry:"nature",
                                            tooltips:"自然",
                                            toolClass:ToolsPanel
                                           }, 
                                            //one toolItem
                                            {  caption:"Link",
                                               icon:"link.png",
                                               tooltips:"Add Link",
                                               toolClass:LinkTool
                                              
                                            }
                                            ,
                                            //one toolItem
                                            {
                                             caption:"接口",
                                             //button image 
                                             icon:"connector.png",
                                             tooltips:"Add Connector",
                                             toolClass:ConnectorTool
                                            },
                                            //one toolItem
                                            {
                                                caption:"登录",
                                                icon:"login.png",
                                                tooltips:"点击登录",
                                                toolClass:LoginTool
                                            }
                                        ]},
    {name:"编辑",caption:"编辑",toolItems:[     
                                         ]} ,
    {name:"文件",caption:"文件",popmenu:true,toolItems:[ 
                                              {
                                                caption:"保存",
                                                icon:"save.png",
                                                tooltips:"保存",
                                                toolClass:SaveTool
                                              }
                                         ]}                                     

    ] ;

    ////////////////////////////// 
class ToolManager{
    currentSceneChangeEventHandler(event){
        var newScene=event.newScene;
        this.ctool&&this.ctool.clearTask();
        this.ctool=null;
        var previousScene=event.preScene;
        previousScene&&previousScene.removeAllEventListener();
        this.setSceneKeyEventHandler(newScene);
   }
    constructor(jqContainer,editor){
        this.editor=editor;
        this.jqContainer=jqContainer;
        this.TBar=$("<div id='editorToolbar'></div>"); 
        this.TBar.addClass("toolBar");
        jqContainer.append(this.TBar);
        this.actionManager=new JTopo.ActionManager();
        editor.stage.click(function(event){
            if(event.button == 0){// 右键
                // 关闭弹出菜单（div）
                $(".contextmenu").hide();
                $(".group-div").hide();
                
            }
        });
        this.sceneClickHandler=null;
        this.navMenusList=new Array();
        this.toolsContainerList=new Array();
        this.editor.addEventListener(this,CURRENT_SCENE_CHANGE,this.currentSceneChangeEventHandler);
          
    }
    setCurrentTool(tool){
        this.ctool=tool;
    }
    getCurrentTool(){
        return this.ctool;
    }
    refresh(result){
        if(result==1){
           
           this.ctool.getToolBtn().style.border="none";
           this.ctool.getToolBtn().style.opacity="1.0";
           
        }
    }
    getActiveScene(){
        return this.editor.getCurrentScene();
    }
    setCursor(cursor){
        this.editor.setCursor(cursor);
    }
    createToolGroupsContainer(){
      this.nav_bar=$("<div ></div>");
      this.toolGroupsBar=$("<div ></div>");
      this.toolGroupsBar.addClass("toolGroupBar");
      this.nav_bar.addClass("navBar");
      
      this.TBar.append(this.nav_bar);
      this.TBar.append(this.toolGroupsBar);
      
    }
    /********************/
    createMenus(toolGroup){
      /*var me=this;
      var navMenu=$("<span></span");
      var htmlStr=toolGroup.name;
      var navMenu=navMenu.html(htmlStr);
      navMenu.addClass("navMenuCommon");
            
      this.nav_bar.append(navMenu);
      var popMenu=new PopMenu(navMenu[0],this);
           
      toolGroup.toolItems.forEach(function(toolItem) {
              
              popMenu.appendMenu(toolItem);
              
          
      })
      */
  }
    //--------create tool buttons
    createToolGroup(toolGroup){
        var me=this;
        var navMenu=$("<span></span");
        var htmlStr=toolGroup.name;
        var navMenu=navMenu.html(htmlStr);
        navMenu.addClass("navMenuCommon");
        this.navMenusList.push(navMenu);
        
        
        this.nav_bar.append(navMenu);
        var toolsContainer=document.createElement("Div");
        this.toolGroupsBar.append(toolsContainer);
        $(toolsContainer).addClass("toolContainer");
        toolsContainer.style.display="none";
        
        toolGroup.toolItems.forEach(function(toolItem) {
                   let tool=toolItem.toolClass.getInstance(toolItem,me);
                   //var tool=new toolItem.toolClass(toolItem,me);
                   toolsContainer.appendChild(tool.getProperty("toolBtn"));})
        
        
        this.toolsContainerList.push(toolsContainer);
        

        navMenu[0].onclick=function(event) {
           
            $.each(me.navMenusList,function(index,menu){
                if(navMenu===menu) menu.attr("class","navMenuCommon navMenuFocus")
                else menu.attr("class","navMenuCommon navMenuNotFocus");} )     
            
            $.each(me.toolsContainerList,function(index,con){
            if(toolsContainer===con) con.style.display="block";
            else con.style.display="none"} )     }
    }
    
    
    //******************************//
   setSceneKeyEventHandler(scene){
      var me=this;
      scene.keyStatus={shift:0}//0-element间自由连线，1－element间元素间水平或竖直连线
      scene.addEventListener("keydown",function(event){
       var ele=scene.currentElement;
       var cx=ele?ele.cx:null,cy=ele?ele.cy:null;
       var step=1;
       function moveConnectors(owner,dx,dy){
           if(owner.connectors){
               owner.connectors.forEach(function (cn){
                  let cx=cn.cx,cy=cn.cy;
                  cn.setCenterLocation(cx+dx,cy+dy);
               })
           }
       }
       switch(event.key){
           case "ArrowUp":
            ele&&ele.setCenterLocation(cx,cy-step) ;
            ele&&moveConnectors(ele,0,-step); 
            break;
           case "ArrowDown":
            ele&&ele.setCenterLocation(cx,cy+step);
            ele&&moveConnectors(ele,0,step);     
            break;
           case "ArrowLeft":
               ele&&ele.setCenterLocation(cx-step,cy) ;
               ele&&moveConnectors(ele,-step,0);  
               break;
           case "ArrowRight":
               ele&&ele.setCenterLocation(cx+step,cy) ;
               ele&&moveConnectors(ele,step,0);
               break;
           case "Shift":
               scene.keyStatus.shift=!scene.keyStatus.shift;
               break;
           case "Escape":
            if(me.ctool instanceof LinkTool==false) retrurn;
            me.ctool.clearTask();
            if(me.ctool.tempLink) scene.remove(me.ctool.tempLink);
            me.ctool.tempLink=null;
            me.ctool.cross.visible=false;
            scene.removeEventListener("click");
            scene.removeEventListener("mousemove");
            scene.removeEventListener("mouseup") ;
            me.setCursor("crosshair" );//：十字标 
            me.ctool.setSceneMouseHandler(scene);  
            break;
    
           default:    

       }    
      })
    }
    //******************//
    createTools(scene)
    {  var me=this;
       this.createToolGroupsContainer();         
       tools_config.forEach(function(toolGroup){
          if(toolGroup.popmenu) me.createMenus(toolGroup) ;
          else me.createToolGroup(toolGroup);

       });
       this.navMenusList[0].trigger("click");
     
    }
    
}
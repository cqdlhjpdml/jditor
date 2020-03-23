class TabSheetsHeader{// this class not used
    construct(tabContainer){
      this.tabSheetsContainer=$("<div></div>");
      this.tabSheetsContainer.addClass("navBar");
      tabContainer.append(this.tabSheetsContainer);
      this.tabList=new Array(); 
      
    }
    appendTab(tabLabel){
      var me=this;
        var tag=$(`<span id='${tabLabel}'>${tabLabel}</span>`);
        tag.addClass("navMenuCommon");
        this.tabSheetsContainer.append(tag);
        this.tagList.push(tag);
        tag[0].onclick=function(event) {
           
          $.each(me.tagList,function(index,t){
              if(tag===t) {
                  t.attr("class","navMenuCommon navMenuFocus");
              }
              else {
                  t.attr("class","navMenuCommon navMenuNotFocus");
                  
              }
          } )     
          
          }
       tag.trigger("click");
    }
    deleteTab(tagLabel){

    }
}
////////////////////////////
class TabSheetsManager{
    
   appendTab(scene){
        var me=this;
        var tag=$(`<span>${scene.name}</span>`);
        tag.addClass("navMenuCommon");
        this.tabSheetsContainer.append(tag);
        var sheet={tabTag:tag,tabScene:scene};
        this.tabList.push(sheet);
        tag[0].onclick=function(event) {
           
          $.each(me.tabList,function(index,sh){
              if(tag===sh.tabTag) {
                  sh.tabTag.attr("class","navMenuCommon navMenuFocus");
                  me.editor.setCurrentScene(sh.tabScene);

              }
              else {
                  sh.tabTag.attr("class","navMenuCommon navMenuNotFocus");
                  
              }
          } )     
          
          }
       tag.trigger("click");
    }
    removeAllTabs(){
      this.tabList=new Array();
      this.tabSheetsContainer.empty();
      var jsContainer=this.tabSheetsContainer[0];
      var tags=jsContainer.childNodes;
      for(let i=0;i<tags.length;i++)
       tags.removeChild(list.childNodes[i]);

    }
    
    constructor(tabContainer,editor){
        this.tabSheetsContainer=$("<div></div>");
        this.tabSheetsContainer.addClass("navBar");
        this.editor=editor;
        tabContainer.append(this.tabSheetsContainer);
        this.tabList=new Array(); 
    
    }

}  
///////////////////////////////////
import { EventDispatcher, CommonUtilities } from './common.js'

////////////////////////////////
class BaseIconTool {//abstract class

  constructor(toolItem, manager) {

    this.toolItem = toolItem;
    this.manager = manager;
    var me = this;
    this.toolIcon = new Image();
    this.toolIcon.src = "icons/" + toolItem.icon;
    this.toolIcon.alt = toolItem.caption;
    this.toolIcon.tooltips = toolItem.tooltips;
    this.toolButton = document.createElement("div");
    //this.toolButton.className = "toolBtn";
    this.toolButton.width = '50px';
    this.toolButton.height = '50px';
    this.toolButton.appendChild(this.toolIcon);
    this.toolButton.onclick = function mouseclick(event) { me.mouseclick(event, me) };
    this.toolButton.ondblclick = function mousedblclick(event) {
      me.mousedblclick(event, me)
    };
    this.toolButton.onmouseenter = function mouseenter(event) { me.mouseenter(event, me) };;
    this.toolButton.onmouseleave = function mouseleave(event) { me.mouseleave(event, me) };
    if (toolItem.caption) {
      var captionSpan = document.createElement("span");
      captionSpan.innerHTML = toolItem.caption;
      this.toolButton.appendChild(captionSpan);
    }
  }
  /*********** */
  getToolBtn() { return this.toolButton };
  /************* */
  mouseclick(event, self) {//virtual,self---the tool

  }
  /**************************** */
  mousedblclick(event, self) {//virtual

  }
  /**************************** */
  mouseleave(event, toolManager) {//virtual;

  }
  /*********** */
  mouseenter(event, toolManager) {//virtual
  }

}
/////////////////////////////////////////////////////////////////
const FOLDER_ICON_TOOL = 1
//////////class folderIcon of user folder UI/////////////////////
class FolderIconTool extends BaseIconTool {
  /************* */
  mouseclick(event, self) {//virtual

    if (self.manager) self.manager.toolClick(event, self);
  }
  mousedblclick(event, self) {//virtual

    if (self.manager) self.manager.toolDbClick(event, self);

  }

  constructor(toolItem, manager) {
    super(toolItem, manager)
    this.toolType = FOLDER_ICON_TOOL;
  }
}
/////////////////////////////////////

/////************editor tools ,such as save button,open button,svgnode symbol button and so on***************//////
class EditorTool {//abstract class
  static getInstance(toolItem, editorToolManager) {//单例模式
    if (this.instance) return this.instance;
    this.instance = new toolItem.toolClass(toolItem, editorToolManager);
    return this.instance;
  }

  activate(active, event) {
    var scene = this.toolManager.getActiveScene();
    if (!active) {
      this.clearTask();
      this.toolBtn.style.border = "none";
      scene.removeEventListener("click");

    }
    else {
      scene.setTool(this);

      this.setSceneMouseHandler(scene);
      this.toolBtn.style.opacity = "0.5";
      this.toolBtn.style.border = "1px solid red";
      this.toolBtn.style.background = "#8080ff";
      this.toolManager.setCursor("crosshair");//：十字标  
      this.toolManager.setCurrentTool(this);
    }
  }

  getToolBtn() { return this.toolBtn }
  /**************************/
  constructor(toolItem, editorToolManager) {
    this.toolItem = toolItem;
    this.toolManager = editorToolManager;

    this.toolBtn = new Image();
    this.toolBtn.src = "icons/" + toolItem.icon;
    this.toolBtn.alt = toolItem.caption;
    this.toolBtn.tooltips = toolItem.tooltips;

    this.toolBtn.className = "toolBtn";
    var me = this;
    this.toolBtn.onclick = function (event) {
      var ctool = editorToolManager.getCurrentTool();
      if (ctool) ctool.activate(false, event);
      me.activate(true, event)
    }
    this.toolBtn.onmouseenter = function (event) {
      var ctool = editorToolManager.getCurrentTool();
      if (ctool === me) return;
      me.toolBtn.style.cssText = "opacity:0.5";

    }
    this.toolBtn.onmouseleave = function (event) {
      var ctool = editorToolManager.getCurrentTool();
      if (ctool === me) return;
      me.toolBtn.style.cssText = "opacity:1.0";
    }

  }


  setProperty(name, value) {
    this[name] = value;
  }
  getProperty(name) {
    return this[name];
  }
  setSceneMouseHandler(scene) {

  }
  clearTask() {

  }
}

////////////Command:点击立即执行的工具或菜单//////////////
class Command extends EditorTool {//abstract class

  constructor(toolItem, toolManager) {
    super(toolItem, toolManager);
    var me = this;
    this.toolBtn.onclick = function (event) { me.execute.apply(me, arguments) };

    var li = document.createElement("li");//与css配合
    var a = document.createElement("a");
    a.innerHTML = toolItem.caption;
    a.onclick = function (event) { me.execute.apply(me, arguments); $(li.parentElement).hide() };
    li.appendChild(a);
    this.menu = li;
  }

  execute(event) {

  }

}
/*MyDialog:wrapper of jquery-ui dialog
 对话框有titlebar,contentbar,buttonbar由上至下三部分组成，
 上下有jq_ui生成，,中间contentbar基类默认生成“you are welcome”Div,
 由子类重载生成具体内容
 */

class MyDialog {

  constructor(title) {
    this.eventDispatcher = new EventDispatcher();
    this.id = CommonUtilities.getGuid();
    this.title = title;

  }

  show(ofEle) {
    var position = { my: "left top", at: "left bottom", of: ofEle }
    $(`#${this.id}`).dialog("option", "position", position)
    $(`#${this.id}`).dialog("open")

  };
  hide() { $(`#${this.id}`).dialog("hide") }
  /*************** */
  contentBar() {//virtual
    this.jqContentBar = $(`<div>welcome to MyDialog</div>`);
    return this.jqContentBar;
  }
  //virtual
  getContentIno() {/*placeholder for future 
        返回信息，供buttonbar按钮的回调函数使用*/
    return null;
  }
  buttonBar() {

  }
  /////////////////
  createDialogContainer() {
    this.jqDiaContainer = $(`<div id=${this.id} title=${this.title}></div>`);
    this.jqDiaContainer.visible = false;
    $(document.body).append(this.jqDiaContainer)
    this.jqDiaContainer.append(this.contentBar());
    this.jqDiaContainer.append(this.buttonBar());
  }
  //virtual,generate jq ui diaolog and register the event callbacks
  jqDialog() {

    $(`#${this.id}`).dialog({
      autoOpen: false,
      show: {
        effect: "blind",
        duration: 1000
      },
      hide: {
        effect: "explode",
        duration: 1000
      }
    });


  }


  create() {//virtual 
    this.createDialogContainer();
    this.jqDialog();
  }
  addEventListener(listener, eventname, handler) {
    this.eventDispatcher.subscrible(listener, eventname, handler)
  }
  dispatchEvent(event) {
    this.eventDispatcher.publish(event);
  }

}
////////////////////


export { EditorTool as Tool, Command, MyDialog, FolderIconTool, FOLDER_ICON_TOOL }



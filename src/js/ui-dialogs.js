import { MyDialog, FolderIconTool, FOLDER_ICON_TOOL } from './ui-base.js'
import {
    CommonUtilities, WsAgent, FILE_SAVE_EVENT, USER_LOGIN_EVENT, GET_FILELIST_EVENT,
    OPEN_FILE_EVENT, CREATE_FOLDER_EVENT, REQUEST_CHILDREN_BY_FOLDER_ID, REQUEST_FOLDER_INFO_BY_FILE_NAME,
    REQUEST_USER_ROOT_FOLDER, REMOVE_FILE_OR_FOLDER_EVENT
} from './common.js'
import { PopMenu } from './menu.js'

class OpenFileDialog extends MyDialog {
    resetUI() {

        this.jqSelectList.html("");
        this.jqHintBar.css({
            "display": "flex", "margin-top": "25px",
            'align-items': 'center', 'width': '200px', 'justify-content': 'center',
            "height": "30px", "font-size": "10pt", "border-radius": "5px"
        });
        this.jqHintBar.html("正在加载文件列表")

    }

    wsNotifyFileLoadHandler(openFileEvent) {
        //console.log(openFileEvent);
        var fileJson = openFileEvent.response.result.content;
        this.tool.toolManager.editor.loadFileFromJson(fileJson);
        $('#headerBar').html(this.tool.getUsername() + '-' + this.jqSelectList[0].selectedOptions[0].value);
        $(`#${this.id}`).dialog("close");

    }

    wsNotifyFileListHandler(getFileListEvent) {
        var response = getFileListEvent.response;
        var r = response.result;
        var fileList = response.fileList;

        if (!r.succeed) {

            this.jqHintBar.html("获取文件列表失败！");
            this.jqHintBar.css({ "background-color": "#e0d0d0" });
            return;
        }

        this.jqHintBar.html("文件列表已加载！");
        this.jqHintBar.css({ "background-color": "#e0d0d0" });
        for (let i = 0; i < fileList.length; i++) {
            let option = $(`<option>${fileList[i].filename}</option>`)
            this.jqSelectList.append(option);
        }
        //console.log(getFileListEvent);
    }
    //overridae
    jqDialog() {
        WsAgent.addEventListener(this, OPEN_FILE_EVENT, this.wsNotifyFileLoadHandler);
        WsAgent.addEventListener(this, GET_FILELIST_EVENT, this.wsNotifyFileListHandler);
        $(`#${this.id}`).dialog({
            close: false,
            autoOpen: false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
                "open": {
                    text: "打开",

                    click: function () {
                        var username = me.tool.getUsername();
                        var filename = me.jqSelectList[0].selectedOptions[0].value;

                        var request = { taskname: "openfile", file: { username: `${username}`, filename: `${filename}`, folder: '.' } };
                        var jsonRequest = JSON.stringify(request);
                        WsAgent.send(jsonRequest);
                    }
                },

                "Cancel": {
                    text: "退出",
                    click: function () {
                        $(`#${this.id}`).dialog("close");

                    },
                }
            }
        });

        var me = this;//dialog self
        $(`#${this.id}`).on("dialogopen", function () {
            var taskreq = { taskname: "getFileList", filter: { username: `${me.tool.getUsername()}`, folder: `.` } }
            var jsonReq = JSON.stringify(taskreq)

            WsAgent.send(jsonReq);
            me.resetUI.call(me);
        });


    }
    //override 
    contentBar() {
        this.jqContentBarID = CommonUtilities.getGuid();
        this.jqContentBar = $(`<div id=${this.jqContentBarID}></div>`);
        this.jqContentBar.css({
            "display": "flex",
            'flex-direction': 'column',
            'justify-content': 'center',
            'align-items': 'center'
        });
        this.fileListBarID = CommonUtilities.getGuid();
        ;
        this.jqFileListBar = $(`<div>文件名\
                         
                         </div>`);
        this.jqFileListBar.css({
            "display": "flex",
            'justify-content': 'space-around',
            'flex-direction': 'row',
            'align-items': 'center'
        });

        this.selectListID = CommonUtilities.getGuid();
        this.jqSelectList = $(`<select id=${this.selectListID}></select>`);
        this.jqFileListBar.append(this.jqSelectList);
        this.jqContentBar.append(this.jqFileListBar);


        this.jqHintBarID = CommonUtilities.getGuid();
        this.jqHintBar = $(`<div id=${this.jqHintBarID}>正在加载文件列表</div>`);
        this.jqHintBar.css({
            "display": "flex", "margin-top": "25px",
            'align-items': 'center', 'width': '200px', 'justify-content': 'center',
            "height": "30px", "font-size": "10pt", "border-radius": "5px"
        })
        this.jqContentBar.append(this.jqHintBar);



        return this.jqContentBar;

    }
    loadFileList(fileListEvent) {




    }
    constructor(title, tool) {
        super(title);
        this.tool = tool;
        this.create();


    }


}
/////////////////////////


class LoginDialog extends MyDialog {
    restetUI() {
        let pwdInput = document.getElementById(`${this.pwdInputID}`);
        let hintSpan = document.getElementById(`${this.jqHintSpanID}`);
        $(hintSpan).css({ "background-color": "#d0d0d0" });
        pwdInput.value = "";
        $(hintSpan).html("请输入用户名和密码");
    }
    wsNotiyHandler(wsLoginEvent) {
        //for login task,reponse from server to client=
        //{task:"login",resutlt:{succeed:true|false,msg:"login Ok"},user:{name:username,pwd:password}} 

        var response = wsLoginEvent.response;
        var hintSpan = document.getElementById(`${this.jqHintSpanID}`);


        if (response.result.succeed == true) {
            $(hintSpan).css({ "background-color": "#e0d0d0" });
            $(hintSpan).html(response.result.msg + "，对话框将自动关闭");
            this.dispatchEvent(wsLoginEvent);

            setTimeout(() => {
                $(`#${this.id}`).dialog("close")

            }, 2000);
        }
        else {
            $(hintSpan).css({ "background-color": "#eed0d0" });
            $(hintSpan).html(response.result.msg);
        }
    }
    //overridae
    jqDialog() {
        var me = this;

        WsAgent.addEventListener(this, USER_LOGIN_EVENT, this.wsNotiyHandler);
        $(`#${this.id}`).dialog({
            close: false,
            autoOpen: false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
                "login": {
                    text: "登录",

                    click: function () {
                        var username = document.getElementById(me.useInputID).value;
                        var pwd = document.getElementById(me.pwdInputID).value;
                        //if(username.length<3){return;}//check the valid of username
                        //if(pwd.length<6){return;}//check valid of password
                        //request={task:[login|register|save|open],user:{name:username,pwd:password}}
                        var request = { taskname: "login", user: { name: `${username}`, pwd: `${pwd}` } };
                        var jsonRequest = JSON.stringify(request);
                        WsAgent.send(jsonRequest);
                    }
                },

                "Cancel": {
                    text: "退出",
                    click: function () {
                        $(`#${this.id}`).dialog("close");

                    },
                }
            }
        });

        $(`#${this.id}`).on("dialogclose", function () { me.restetUI.call(me) });


    }
    contentBar() {
        var id = CommonUtilities.getGuid();
        this.jqContentBar = $(`<div id=${id}></div>`);
        this.jqContentBar.css({
            "display": "flex",
            'flex-direction': 'column',
            'justify-content': 'center',
            'align-items': 'center'
        });
        this.useInputID = CommonUtilities.getGuid();
        this.pwdInputID = CommonUtilities.getGuid();
        this.usernameRuleID = CommonUtilities.getGuid();
        this.passwordRuleID = CommonUtilities.getGuid();
        this.jqUserInoBar = $(`<div" >\
                         用户名: <input type="text"   id=${this.useInputID} /><span id=${this.usernameRuleID}>${this.usernameRule}</span>\
                         密码: <input type="password" id=${this.pwdInputID} /><span id=${this.passwordRuleID}>${this.passwordRule}</span>\
                         </div>`);

        this.jqUserInoBar.css({
            "display": "grid",
            "grid-template-columns": "15% 40% 45%",
            "grid-template-rows": "50% 50%",
            "grid-row-gap": "8px",
            "grid-column-gap": "8px"
        });
        this.jqContentBar.append(this.jqUserInoBar);
        this.jqHintSpanID = CommonUtilities.getGuid();
        this.jqHintSpan = $(`<div id=${this.jqHintSpanID}>请输入用户名和密码</div>`);
        this.jqHintSpan.css({
            "display": "flex", "margin-top": "25px",
            'align-items': 'center', 'width': '200px', 'justify-content': 'center',
            "height": "30px", "font-size": "10pt", "border-radius": "5px"
        })
        this.jqContentBar.append(this.jqHintSpan);

        return this.jqContentBar;
    }
    constructor(title, usernameRule, passwordRule) {
        super(title);
        this.usernameRule = usernameRule;
        this.passwordRule = passwordRule;
        this.create();
        this.restetUI();
    }


}
//////////////////


class FileDialog extends MyDialog {
    restetUI() {//virtual


    }


    wsNotiyHandler(wsTaskEvent) {//virtual
    }
    /****************** */
    getUsername() {
        return this.tool.getUsername();
    }
    /******************* */
    jqDialog() {//virtual
        var me = this;
        $(`#${this.id}`).dialog({
            autoOpen: false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
                "save": {
                    text: "保存",

                    click: function () {
                        var filename = document.getElementById(me.folder.fileInputID).value;
                        var username = me.tool.getUsername();
                        var content = me.tool.getContent();
                        var date = new Date();
                        var time = date.toLocaleDateString() + date.toLocaleTimeString();
                        var ip = "fakeIP";//real IP will be set by server;
                        var parentFolderID = me.folder.currentFolderFolderIconTool.toolItem.folderID;
                        var request = { taskname: "savefile", file: { name: `${filename}`, isfolder: false, username: `${username}`, content: `${content}`, parentFolderID: `${parentFolderID}` }, time: `${time}`, ip: `${ip}` };
                        var jsonRequest = JSON.stringify(request);
                        WsAgent.send(jsonRequest);

                    }
                },

                "Cancel": {
                    text: "取消",
                    click: function () { $(`#${this.id}`).dialog("close") },
                },

            }
        });
        $(`#${this.id}`).on("dialogclose", function () { me.restetUI.call(me) });
        $(`#${this.id}`).on("dialogopen", function () { me.initDialogUI.call(me) });
    }

    constructor(title, savetool) {
        super(title);
        this.tool = savetool;
        this.currentUser = null;

        this.create();
        WsAgent.addEventListener(this, FILE_SAVE_EVENT, this.wsNotiyHandler);
        WsAgent.addEventListener(this, OPEN_FILE_EVENT, this.wsNotifyFileLoadHandler);
        this.currentFolder = '#';//??????????????????????????????????
        this.restetUI();

    }
}
/////////////////////////////////

/////////////////////////////////
class Folder {
    constructor(owner) {
        this.owner = owner;
        WsAgent.addEventListener(this, REQUEST_CHILDREN_BY_FOLDER_ID, this.wsNotifyRequestChildrenByFolderID);
        WsAgent.addEventListener(this, REQUEST_USER_ROOT_FOLDER, this.wsNotifyRequestUserRootFolder);
        WsAgent.addEventListener(this, CREATE_FOLDER_EVENT, this.wsNotifyCreateFolder);
        WsAgent.addEventListener(this, REMOVE_FILE_OR_FOLDER_EVENT, this.wsNotifyFileRemove)
        this.path = '';
        this.pathStack = new Array();//?????????

    }
    /***************/
    getUsername() {
        return this.owner.getUsername();
    }
    /*********** */
    requestChildrenByFolderID(folderID) {
        var id = folderID;
        var username = this.owner.tool.getUsername();;
        var date = new Date();
        var time = date.toLocaleDateString() + date.toLocaleTimeString();
        var ip = "fakeIP";//real IP will be set by server;
        var request = { taskname: REQUEST_CHILDREN_BY_FOLDER_ID, folder: { username: `${username}`, id: `${id}`, time: `${time}`, ip: `${ip}` } };
        var jsonRequest = JSON.stringify(request);
        WsAgent.send(jsonRequest);

    }
    /************* */
    wsNotifyRequestChildrenByFolderID(wsTaskEvent) {//virtual
        var folders = wsTaskEvent.response.result;
        this.loadFolders(folders)

    }
    /************* */
    wsNotifyRequestFolderInfoByFileName(wsTaskEvent) {

    }
    /******************** */
    wsNotifyCreateFolder(wsTaskEvent) {
        var folder = wsTaskEvent.response.result;
        var toolItem = toolItem = { icon: 'folder.png', caption: folder.name, folderID: folder.id };
        var folderIconTool = new FolderIconTool(toolItem, this);
        folderIconTool.setPopMenu(this.folder_icon_tool_popMenu);
        this.appendFolderToolIcon(folderIconTool.getToolBtn());
        this.folderIconTool = folderIconTool;

    }
    //***************
    wsNotifyFileRemove(wsTaskEvent) {
        console.log(wsTaskEvent);
        var toolDiv = document.getElementById(wsTaskEvent.response.result.toolDivId);
        toolDiv.remove();       
    }
    /************ */
    requestFolderInfoBYFileName(filename, parent_id) {

        var username = this.owner.tool.getUsername();;
        var date = new Date();
        var time = date.toLocaleDateString() + date.toLocaleTimeString();
        var ip = "fakeIP";//real IP will be set by server;
        var request = {
            taskname: REQUEST_FOLDER_INFO_BY_FILE_NAME, folder: {
                username: `${username}`, filename: `${filename}`,
                parent_id: `${parent_id}`, time: `${time}`, ip: `${ip}`
            }
        };
        var jsonRequest = JSON.stringify(request);
        WsAgent.send(jsonRequest);

    }
    /*************** */
    requestUserRootFolder(username, rootid) {

        var date = new Date();
        var time = date.toLocaleDateString() + date.toLocaleTimeString();
        var ip = "fakeIP";//real IP will be set by server;
        //ACCORDING CONVENTION,ROOT FOLDER'S NAME IS USERNAME
        var request = {
            taskname: REQUEST_USER_ROOT_FOLDER, folder: {
                username: `${username}`, filename: `${username}`,
                parent_id: `${rootid}`, time: `${time}`, ip: `${ip}`
            }
        };
        var jsonRequest = JSON.stringify(request);
        WsAgent.send(jsonRequest);
    }
    /****************** */
    wsNotifyRequestUserRootFolder(wsTaskEvent) {
        var folders = wsTaskEvent.response.result;
        var toolItem = { icon: 'folder.png', caption: folders[0].name, folderID: folders[0].id }
        toolItem.icon = 'folder.png';
        let folderIconTool = new FolderIconTool(toolItem, this);
        folderIconTool.setPopMenu(this.folder_icon_tool_popMenu);
        this.appendFolderToolIcon(folderIconTool.getToolBtn());
        this.folderIconTool = folderIconTool;
        //this.owner is a saveAsDialog　Object 
        //this.owner.tool is a tool clicked that popup the saveAsDialog window
        this.jqNavigitorBarElements.pathBar.html(this.owner.tool.getUsername()+">");


    }
    /**************** */
    toolMouseup(event, sourceTool) {

    }
    toolClick(event, sourceTool) {
        var toolType = sourceTool.toolType;
        switch (toolType) {
            case FOLDER_ICON_TOOL:
             
                sourceTool.toolButton.style.border = "1px solid blue";
                sourceTool.toolButton.style.background = "#aaaaaa";
                //this.requestChildrenByFolderID(sourceTool.toolItem.folderID);
                //this.jqFolderListBar.html("");
                this.folder_icon_tool_popMenu.setParent(this.jqFolderListBar[0]);
                this.currentFolderFolderIconTool = sourceTool;
                break;

            default:

                break;
        }
    }
    toolDbClick(event, sourceTool) {

        var toolType = sourceTool.toolType;
        switch (toolType) {
            case FOLDER_ICON_TOOL:
                var path = this.jqNavigitorBarElements.pathBar.html();
                if (path.length > 0) this.path = path + sourceTool.toolItem.caption + '>';
                else this.path=sourceTool.toolItem.caption+ '>';
                this.jqNavigitorBarElements.pathBar.html(this.path);
                this.pathStack.push(sourceTool);
                var folderID = sourceTool.toolItem.folderID;
                this.jqFolderListBar.html("");
                this.requestChildrenByFolderID(folderID);
                break;
        }
    }
    //***** */
    contextmenu(event, sourceTool) {
        var toolType = sourceTool.toolType;
        switch (toolType) {
            case FOLDER_ICON_TOOL:
                event.preventDefault();
                var ox = event.currentTarget.offsetLeft;
                var oy = event.currentTarget.offsetTop;
                var sh = event.currentTarget.parentElement.scrollTop;
                event.sourceTool = sourceTool;
                sourceTool.popmenu.setTargetEvent(event)
                sourceTool.popmenu.showAt(ox + event.offsetX,
                    oy - sh + event.offsetY);
                break;
            default:
                break;
        }

    }
    //******** */
    loadFolders(folderArray) {
        var toolItem;
        for (let i = 0; i < folderArray.length; i++) {
            toolItem = { icon: 'folder.png', caption: folderArray[i].name, folderID: folderArray[i].id }
            if (!folderArray[i].isfolder)
                toolItem.icon = 'file.png';
            let folderIconTool = new FolderIconTool(toolItem, this);
            folderIconTool.setPopMenu(this.folder_icon_tool_popMenu);
            this.appendFolderToolIcon(folderIconTool.getToolBtn());
            this.folderIconTool = folderIconTool;
        }
    }
    //-----
    //called by owner.newFolderButtonClick(event),and owner is folder Object
    newFolderButtonClick(username, event) {
        var date = new Date();
        var time = date.toLocaleDateString() + date.toLocaleTimeString();
        var ip = "fakeIP";//real IP will be set by server;
        var username = this.owner.tool.getUsername()
        var parentFolderID = this.currentFolderFolderIconTool.toolItem.folderID;
        var request = { taskname: CREATE_FOLDER_EVENT, file: { isfolder: true, username: `${username}`, parentFolderID: `${parentFolderID}` }, time: `${time}`, ip: `${ip}` };
        var jsonRequest = JSON.stringify(request);
        WsAgent.send(jsonRequest);
    }
    //-----------------------
    deleteCtxMenuClick(event) {
        var sourceTool = event.sourceTool;
        var date = new Date();
        var time = date.toLocaleDateString() + date.toLocaleTimeString();
        var toolDivId = sourceTool.getToolBtn().getAttribute('id');
        var ip = "fakeIP";//real IP will be set by server;
        var username = sourceTool.getUsername();
        var id = sourceTool.getFolderID();
        var request = {
            taskname: REMOVE_FILE_OR_FOLDER_EVENT, file: { username: `${username}`, id: `${id}`, toolDivId: `${toolDivId}` },
            time: `${time}`, ip: `${ip}`
        };
        var jsonRequest = JSON.stringify(request);
        WsAgent.send(jsonRequest);
    }
    //------------------------
    createFolderUIElements() {

        function createContentBar(id) {

            var jqContentBar = $(`<div id=${id}></div>`);
            jqContentBar.css({
                "display": "flex",
                'flex-direction': 'column',
                'justify-content': 'center',
                'align-items': 'center'
            });
            return jqContentBar;
        }
        //-----------
        function createNavigitorBar(id) {

            var jqNavigitorBar = $(`<div　id=${id}><h5>当前路径</h5></div>`);
            jqNavigitorBar.css({
                "display": "flex",
                'flex-direction': 'column',
                'justify-content': 'center',

            });
            var jqPathBar = $(`<div　></div>`);

            jqPathBar.css({ "height": "60px", "width": "200px", "border": "1px solid" , 'overflow': 'scroll'})
            jqNavigitorBar.append(jqPathBar);
            var jqButtonDiv = $(`<div　'></div>`);
            jqButtonDiv.css({ "height": "40px", "width": "200px", "padding": "5px" })
            var jqGoBackButton = $('<button>GoBack</button>').button();
            jqButtonDiv.append(jqGoBackButton);
            var jqForwardButton = $('<button>Forward</button>').button();
            jqButtonDiv.append(jqForwardButton);
            jqNavigitorBar.append(jqButtonDiv);
            return { naviBar: jqNavigitorBar, pathBar: jqPathBar };
        }
        //---------
        function createFolderListBar(id) {

            var jqFolderBar = $(`<div id=${id}></div>`);
            jqFolderBar.css({
                "height": "150px",
                "width": "200px",
                "border": "1px solid",
                'justify-content': 'space-around',
                'overflow': 'scroll'

            });
            return jqFolderBar;
        }

        //-----------------------
        function createCommandBar(id, owner) {
            var jqCommandBar = $(`<div　id=${id}></div>`);
            jqCommandBar.css({
                "display": "flex",
                'flex-direction': 'row',
                'justify-content': 'center',

            });

            var jqNewButton = $('<button>新建</button>').button();
            jqNewButton[0].onclick = function (event) {
                owner.newFolderButtonClick(event)
            }
            jqCommandBar.append(jqNewButton);
            var jqDeletedButton = $('<button>删除</button>').button();
            jqCommandBar.append(jqDeletedButton);
            return jqCommandBar;

        }
        //----------------
        function createFileNameBar(id) {
            var jqFileNameBar = $(`<div><h5>文件名</h5><input type="text"  id=${id} /></div>`);

            return jqFileNameBar;

        }
        function createHintBar(id) {

            var jqHintBar = $(`<div id=${id}>文件将存到服务器</div>`);
            jqHintBar.css({
                "display": "flex", "margin-top": "25px",
                'align-items': 'center', 'width': '200px', 'justify-content': 'center',
                "height": "30px", "font-size": "10pt", "border-radius": "5px"
            });
            return jqHintBar;
        }
        //-----------

        this.navigitorID = CommonUtilities.getGuid();
        this.folderDivID = CommonUtilities.getGuid();
        this.fileInputID = CommonUtilities.getGuid();
        this.jqHintBarID = CommonUtilities.getGuid();
        this.jqCommandBarID = CommonUtilities.getGuid();

        this.jqContentBar = createContentBar(this.id);
        this.jqNavigitorBarElements = createNavigitorBar(this.navigitorID);
        this.jqFolderListBar = createFolderListBar(this.folderDivID);
        this.jqCommandBar = createCommandBar(this.jqCommandBarID, this);
        this.jqFilInputBar = createFileNameBar(this.fileInputID)
        this.jqHintBar = createHintBar(this.jqHintBarID);
        this.jqContentBar.append(this.jqNavigitorBarElements.naviBar);
        this.jqContentBar.append(this.jqFolderListBar);
        this.jqContentBar.append(this.jqCommandBar);
        this.jqContentBar.append(this.jqContentBar);
        this.jqContentBar.append(this.jqFilInputBar);
        this.jqContentBar.append(this.jqHintBar);
        var folde_icon_tool_popMenu_config = [{ caption: "删除", icon: "delete.png", tooltips: "删除", handler: this.deleteCtxMenuClick }];
        this.folder_icon_tool_popMenu = new PopMenu(folde_icon_tool_popMenu_config, this.jqFolderListBar[0]);
        return this.jqContentBar;

    }
    appendFolderToolIcon(folderToolIcon) {
        this.jqFolderListBar.append(folderToolIcon)
    }

}
///////////////////////////////////////////////////
const ROOTID = "a1ca0f7b-51bd-4bf3-a5d5-6a74f6adc1c7"
class SaveAsDialog extends FileDialog {


    initDialogUI() {//virtual

        var user = this.tool.getUsername();
        this.folder.requestUserRootFolder(user, ROOTID);

    }
    restetUI() {
        // let jqHintBar=document.getElementById(`${this.jqHintBarID}`);
        //  $(jqHintBar).css({"background-color":"#d0d0d0"});
        //  $(jqHintBar).html("文件将存到服务器");

    }


    wsNotiyHandler(wsTaskEvent) {
        var response = wsTaskEvent.response;
        var hintSBar = document.getElementById(`${this.folder.jqHintBarID}`);
        //console.log(wsTaskEvent);
        var response = wsTaskEvent.response;

        if (response.result.succeed == true) {
            $(hintSBar).css({ "background-color": "#e0d0d0" });
            $(hintSBar).html(response.result.msg + "，对话框将自动关闭");
            this.dispatchEvent(wsTaskEvent);

            setTimeout(() => {
                $(`#${this.id}`).dialog("close")

            }, 2000);
        }
        else {
            $(hintSBar).css({ "background-color": "#eed0d0" });
            $(hintSBar).html(response.result.msg);
        }
    }
    contentBar() {
        this.folder = new Folder(this);
        return this.folder.createFolderUIElements();

    }


}
/////////////////////////////////

//////////////////////////////////
export { LoginDialog, SaveAsDialog as SaveDialog, OpenFileDialog }
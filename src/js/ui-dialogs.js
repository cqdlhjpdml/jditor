import{MyDialog} from './ui-base-tools.js'
import {CommonUtilities,WsAgent,FILE_SAVE_EVENT,USER_LOGIN_EVENT, GET_FILELIST_EVENT, OPEN_FILE_EVENT} from './common.js'
class OpenFileDialog extends MyDialog{
    resetUI(){
        
        this.jqSelectList.html("");
        this.jqHintBar.css({"display":"flex","margin-top":"25px",
        'align-items':'center','width':'200px','justify-content':'center',
        "height":"30px","font-size":"10pt","border-radius":"5px"});
        this.jqHintBar.html("正在加载文件列表")
       
    }

    wsNotifyFileLoadHandler(openFileEvent){
        //console.log(openFileEvent);
        var fileJson=openFileEvent.response.result.content;
        this.tool.toolManager.editor.loadFileFromJson(fileJson);
        $('#headerBar').html(this.tool.getUsername()+'-'+this.jqSelectList[0].selectedOptions[0].value);
        $(`#${this.id}` ).dialog("close");
        
    }

    wsNotifyFileListHandler(getFileListEvent){
        var response=getFileListEvent.response;
        var r=response.result;
        var fileList=response.fileList;
        
        if(!r.succeed) {
           
            this.jqHintBar.html("获取文件列表失败！");
            this.jqHintBar.css({"background-color":"#e0d0d0"});
            return;
        }
        
        this.jqHintBar.html("文件列表已加载！");
        this.jqHintBar.css({"background-color":"#e0d0d0"});
        for(let i=0;i<fileList.length;i++) {
           let option=$(`<option>${fileList[i].filename}</option>`)
           this.jqSelectList.append(option);
        } 
        //console.log(getFileListEvent);
     }
     //overridae
     jqDialog(){
        WsAgent.addEventListener(this,OPEN_FILE_EVENT,this.wsNotifyFileLoadHandler);
        WsAgent.addEventListener(this,GET_FILELIST_EVENT,this.wsNotifyFileListHandler);
        $(`#${this.id}` ).dialog({
            close:false,
            autoOpen:false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
               "open":{
                    text: "打开",
                    
                    click: function() {
                        var username=me.tool.getUsername();
                        var filename=me.jqSelectList[0].selectedOptions[0].value;
                       
                        var request={taskname:"openfile",file:{username:`${username}`,filename:`${filename}`,folder:'.'}};
                        var jsonRequest=JSON.stringify(request);
                        WsAgent.send(jsonRequest);
                    }
                },
               
              "Cancel":{ 
                text:"退出",
                click:function(  ){ 
                  $(`#${this.id}` ).dialog("close");
                  
                },
              }
          }});
          
          var me=this;//dialog self
          $(`#${this.id}`).on( "dialogopen", function(){
                                 var taskreq={taskname:"getFileList",filter:{username:`${me.tool.getUsername()}`,folder:`.`}}
                                 var jsonReq=JSON.stringify(taskreq)
             
                                WsAgent.send(jsonReq);  
                                me.resetUI.call(me);
                            } );
       
   
    }
    //override 
    contentBar(){
        this.jqContentBarID=CommonUtilities.getGuid();
        this.jqContentBar=$(`<div id=${this.jqContentBarID}></div>`);
        this.jqContentBar.css({"display": "flex",
                           'flex-direction':'column',
                           'justify-content':'center',
                           'align-items':'center'
                        });
        this.fileListBarID=CommonUtilities.getGuid();
        ;
        this.jqFileListBar=$(`<div>文件名\
                         
                         </div>`);
        this.jqFileListBar.css({ "display": "flex",
        'justify-content': 'space-around',  
        'flex-direction':'row' ,
        'align-items':'center'  
        });
        
        this.selectListID=CommonUtilities.getGuid();
        this.jqSelectList=$(`<select id=${this.selectListID}></select>`);
        this.jqFileListBar.append(this.jqSelectList);
        this.jqContentBar.append(this.jqFileListBar);
       
        
        this.jqHintBarID=CommonUtilities.getGuid();
        this.jqHintBar=$(`<div id=${this.jqHintBarID}>正在加载文件列表</div>`);
        this.jqHintBar.css({"display":"flex","margin-top":"25px",
                      'align-items':'center','width':'200px','justify-content':'center',
                      "height":"30px","font-size":"10pt","border-radius":"5px"})
        this.jqContentBar.append(this.jqHintBar);
        
        
             
        return this.jqContentBar;

    }
    loadFileList(fileListEvent){
      



    }
    constructor(title,tool){
        super(title);
        this.tool=tool;
        this.create();
        

    }


}
/////////////////////////


class LoginDialog extends MyDialog{
    restetUI(){
        let pwdInput=document.getElementById(`${this.pwdInputID}`);
        let hintSpan=document.getElementById(`${this.jqHintSpanID}`);
        $(hintSpan).css({"background-color":"#d0d0d0"});
        pwdInput.value="";
        $(hintSpan).html("请输入用户名和密码");
    }
    wsNotiyHandler(wsLoginEvent){
      //for login task,reponse from server to client=
      //{task:"login",resutlt:{succeed:true|false,msg:"login Ok"},user:{name:username,pwd:password}} 
        
        var response=wsLoginEvent.response;
        var hintSpan=document.getElementById(`${this.jqHintSpanID}`);
        
    
        if(response.result.succeed==true){
            $(hintSpan).css({"background-color":"#e0d0d0"});
            $(hintSpan).html(response.result.msg+"，对话框将自动关闭");
            this.dispatchEvent(wsLoginEvent);
                       
            setTimeout(()=>{
                          $(`#${this.id}` ).dialog("close")
                             
                           },2000);
        }
        else{
            $(hintSpan).css({"background-color":"#eed0d0"});
            $(hintSpan).html(response.result.msg);
        }
    }
    //overridae
    jqDialog(){
        var me=this;
        
        WsAgent.addEventListener(this,USER_LOGIN_EVENT,this.wsNotiyHandler);
        $(`#${this.id}` ).dialog({
            close:false,
            autoOpen:false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
               "login":{
                    text: "登录",
                    
                    click: function() {
                        var username=document.getElementById(me.useInputID).value;
                        var pwd=document.getElementById(me.pwdInputID).value;
                        //if(username.length<3){return;}//check the valid of username
                        //if(pwd.length<6){return;}//check valid of password
                        //request={task:[login|register|save|open],user:{name:username,pwd:password}}
                        var request={taskname:"login",user:{name:`${username}`,pwd:`${pwd}`}};
                        var jsonRequest=JSON.stringify(request);
                        WsAgent.send(jsonRequest);
                    }
                },
               
              "Cancel":{ 
                text:"退出",
                click:function(  ){ 
                  $(`#${this.id}` ).dialog("close");
                  
                },
              }
          }});
          
          $(`#${this.id}`).on( "dialogclose", function(){me.restetUI.call(me)} );
       

    }
    contentBar(){
        var  id=CommonUtilities.getGuid();
        this.jqContentBar=$(`<div id=${id}></div>`);
        this.jqContentBar.css({"display": "flex",
                           'flex-direction':'column',
                           'justify-content':'center',
                           'align-items':'center'
                        });
        this.useInputID=CommonUtilities.getGuid();
        this.pwdInputID=CommonUtilities.getGuid();
        this.usernameRuleID=CommonUtilities.getGuid();
        this.passwordRuleID=CommonUtilities.getGuid();
        this.jqUserInoBar=$(`<div" >\
                         用户名: <input type="text"   id=${this.useInputID} /><span id=${this.usernameRuleID}>${this.usernameRule}</span>\
                         密码: <input type="password" id=${this.pwdInputID} /><span id=${this.passwordRuleID}>${this.passwordRule}</span>\
                         </div>`);
                         
        this.jqUserInoBar.css({ "display": "grid",
            "grid-template-columns": "15% 40% 45%",
            "grid-template-rows":  "50% 50%",
            "grid-row-gap": "8px",
            "grid-column-gap": "8px"
        });
        this.jqContentBar.append(this.jqUserInoBar);
        this.jqHintSpanID=CommonUtilities.getGuid();
        this.jqHintSpan=$(`<div id=${this.jqHintSpanID}>请输入用户名和密码</div>`);
        this.jqHintSpan.css({"display":"flex","margin-top":"25px",
                      'align-items':'center','width':'200px','justify-content':'center',
                      "height":"30px","font-size":"10pt","border-radius":"5px"})
        this.jqContentBar.append(this.jqHintSpan);
             
        return this.jqContentBar;
    }
    constructor(title,usernameRule,passwordRule){
        super(title);
        this.usernameRule=usernameRule;
        this.passwordRule=passwordRule;
        this.create();
        this.restetUI();
    }

   
}
//////////////////

class SaveDialog extends MyDialog{
    restetUI(){
        let jqHintBar=document.getElementById(`${this.jqHintBarID}`);
        
        $(jqHintBar).css({"background-color":"#d0d0d0"});
        $(jqHintBar).html("文件将存到服务器");
        
    }
    wsNotiyHandler(wsTaskEvent){
        var response=wsTaskEvent.response;
        var hintSBar=document.getElementById(`${this.jqHintBarID}`);
        //console.log(wsTaskEvent);
        var response=wsTaskEvent.response;
       
        if(response.result.succeed==true){
            $(hintSBar).css({"background-color":"#e0d0d0"});
            $(hintSBar).html(response.result.msg+"，对话框将自动关闭");
            this.dispatchEvent(wsTaskEvent);
                       
            setTimeout(()=>{
                          $(`#${this.id}` ).dialog("close")
                             
                           },2000);
        }
        else{
            $(hintSBar).css({"background-color":"#eed0d0"});
            $(hintSBar).html(response.result.msg);
        }
    }
    jqDialog(){
        var me=this;
        $(`#${this.id}` ).dialog({
            autoOpen:false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
               "save":{
                    text: "保存",
                    
                    click: function() {
                        var filename=document.getElementById(me.fileInputID).value;
                        var username=me.tool.getUsername();
                        var content=me.tool.getContent();
                        var date=new Date();
                        var time=date.toLocaleDateString()+date.toLocaleTimeString();
                        var ip="fakeIP";//real IP will be set by server;
                        var folder='.';
                        
                        var request={taskname:"savefile",file:{filename:`${filename}`,username:`${username}`,content:`${content}`,folder:`${folder}`},time:`${time}`,ip:`${ip}`};
                        var jsonRequest=JSON.stringify(request);
                        WsAgent.send(jsonRequest);
                                               
                    }
                  },
               
              "Cancel":{ 
                text:"取消",
                click:function(  ){ $(`#${this.id}` ).dialog("close")},
              },
              
          }});
      $(`#${this.id}`).on( "dialogclose", function(){me.restetUI.call(me)} )
    }
    contentBar(){
        var  id=CommonUtilities.getGuid();
        this.jqContentBar=$(`<div id=${id}></div>`);
        this.jqContentBar.css({"display": "flex",
                           'flex-direction':'column',
                           'justify-content':'center',
                           'align-items':'center'
                        });
        this.fileInputID=CommonUtilities.getGuid();
        ;
        this.jqFileBar=$(`<div><h5>文件名</h5><input type="text"  id=${this.fileInputID} />\
                         
                         </div>`);
                         
        this.jqFileBar.css({ "display": "flex",
        'justify-content': 'space-around',  
        'flex-direction':'row' ,
        'align-items':'center'  
        });
        this.jqContentBar.append(this.jqFileBar);
        this.jqHintBarID=CommonUtilities.getGuid();
        this.jqHintBar=$(`<div id=${this.jqHintBarID}>文件将存到服务器</div>`);
        this.jqHintBar.css({"display":"flex","margin-top":"25px",
                      'align-items':'center','width':'200px','justify-content':'center',
                      "height":"30px","font-size":"10pt","border-radius":"5px"})
        this.jqContentBar.append(this.jqHintBar);
             
        return this.jqContentBar;

    }
    constructor(title,savetool){
        super(title);
        this.tool=savetool;
        this.create();
        WsAgent.addEventListener(this,FILE_SAVE_EVENT,this.wsNotiyHandler);
        this.restetUI();
    }
}
//////////////////////////////////
export{LoginDialog,SaveDialog,OpenFileDialog}
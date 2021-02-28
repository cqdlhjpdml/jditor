//web socket server to surpport user to  register ,save,login and other operations.

const Config=require("../server-config.js")
const WebSocket = require('ws');
const db=require("../models/db.js");
const wss = new WebSocket.Server({ port: Config.webSocketPort });
var taskRouter=new Array();

//////////////////
class  TaskRouter{
  constructor(){
    this.taskRouter={};
    
  }
  addRouter(taskname,router){
    if(!this.taskRouter[taskname])
        this.taskRouter[taskname]=new Array();
    this.taskRouter[taskname].push(router);
  }
  async route(taskreq){
    var taskname=taskreq.taskname;
    this.currentTaskreq=taskreq;
    var handlers=this.taskRouter[taskname];
    this.handlerLine=handlers;
    this.nextHandlerIndex=0;
    var me=this;
    return await this.next(me);
  }
  removeRouter(taskname,handlername)
  {
    
    var handlers=this.taskRouter[taskname];
    for(let i=0;i<handlers.length;i++) {
      let handler=handlers[i];
      if(handler.name==handlername) handlers.splice(index, i);
   }
  }
  async next(me){
    if(me.nextHandlerIndex>me.handlerLine.length) return;
    else  return  await  me.handlerLine[me.nextHandlerIndex++].doTask(me.currentTaskreq);
  }
  
}
var taskRouter=new TaskRouter();
///////////////////
class Task_Handler{
  constructor(name,db){
    this.db=db;
    this.name=name;
    
  }
  //virtual
  async doTask(taskReq,next){
    //if there's a handler stack chain and you'd like to call the next handler after your codes,then
    //next function should be called ,  if not to call the next function,the other hanlers in the stack following yours will be bypass.
    //await callFunction 
    
  }
}
//////////////
class getFileList_TaskHandler extends Task_Handler{
  async getFileList(filter){
    return await this.db.getFileList(filter)
  }
  async doTask(taskReq){
    var filter=taskReq.filter
    var r= await this.getFileList(filter);
    var response={taskname:taskReq.taskname,result:{succeed:true,msg:"文件列表已返回"},fileList:r};
    return response;
  }
}
////////////////////////////////
class OpenFile_TaskHandler extends Task_Handler{
  async checkvalid(file){
     //file:{filename:`${filename}`,username:`${username}`,content:`${jsonStr}`}
     var filter={filename:file.filename,username:file.username,folder:file.folder};
     if(!filter.filename||!filter.username||!filter.folder) return {succeed:false,msg:"[用户名|文件名|路径]不能为空！"};
     else return {succeed:true,msg:"[用户名|文件名|路径]满足要求！"};
  }
  
  
  async getFileContent(file){
    var response;
    var r= await this.checkvalid(file);
    if(!r.succeed) {
      response={taskname:"openfile",result:r}
      return response;
    }
    
    var r=await this.db.readFile(file);
    return {taskname:"openfile",result:r};
  }

  async doTask(taskReq){
    this.taskReq=taskReq;
    var file=taskReq.file;
    return await this.getFileContent(file);
  }
}

////////////////////////////////
class SaveFile_TaskHandler extends Task_Handler{
  async checkvalid(file){
    //file:{filename:`${filename}`,username:`${username}`,content:`${jsonStr}`}
    var filter={name:file.name,username:file.username,parent_id:file.parentFolderID,isfolder:false};
    if(!filter.name||!filter.username||!filter.parent_id) return {succeed:false,msg:"[用户名|文件名|路径]不能为空！"};
    
    var r=await this.db.getFileList(filter);
    if(r.length!=0)      return {succeed:false,msg:"该文件已存在！" };
    else return {succeed:true,msg:"OK！"}
  }
  async savefile(file){
    
    var r,response;
    r=await this.checkvalid(file);
    if(!r.succeed) {
      response={taskname:"savefile",result:r}
      return response;
    }
    r=await this.db.createFile(file);
    response={taskname:"savefile",result:r};
    return response;
       
  }
  /***************************/
  async doTask(taskReq){
    this.taskReq=taskReq;
    var file=taskReq.file;
    return await this.savefile(file);
  }
}
//////////////////////
class Login_Register_TaskHandller extends Task_Handler{
  async checvalid(user){
    if(!user.pwd|!user.name) return {succeed:false,msg:"用户名或密码为空!"};
    let users=await this.db.getUser(user.name);
    if(users.length==0) return {succeed:false,msg:"该用户不存在!",};
    if(user.pwd)
      if(user.pwd==users[0].pwd) return {succeed:true,msg:"OK登录成功!"}; 
      else return {succeed:false,msg:"密码错误!"};
  }

  async register(user){
      if(!user.name||!user.pwd) return {succeed:false,msg:"用户名或密码为空!"};
      let r=await this.checkuser(user);
      if(!r.succeed) return r;
      return( await this.db.createUser(user));
    
  }
  async login(user){
                let response;
                let jsonresponse;
                let r=await this.checvalid(user);
                if(!r.succeed) {
                  response={taskname:"login",result:r};
                  return response;
                   
                }
                
                else{
                    //reponse to client:response={task:"login",resutlt:{succeed:true|false,msg:"login Ok"},user:{name:username,pwd:password}}
                    response={taskname:"login",result:r,"user":user}
                    return response;
                }
  }
  async doTask(taskReq){
    this.taskReq=taskReq;
    var user=taskReq.user;
    return await this.login(user);
  }
}
/////////////////////////////////////////////
//var request={taskname:"requestChildren",folder:{username:`${username}`,folder:`${crrentFolder}`},time:`${time}`,ip:`${ip}`};
class RequestChildren_TaskHandler extends Task_Handler{
  
 async getChildren(taskReq){
      return await this.db.getChildren(taskReq);
   
  }
  async doTask(taskReq){
    var folder=taskReq.folder;
    var r=await this.getChildren(folder);
    if(!r.succeed) {
      var response={taskname:"request_children_of_one_folder",result:r};
      return response;
       
    }


  }

}
////////////////////////////////////////////
taskRouter.addRouter('savefile',new SaveFile_TaskHandler("default-saveFile-handler",db));
taskRouter.addRouter('login',new Login_Register_TaskHandller("default-login-hanler",db));
taskRouter.addRouter('register',new Login_Register_TaskHandller("default-register-handler",db));
taskRouter.addRouter('getFileList',new getFileList_TaskHandler("default-getFilList-handler",db));
taskRouter.addRouter('openfile',new OpenFile_TaskHandler("default-openfile-handler",db));
taskRouter.addRouter('request_children_of_one_folder',new RequestChildren_TaskHandler('request_children_of_one_folder',db));
//////////////////
////////////////////////////////


///////////////
wss.on('connection', function connection(ws) {
   //console.log(ws);
    ws.on('message', async function incoming(message) {
      var taskreq=JSON.parse(message);
      var taskname=taskreq.taskname;
      var jsonReponse
      let r=await taskRouter.route(taskreq);
      jsonReponse=JSON.stringify(r);
      ws.send(jsonReponse);   
    });
    
    
  });


  module.exports=wss;

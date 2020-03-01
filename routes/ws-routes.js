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
    if(!this.taskRouter[taskname])this.taskRouter[task]=new Array();
    this.taskRouter[taskname].push(router);
  }
  route(taskreq){
    var taskname=taskreq.taskname;
    this.currentTaskreq=taskreq;
    var handlers=this.taskRouter[taskname];
    this.handlerLine=handlers;
    this.nextHandlerIndex=0;
    this.next();
  }
  removeRouter(taskname,handlername)
  {
    
    var handlers=this.taskRouter[taskname];
    for(let i=0;i<handlers.length;i++) {
      let handler=handlers[i];
      if(handler.name==handlername) handlers.splice(index, i);
   }
  }
  next=()=>{
    if(this.nextHandlerIndex>this.handlerLine.length) return;
    else    return handlerLine[this.nextHandlerIndex++].doTask(this.currentTaskreq);
  }
  
}
var taskRouter=new TaskRouter();
///////////////////
class Task_Handler{
  constructor(db,name){
    this.db=db;
    this.name=name;
    
  }
  //virtual
  doTask(taskReq,next){
    //if there's a handler stack chain and you'd like to call the next handler after your codes,then
    //next function should be called ,  if not to call the next function,the other hanlers in the stack following yours will be bypass.
     
    
  }
}
////////////////////////////////
class File_Serializer extends Task_Handler{
  async checkvalid(file){
    //file:{name:`${filename}`,username:`${username}`,content:`${jsonStr}`}
    var filter={name:file.name,username:file.username,folder:file.folder};
    if(!filter.name||!filter.username||!filter.folder) return {succeed:false,msg:"[用户名|文件名|路径]不能为空！"};
    
    var r=await this.db.getFiles(filter);
    if(r.length!=0)      return {succeed:false,msg:"该文件已存在！" };
    else return {succeed:true,msg:"OK！"}
  }
  async savefile(file){
    
    var r;
    r=await this.checkvalid(file);
    if(!r.succeed) return r;
    return await this.db.createFile(file);
       
  }
  /***************************/
  doTask(taskReq){
    this.taskReq=taskReq;
    var file=taskreq.file;
    return this.savefile(file);
  }
}

taskRouter.addRouter('savefile',new File_Serializer("default-saveile-router",db));
//////////////////
class Login_Register{
  constructor(){this.db=db;}
  async checkuser(user){
    let users=await this.db.getUser(user.name);
    if(users.length==0) return {succeed:false,msg:"该用户不存在!",};
    if(user.pwd)
      if(user.pwd==users[0].pwd) return {succeed:true,msg:"OK登录成功!"}; 
      else return {succeed:false,msg:"密码错误!"};
  }
  async login(user){
      if(!user.pwd) return {succeed:false,msg:"密码为空!"};
      return(await this.checkuser(user));
  }
  async register(user){
      if(!user.name||!user.pwd) return {succeed:false,msg:"用户名或密码为空!"};
      let r=await this.checkuser(user);
      if(!r.succeed) return r;
      return( await this.db.createUser(user));
    
  }

}

////////////////////////////////

var Login_Register_Service=new Login_Register();
///////////////
wss.on('connection', function connection(ws) {
    ws.on('message', async function incoming(message) {
      var taskreq=JSON.parse(message);
      var taskname=taskreq.taskname;
      var jsonReponse
      let r=await taskRutor.router(taskname);
      r.taskname=taskname;
      jsonReponse=JSON.stringify(r);
      ws.send(jsonReponse);   
      //received from client,message={task:[login|register|save|open],taskdata{...}}
        /*
        var jsondata=JSON.parse(message);
        var response,jsonReponse;*/
        
        
        /*switch(jsondata.task){
          //for login task,message={task:[login|register|save|open],[user]:{name:username,pwd:password}}  
          case "login":
                let user=jsondata.user;
                let r=await Login_Register_Service.login(user);
                
                if(r.succeed){
                    //reponse to client:response={task:"login",resutlt:{succeed:true|false,msg:"login Ok"},user:{name:username,pwd:password}}
                    response={task:"login",result:{succeed:true,msg:"登录成功"},"user":user}
                    jsonReponse=JSON.stringify(response);
                    ws.send(jsonReponse);
                }
                else{
                  response={task:"login",result:{succeed:false,msg:"登录失败，密码或用户名错误！"},"user":user}
                  jsonReponse=JSON.stringify(response);
                  ws.send(jsonReponse);
                }
                break;
            //request={task:"savefile",file:{name:`${filename}`,username:`${username}`,content:`${jsonStr}`}};
            case "savefile":
                 
                 break;
            default:
                response={scceed:false,msg:"该操作未定义",data:{}}///????
                jsonReponse=JSON.stringify(response);
                ws.send(jsonReponse);    
        }*/
        

    });
    
    
  });


  module.exports=wss;

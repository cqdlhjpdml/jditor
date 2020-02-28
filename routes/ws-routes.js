//web socket server to surpport user to  register ,save,login and other operations.
const Config=require("../server-config.js")
const WebSocket = require('ws');
const db=require("../models/db.js");
const wss = new WebSocket.Server({ port: Config.webSocketPort });
//////////////////
class Login_Register{
  constructor(){this.db=db;}
  async checkuser(user){
    let users=await this.db.getUser(user.name);
    if(users.length==0) return {succeed:false,msg:"该用户不存在!"};
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
var Login_Register_Service=new Login_Register();
///////////////
wss.on('connection', function connection(ws) {
    ws.on('message', async function incoming(message) {
        
        var jsondata=JSON.parse(message);
        //received from client,msg.data={task:[login|register|save|open],data:{..}}
        var response,jsonReponse;
        switch(jsondata.task){
            case "login":
                let user=jsondata.data;
                let r=await Login_Register_Service.login(user);
                
                if(r.succeed){
                    //reponse to client:response={task:"login",resutlt:{succeed:true|false,msg:"login Ok"}}
                    response={task:"login",result:{succeed:true,msg:"登录成功"}}
                    jsonReponse=JSON.stringify(response);
                    ws.send(jsonReponse);
                }
                else{
                  response={task:"login",result:{succeed:false,msg:"登录失败，密码或用户名错误！"}}
                  jsonReponse=JSON.stringify(response);
                  ws.send(jsonReponse);
                }
                break;
            default:
                response={scceed:false,msg:"该操作未定义"}
                jsonReponse=JSON.stringify(response);
                ws.send(jsonReponse);    
        }
        

    });
    
    
  });


  module.exports=wss;

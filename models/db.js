const Sequelize = require('sequelize');
const Config = require('../server-config.js');

class DB{
   
    constructor(){
      Config.connection.sqlite3;
      this.sequelize= new Sequelize(Config.connection.sqlite3);
      (async ()=>{
        await this.sequelize.authenticate().then(() => {console.log('Connection has been established successfully.');  })
                              .catch(err => {
                                  console.error('Unable to connect to the database:', err);
      })})();
      this.user = this.sequelize.define('user', {
        name: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        pwd: Sequelize.STRING,
        }, 
        {
            timestamps: false
        });
        this.file = this.sequelize.define('file', {
            name:{type:Sequelize.STRING,primaryKey:true},
            username:{type:Sequelize.STRING,primaryKey:true},
            content:Sequelize.STRING,
            ip: Sequelize.STRING,
            timestamp:Sequelize.STRING,
            folder:{type:Sequelize.STRING,primaryKey:true}},

            {timestamps: false});
         
    };
    async createUser(newuser){
            var user=await this.getUser(newuser.name);
            if(user.length) return {result:0,msg:"该用户已存在"};
            
            await this.user.create({
                name: newuser.name,
                pwd:newuser.pwd
            });
            return {result:1,msg:"创建用户成功"};

        }
    async getUser(username){
        return await this.user.findAll({
            where: {
                name: username
            }
        })
    }
    ////file={name:`${filename}`,username:`${username}`,content:`${jsonStr}`}};
    async createFile(file)//to databse
    { 
      try{
          await this.file.create({
            username: file.username,
            name:file.name,
            content:file.content,
            ip:file.ip,           
            timestamp:file.timestamp,
            folder:file.folder
           });
           return {succeed:true,msg:"文件保存成功"};
         }catch(err){return {succeed:false,msg:err};}
    }
    async getFileList(filter)
    { 
        return await this.file.findAll({attributes:[['name','filename']],
            where: filter
        })
    }
     
  
}
/*some test statements
var db=new DB();
//db.createFile({name:"file2",username:"dml",content:"hello world",ip:"127.0.0.1",timestamp:"2020-02-29",folder:"."})
(async function a(){
    var files=await db.getFiles({name:"file1"});
    console.log(files.length);
})()
*/
module.exports=new DB();
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
            username:Sequelize.STRING,
            content:Sequelize.STRING,
            ip: Sequelize.STRING,
            folder:Sequelize.STRING},
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

}


module.exports=new DB();
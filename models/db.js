const Sequelize = require('sequelize');
const Config = require('../server-config.js');

class DB {

    constructor() {
        Config.connection.sqlite3;
        this.sequelize = new Sequelize(Config.connection.sqlite3);
        (async () => {
            await this.sequelize.authenticate().then(() => { console.log('Connection has been established successfully.'); })
                .catch(err => {
                    console.error('Unable to connect to the database:', err);
                })
        })();
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
            id: Sequelize.UUID,
            name: { type: Sequelize.STRING, primaryKey: true },
            isfolder: Sequelize.BOOLEAN,
            username: { type: Sequelize.STRING, primaryKey: true },
            content: Sequelize.STRING,
            ip: Sequelize.STRING,
            timestamp: Sequelize.STRING,
            parent_id: { type: Sequelize.INTEGER, primaryKey: true }
        },

            { timestamps: false });
      

    };
    uuid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
    
        var uuid = s.join("");
        return uuid;
    }
    async createUser(newuser) {
        var user = await this.getUser(newuser.name);
        if (user.length) return { result: 0, msg: "该用户已存在" };

        await this.user.create({
            name: newuser.name,
            pwd: newuser.pwd
        });
        return { result: 1, msg: "创建用户成功" };

    }
    async getUser(username) {
        return await this.user.findAll({
            where: {
                name: username
            }
        })
    }
    ////file={name:`${filename}`,username:`${username}`,content:`${jsonStr}`}};
    async createFile(file)//to databse
    {   var uid=this.uuid();
        try {
            await this.file.create({
                id:uid,
                username: file.username,
                name: file.name,
                content: file.content,
                ip: file.ip,
                timestamp: file.timestamp,
                isfolder: file.isfolder,
                parent_id:file.parentFolderID
            });
            return { succeed: true, msg: "文件保存成功" };
        } catch (err) { return { succeed: false, msg: err }; }
    }
    async getFileList(filter) {
        try {
            return await this.file.findAll({
                attributes: [['name', 'name']],
                where: filter
            })
        } catch (err) { return { succeed: false, msg: "获取文件列表失败" }; }
    }
    async readFile(filter) {
        try {
            let r = await this.file.findAll({
                attributes: [['content', 'content']],
                where: filter
            })
            return { succeed: true, msg: "读取文件成功！", content: r[0].content }

        } catch (err) { return { succeed: false, msg: "文件内容加载失败！" } }
    }
    async getChildren(folder) {
        if (folder.id == '-1')//means root folder
        {
            var filter = { username: folder.username, parent_id: 0 }//获取根目录
        }
        else {
            var filter = { username: folder.username, parent_id: folder.id }//获取根目录

        }
        try {
            let r = await this.file.findAll({
                attributes: [['name', 'name'], ['id', 'id'],['isfolder','isfolder']],
                where: filter
            })
            return r;

        } catch (err) {
            return { succeed: false, msg: "获取子目录失败！" }

        }

    }
    async getUserRootFolder(folder){
        var filter={username:folder.username,parent_id:folder.parent_id}
        try{
            let r=await this.file.findAll({
                attributes: [['name', 'name'], ['id', 'id'],['isfolder','isfolder']],
                where: filter 
            })
            return r;
        }
        catch(err){
            return { succeed: false, msg: "获取文件夹信息失败！" }
        }
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
module.exports = new DB();
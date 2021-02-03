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
            id: Sequelize.INTEGER,
            name: { type: Sequelize.STRING, primaryKey: true },
            isfolder: Sequelize.BOOLEAN,
            username: { type: Sequelize.STRING, primaryKey: true },
            content: Sequelize.STRING,
            ip: Sequelize.STRING,
            timestamp: Sequelize.STRING,
            parent_id: { type: Sequelize.INTEGER, primaryKey: true }
        },

            { timestamps: false });
        (async () => { await this.getMaxFileID() })();

    };
    async getMaxFileID() {//be careful of ID overflow,ID is a sqlite Integer data type

        var r = await this.file.max('id');
        this.maxID = r;
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
    {
        try {
            await this.file.create({
                username: file.username,
                filename: file.filename,
                content: file.content,
                ip: file.ip,
                timestamp: file.timestamp,
                isfolder: file.isfolder
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
                attributes: [['name', 'name'], ['id', 'id']],
                where: filter
            })
            return r;

        } catch (err) {
            return { succeed: false, msg: "获取子目录失败！" }

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
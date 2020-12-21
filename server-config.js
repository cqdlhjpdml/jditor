var path=require('path');
var ENV_CONFIG={
    "connection": {
      "sqlite3": {
            "dialect": "sqlite",
            "storage": path.resolve(__dirname,'data/test.db')
      },
    
      "mysql": {
        "username": "root",
        "password": null,
        "database": "database_production",
        "host": "127.0.0.1",
        "dialect": "mysql"
      },
      "production": {
        "dialect": "sqlite",
        "storage": "./data/db.sqlite"
      }
    },
    "app": {
      "port": 4000,
      "static_root": "public",
      "apps": [
        "course",
        "article",
        "browse"
      ]
    },
    "sequelize": {
      "underscored": true,
      "timestamps": false,
      "freezeTableName": true
    },
    
    "staticpath":"static",
    "viewpath":"views",
    //"SeerverIP":"111.229.239.244",
    "SeerverIP":"127.0.0.1",
    "webSocketPort":3001,
    "httpPort":80
  }
  
  module.exports=ENV_CONFIG;
console.log(ENV_CONFIG.connection.sqlite3)

  

var ENV_CONFIG={
    "connection": {
      "sqlite3": {
            "dialect": "sqlite",
            "storage": "d:/jditor/data/test.db"
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
    "webSocketPort":3001,
    "httpPort":80
  }
  
  module.exports=ENV_CONFIG;


  

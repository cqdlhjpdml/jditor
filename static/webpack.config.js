require('path');
const config = {
  externals: {
    // require("jquery") is external and available
    //  on the global var jQuery
    "jquery": "jQuery"
  },
   entry: ['./jquery-3.1.1.js',
    './jtopo0.4.8.js',
   './common.js',
    "./symbols.js",
    "./JTopoExt.js",
    "./tabsheet.js",
    "./ui-tools.js",
    "./menu.js",
    "./toolManager.js",
    "./myeditor.js",
    "./lib/jquery-ui-1.12.1/jquery-ui.js"]
  ,
  output: {
    filename: 'bundle.js',
    path: __dirname
  }
};
module.exports = config;
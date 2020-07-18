const Koa = require('koa');
const router = require('koa-router')();
const staicServer = require('koa-static');
const path = require('path');
const Config = require('./server-config.js');
const pug = require('pug');
const ws  = require('./routes/ws-routes.js');
const app = new Koa();

app.use(staicServer(path.join(__dirname,Config.staticpath)));

const index= (ctx) => {
  ctx.response.body = pug.renderFile(path.join(__dirname,Config.viewpath)+'/index.html');
  console.log(ctx.response.body);
};
router.get("/",index);


const demo = (ctx) => {
  ctx.response.body = pug.renderFile(path.join(__dirname,Config.viewpath)+'/demo.pug');
  ctx.response.type="text/html";
  console.log(ctx.response.body);
};
router.get("/demo.html",demo);

var port=Config.httpPort;

app.use(router.routes());
app.listen(port);
console.log('listening on port:'+port);
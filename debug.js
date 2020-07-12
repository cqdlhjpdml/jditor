const Koa = require('koa');
const router = require('koa-router')();
const staicServer = require('koa-static');
const path = require('path');
const Config = require('./server-config.js');
const pug = require('pug');
const ws  = require('./routes/ws-routes.js');
const app = new Koa();
const fs = require('fs');
const srcpath='/src/js';
const viewspath='/views'

app.use(staicServer(path.join(__dirname,Config.staticpath)));

app.use(async (ctx, next) => {
  
  if (ctx.request.path.indexOf('.js')!=-1) { // get js files
    ctx.response.body = fs.readFileSync(path.join(__dirname,srcpath,ctx.request.path), 'utf8');
    ctx.response.status = 200
    ctx.response.type="text/javascript"
    console.log('js file sent')
    console.log(ctx)
  } else 
  if (ctx.request.path === '/debug.html') { // 列表页
    ctx.response.status = 200;
    ctx.response.type="string";
    ctx.response.body = fs.readFileSync(path.join(__dirname,viewspath,ctx.request.path), 'utf8');
    console.log(ctx)
  } else {
    ctx.throw(404, 'Not found') // 404
  }
await next()
})

var port=Config.httpPort;

app.use(router.routes());
app.listen(port);
console.log('listening on port:'+port);
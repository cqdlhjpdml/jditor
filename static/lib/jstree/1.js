
var A={b:3,a:undefined}
if(A['a']){
    console.log('A.a');
}
if(A['c']!=undefined){
    console.log(A.c)
}
if(A['c']==undefined){
    console.log(A.c)
}
///////////////////////
class Task{//任务接口
    constructor(){ }
    finishTask(arg){//*各具体任务的代码
    }
   }
/////////////////////////////
class Task0 extends Task{
    constructor(){
        super();
        this.taskname=0;
    } 
    f0(arg){console.log("task0 arg="+arg); }
    finishTask(arg){this.f0(arg);}
 }
 ////////////////////////////
class Task1 extends Task{
   constructor(){
       super();
       this.taskname=1;
   } 
   f1(arg){console.log("task1 arg="+arg); }
   finishTask(arg){this.f1(arg);}
}
//////////////////////
class Task2 extends Task{
   constructor(){
        super();
        this.taskname=2;
    } 
   f2(arg){console.log("task2 arg="+arg)};
   
   finishTask(arg){this.f2(arg);}
}
///////////////////////////////   
class Router{
   constructor(){
    this.taskHandlers=new Array();
   }
   doTask(taskname,arg){
    if(this.taskHandlers[taskname])
       this.taskHandlers[taskname].finishTask(arg);
    else return -1;
   }
   addTaskHandler(taskHandler){
    var taskname=taskHandler.taskname;
    this.taskHandlers[taskname]=taskHandler;
   }
}
////////////////////////////
(function taskScheduler(){//模拟任务生成10个任务
       var args=['jim','jack','hebby','messi'];
       var router=new Router();
       router.addTaskHandler(new Task0());
       router.addTaskHandler(new Task1());
       router.addTaskHandler(new Task2());
       var count=0; 
       var gen=setInterval(() => {
            var taskname=Math.ceil(Math.random()*10)%3;
            var argIndex=Math.ceil(Math.random()*10)%4;
            var arg=args[argIndex]
            router.doTask(taskname,arg);
            count++;if(count==10) clearInterval(gen);
        },2000);
})()

/*
class Task{//任务接口
    constructor(){ }
    finishTask(arg){//各具体任务的代码
    }
   }
/////////////////////////////
class Task0 extends Task{
    constructor(){
        super();
        this.taskname=0;
    } 
    f0(arg){console.log("task0 arg="+arg); }
    finishTask(arg){this.f0(arg);}
 }
 ////////////////////////////
class Task1 extends Task{
   constructor(){
       super();
       this.taskname=1;
   } 
   f1(arg){console.log("task1 arg="+arg); }
   finishTask(arg){this.f1(arg);}
}
//////////////////////
class Task2 extends Task{
   constructor(){
        super();
        this.taskname=2;
    } 
   f2(arg){console.log("task2 arg="+arg)};
   
   finishTask(arg){this.f2(arg);}
}
///////////////////////////////   
class Router{
   constructor(){
   this.taskHandlers=new Array();
   this.taskQueue=new Array();
   }
   queue(task){
    this.taskQueue.push(task);
   }
   doTask(){
    var task=this.taskQueue.shift();
    if(task)
    {  var taskname=task.taskname;
       if(this.taskHandlers[taskname])
       this.taskHandlers[taskname].finishTask(task.arg);
    }
    var self=this;
    setTimeout(function(){self.routes()},500);
   }

   addTaskHandler(handler){
    var name=handler.taskname;
    this.taskHandlers[name]=handler;
   }
  
   routes(){
    this.doTask();
    return this;
    
  }
}
////////////////////////////
router=new Router();
router.addTaskHandler(new Task0());
router.addTaskHandler(new Task1());
router.addTaskHandler(new Task2());
////////////////////
class App{
    
    use(router){
      this.router=router;
    }
    
    queue(task){
        this.router.queue(task);
    }
}
const app=new App();
app.use(router.routes());

(function taskGenerator(){//模拟任务生成10个任务
       var args=['jim','jack','hebby','messi'];
       var count=0; 
       var gen=setInterval(() => {
            var taskname=Math.ceil(Math.random()*10)%3;
            var argIndex=Math.ceil(Math.random()*10)%4;
            var arg=args[argIndex]
            var task={taskname:taskname,arg:arg}
            app.queue(task);
            count++;if(count==10) clearInterval(gen);
        },100);
})()  
*/ 


     

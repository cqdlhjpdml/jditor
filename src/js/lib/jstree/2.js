class Task{
    constructor(){ }
    finishTask(arg){/*各具体任务的代码*/}
   }
   /////////////////////////////
class Task0 extends Task{
    constructor(){
        super();
        this.taskname=1;
    } 
    f0(arg){console.log("task0 arg="+arg); }
    finishTask(args){this.f0();}
 }
class Task1 extends Task{
   constructor(){
       super();
       this.taskname=1;
   } 
   f1(arg){console.log("task1 arg="+arg); }
   finishTask(args){this.f1();}
}


   //////////////////////
class Task2 extends Task{
   constructor(){
        super();
        this.taskname=2;
    } 
   f2(arg){console.log("task2 arg="+arg)};
   
   finishTask(){this.f2();}
}
   ///////////////////////////
class Router{
   constructor(){
   this.tasks=new Array();
   }
   doTask(taskname,arg){
    tasks[taskname].finishTask(arg)
   }
   addTask(task){
    var name=task.taskname;
    tasks[name]=task;
   }
   }
   (function main(){
       var args=['jim','jack','hebby','messi'];
       var router=new Router();
       router.addTask(new Task0());
       router.addTask(new Task1());
       router.addTask(new Task2());
       var count=0; 
       while(1){
          
        setTimeout(function(){
            var taskname=Math.ceil(Math.random()*10)%3;
            var argIndex=Math.ceil(Math.random()*10)%4;
            var arg=args[argIndex]
            router.doTask(taskname,arg);
            count++;if(count==10) return;
        },2000);
       }
   })()
   
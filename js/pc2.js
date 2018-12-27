var Engine = Matter.Engine,Render = Matter.Render,Runner = Matter.Runner,World = Matter.World,Bodies = Matter.Bodies,Body = Matter.Body, Composite = Matter.Composite, Composites = Matter.Composites, Common = Matter.Common,Events = Matter.Events;
var faceArr = new Array();
var faceBodyArr = new Array();
var obj = 0;
var engine = Engine.create(),world = engine.world;
var render_width = window.innerWidth;
var render_height = window.innerHeight;
var render = Render.create({
    element:document.body,
    engine:engine,
    options:{
        width:render_width,
        height:render_height,
        background:'#aaa',
        wireframes:false
    }
});
Render.run(render);
var runner = Runner.create();
Runner.run(runner,engine);
var yuka = Bodies.rectangle(render_width/2,render_height,render_width,30,{isStatic:true});
var kabe1 = Bodies.rectangle(0,0,30,render_height*2,{isStatic:true});
var kabe2 = Bodies.rectangle(render_width,0,30,render_height*2,{isStatic:true});
World.add(world,[kabe1,kabe2]);
World.addBody(world,yuka);
var testTimer;
var current_num =0;
var fData = new FormData();
fData.append('current_num', current_num);
startTimer();

/* ajaxで新しい画像データがあるか確認、あれば描画 */
function startTimer(){
    testTimer=setInterval(function(){
        fData = null;
        fData = new FormData();
        fData.append('current_num', current_num);
        $.ajax({
            url: "php/upload.php",
            type: 'POST',
            data: fData ,
            contentType: false,
            processData: false,
            success: function(data, dataType) {
                var data_arr = JSON.parse(data);
                if(!isNaN(data_arr['current_num'])){
                    current_num = data_arr['current_num'];
                    var img_name = "face_img/face_"+current_num+"_.png";
                    var r = data_arr['r'];
                    var x = data_arr['current_x'];
                    var xx = parseInt(x,10);
                    faceArr[obj] = Composite.create();
                    faceBodyArr[obj] = Bodies.circle(xx,0,r,{
                        restitution:0.3,
                        angle:Math.random()*360,
                        render:{sprite:{texture:img_name}}
                    });
                    Body.setAngularVelocity(faceBodyArr[obj],Math.random()*0.05);
                    Composite.addBody(faceArr[obj],faceBodyArr[obj]);
                    World.add(world, faceArr[obj]); 
                    obj++;
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {}
        });
    },1000);
}

var flg = true;
/* 描画更新後、画像が一定数超えたら画面をリセット */
Events.on(engine, 'beforeUpdate', function(){
    if(obj > 10){
        if(flg == true){
            Body.translate(yuka, { x: 5, y: 0 });
            if(yuka.position.x > render_width*1.5){flg = false;}
        }else if(flg == false){
            Body.translate(yuka, { x: -5, y: 0 });
            if(yuka.position.x < render_width/2){
                 var face_length = faceArr.length;
                for(var i=0;i<face_length;i++){
                    World.clear(faceArr[i]);
                }
                obj = 0;
                flg = true;
            }
        }
    }
});

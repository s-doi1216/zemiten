window.onload = function(){
 var window_height = window.innerHeight;
 var container = document.getElementById("container");
 var video = document.getElementById("video");
 var canvas = document.getElementById("canvas");
 var ctx = canvas.getContext("2d");
 var canvas_img = document.getElementById("canvas_img");
 var ctx_img = canvas_img.getContext("2d");
 var se1 = document.getElementById("se1");
 var se2 = document.getElementById("se2");
 var se3 = document.getElementById("se3");
 var face1 = new Image();
 face1.src = "face_track/face1.png";
 var face2 = new Image();
 face2.src = "face_track/face2.png";
 var face3 = new Image();
 face3.src = "face_track/face3.png";
 var face4 = new Image();
 face4.src = "face_track/face4.png";
 var snow = new Image();
 snow.src = "face_track/snow.png";
 var snow4 = new Image();
 snow4.src = "face_track/snow04.png";
 var frame;
 var mouth_x,mouth_y,wScale,imgW,imgH,imgL,imgT;
 var testTimer;
 var face_flag = false;
 var cnt = 0;
 var emotion;
 var faceSizeFlg = false;

 //カメラを取得、videoに出力
navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
   getUserMedia: function(c) {
     return new Promise(function(y, n) {
       (navigator.mozGetUserMedia ||
        navigator.webkitGetUserMedia).call(navigator, c, y, n);
     });
   }
} : null);
 var media = navigator.mediaDevices.getUserMedia({
     video:{facingMode:"user"},
     audio:false
 });
 media.then((stream) =>{video.srcObject = stream;});
 video.onloadeddata = function(){
     //videoとcanvasの大きさを合わせる
     var w = $('video').width();
     var h = $('video').height();
     $('#video').attr('width', w);
     $('#video').attr('height', h);
     $('#canvas').attr('width', w);
     $('#canvas').attr('height', h);
     var tracker = new clm.tracker();
     tracker.init(pModel);
     tracker.start(video);
     var positions;
     var classifier = new emotionClassifier();
     classifier.init(emotionModel);
     startTimer();
     drawLoop();

     function drawLoop(){
         /* 顔を検知した場合撮影し、phpへ送信 */
         if(face_flag){
             canvas_img.style.position = "absolute";
             canvas_img.style.top = y_start+"px";
             canvas_img.style.left = x1_start+"px";
             $('#canvas_img').attr('width', eyeLong*2);
             $('#canvas_img').attr('height', eyeLong*2);
             ctx_img.save();
             ctx_img.beginPath();
             ctx_img.arc(canvas_img.width/2, canvas_img.height/2, canvas_img.height/2, 0, Math.PI*2, false);
             ctx_img.clip();
             ctx_img.drawImage(video,x1_start,y_start,x_wid,eyeLong*2,0,0,canvas_img.width,canvas_img.height);
             ctx_img_draw(positions,snow, 62, 3.0, 0.0, 0.0);
             var canvas_url = canvas_img.toDataURL("image/png");
             canvas_url = canvas_url.replace(/^data:image\/png;base64,/, '');
             var img_r = arc_r;
             var current_x = positions[33][0];
             var fData = new FormData();
             fData.append('face_clip_img', canvas_url);
             fData.append('img_r', img_r);
             fData.append('current_x', current_x);
             $.ajax({
                 url: "php/download.php",
                 type: 'POST',
                 data: fData,
                 contentType: false,
                 processData: false,
                 success: function(data, dataType) {
                     setTimeout(startTimer,2500);
                 }
            });
             frame = 1;
             se3.play();
             fallen();
             face_flag =false;
         }
         var parameters = tracker.getCurrentParameters(); 
         emotion = classifier.meanPredict(parameters);
         var anime = window.requestAnimationFrame(drawLoop);
         positions = tracker.getCurrentPosition();
         ctx.clearRect(0,0,canvas.width,canvas.height);
         ctx.beginPath ();
         if(faceSizeFlg){
             drawStamp(positions,snow, 62, 3.0, 0.0, 0.0);
         }else{
             drawStamp(positions,snow, 62, 3.0, 0.0, 0.0);
         }
     }
     var x1_start,y_start,x_wid,eyeLong,eyeLine;
     var arc_center_x,arc_center_y,arc_r;
     var x1,y1,x2,y2;
     var mouth_x,mouth_y,wScale,imgW,imgH,imgL,imgT;
     /* 顔に合わせて画像を表示 */
     function drawStamp(pos, img, bNo, scale, hShift, vShift){
         if(positions[32]){
             x1 = pos[1][0];
             y1 = pos[20][1];
             x2 = pos[13][0];
             y2 = pos[7][1];
             eyeLine = pos[23][1];
             eyeLong = y2-eyeLine;
             y_start = eyeLine-eyeLong;
             var wid = x2-x1;
             var eae_width = wid/3;
             x1_start = x1-eae_width;
             x_wid = wid + eae_width+eae_width;
             arc_center_x = pos[62][0];
             arc_center_y = eyeLine;
             arc_r = eyeLong;
             mouth_x = pos[50][0] - pos[44][0];
             mouth_y = pos[53][1] - pos[47][1];
             wScale = mouth_x / img.width;
             imgW = img.width * scale * wScale;
             imgH = img.height * scale * wScale;
             imgL = pos[bNo][0] - imgW / 2 + mouth_x * hShift;
             imgT = pos[bNo][1] - imgH / 2 + mouth_y * vShift;
             ctx.drawImage(img, imgL, imgT, imgW, imgH);
         }
     }
     /* 送信用canvasに画像を表示 */
     function ctx_img_draw(pos2, img2, bNo2, scale2, hShift2, vShift2){
         if(positions[bNo2]){
             var mouth_x2 = pos2[50][0] - pos2[44][0];
             var mouth_y2 = pos2[53][1] - pos2[47][1];
             var wScale2 = mouth_x / img2.width;
             var imgw2 = img2.width * scale2 * wScale2;
             var imgH2 = img2.height * scale2 * wScale2;
             var imgL2 = pos2[bNo2][0] - imgw2 / 2+ mouth_x2 * hShift2;
             var imgT2 = pos2[bNo2][1] - imgH2 / 2 + mouth_y2 * vShift2;
             var ctx_imgX = imgL2 - x1_start;
             var ctx_imgY = imgT2 - y_start;
             ctx_img.drawImage(img2, ctx_imgX, ctx_imgY, imgw2, imgH2);
         }
     }

     /* 顔検知用タイマー */
     function startTimer(){
         testTimer=setInterval(function(){
             if(mouth_x > 50){
                 faceSizeFlg = true;
                 cnt = 0;
                 return;
             }else if(cnt == 1 && positions[32]){
                 faceSizeFlg = false;
                 se2.play();
                 face_flag =true;
                 cnt = 0;
                 stopTimer();
             }else if(positions[32]){
                 faceSizeFlg = false;
                se1.play();
                cnt++;
             }else{
                 faceSizeFlg = false;
                cnt =0;
                face_flag =false;
        }
         },1000);
     }

     function stopTimer(){clearInterval(testTimer)}

     /* 落下アニメーション */
     function fallen(){
         var fall = window.requestAnimationFrame(fallen);
         var now = y_start + frame*10;
         canvas_img.style.top = now+"px"; 
         frame++;
         if(now > window.innerHeight){
             window.cancelAnimationFrame(fall);
             ctx_img.restore();
             ctx_img.clearRect(0,0,canvas_img.width,canvas_img.height);
         }
     }
 }
}
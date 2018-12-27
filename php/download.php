<?php
session_start();
/* 画像が送られてきた場合連番で保存、x座標や画像の大きさをsessionに保存 */
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && (strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')) {
    if(isset($_POST['face_clip_img'])){
        $imageData = $_POST['face_clip_img'];
        $img_r = $_POST["img_r"];
        $current_x = $_POST["current_x"];
        $glob = glob('../face_img/*.png');
        $num = count($glob);//顔何個あるか
        $filename = '../face_img/face_'.$num.'_.png';
        $fp = fopen($filename,'w');
        fwrite($fp,base64_decode($imageData));
        fclose($fp);
        $_SESSION['num'] = $num;
        $_SESSION['img_r'] = $img_r;
        $_SESSION['current_x'] = $current_x;
    }else{
    }
}
?>

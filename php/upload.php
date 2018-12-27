<?php
session_start();
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && (strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')) {
    if(isset($_POST['current_num'])){
        /* session取り出し、画像が更新されていたら新しい番号を返す */
        $current_num = $_POST["current_num"];
        $session_num = $_SESSION['num'];
        $session_img_r = $_SESSION['img_r'];
        $session_x = $_SESSION['current_x'];
        if(($current_num < $session_num) || ($current_num=0 && $session_num==0)){
            $current_num = $session_num;
            $data_arr = array('current_num'=>$current_num,'r'=>$session_img_r,'current_x'=>$session_x);
        }else{$data_arr = array('current_num'=>"画像増えてない",'r'=>"画像なし",'current_x'=>"x座標なし");}
        $datas = json_encode($data_arr);
        echo $datas;
    }
}
?>

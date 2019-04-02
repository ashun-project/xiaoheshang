// var videoObject = {
//     container: '#video', //容器的ID或className
//     variable: 'player',//播放函数名称
//     flashplayer: true,
//     poster: '/static/img/ashun.png',//封面图片
//     video: 'https://cdn1.91baimi.com:8081/20180707/ynGLUeQf/index.m3u8'//
// };
// var player = new ckplayer(videoObject);
var videoUrl = document.getElementById('video-url').value;
if (videoUrl.indexOf('https') > -1) {
    var $iframe = document.createElement('iframe');
    var $video = document.getElementById('video');
    $iframe.src = "https://api.xhgzyck.com/m3u8.php?url=" + videoUrl;
    $video.appendChild($iframe);
} else {
    var videoObject = {
        container: '#video', //容器的ID或className
        variable: 'player',//播放函数名称
        flashplayer: true,
        poster: '/static/img/ashun.png',//封面图片
        video: videoUrl
    };
    var player = new ckplayer(videoObject);
}
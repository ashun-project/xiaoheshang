
var videoUrl = document.getElementById('video-url').value;
// if (videoUrl.indexOf('https') > -1) {
//     var $iframe = document.createElement('iframe');
//     var $video = document.getElementById('video');
//     $iframe.src = "https://api.xhgzyck.com/m3u8.php?url=" + videoUrl;
//     $video.appendChild($iframe);
// } else {
//     var videoObject = {
//         container: '#video', //容器的ID或className
//         variable: 'player',//播放函数名称
//         flashplayer: true,
//         poster: '/static/img/ashun.png',//封面图片
//         video: videoUrl
//     };
//     var player = new ckplayer(videoObject);
// }
var playVideo =  document.getElementById('video');
var _5ye_height = playVideo.clientWidth / 16 * 9;
var dp = new DPlayer({
    container: playVideo,
    autoplay: false,
    video: {
        quality: [{
            name: "标清",
            url: videoUrl,
            type: "hls",
        }],
        defaultQuality: 0,
    },
});
playVideo.style.height = _5ye_height + 'px';
dp.pause();
dp.play();
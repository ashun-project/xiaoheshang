function ajax() {  
    var ajaxData = {    
        type: arguments[0].type || "GET",
            url: arguments[0].url || "",
            async: arguments[0].async || "true",
            data: arguments[0].data || null,
            dataType: arguments[0].dataType || "text",
            contentType: arguments[0].contentType || "application/x-www-form-urlencoded",
            beforeSend: arguments[0].beforeSend || function () {},
            success: arguments[0].success || function () {},
            error: arguments[0].error || function () {}  
    }; 
    ajaxData.beforeSend(); 
    var xhr = createxmlHttpRequest();   
    try{
        xhr.responseType = ajaxData.dataType;  
    }catch (err) {
        console.log(err)
    };
    xhr.open(ajaxData.type, ajaxData.url, ajaxData.async);   
    xhr.setRequestHeader("Content-Type", ajaxData.contentType);   
    xhr.send(convertData(ajaxData.data));   
    xhr.onreadystatechange = function () {     
        if (xhr.readyState == 4) {       
            if (xhr.status == 200) {
                ajaxData.success(xhr.response);      
            } else {        
                ajaxData.error();      
            }     
        }  
    } 
};
function createxmlHttpRequest() {   
    if (window.ActiveXObject) {     
        return new ActiveXObject("Microsoft.XMLHTTP");   
    } else if (window.XMLHttpRequest) {     
        return new XMLHttpRequest();   
    } 
}; 
function convertData(data) {  
    if (typeof data === 'object') {    
        var convertResult = "";     
        for (var c in data) {       
            convertResult += c + "=" + data[c] + "&";     
        }     
        convertResult = convertResult.substring(0, convertResult.length - 1);   
        return convertResult;  
    } else {    
        return data;  
    }
};

// 内容
// 判断是不是手机端
var ua = navigator.userAgent;
var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
var isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
var isAndroid = ua.match(/(Android)\s+([\d.]+)/);
var isMobile = isIphone || isAndroid;
var params = window.location.search.split('myparams=');
var defaultUrl = '';
var bodyer = document.getElementById('bodyer');
var mySpare = document.getElementById('my-spare');
var tuijianWrap = document.getElementById('tuijian-wrap');
if (params && params.length > 1) defaultUrl = params[1];
if (defaultUrl) {
    getHtml(defaultUrl);
}

function getHtml(url) {
    ajax({  
        type: "get",
          url: "/api" + url,
          beforeSend: function () {},
            //some js code 
        success: function (msg) {
            var reTag = /onclick=\"this.select\(\)\"|<link(?:.|\s)*?>|<script(?:.|\s)*?<\/script>|<iframe(?:.|\s)*?<\/iframe>/ig;
            var reTag2 = /mac_url=unescape(?:.|\s)*?\);/g;
            var rul = /mac_url=unescape\(\'|\'\)\;|\"/gi;
            var result = reTag2.exec(msg);
            var url = '';
            if (result && result[0]) {
                url = unescape(result[0].replace(rul, ''));
            };
            document.documentElement.scrollTop=document.body.scrollTop=0;
            mySpare.innerHTML = msg.replace(reTag,'');
            setTimeout(function() {
                reset();
                getUrl(url);
            }, 30);
        },
        error: function () {    
            alert('获取资源失败，请切换其它资源');
            window.location.href = 'http://xjb520.com';
        }
    })
}
function getUrl (url) {
    if (!url) {
        alert('获取资源失败， 请切换其他资源');
        return;
    }
    url = 'http' + url.split('http')[1];
    if (url.indexOf('https') > -1) {
        var $iframe = document.createElement('iframe');
        var $video = document.getElementById('video');
        $iframe.src = "https://api.xhgzyck.com/m3u8.php?url=" + url;
        $video.appendChild($iframe);
    } else {
        var videoObject = {
            container: '#video', //容器的ID或className
            variable: 'player',//播放函数名称
            flashplayer: true,
            poster: '/static/img/ashun.png',//封面图片
            video: url
        };
        var player = new ckplayer(videoObject);
    }
}
// 去除元素
function reset() {
    // 过滤元素下载链接
    var divEles = mySpare.children;
    var imgs = mySpare.querySelectorAll('img');
    var getA = mySpare.querySelectorAll('a');

    if (divEles && divEles.length) {
        // 去除a链接
        var txt = ['激情图区', '情色小说', '采集插件', '采集教程', '采集福利', '采集百科全书'];
        for (var i = 0; i < getA.length; i++) {
            var href = getA[i].getAttribute('href');
            if ((href.indexOf('http:') > -1 && href.indexOf('http://www.xhgszy.com') <= -1) || txt.indexOf(getA[i].text) > -1) {
                getA[i].parentNode.removeChild(getA[i]);
            } else {
                getA[i].setAttribute('my-data', href.replace('http://www.xhgszy.com', ''));
                getA[i].removeAttribute('href');
            }
        }
        // 添加完整的图片路径
        for (var i = 0; i < imgs.length; i++) {
            var src = imgs[i].getAttribute('src');
            imgs[i].setAttribute('onerror', '')
            if (src.indexOf('http') === -1) {
                imgs[i].setAttribute('src', '//www.xhgszy.com/' + src);
            }
            if (src.indexOf('.gif') > -1) {
                imgs[i].parentNode.removeChild(imgs[i]);
            }
        }
        // debugger
        var obj = {};
        var bodyCont = document.createElement('div');
        bodyCont.className = 'tuijian-list';
        obj.topNav = mySpare.querySelector('.top-nav');
        obj.nav = mySpare.querySelector('.class-feed-btn2');
        obj.navM = mySpare.querySelector('.nav__btn--wrap li ul');
        obj.tuijian = mySpare.querySelectorAll('.col-sm-3.col-xs-6 a');
        obj.tuijianM = mySpare.querySelectorAll('.video__wrap a');
        tuijianWrap.innerHTML = '';
        for (var key in obj) {
            if (obj[key]) {
                if (key.indexOf('tuijian') > -1) {
                    for (var i = 0; i < obj[key].length; i++) {
                        bodyCont.appendChild(obj[key][i]);
                    }
                    tuijianWrap.appendChild(bodyCont);
                } else {
                    bodyer.appendChild(obj[key]);
                }
            }
        }
        mySpare.parentNode.removeChild(mySpare);
        getClike(obj);
    } else {
        reset();
    }
}

// 注册事件
function getClike(obj) {
    var eventA = ''; 
    for (var key in obj) {
        if (obj[key]) {
            if (key.indexOf('tuijian') > -1) {
                successContent(obj[key], true); 
            } else {
                eventA = obj[key].querySelectorAll('a');
                successContent(eventA); 
            }
        }
    }
    showMenu();
}

function successContent(list, wrap) {
    for (var i = 0; i < list.length; i++) {
        list[i].onclick = function (event) {
            var hrf = decodeURIComponent(this.getAttribute('my-data'));
            if (!wrap) {
                window.location.href = '/?myparams=' + hrf;
            } else {
                if (isMobile) {
                    window.location.href = '/detail.html?myparams=' + hrf;
                } else {
                    window.open('/detail.html?myparams=' + hrf);
                }
            }
            event.cancelBubble = true;
            event.stopPropagation();
            event.preventDefault();
        }
    }
}

function showMenu () {
    var myMenu = document.getElementById('my-menu');
    var body = document.getElementsByTagName('body')[0];
    var meunWrap = document.querySelector('.detail ul.second__menu');
    myMenu.addEventListener('click', function () {
        if (meunWrap.className.indexOf('show') > -1) {
            meunWrap.className = 'second__menu'
        } else {
            meunWrap.className = 'second__menu show'
        }
        event.cancelBubble = true;
        event.stopPropagation();
        event.preventDefault();
    });
    body.addEventListener('click', function () {
        meunWrap.className = 'second__menu'
    });
}
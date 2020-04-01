var request = require("request");
var cheerio = require('cheerio');
const iconv = require('iconv-lite');
var mysql = require('mysql');
var pageNum = 0;
var dtNum = 0;
var arr = [];
var resour = 'http://www.msnyxs1.com/';
var items = [
    { "url": "/?m=vod-type-id-1.html", "type": "guocai", "title": "国产精品", num: 28 },//868
    { "url": "/?m=vod-type-id-3.html", "type": "oumei", "title": "欧美", num: 6 }, //110
    { "url": "/?m=vod-type-id-4.html", "type": "dongman", "title": "动漫", num: 6 }, //21
    { "url": "/?m=vod-type-id-5.html", "type": "wuma", "title": "无码", num: 4 }, //139
    { "url": "/?m=vod-type-id-7.html", "type": "zhonggwen", "title": "中文字幕", num: 3 },//31 
    { "url": "/?m=vod-type-id-8.html", "type": "juru", "title": "巨乳", num: 8 }, //18
    { "url": "/?m=vod-type-id-9.html", "type": "meishaonv", "title": "美少女", num: 10 }, //3
    { "url": "/?m=vod-type-id-10.html", "type": "dujia", "title": "DMM独家", num: 6 }, //120
    { "url": "/?m=vod-type-id-16.html", "type": "hey", "title": "Hey动画", num: 7 },//3
    { "url": "/?m=vod-type-id-17.html", "type": "HEYZO", "title": "HEYZO", num: 7 }, //36
    { "url": "/?m=vod-type-id-18.html", "type": "caocui", "title": "潮吹", num: 12 }, //30
    { "url": "/?m=vod-type-id-19.html", "type": "kojiao", "title": "口交", num: 11 }, //21
    { "url": "/?m=vod-type-id-20.html", "type": "shouci", "title": "首次亮相", num: 11 }, //38
]

var ip = [
    '14.192.76.22',
    '27.54.72.21',
    '27.224.0.14',
    '36.0.32.19',
    '36.37.40.21',
    '36.96.0.11',
    '39.0.0.24',
    '39.0.128.17',
    '40.0.255.24',
    '40.251.227.24',
    '42.0.8.21',
    '42.1.48.21',
    '42.1.56.22',
    '42.62.128.19',
    '42.80.0.15',
    '42.83.64.20',
    '42.96.96.21',
    '42.99.112.22',
    '42.99.120.21',
    '42.100.0.14',
    '42.157.128.20',
    '42.187.96.20',
    '42.194.64.18',
    '42.248.0.13',
    '43.224.212.22',
    '43.225.236.22',
    '43.226.32.19',
    '43.241.88.21',
    '43.242.64.22',
    '43.247.152.22',
    '45.116.208.24',
    '45.120.243.24'
];
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'xiaoheshang',
    useConnectionPooling: true
});

function getAjax(url) {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            url: url,
            gzip: true,
            encoding: null,
            headers: {
                "X-Forwarded-For": ip[Math.floor(Math.random() * ip.length)] || '42.194.64.18',
                'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
                'referer': resour,
                'Cookie': "PHPSESSID=88f1qocpntbtjnp990pkqvo3a4; UM_distinctid=16846df58e71c8-0735f5020bd16-10326653-13c680-16846df58e8f22; CNZZDATA1273706240=1075868105-1547372666-http%253A%252F%252Fmvxoxo.com%252F%7C1547431260; CNZZDATA1275906764=206766016-1547375436-http%253A%252F%252Fmvxoxo.com%252F%7C1547430243"
            }
        };
        request(options, function (error, response, body) {
            try {
                if (error) throw error;
                var buf = iconv.decode(body, 'UTF-8');//获取内容进行转码
                $ = cheerio.load(buf);
                resolve();
            } catch (e) {
                console.log(options.url, 'eeeeeeeß')
                reject(e);
            }
        })
    });
}

function getList() {
    var urlC = resour + items[pageNum].url;
    if ((items[pageNum].num - dtNum) > 1) {
        var spl = urlC.split('.html');
        urlC = spl[0] + '-pg-' + (items[pageNum].num - dtNum) + '.html';
    }
    // console.log(urlC)
    // return
    getAjax(urlC).then(function () {
        var li = $('.listbox ul li');
        var title = '';
        var url = '';
        var img = '';
        dtNum++
        for (var i = 0; i < li.length; i++) {
            title = $('h3 a', li[i]).text();
            url = $('h3 a', li[i]).attr('href');
            img = $('.item-lazy', li[i]).attr('data-echo');
            arr.push({ url: url, title: title, img: img, type: items[pageNum].type });
        }
        if ((items[pageNum].num - dtNum) > 0) {
            console.log('current page is========', dtNum);
            getList();
        } else {
            pageNum++
            dtNum = 0;
            if (pageNum === items.length) {
                pageNum = 0;
                var nArr = JSON.parse(JSON.stringify(arr));
                arr = [];
                listArr(nArr);
            } else {
                getList();
            }
        }
    }, function () {
        getList();
    });
}

function listArr(list) {
    if (dtNum === list.length) {
        console.log('end--', dtNum, 'current-time--', new Date().getTime());
        var date = new Date();
        var timeS = new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' 23:00:00').getTime();
        setTimeout(function () {
            getList();
        }, 8 * 60 * 60 * 1000); // 8小时后重新调  timeS - date.getTime() + (6 * 60 * 60 * 1000)
    } else {
        var sql = 'select * from list_data where url ="' + list[dtNum].url + '"';
        pool.getConnection(function (err, conn) {
            if (err) console.log("detail ==> " + err);
            conn.query(sql, function (err2, rows, fields) {
                if (err2) {
                    console.log('[chear ERROR2] - ', err2.message);
                    conn.release();
                    listArr(list);
                } else {
                    if (rows.length) {
                        dtNum++;
                        conn.release();
                        listArr(list);
                    } else {
                        var id = new Date().getTime() + dtNum;
                        var sqlL = "INSERT INTO list_data(id,url,title,img,type,video) VALUES (?,?,?,?,?,?)";
                        function getDetail(dUrl) {
                            getAjax(dUrl).then(function () {
                                var video = $('.play-panel .tips span').eq(0).text();
                                var infoL = [id, list[dtNum].url, list[dtNum].title, list[dtNum].img, list[dtNum].type, video];
                                conn.query(sqlL, infoL, function (err, rows, fields) {
                                    if (err) {
                                        console.log('[SELECT ERROR] - ', err.message);
                                    } else {
                                        console.log('add number' + dtNum + 'data success');
                                    }
                                });
                                setTimeout(function () {
                                    conn.release();
                                    dtNum++;
                                    listArr(list);
                                }, 1000);
                            }, function () {
                                getDetail(dUrl);
                            });
                        }
                        var numId = list[dtNum].url.replace(/[^\d]/g,'');
                        var reUrl = '?m=vod-play-id-'+ numId +'-src-1-num-1.html'
                        // console.log(resour+reUrl)
                        getDetail(resour+reUrl);
                    }
                }
            });
        });
    }
}

getList();
var request = require("request");
var cheerio = require('cheerio');
const iconv = require('iconv-lite');
var mysql = require('mysql');
var pageNum = 0;
var dtNum = 0;
var arr = [];
var resour = 'http://xhgtv.com';
var items = [
    { "url": "/?m=vod-type-id-5.html", "type": "youma", num: 1 },//61
    { "url": "/?m=vod-type-id-6.html", "type": "wuma", num: 1 }, //110
    { "url": "/?m=vod-type-id-7.html", "type": "qingse", num: 1 }, //21
    { "url": "/?m=vod-type-id-8.html", "type": "zimu", "title": "中文字幕", num: 1 }, //139
    { "url": "/?m=vod-type-id-10.html", "type": "qiangjianluanlun", "title": "强奸乱伦", num: 1 },//31 
    { "url": "/?m=vod-type-id-11.html", "type": "shisheng", "title": "制服师生", num: 1 }, //18
    { "url": "/?m=vod-type-id-13.html", "type": "gaoqing", "title": "JAVHD高清", num: 1 }, //3
    { "url": "/?m=vod-type-id-14.html", "type": "oumei", "title": "欧美性爱", num: 1 }, //120
    { "url": "/?m=vod-type-id-15.html", "type": "linglei", "title": "变态另类", num: 1 },//3
    { "url": "/?m=vod-type-id-17.html", "type": "guochangmingren", "title": "国产名人", num: 1 }, //36
    { "url": "/?m=vod-type-id-18.html", "type": "tongshi", "title": "职场同事", num: 1 }, //30
    { "url": "/?m=vod-type-id-19.html", "type": "chezheng", "title": "野合车震", num: 1 }, //21
    { "url": "/?m=vod-type-id-20.html", "type": "qunjiao", "title": "自慰群交", num: 1 }, //38
    { "url": "/?m=vod-type-id-21.html", "type": "guochangluanlun", "title": "国产乱伦", num: 1 }, //30
    { "url": "/?m=vod-type-id-22.html", "type": "mutie", "title": "空姐模特", num: 1 }, //27
    { "url": "/?m=vod-type-id-23.html", "type": "renqi", "title": "娇妻素人", num: 1 }, //167
    { "url": "/?m=vod-type-id-24.html", "type": "shaofu", "title": "美熟少妇", num: 1 },//47
    { "url": "/?m=vod-type-id-25.html", "type": "xuesheng", "title": "女神学生", num: 1 },//92
    { "url": "/?m=vod-type-id-9.html", "type": "sanji", "title": "三级伦理", num: 1 },//26
    { "url": "/?m=vod-type-id-26.html", "type": "dongman", "title": "动漫卡通", num: 1 }//75
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
        var li = $('.row .new-video');
        var title = '';
        var url = '';
        var img = '';
        dtNum++
        for (var i = 0; i < li.length; i++) {
            title = $('.v-title a', li[i]).text();
            url = $('.v-title a', li[i]).attr('href');
            img = $('a img', li[i]).attr('src');
            arr.push({ url: url, title: title, img: img, type: items[pageNum].type });
        }
        if ((items[pageNum].num - dtNum) > 0) {
            console.log('current page is========', dtNum);
            getList();
        } else {
            pageNum++
            if (pageNum === items.length) {
                if (arr.length) {
                    var nArr = JSON.parse(JSON.stringify(arr));
                    arr = [];
                    pageNum = 0;
                    dtNum = 0;
                    listArr(nArr);
                }
            } else {
                dtNum = 0;
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
        }, timeS - date.getTime() + (6 * 60 * 60 * 1000)); // 8小时后重新调  
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
                                var video = $('.container .inputA .form-control').eq(0).val();
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
                        getDetail(resour+list[dtNum].url);
                    }
                }
            });
        });
    }
}

getList();
var express = require('express');
var url = require('url');
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var router = express.Router();
var num = 0;
var menu = [
    { "url": "/", "name": "首页"},
    { "url": "/videos/youma/", "name": "日本有码" },
    { "url": "/videos/wuma/", "name": "日本无码" },
    { "url": "/videos/qingse/", "name": "韩国情色" }, 
    { "url": "/videos/zimu/", "name": "中文字幕" },
    { "url": "/videos/qiangjianluanlun/", "name": "强奸乱伦" }, 
    { "url": "/videos/shisheng/", "name": "制服师生" },
    { "url": "/videos/gaoqing/", "name": "JAVHD高清"}, 
    { "url": "/videos/oumei/", "name": "欧美性爱" }, 
    { "url": "/videos/linglei/", "name": "变态另类" },
    { "url": "/videos/guochangmingren/", "name": "国产名人" }, 
    { "url": "/videos/tongshi/", "name": "职场同事" }, 
    { "url": "/videos/chezheng/", "name": "野合车震" }, 
    { "url": "/videos/qunjiao/", "name": "自慰群交" }, 
    { "url": "/videos/guochangluanlun/", "name": "国产乱伦" }, 
    { "url": "/videos/mutie/", "name": "空姐模特" }, 
    { "url": "/videos/renqi/", "name": "娇妻素人" }, 
    { "url": "/videos/shaofu/", "name": "美熟少妇" }, 
    { "url": "/videos/xuesheng/", "name": "女神学生" }, 
    { "url": "/videos/sanji/", "type": "sanji", "name": "三级伦理" },
    { "url": "/videos/dongman/", "name": "动漫卡通" }
];
var getIp = function (req) {
    var ip = req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0];
    }
    num = num + 1;
    return ip;
};

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'xiaoheshang'
});

// 缩略图
// const command = `ffmpeg -i ${input} -r 1 -s WxH -f image2 ${output} -vframes 1`;
//     return new Promise((resolve,reject)=>{
//         exec(command, (error, stdout, stderr) => {
//         if(error) return reject(error);
//         if(stderr) return reject(stderr);
//         resolve(output);
//         });
//     })

// 路由拦截
router.all('*', function (req, res, next) {
    var userAgent = req.headers["user-agent"] || '';
    var deviceAgent = userAgent.toLowerCase();
    var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    var terminal = '';
    if (agentID) {
        terminal = "mobile";
    } else {
        terminal = "pc";
    }
    req.terminal = terminal;
    next();
})
// 首页
router.get('/', function (req, res) {
    var sql = 'select a.* from (select * from list_data where type = "youma" order by id desc limit 4) a union all select b.* from (select * from list_data where type = "oumei" order by id desc limit 4) b union all select c.* from (select * from list_data where type = "dongman" order by id desc limit 4) c';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL-index ==> " + err);
        conn.query(sql, function (err, result) {
            var listObj = {
                pageTitle: '韩国伦理',
                pageKeyword: '阿顺/阿顺520,ashun520.com有你, ady, ady在线, 韩国伦理, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
                pageDescrition: '阿顺/阿顺520,ashun520.com有你, ady, ady在线, 韩国伦理, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
                host: 'http://'+req.headers['host'],
                menu: menu,
                type: '/',
                terminal: req.terminal,
                result: ''
            }
            if (err) {
                res.render('index', listObj);
            } else {
                var obj = {
                    youma: [],
                    oumei: [],
                    dongman: [],
                }
                var arr = [];
                for (var i = 0; i < result.length; i++) {
                    obj[result[i].type].push(result[i]);
                }
                arr = [
                    {type: 'youma', list: obj.youma, name: '日本有码'},
                    {type: 'oumei', list: obj.oumei, name: '欧美性爱'},
                    {type: 'dongman', list: obj.dongman, name: '动漫卡通'}
                ]
                listObj.result = arr;
                res.render('index', listObj);
            }
            conn.release();
        });
    })
})

// 获取列表
router.get('/videos/:type', function (req, res) {
    var typeU = req.params.type || '';
    var params = typeU.split('.');
    var type = params[0].split('_');
    var search = req.url.split('search=');
    var listObj = {
        pageTitle: type[0]+'列表-韩国伦理',
        pageKeyword: '阿顺/阿顺520,ashun520.com有你, ady, ady在线, 韩国伦理, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        pageDescrition: '阿顺/阿顺520,ashun520.com有你, ady, ady在线, 韩国伦理, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        host: 'http://'+req.headers['host'],
        menu: menu,
        terminal: req.terminal,
        type: '/videos/'+type[0]+'/',
        result: []
    }
    // if (params.length < 2) {
    //     res.render('list', listObj);
    //     return;
    // } 
    var numL = Number(type[1]) || 1;
    var limit = ((numL - 1) * 12) + ',' + 12;
    var sql = 'SELECT * FROM list_data where type = "'+ type[0] +'" order by id desc limit ' + limit;
    var count = 'SELECT COUNT(1) FROM list_data where type ="' + type[0] + '"';
    if (search[1]) {
        sql = 'SELECT * FROM list_data where type = "'+ type[0] +'" and title like "' +'%'+ decodeURI(search[1]) +'%'+ '" order by id desc limit ' + limit;
        count = 'SELECT COUNT(1) FROM list_data where type ="' + type[0] + '" and title like "' +'%'+ decodeURI(search[1]) +'%'+ '"';
    }
    // console.log(sql, count)
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL-list ==> " + err); 
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] -list ', err.message);
                res.render('list', listObj);
                conn.release();
            } else {
                conn.query(count, function (err, total) {
                    if (err) {
                        res.render('list', listObj);
                    } else {
                        var arr = result.map(item => {
                            return {
                                id: item.id,
                                title: item.title,
                                img: item.img
                            }
                        })
                        listObj.result = arr;
                        listObj.page = getPage(Number(total[0]['COUNT(1)']), numL, type[0], search[1]);
                        res.render('list', listObj);
                    }
                    conn.release();
                });
            }
        });
    })
})
function getPage(total, currentPage, type, pSearch) {
    var totalPage = 0;//总页数
    var pageSize = 12;//每页显示行数
    var pageUrl = '/videos/' + type;
    var pageSearch = pSearch? '?search=' + pSearch : '';
    //总共分几页
    if(total/pageSize > parseInt(total/pageSize)){
        totalPage=parseInt(total/pageSize)+1;
    }else{
        totalPage=parseInt(total/pageSize);
    }
    var tempStr = "<span>共"+totalPage+"页</span>";
    if(currentPage>1){
        tempStr += "<a href="+ pageUrl + '.html' + pageSearch + ">首页</a>";
        tempStr += "<a href="+ pageUrl + '_' + (currentPage-1) + '.html' + pageSearch +">上一页</a>"
    }else{
        tempStr += "<span class='btn'>首页</span>";
        tempStr += "<span class='btn'>上一页</span>";
    }

    if (currentPage > 5 && currentPage < (totalPage -5)) {
        for(var pageIndex= currentPage - 5; pageIndex<currentPage+5;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + '_' + pageIndex + '.html' + pageSearch +">"+ pageIndex +"</a>";
        }
    } else if (currentPage > (totalPage -5) && totalPage >= 10){
        for(var pageIndex= (totalPage - 9); pageIndex < totalPage+1;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + '_' + pageIndex + '.html' + pageSearch +">"+ pageIndex +"</a>";
        }
    } else if (currentPage <= 5 && totalPage > 10) {
        for(var pageIndex= 1; pageIndex <= 10;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + '_' + pageIndex + '.html' + pageSearch +">"+ pageIndex +"</a>";
        }
    } else {
        for(var pageIndex= 1; pageIndex <= totalPage;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + '_' + pageIndex + '.html' + pageSearch +">"+ pageIndex +"</a>";
        }
    }

    if(currentPage<totalPage){
        tempStr += "<a href="+ pageUrl + '_' + (currentPage+1) + '.html' + pageSearch +">下一页</a>";
        tempStr += "<a href="+ pageUrl + '_' + totalPage + '.html' + pageSearch +">尾页</a>";
    }else{
        tempStr += "<span class='btn'>下一页</span>";
        tempStr += "<span class='btn'>尾页</span>";
    }

    return tempStr;
}

// 视频详情
router.get('/videos/detail/:id', function (req, res) {
    var id = req.params.id || '';
    var sql = 'SELECT * FROM list_data where id = "'+ id +'"';
    var listObj = {
        pageTitle: '没找到数据-韩国伦理',
        pageKeyword: '阿顺/阿顺520,ashun520.com有你, ady, ady在线, 韩国伦理, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        pageDescrition: '阿顺/阿顺520,ashun520.com有你, ady, ady在线, 韩国伦理, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        host: 'http://'+req.headers['host'],
        menu: menu,
        terminal: req.terminal,
        video: ''
    }
    
    if (!Number(id)) {
        res.render('detail', listObj);
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL ==> detail" + err);
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - detail', err.message);
                res.render('detail', listObj);
                conn.release();
            } else {
                if (result[0]) {
                    var video = result[0].video ? result[0].video.split('http')[1] : '';
                    listObj.video = 'http' + video;
                    listObj.type = '/videos/'+result[0].type+'/';
                    listObj.pageTitle = result[0].title;
                    res.render('detail', listObj);
                    conn.release();
                } else{
                    res.render('detail', listObj);
                }
            }
        });
    })
})


router.get('*', function (req, res, next) {
    var listObj = {
        pageTitle: '韩国伦理404页面',
        pageKeyword: '阿顺/阿顺520,ashun520.com有你, ady, ady在线, 韩国伦理, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        pageDescrition: '阿顺/阿顺520,ashun520.com有你, ady, ady在线, 韩国伦理, 奸臣 韩国在线观看, 韩国表妹2017在线观看',
        host: 'http://'+req.headers['host']
    }
    res.status(404);
    res.render('404', listObj);
});

module.exports = router;

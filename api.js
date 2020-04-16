var express = require('express');
var url = require('url');
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var router = express.Router();
var num = 0;
var menu = [
    { "url": "/", "type": '/', "name": "首页"},
    { "url": "/videos/guocai/", "type": "guocai", "name": "国产精品", num: 1 },//868
    { "url": "/videos/oumei/", "type": "oumei", "name": "欧美", num: 1 }, //110
    { "url": "/videos/dongman/", "type": "dongman", "name": "动漫", num: 1 }, //21
    { "url": "/videos/wuma/", "type": "wuma", "name": "无码", num: 1 }, //139
    { "url": "/videos/zhonggwen/", "type": "zhonggwen", "name": "中文字幕", num: 1 },//31 
    { "url": "/videos/juru/", "type": "juru", "name": "巨乳", num: 1 }, //18
    { "url": "/videos/meishaonv/", "type": "meishaonv", "name": "美少女", num: 1 }, //3
    { "url": "/videos/dujia/", "type": "dujia", "name": "DMM独家", num: 1 }, //120
    { "url": "/videos/hey/", "type": "hey", "name": "Hey动画", num: 1 },//3
    { "url": "/videos/HEYZO/", "type": "HEYZO", "name": "HEYZO", num: 1 }, //36
    { "url": "/videos/caocui/", "type": "caocui", "name": "潮吹", num: 1 }, //30
    { "url": "/videos/kojiao/", "type": "kojiao", "name": "口交", num: 1 }, //21
    { "url": "/videos/shouci/", "type": "shouci", "name": "首次亮相", num: 1 }, //38
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

// 路由拦截
router.all('*', function (req, res, next) {
    // var userAgent = req.headers["user-agent"] || '';
    // var deviceAgent = userAgent.toLowerCase();
    // var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    // var terminal = '';
    // if (agentID) {
    //     terminal = "mobile";
    // } else {
    //     terminal = "pc";
    // }
    // req.terminal = terminal;
    if(req.method=="OPTIONS") {
        res.sendStatus(200);/*让options请求快速返回*/
    } else {
        next();
    }
})
// 首页
router.get('/', function (req, res) {
    var sql = 'select a.* from (select * from list_data where type = "zhonggwen" order by id desc limit 10) a union all select b.* from (select * from list_data where type = "dongman" order by id desc limit 10) b union all select c.* from (select * from list_data where type = "shouci" order by id desc limit 10) c';
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
                    zhonggwen: [],
                    dongman: [],
                    shouci: [],
                }
                var arr = [];
                for (var i = 0; i < result.length; i++) {
                    obj[result[i].type].push(result[i]);
                }
                arr = [
                    {type: 'zhonggwen', list: obj.zhonggwen, name: '中文字幕'},
                    {type: 'dongman', list: obj.dongman, name: '动漫'},
                    {type: 'shouci', list: obj.shouci, name: '首次亮相'}
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
        type: type[0],
        result: []
    }
    var numL = Number(type[1]) || 1;
    var limit = ((numL - 1) * 20) + ',' + 20;
    var sql = 'SELECT * FROM list_data where type = "'+ type[0] +'" order by id desc limit ' + limit;
    var count = 'SELECT COUNT(1) FROM list_data where type ="' + type[0] + '"';
    if (type[0] == 'search') {
        sql = 'SELECT * FROM list_data where title like "' +'%'+ decodeURI(search[1]) +'%'+ '" order by id desc limit ' + limit;
        count = 'SELECT COUNT(1) FROM list_data where title like "' +'%'+ decodeURI(search[1]) +'%'+ '"';
    }
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
    var pageSize = 20;//每页显示行数
    var pageUrl = '/videos/' + type;
    var pageSearch = (type === 'search') ? '?search=' + pSearch : '';
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
        recommond: [],
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
                    listObj.type = result[0].type;
                    listObj.pageTitle = result[0].title;
                    var reNum = Math.floor(Math.random()*(1 - 2000) + 2000);
                    var recommondSql = 'SELECT * FROM list_data order by id desc limit ' + (reNum + ',' + 10);
                    conn.query(recommondSql, function (err, recommondResult) {
                        listObj.recommond = recommondResult;
                        res.render('detail', listObj);
                        conn.release();
                    })
                } else{
                    res.render('detail', listObj);
                }
            }
        });
    })
})

router.get('/friendly666', function (req, res) {
    fs.readFile('./public/users.json',function(err,data){
        var person = data.toString();//将二进制的数据转换为字符串
        person = JSON.parse(person);//将字符串转换为json对象
        res.render('friendly', person);
    })
    
});

router.post('/friendly/del', function (req, res) {
    var obj = req.body;
    fs.readFile('./public/users.json',function(err,data){
        var person = data.toString();//将二进制的数据转换为字符串
        person = JSON.parse(person);//将字符串转换为json对象
        for(var i = 0; i < person.data.length; i++){
            if(obj.id == person.data[i].id){
                person.data.splice(i,1);
            }
        }
        var str = JSON.stringify(person);
        //然后再把数据写进去
        fs.writeFile('./public/users.json',str,function(err){
            if(err){
                console.error(err);
            }
        })
        res.json({code: 200, msg: '删除成功'})
    })
})
router.post('/friendly/add', function (req,res){
    var params = req.body
    //现将json文件读出来
    fs.readFile('./public/users.json',function(err,data){
        if(err){
            return console.error(err);
        }
        var person = data.toString();//将二进制的数据转换为字符串
        var id = 1;
        person = JSON.parse(person);//将字符串转换为json对象
        for (var i = 0; i < person.data.length; i++) {
            if (person.data[i].id >= id) {
                id = person.data[i].id + 1
            }
        }
        params.id = id
        person.data.push(params);//将传来的对象push进数组对象中
        var str = JSON.stringify(person);//因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
        fs.writeFile('./public/users.json',str,function(err){
            if(err){r(err);
            }
        })
        res.json({code: 200, msg: '添加成功', data: params})
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

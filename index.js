const http = require("http");
const url = require("url");
const fs = require("fs");
const ytsr = require("ytsr");
const cheerio = require("cheerio");
const got = require("got");
const redddit = require("redddit");
const sc = require("sc-searcher");
const scSearch = new sc();
const scKey = require("soundcloud-key-fetch");
scKey.fetchKey().then(function(key) {
    scKey.testKey(key).then(function(valid) {
        if (valid) { scSearch.init(key); }
    }) 
});
const port = process.env.PORT || 8228

http.createServer(hostServer).listen(port);
console.log(" -- videoshack server started on port " + port + " -- ")

async function hostServer(request, response) {
    var u = url.parse(request.url, true);
    var pathP = u.pathname.split("/").slice(1);
    if (pathP[0] == "api") {
        if (pathP[1] == "search") {
            switch (pathP[2]) {
                case "youtube":
                    ytsr(u.query.q).then(function(resp) {
                        var final = [];
                        for (var c in resp.items) {if (resp.items[c].type == "video") {
                            var newObj = {
                                "title": resp.items[c].title,
                                "url": resp.items[c].url,
                                "thumbnail": resp.items[c].bestThumbnail.url.split("?")[0],
                                "creatorName": resp.items[c].author.name,
                                "creatorUrl": resp.items[c].author.url,
                                "uploadedAt": resp.items[c].uploadedAt,
                                "viewCount": resp.items[c].views,
                                "desc": resp.items[c].description
                            }
                            final.push(newObj);
                        } else {continue;}}
                        var json = JSON.stringify({
                            "query": u.query.q,
                            "results": final
                        })
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(json);
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;
                
                case "vimeo":
                    got("https://vimeo.com/search?q=" + encodeURIComponent(u.query.q), {
                        headers: {
                            "Host": "vimeo.com",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Accept-Encoding": "gzip, deflate, br",
                            "Referer": "https://vimeo.com",
                            "Connection": "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "DNT": "1",
                            "Sec-GPC": "1",
                            "Cache-Control": "max-age=0"
                        }
                    }).then(async function(resp) {
                        try {
                            var json = JSON.parse(resp.body.split('var data = ')[1].split("}};")[0] + "}}");
                            var final = [];
                            for (var c in json.filtered.data) {
                                if (json.filtered.data[c].type == "clip") {
                                    var newObj = {
                                        "title": json.filtered.data[c].clip.name,
                                        "url": json.filtered.data[c].clip.link,
                                        "thumbnail": json.filtered.data[c].clip.pictures.sizes[0].link,
                                        "creatorName": json.filtered.data[c].clip.user.name,
                                        "creatorUrl": json.filtered.data[c].clip.user.link,
                                        "uploadedAt": json.filtered.data[c].clip.created_time,
                                        "viewCount": json.filtered.data[c].clip.stats.plays,
                                        "desc": null
                                    }
                                    final.push(newObj);
                                }
                            }
                            var json = JSON.stringify({
                                "query": u.query.q,
                                "results": final
                            })
                            response.writeHead(200, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(json);
                        } catch (error) {
                            var errObj = JSON.stringify({
                                "err": {
                                    "message": error.message,
                                    "code": error.code
                                }
                            });
                            response.writeHead(500, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(errObj);
                        }
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                })
                return;

                case "dailymotion":
                    got("https://api.dailymotion.com/videos?fields=url,thumbnail_url,title,description,views_total&search=" + encodeURIComponent(u.query.q) + "&limit=100").then(function(resp) {
                        var json = JSON.parse(resp.body);
                        var final = [];
                        for (var c in json.list) {
                            var newObj = {
                                "title": json.list[c].title,
                                "url": json.list[c].url,
                                "thumbnail": json.list[c].thumbnail_url,
                                "creatorName": null,
                                "creatorUrl": null,
                                "uploadedAt": null,
                                "viewCount": json.list[c].views_total,
                                "desc": json.list[c].description
                            }
                            final.push(newObj);
                        }
                        var json = JSON.stringify({
                            "query": u.query.q,
                            "results": final
                        });
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(json);
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                case "bitchute":
                    got("https://www.bitchute.com/search/?query=" + encodeURIComponent(u.query.q) + "&kind=video", {
                        headers: {
                            "Host": "www.bitchute.com",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Accept-Encoding": "gzip, deflate, br",
                            "DNT": "1",
                            "Connection": "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "Sec-GPC": "1"
                        }
                    }).then(function(resp) {
                        try {
                            var csrf = resp.headers["set-cookie"][1].split("csrftoken=")[1].split("; ")[0]
                            var b = "csrfmiddlewaretoken=" + csrf + "&query=" + encodeURIComponent(u.query.q) +"&kind=video&duration=&sort=page=0";
                            var cookie = resp.headers["set-cookie"][0].split(";")[0] + "; " + resp.headers["set-cookie"][1].split(";")[0] + "; registration=on; preferences={%22theme%22:%22day%22%2C%22autoplay%22:true}";
                            var c = (encodeURI(b).split(/%..|./).length - 1);
                        } catch (error) {
                            var errObj = JSON.stringify({
                                "err": {
                                    "message": error.message,
                                    "code": error.code
                                }
                            });
                            response.writeHead(500, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(errObj);
                        }
                        got.post("https://www.bitchute.com/api/search/list/", {
                            body: b,
                            headers: {
                                "Host": "www.bitchute.com",
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                                "Accept": "*/*",
                                "Accept-Language": "en-US,en;q=0.5",
                                "Accept-Encoding": "gzip, deflate, br",
                                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                                "X-Requested-With": "XMLHttpRequest",
                                "Content-Length": c,
                                "Referer": "https://www.bitchute.com/search/?query=test&kind=video",
                                "Cookie": cookie,
                                "Sec-GPC": "1",
                                "TE": "Trailers"
                            }
                        }).then(function(resp) {
                            var json = JSON.parse(resp.body).results;
                            var final = [];
                            for (var c in json) {
                                if (json[c].kind == "video") {
                                    var newObj = {
                                        "title": json[c].name,
                                        "url": "https://www.bitchute.com" + json[c].path,
                                        "thumbnail": json[c].images.thumbnail,
                                        "creatorName": json[c].channel_name,
                                        "creatorUrl": "https://www.bitchute.com" + json[c].channel_path,
                                        "uploadedAt": null,
                                        "viewCount": json[c].views,
                                        "desc": extractQQTitle(json[c].description)
                                    }
                                    final.push(newObj);
                                }
                            }
                            var json = JSON.stringify({
                                "query": u.query.q,
                                "results": final
                            })
                            response.writeHead(200, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(json);
                        }).catch(function(err) {
                            var errObj = JSON.stringify({
                                "err": {
                                    "message": err.message,
                                    "code": err.code
                                }
                            });
                            response.writeHead(500, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(errObj);
                        })
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                case "metacafe": 
                    got("https://www.metacafe.com/videos_about/" + u.query.q, {
                        headers: {
                            "Host": "www.metacafe.com",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Accept-Encoding": "gzip, deflate, br",
                            "DNT": "1",
                            "Connection": "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "Sec-GPC": "1"
                        }
                    }).then(function(resp) {
                        var final = [];
                        var $ = cheerio.load(resp.body);
                        for (var c in $("#search_videos_videos_list_search_result .item")) {
                            if (
                                $("#search_videos_videos_list_search_result .item .mc-preview-title a")[c].children !== undefined &&
                                $("#search_videos_videos_list_search_result .item .mc-preview-title a")[c].children[0] !== undefined &&
                                $("#search_videos_videos_list_search_result .item .mc-preview-title a")[c].children[0].data !== "!DOCTYPE html" &&
                                $("#search_videos_videos_list_search_result .item .mc-preview-title a")[c].children[0].data !== undefined &&
                                $("#search_videos_videos_list_search_result .mc-preview-link a")[c].attribs !== undefined &&
                                $("#search_videos_videos_list_search_result .item .mc-preview-views span")[c] !== undefined &&
                                $("#search_videos_videos_list_search_result .item .mc-preview-views span")[c].children !== undefined
                            ) {
                                var tit = $("#search_videos_videos_list_search_result .item .mc-preview-title a")[c].children[0].data;
                                var au = $("#search_videos_videos_list_search_result .mc-preview-link a")[c].children[0].data;
                                var aul = $("#search_videos_videos_list_search_result .mc-preview-link a")[c].attribs.href;
                                if (aul == "https://www.metacafe.com/login-required/") {continue;}
                                var ur = $("#search_videos_videos_list_search_result .item .mc-preview-title a")[c].attribs.href;
                                var v = parseInt($("#search_videos_videos_list_search_result .item .mc-preview-views span")[c].children[0].data);
                                var up = extractQQTitle($("#search_videos_videos_list_search_result .item .mc-preview-date")[c].children);
                                var d = extractQQTitle($("#search_videos_videos_list_search_result .item .mc-preview-description")[c].children);
                                if ($("#search_videos_videos_list_search_result .item .mc-new-item-image img")[c] == undefined) {var th = null;} else {
                                    var th = JSON.stringify($("#search_videos_videos_list_search_result .item .mc-new-item-image img")[c].attribs.onscreenover.split("selectImgSrc(this, ")[1].split(")")[0])
                                    var th = th.split("src: '")[1].split("'}")[0]
                                }
                                var blob = {
                                    "title": tit,
                                    "url": ur,
                                    "thumbnail": th,
                                    "creatorName": au,
                                    "creatorUrl": aul,
                                    "uploadedAt": up,
                                    "viewCount": v,
                                    "desc": d
                                };
                                final.push(blob);
                            }
                        }
                        var json = JSON.stringify({
                            "query": u.query.q,
                            "results": final
                        })
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(json);
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                case "archiveorg": 
                    got("https://archive.org/details/movies?and%5B%5D=" + u.query.q + "&sin=&and%5B%5D=mediatype%3A%22movies%22", {
                        headers: {
                            "Host": "archive.org",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Accept-Encoding": "gzip, deflate, br",
                            "DNT": "1",
                            "Connection": "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "Sec-GPC": "1"
                        }
                    }).then(function(resp) {
                        var $ = cheerio.load(resp.body);
                        var final = [];
                        for (var c in $(".results .item-ia")) {
                            if (
                                $(".results .item-ia .C234 div a")[c] !== undefined && 
                                $(".results .item-ia .C234 div a")[c].attribs !== undefined && 
                                $(".results .item-ia .C234 div a")[c].attribs.href !== undefined
                            ) {
                                var ur = "https://archive.org" + $(".results .item-ia .C234 .C2 a")[c].attribs.href;
                                var t = $(".results .item-ia .C234 .C2 .ttl")[c].children[0].data
                                var t = t.replace(/^\s+|\s+$/g, "");
                                if ($(".results .item-ia .C234 .by .byv")[c] == undefined) {continue;}
                                var auth = $(".results .item-ia .C234 .by .byv")[c].children[0].data;
                                var th = "https://archive.org" + $(".results .item-ia .C234 .C2 img")[c].attribs.source;
                                var up = $(".results .item-ia .pubdate .hidden-xs")[c].children[0].data;
                                var vc = parseInt($(".results .item-ia .views .hidden-xs")[c].children[0].data);
                                var blob = {
                                    "title": t,
                                    "url": ur,
                                    "thumbnail": th,
                                    "creatorName": auth,
                                    "creatorUrl": null,
                                    "uploadedAt": up,
                                    "viewCount": vc,
                                    "desc": null
                                };
                                final.push(blob);
                            }
                        } 
                        var json = JSON.stringify({
                            "query": u.query.q,
                            "results": final
                        })
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(json);
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                case "bilibili":
                    got("https://search.bilibili.com/video?keyword=" + u.query.q + "&from_source=nav_search_new", {
                        headers: {
                            "Host": "search.bilibili.com",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Accept-Encoding": "gzip, deflate, br",
                            "DNT": "1",
                            "Connection": "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "Sec-GPC": "1"
                        }
                    }).then(function(resp) {
                        var $ = cheerio.load(resp.body);
                        var final = [];
                        for (var c in $(".video-list li")) {
                            if (
                                $(".video-list li .img-anchor")[c].attribs !== undefined && 
                                $(".video-list li .img-anchor")[c].attribs.title !== undefined
                            ) {
                                var t = $(".video-list li .img-anchor")[c].attribs.title;
                                var th = $(".video-list li .img .lazy-img")[c].children[0].attribs.src;
                                var a = $(".video-list li .up-name")[c].children[0].data;
                                var al = "https:" + $(".video-list li .up-name")[c].attribs.href.split("?")[0];
                                var ur = "https:" + $(".video-list li .title")[c].attribs.href.split("?")[0];
                                var up = extractQQTitle($(".video-list li .time")[c].children)
                                var vc = extractQQTitle($(".video-list li .watch-num")[c].children).replace("万", "K");
                                var blob = {
                                    "title": t,
                                    "url": ur,
                                    "thumbnail": th,
                                    "creatorName": a,
                                    "creatorUrl": al,
                                    "uploadedAt": up,
                                    "viewCount": vc,
                                    "desc": null
                                };
                                final.push(blob);
                            }
                        }
                        var json = JSON.stringify({
                            "query": u.query.q,
                            "results": final
                        })
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(json);
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                case "newgrounds":
                    got("https://www.newgrounds.com/search/conduct/movies?suitabilities=etm&terms=" + u.query.q, {
                        headers: {
                            "Host": "www.newgrounds.com",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Accept-Encoding": "gzip, deflate, br",
                            "DNT": "1",
                            "Connection": "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "Sec-GPC": "1"
                        }
                    }).then(function(resp) {
                        var $ = cheerio.load(resp.body);
                        var final = [];
                        for (var c in $(".itemlist li")) {
                            if (
                                $(".itemlist li a")[c].attribs == undefined ||
                                $(".itemlist li a")[c].attribs.href == undefined || 
                                $(".itemlist li a")[c].attribs.href.substring(0,1) == "/"
                            ) {continue;}
                            var ur = $(".itemlist li a")[c].attribs.href;
                            var th = $(".itemlist li a .item-icon div img")[c].attribs.src.split("?")[0];
                            var t = extractQQTitle($(".itemlist li a .detail-title h4")[c].children);
                            var au = $(".itemlist li a .detail-title span strong")[c].children[0].data;
                            var d = extractQQTitle($(".itemlist li a .detail-description")[c].children);
                            var blob = {
                                "title": t,
                                "url": ur,
                                "thumbnail": th,
                                "creatorName": au,
                                "creatorUrl": null,
                                "uploadedAt": null,
                                "viewCount": null,
                                "desc": d
                            };
                            final.push(blob);
                        }  
                        var json = JSON.stringify({
                            "query": u.query.q,
                            "results": final
                        })
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(json);
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                case "rumble":
                    got("https://rumble.com/search/video?q=" + u.query.q, {
                        headers: {
                            "Host": "rumble.com",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Accept-Encoding": "gzip, deflate, br",
                            "DNT": "1",
                            "Connection": "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "Sec-GPC": "1"
                        }
                    }).then(function(resp) {
                        var $ = cheerio.load(resp.body);
                        var final = [];
                        for (var c in $(".video-listing-entry")) {
                            if (
                                $(".video-listing-entry article h3")[c] == undefined ||
                                $(".video-listing-entry article h3")[c].children == undefined ||
                                $(".video-listing-entry article h3")[c].children[0] == undefined ||
                                $(".video-listing-entry article h3")[c].children[0].data == "!DOCTYPE html" ||
                                $(".video-listing-entry article .video-item--a")[c].attribs == undefined ||
                                $(".video-listing-entry article footer .video-item--rumbles")[c] == undefined ||
                                $(".video-listing-entry article .video-item--time")[c] == undefined
                            ) {continue;} 
                            var t = $(".video-listing-entry article h3")[c].children[0].data;
                            if ($(".video-listing-entry article .video-item--a img")[c].attribs == undefined) {var th = null}
                            else {var th = $(".video-listing-entry article .video-item--a img")[c].attribs.src;}
                            var au = $(".video-listing-entry article footer address a .ellipsis-1")[c].children[0].data;
                            var auL = "https://rumble.com" + $(".video-listing-entry .video-item--by-a")[c].attribs.href;
                            var ur = "https://rumble.com" + $(".video-listing-entry article .video-item--a")[c].attribs.href;
                            var vc = parseInt($(".video-listing-entry article footer .video-item--rumbles")[c].attribs["data-value"].replace(",", ""));
                            var up = $(".video-listing-entry article .video-item--time")[c].attribs["datetime"];
                            var blob = {
                                "title": t,
                                "url": ur,
                                "thumbnail": th,
                                "creatorName": au,
                                "creatorUrl": auL,
                                "uploadedAt": up,
                                "viewCount": vc,
                                "desc": null
                            };
                            final.push(blob);
                        }
                        var json = JSON.stringify({
                            "query": u.query.q,
                            "results": final
                        })
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(json);
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                case "reddit":
                    redddit.search("site:v.redd.it " + u.query.q, function(err, resp) {
                        if (err) {
                            var errObj = JSON.stringify({
                                "err": {
                                    "message": err.message,
                                    "code": err.code
                                }
                            });
                            response.writeHead(500, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(errObj);
                        } else {
                            var final = [];
                            for (var c in resp) {
                                var t = resp[c].data.title;
                                var th = resp[c].data.thumbnail;
                                var ur = resp[c].data.url_overridden_by_dest;
                                var au = resp[c].data.author;
                                var auL = "https://reddit.com/u/" + resp[c].data.author;
                                var blob = {
                                    "title": t,
                                    "url": ur,
                                    "thumbnail": th,
                                    "creatorName": au,
                                    "creatorUrl": auL,
                                    "uploadedAt": null,
                                    "viewCount": null,
                                    "desc": null
                                };
                                final.push(blob);
                            }
                            var json = JSON.stringify({
                                "query": u.query.q,
                                "results": final
                            })
                            response.writeHead(200, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(json);
                        }
                    });
                return;

                case "meganz":
                    redddit.search("site:mega.nz " + u.query.q, function(err, resp) {
                        if (err) {
                            var errObj = JSON.stringify({
                                "err": {
                                    "message": err.message,
                                    "code": err.code
                                }
                            });
                            response.writeHead(500, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(errObj);
                        } else {
                            var final = [];
                            for (var c in resp) {
                                var t = resp[c].data.title;
                                var th = resp[c].data.thumbnail;
                                var ur = resp[c].data.url_overridden_by_dest;
                                var au = resp[c].data.author
                                var auL = "https://reddit.com/u/" + resp[c].data.author
                                var blob = {
                                    "title": t,
                                    "url": ur,
                                    "thumbnail": th,
                                    "creatorName": au,
                                    "creatorUrl": auL,
                                    "uploadedAt": null,
                                    "viewCount": null,
                                    "desc": null
                                };
                                final.push(blob);
                            }
                            var json = JSON.stringify({
                                "query": u.query.q,
                                "results": final
                            })
                            response.writeHead(200, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(json);
                        }
                    });
                return;

                case "gdrive":
                    redddit.search("site:drive.google.com " + u.query.q, function(err, resp) {
                        if (err) {
                            var errObj = JSON.stringify({
                                "err": {
                                    "message": err.message,
                                    "code": err.code
                                }
                            });
                            response.writeHead(500, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(errObj);
                        } else {
                            var final = [];
                            for (var c in resp) {
                                var t = resp[c].data.title;
                                var th = resp[c].data.thumbnail;
                                var ur = resp[c].data.url_overridden_by_dest;
                                var au = resp[c].data.author
                                var auL = "https://reddit.com/u/" + resp[c].data.author
                                var blob = {
                                    "title": t,
                                    "url": ur,
                                    "thumbnail": th,
                                    "creatorName": au,
                                    "creatorUrl": auL,
                                    "uploadedAt": null,
                                    "viewCount": null,
                                    "desc": null
                                };
                                final.push(blob);
                            }
                            var json = JSON.stringify({
                                "query": u.query.q,
                                "results": final
                            })
                            response.writeHead(200, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(json);
                        }
                    });
                return;

                case "soundcloud":
                    var final = [];
                    scSearch.getTracks(u.query.q, 100).then(function(resp) {
                        for (var c in resp) {
                            var t = resp[c].title;
                            var th = resp[c].artwork_url;
                            var ur = resp[c].permalink_url;
                            if (resp[c].user.full_name) {
                                var au = resp[c].user.full_name;
                            } else {
                                var au = resp[c].user.permalink;
                            }
                            var auL = resp[c].user.permalink_url;
                            var vc = resp[c].playback_count;
                            var up = resp[c].display_date;
                            if (resp[c].description) {var d = resp[c].description.replace(/^\s+|\s+$/g, "");} else {var d = null;}
                            var blob = {
                                "title": t,
                                "url": ur,
                                "thumbnail": th,
                                "creatorName": au,
                                "creatorUrl": auL,
                                "uploadedAt": up,
                                "viewCount": vc,
                                "description": d
                            };
                            final.push(blob);
                        }
                        var json = JSON.stringify({
                            "query": u.query.q,
                            "results": final
                        })
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(json);
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                case "niconico":
                    got("https://www.nicovideo.jp/search/" + u.query.q, {
                        headers: {
                            "Host": "www.nicovideo.jp",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Accept-Encoding": "gzip, deflate, br",
                            "DNT": "1",
                            "Connection": "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "Sec-GPC": "1"
                        }
                    }).then(function(resp) {
                        var $ = cheerio.load(resp.body);
                        var final = [];
                        for (var c in $(".list .item")) {
                            if (
                                $(".list .item .itemTitle a")[c] !== undefined &&
                                $(".list .item .itemTitle a")[c].children !== undefined &&
                                $(".list .item .itemTitle a")[c].children[0] !== undefined && 
                                $(".list .item .itemTitle a")[c].children[0].data !== undefined &&
                                $(".list .item .itemTitle a")[c].children[0].data !== "!DOCTYPE html" &&
                                $(".list .item .jsLazyImage")[c] !== undefined &&
                                $(".list .item .itemTitle a")[c].attribs !== undefined &&
                                $(".list .item .view span")[c] !== undefined &&
                                $(".list .item .view span")[c].children !== undefined 
                            ) {
                                var t = $(".list .item .itemTitle a")[c].children[0].data;
                                var ur =  $(".list .item .itemTitle a")[c].attribs.href;
                                var thumb = $(".list .item .jsLazyImage")[c].attribs["data-original"] || $(".list .item .jsLazyImage")[c].attribs["data-thumbnail"];
                                var vc = parseInt(extractQQTitle($(".list .item .view span")[c].children).replace(",", ""));
                                if (thumb == undefined) {var thumb = null;}
                                if (ur.substring(0,1) == "/" && !ur.includes("?")) {
                                    var blob = {
                                        "title": t,
                                        "url": "https://www.nicovideo.jp" + ur,
                                        "thumbnail": thumb,
                                        "creatorName": null,
                                        "creatorUrl": null,
                                        "uploadedAt": null,
                                        "viewCount": vc,
                                        "desc": null
                                    }
                                    final.push(blob);
                                }
                            } else {
                                continue;
                            }
                        }
                        var json = JSON.stringify({
                            "query": u.query.q,
                            "results": final
                        })
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(json);
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                case "tumblr":
                    got("https://www.tumblr.com/search/" + u.query.q, {
                        headers: {
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                            "Accept-Encoding": "gzip, deflate, br",
                            "Accept-Language": "en-US,en;q=0.9",
                            "Upgrade-Insecure-Requests": "1",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36"
                        }
                    }).then(function(resp) {
                        var cookies = resp.headers["set-cookie"];
                        var cString = "";
                        var $ = cheerio.load(resp.body);
                        var key = $("#tumblr_form_key")[0].attribs.content;
                        for (var c in cookies) { cString = cString + cookies[c].split(";")[0] + "; " }
                        cString = cString.substring(0, cString.length - 2);
                        var b = "q=" + u.query.q + "&sort=top&post_view=masonry&blogs_before=-1&num_blogs_shown=4&num_posts_shown=0&before=0&blog_page=2&safe_mode=true&post_page=1&filter_nsfw=true&filter_post_type=video&next_ad_offset=0&ad_placement_id=0&more_posts=true";
                        var l = (encodeURI(b).split(/%..|./).length - 1);
                        got.post("https://www.tumblr.com/search/" + u.query.q, {
                            body: b,
                            headers: {
                                "accept": "application/json, text/javascript, */*; q=0.01",
                                "accept-encoding": "gzip, deflate, br",
                                "accept-language": "en-US,en;q=0.9",
                                "content-length": l,
                                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                                "Cookie": cString,
                                "Origin": "https://www.tumblr.com",
                                "Referer": "https://www.tumblr.com/search/" + u.query.q,
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36",
                                "x-requested-with": "XMLHttpRequest",
                                "x-tumblr-form-key": key
                            }
                        }).then(function(resp) {
                            var j = JSON.parse(resp.body);
                            var $ = cheerio.load(j.response.posts_html);
                            fs.writeFileSync("tumblr.html", j.response.posts_html)
                            var final = [];
                            for (var c in $("article .post_content")) {
                                if (
                                    $("article .post_content .post_body")[c] == undefined || 
                                    $("article .post_content .post_body")[c].children == undefined ||
                                    $("article .tumblelog_info .post-info-tumblelog a")[c] == undefined ||
                                    $("article .tumblelog_info .post-info-tumblelog a")[c].attribs == undefined
                                ) {continue;}
                                var t = extractQQTitle($("article .post_content .post_body")[c].children)
                                var au = $("article .tumblelog_info .post-info-tumblelog a")[c].attribs.href.split("/post/")[0].substring(8).split(".tumblr.com")[0];
                                var al = $("article .tumblelog_info .post-info-tumblelog a")[c].attribs.href.split("/post/")[0];
                                var l = $("article .tumblelog_info .post-info-tumblelog a")[c].attribs.href; 
                                var blob = {
                                    "title": t,
                                    "url": l,
                                    "thumbnail": null,
                                    "creatorName": au,
                                    "creatorUrl": al,
                                    "uploadedAt": null,
                                    "viewCount": null,
                                    "desc": null
                                }
                                final.push(blob);
                            }
                            var json = JSON.stringify({
                                "query": u.query.q,
                                "results": final
                            })
                            response.writeHead(200, {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json"
                            });
                            response.end(json);
                        })
                    }).catch(function(err) {
                        var errObj = JSON.stringify({
                            "err": {
                                "message": err.message,
                                "code": err.code
                            }
                        });
                        response.writeHead(500, {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/json"
                        });
                        response.end(errObj);
                    });
                return;

                default:
                    var errObj = JSON.stringify({
                        "err": {
                            "message": "This search endpoint does not exist.",
                            "code": "noSearchEnd"
                        }
                    })
                    response.writeHead(404, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "application/json"
                    });
                    response.end(errObj);
                return;
            }
        } else {
            var errObj = JSON.stringify({
                "err": {
                    "message": "This endpoint does not exist.",
                    "code": "invalidEndpoint"
                }
            })
            response.writeHead(404, {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            });
            response.end(errObj);
        }
    } else if (pathP[0] == "proxy") {
        var ur = Buffer.from(u.pathname.substring(7), "base64").toString();
        got(ur, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
                "Accept": "image/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                "DNT": "1",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-GPC": "1"
            }
        }).then(function(resp) {
            
            response.writeHead(resp.statusCode, resp.headers);
            response.end(resp.rawBody);
        }).catch(function(err) {
            if (err.response) {
                response.writeHead(err.response.statusCode, err.response.headers);
                response.end(err.response.rawBody);
            } else {
                response.writeHead(500)
                response.end(err.stack)
            }
        })
    } else {
        if (fs.existsSync("./web-content" + u.pathname + "index.html")) {
            var path = "./web-content" + u.pathname + "index.html";
            fs.readFile(path, function(err, resp) {
                if (err) {
                    fs.readFile("./error-pages/500.html", function(err, resp) {
                        if (err) {
                            resp.end(err.stack);
                        } else {
                            var $ = cheerio.load(resp);
                            $("#errStack").text(err.stack);
                            response.end($.html());
                        }
                    })
                } else {
                    response.writeHead(200,  {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/html"
                    });
                    response.end(resp);
                }
            })
        } else if (fs.existsSync("./web-content" + u.pathname + "/index.html")) {
            var path = "./web-content" + u.pathname + "/index.html";
            fs.readFile(path, function(err, resp) {
                if (err) {
                    fs.readFile("./error-pages/500.html", function(err, resp) {
                        if (err) {
                            resp.end(err.stack);
                        } else {
                            var $ = cheerio.load(resp);
                            $("#errStack").text(err.stack);
                            response.end($.html());
                        }
                    })
                } else {
                    response.writeHead(200,  {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/html"
                    });
                    response.end(resp);
                }
            })
        } else if (fs.existsSync("./web-content" + u.pathname)) {
            var path = "./web-content" + u.pathname;
            var type = path.split(".")[path.split(".").length - 1];
            if (type == "css") {
                var cType = "text/css";
            } else if (type == "js") {
                var cType = "application/javascript";
            } else if (type == "html") {
                var cType = "text/html"
            } else if (type == "jpg") {
                var cType = "image/jpeg"
            } else if (type == "png") {
                var cType = "image/png"
            }
            fs.readFile(path, function(err, resp) {
                if (err) {
                    if (err.code == "EISDIR") {
                        fs.readFile("./error-pages/404.html", function(err, resp) {
                            if (err) {
                                fs.readFile("./error-pages/500.html", function(err, resp) {
                                    if (err) {
                                        resp.end(err.stack);
                                    } else {
                                        var $ = cheerio.load(resp);
                                        $("#errStack").text(err.stack);
                                        response.end($.html());
                                    }
                                })
                            } else {
                                response.writeHead(404, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "text/html"
                                });
                                response.end(resp);
                            }
                        })
                    } else {
                        fs.readFile("./error-pages/500.html", function(err, resp) {
                            if (err) {
                                resp.end(err.stack);
                            } else {
                                var $ = cheerio.load(resp);
                                $("#errStack").text(err.stack);
                                response.end($.html());
                            }
                        })
                    }
                } else {
                    response.writeHead(200,  {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": cType
                    });
                    response.end(resp);
                }
            })
        } else {
            fs.readFile("./error-pages/404.html", function(err, resp) {
                if (err) {
                    fs.readFile("./error-pages/500.html", function(err, resp) {
                        if (err) {
                            resp.end(err.stack);
                        } else {
                            var $ = cheerio.load(resp);
                            $("#errStack").text(err.stack);
                            response.end($.html());
                        }
                    })
                } else {
                    response.writeHead(404, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/html"
                    });
                    response.end(resp);
                }
            })
        }
    }
}


function extractQQTitle(array) {
    if (Object.prototype.toString.call(array) == "[object Array]") {
        var string = "";
        for (var c in array) {
            if (array[c].type == "text") {string = string + array[c].data}
            else if (
                array[c].type == "tag" && 
                array[c].children !== undefined && 
                array[c].children[0] !== undefined &&
                array[c].children[0].type == "text"
            ) {
                for (var d in array[c].children) {
                    if (array[c].children[d].data) {string = string + array[c].children[d].data;} else {continue;}
                }
            }
        }
        return string.replace(/^\s+|\s+$/g, "");
    } else {
        return array;
    }
}
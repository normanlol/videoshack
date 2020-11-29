const http = require("http");
const url = require("url");
const fs = require("fs");
const ytsr = require("ytsr");
const cheerio = require("cheerio");
const got = require("got");

http.createServer(hostServer).listen(process.env.PORT || 8228);

async function hostServer(request, response) {
    var u = url.parse(request.url, true);
    var pathP = u.pathname.split("/").slice(1);
    if (pathP[0] == "api") {
        if (pathP[1] == "search") {
            if(pathP[2] == "youtube") {
                ytsr(u.query.q).then(function(resp) {
                    var final = [];
                    for (var c in resp.items) {if (resp.items[c].type == "video") {
                        var newObj = {
                            "title": resp.items[c].title,
                            "url": resp.items[c].link,
                            "thumbnail": resp.items[c].bestThumbnail.url,
                            "creatorName": resp.items[c].author.name,
                            "creatorUrl": resp.items[c].author.ref
                        }
                        final.push(newObj)
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
                })
            } else if (pathP[2] == "vimeo") {
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
                                    "creatorUrl": json.filtered.data[c].clip.user.link
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
            } else if (pathP[2] == "bitchute") {
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
                                    "creatorUrl": "https://www.bitchute.com" + json[c].channel_path
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
                })

            }
        }
    } else {

    }
}
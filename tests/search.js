console.log("");
console.log("test of videoshack's scrapers");
console.log("");

const ytsr = require("ytsr");
const got = require("got");
const redddit = require("redddit");
const sc = require("sc-searcher");
const scSearch = new sc();
const cheerio = require("cheerio");

// youtube search
ytsr("test").then(function(sr) {
    console.log("[+] youtube search successfully executed! (" + sr.items.length.toLocaleString() + " items found)")
}).catch(function(err) {
    console.log("[!] youtube search failed! (" + err.message + ")")
})

// vimeo search
got("https://vimeo.com/search?q=test", {
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
        console.log("[+] vimeo test successfully executed (" + json.filtered.data.length + " items found)");
    } catch (error) {
        console.log("[!] vimeo search failed (parsing error) (" + error.message + ")")
    }
}).catch(function(err) {
    console.log("[!] vimeo search failed (request error) (" + err.message + ")");
})

// dailymotion search
got("https://api.dailymotion.com/videos?fields=id,thumbnail_url%2Ctitle&search=test&limit=100").then(async function(resp) {
    try {
        var json = JSON.parse(resp.body).list;
        console.log("[+] dailymotion (official) search successfully executed (" + json.length + " items found)");
    } catch (error) {
        console.log("[!] dailymotion (official) search failed (parsing error) (" + error.message + ")")
    }
}).catch(function(err) {
    console.log("[!] dailymotion (official) search failed (request error) (" + err.message + ")")
})

// bitchute search
got("https://www.bitchute.com/search/?query=test&kind=video", {
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
        var b = "csrfmiddlewaretoken=" + csrf + "&query=test&kind=video&duration=&sort=page=0";
        var cookie = resp.headers["set-cookie"][0].split(";")[0] + "; " + resp.headers["set-cookie"][1].split(";")[0] + "; registration=on; preferences={%22theme%22:%22day%22%2C%22autoplay%22:true}";
        var c = (encodeURI(b).split(/%..|./).length - 1);
    } catch (error) {
        console.log("[!] bitchute search failed (parse #1 error) (" + error.message + ")");
        return;
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
        console.log("[+] bitchute search successfully executed (" + json.length + " items found)");
    }).catch(function(err) {
        console.log("[!] bitchute search failed (request #2 failed) (" + err.message + ")");
    })
}).catch(function(err) {
    console.log("[!] bitchute search failed (request #1 failed) (" + err.message + ")");
})

// bilibili search
got("https://search.bilibili.com/all?keyword=test&from_source=nav_search_new", {
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
    var l = $(".video-list li").length;
    console.log("[+] bilibili search successfully executed (" + l + " items found)");
}).catch(function(err) {
    console.log("[!] bilibili search failed (request error) (" + err.message + ")");
})

// qq.com search
got("https://v.qq.com/x/search/?q=test&stag=0&smartbox_ab=").then(function(resp) {
    var $ = cheerio.load(resp.body);
    var l = $(".search_container .wrapper .result_item_h").length;
    console.log("[+] v.qq.com search successfully executed (" + l + " items found)");
}).catch(function(err) {
    console.log("[!] v.qq.com search failed (request error) (" + err.message + ")");
})

// metacafe search
got("https://www.metacafe.com/videos_about/test/", {
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
    var $ = cheerio.load(resp.body);
    var l = $("#search_videos_videos_list_search_result .item").length;
    console.log("[+] metacafe search successfully executed (" + l + " items found)");
}).catch(function(err) {
    console.log("[!] metacafe search failed (request error) (" + err.message + ")");
})

// archive.org search
got("https://archive.org/details/movies?and%5B%5D=test&sin=&and%5B%5D=mediatype%3A%22movies%22", {
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
    var l = $(".results .item-ia").length;
    console.log("[+] archive.org search successfully executed (" + l + " items found)");
}).catch(function(err) {
    console.log("[!] archive.org search failed (request error) (" + err.message + ")");
})

// newgrounds search
got("https://www.newgrounds.com/search/conduct/movies?suitabilities=etm&terms=test", {
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
    var l = ($(".itemlist li").length - 1);
    console.log("[+] newgrounds search successfully executed (" + l + " items found)");
}).catch(function(err) {
    console.log("[!] newgrounds search failed (request error) (" + err.message + ")");
})

// rumble search
got("https://rumble.com/search/video?q=test", {
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
    var l = $(".video-listing-entry").length;
    console.log("[+] rumble search successfully executed (" + l + " items found)");
}).catch(function(err) {
    console.log("[!] rumble search failed (request error) (" + err.message + ")");
})

// reddit video search
redddit.search("site:v.redd.it test", function(err, resp) {
    if (err) {
        console.log("[!] reddit search failed (" + err + ")");
    } else {
        console.log("[+] reddit search successfully executed (" + resp.length + " items found)");
    }
})

// mega.nz search
redddit.search("site:mega.nz test", function(err, resp) {
    if (err) {
        console.log("[!] mega.nz search failed (" + err + ")");
    } else {
        console.log("[+] mega.nz search successfully executed (" + resp.length + " items found)");
    }
})

// drive.google.com search
redddit.search("site:drive.google.com test", function(err, resp) {
    if (err) {
        console.log("[!] google drive search failed (" + err + ")");
    } else {
        console.log("[+] google drive search successfully executed (" + resp.length + " items found)");
    }
})

scSearch.init("38kZjAWhqvwrcMFKFo3496SY4OsSovTU");
scSearch.getTracks("test", 100).then(function(resp) {
    console.log("[+] soundcloud search successfully executed (" + resp.length + " items found)");
}).catch(function(err) {
    console.log("[!] soundcloud search failed (" + err.message + ")");
})
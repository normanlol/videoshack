load();

function load() {
    var query = window.location.search.substring(3);
    document.getElementById("loader").style.display = "";
    document.getElementById("query").innerHTML = decodeURIComponent(query);
    localStorage.setItem("index", "0");
    document.getElementById("resultCount").innerHTML = "No videos found so far."
    runSearch();
}

function runSearch() {
    var scrapers = [
        {
            "apiName":"youtube",
            "safeName":"YouTube"
        },
        {
            "apiName":"vimeo",
            "safeName":"Vimeo"
        },
        {
            "apiName":"bitchute",
            "safeName":"BitChute"
        },
        {
            "apiName":"bilibili",
            "safeName":"BiliBili"
        },
        {
            "apiName":"metacafe",
            "safeName":"Metacafe"
        },
        {
            "apiName":"archiveorg",
            "safeName":"Archive.org"
        },
        {
            "apiName":"newgrounds",
            "safeName":"Newgrounds"
        },
        {
            "apiName":"rumble",
            "safeName":"Rumble"
        },
        {
            "apiName":"reddit",
            "safeName":"Reddit"
        },
        {
            "apiName":"meganz",
            "safeName":"mega.nz"
        },
        {
            "apiName":"gdrive",
            "safeName":"Google Drive"
        },
        {
            "apiName":"soundcloud",
            "safeName":"Soundcloud"
        }
    ]
    var index = parseInt(localStorage.getItem("index"));
    var query = window.location.search.substring(3);
    if (scrapers[index] == undefined) {
        document.getElementById("s").innerHTML = "finished searching!"
        document.getElementById("resultCount").innerHTML = document.querySelectorAll("#resultsContainer a").length.toLocaleString() + " videos found.";
        return;
    }
    document.getElementById("scraper").innerHTML = scrapers[index].safeName;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/search/" + scrapers[index].apiName + "?q=" + decodeURIComponent(query));
    xhr.send();
    xhr.onload = function () {
        var json = JSON.parse(xhr.responseText);
        for (var c in json.results) {
            var a = document.createElement("A");
            a.href = json.results[c].url;
            var div = document.createElement("DIV");
            div.classList.add("result")
            if (json.results[c].thumbnail) {
                var img = document.createElement("IMG");
                img.src = "/proxy/" + btoa(json.results[c].thumbnail);
                img.onerror = function () {
                    this.src = "/noThumb.jpg";
                }
                div.appendChild(img);
            } else {
                var img = document.createElement("IMG");
                img.src = "/noThumb.jpg";
                div.appendChild(img);
            }
            var d = document.createElement("DIV");
            var t = document.createElement("H2");
            t.innerHTML = json.results[c].title;
            d.appendChild(t);
            if (json.results[c].creatorUrl && json.results[c].creatorUrl !== null) {
                var authLink = document.createElement("A");
                authLink.href = json.results[c].creatorUrl;
                authLink.classList.add("hoverLink")
                var auth = document.createElement("H3");
                auth.innerHTML = "by " + json.results[c].creatorName + " from " + scrapers[index].safeName;
                authLink.appendChild(auth);
                d.appendChild(authLink);
            } else {
                var auth = document.createElement("H3");
                auth.innerHTML = "by " + json.results[c].creatorName + " from " + scrapers[index].safeName;
                d.appendChild(auth);
            }
            div.appendChild(d);
            a.appendChild(div);
            document.getElementById("resultsContainer").appendChild(a);
        }
        document.getElementById("resultCount").innerHTML = document.querySelectorAll("#resultsContainer a").length.toLocaleString() + " videos found so far...";
        var nIndex = index + 1;
        localStorage.setItem("index", nIndex.toString());
        runSearch();
    }
}
if (document.getElementById("q")) {
    document.getElementById("q").addEventListener('keydown', function (event) {
        if (event.defaultPrevented) {return;}
        var key = event.key || event.keyCode;
        if (key == "Enter" | key == 13) {
            search();
        }
    })
}

function search() {
    if (window.location.search.split("&")[1] !== undefined) {
        window.open("/search?q=" + encodeURIComponent(document.getElementById("q").value) + "&" + window.location.search.split("&").slice(1).join("&"), "_self");
    } else {
        window.open("/search?q=" + encodeURIComponent(document.getElementById("q").value), "_self");
    }
}
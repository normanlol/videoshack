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
    window.open("/search?q=" + encodeURIComponent(document.getElementById("q").value), "_self")
}
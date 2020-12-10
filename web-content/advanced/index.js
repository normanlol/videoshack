if (document.getElementById("q")) {
    document.getElementById("q").addEventListener('keydown', function (event) {
        if (event.defaultPrevented) {return;}
        var key = event.key || event.keyCode;
        if (key == "Enter" | key == 13) {
            window.open("/search" + formatUrl(), "_self");
        }
    })
}

function toggleDisplay(id) {
    if (document.getElementById(id).classList.contains("closed")) {
        document.getElementById(id).classList.add("open");
        document.getElementById(id).classList.remove("closed");
        setTimeout(function() {
            document.getElementById(id).style = "max-height:" + document.getElementById(id).clientHeight + "px;"
        }, 700)
    } else {
        document.getElementById(id).classList.remove("open");
        document.getElementById(id).classList.add("closed");
    }
}

function updateVal(id) {
    if (document.getElementById(id).value == "true") {
        document.getElementById(id).value = "false";
    } else {
        document.getElementById(id).value = "true";
    }
}

function formatUrl() {
    var l = "";
    if (document.getElementById("q").value) {
        var l = l + "?q=" + document.getElementById("q").value;
    } else {
        var l = l + "?q=";
    }
    var a = "";
    for (var c in document.querySelectorAll("#sites button")) {
        if (document.querySelectorAll("#sites button")[c].value == "false") {
            if (a == "") {
                a = document.querySelectorAll("#sites button")[c].id
            } else {
                a = a + "," + document.querySelectorAll("#sites button")[c].id
            }
        }
    }
    if (a !== "") { var l = l + "&ignore=" + a }
    return l;
}
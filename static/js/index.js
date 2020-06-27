$( document ).ready(function() {
    window.onscroll = function() {
        // show shadow when scrolled
        var doc = document.documentElement;
        var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        if(top >= 10) {
            $(".navbar").css("box-shadow", "2px 4px 10px 2px rgba(0, 0, 0, 0.1)");
        }
        else {
            $(".navbar").css("box-shadow", "none");
        }
    }
})
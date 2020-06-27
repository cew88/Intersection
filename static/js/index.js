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

$(".comment").click(e => {
    title = $(e.currentTarget).data("val")
	  author = $(e.currentTarget).data("author")
    console.log(title);
    com = $("#comtext-"+title).val();
    
    // Empty textbox
    $("#comtext-"+title).val("");
    console.log(com);
    
    //Do not post comment if comment box is empty
    if (com != ""){
      $.ajax({
        url: '/comment',
        type: "POST",
        data: JSON.stringify({ author: author, title: title, comment: com }),
        contentType: "application/json; charset=UTF-8",
        success: function(response) {
            $("#combox-"+title).append(`<div><b> ${response.user} </b> ${response.comment}</div>`)
        },
        error: function(error) {
            console.log(error);
        }
    });
  }
});
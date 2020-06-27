var story_tags = [];
var personal_tags = [];

//Handle modal for story composition
var storyModal = document.getElementById("story-modal");
document.getElementById("open-compose-story").onclick = function(){
  storyModal.style.display = "block";
}

document.getElementsByClassName("close")[0].onclick = function(){
  storyModal.style.display = "none";
}

window.onclick = function(event){
  if (event.target == storyModal){
    storyModal.style.display = "none";
  }
}

document.getElementById("submit-story").onclick = function(){
  storyModal.style.display = "none";
  
  var post_card = document.createElement('div');
  post_card.setAttribute("class", "card");

  var post_content = document.createElement("div");
  post_content.setAttribute("class", "container");
  post_content.style.textOverflow ="ellipsis";

  var tags = document.createElement('div');

  console.log(story_tags);
  for (var i = 0; i < story_tags.length; i++){
    var tag_to_add = document.createElement('span');
    tag_to_add.setAttribute("class", "badge badge-info");
    tag_to_add.textContent = (story_tags[i]);
    tags.appendChild(tag_to_add);
    tags.appendChild(document.createTextNode(' '));
  }

  post_content.appendChild(tags);

  var title = document.createElement('p');
  var title_text = document.createTextNode(document.getElementById("story-title").value);
  title.style.textAlign = "center";
  title.appendChild(title_text);
  title.style.fontWeight = "700";
  
  var content = document.createElement('p');
  var content_text = document.createTextNode(document.getElementById("story").value);
  content.appendChild(content_text);
  content.style.textAlign = "center";

  post_content.appendChild(title);
  post_content.appendChild(content);

  post_card.appendChild(post_content);

  document.getElementById("posts").appendChild(post_card);

  // Backend stuff
  $.ajax({
        url: '/newstory',
        type: "POST",
        data: JSON.stringify({ title: title_text, content: content_text, tags:story_tags}),
        contentType: "application/json; charset=UTF-8",
        success: function(response) {
            console.log( response );
        },
        error: function(error) {
            console.log(error);
        }
    });
}


//Handle profile tags
function profile_tags(personal_tags){
  var yourTags = document.getElementById("tags");
  yourTags.innerHTML = '';
  for (tag_index = 0; tag_index < personal_tags.length; tag_index++){
    var tag_to_add = document.createElement('span');
    tag_to_add.setAttribute("class", "badge badge-info");
    tag_to_add.textContent = (personal_tags[tag_index]).substring(2);

    yourTags.appendChild(tag_to_add);
    yourTags.appendChild(document.createTextNode(' '));
  }
}

//Handle modal for updating tags
var tagModal = document.getElementById('tag-modal');

document.getElementById("update-tags").onclick = function(){
  tagModal.style.display="block";
}

document.getElementsByClassName("close")[1].onclick = function(){
  tagModal.style.display = "none";
}

window.onclick = function(event){
  if (event.target == tagModal){
    tagModal.style.display = "none";
  }
}

document.getElementById("submit-tags").onclick = function(){
  tagModal.style.display="none";
  profile_tags(personal_tags);
}

//Deal with drag and drop
function dragStart(event) {
  event.dataTransfer.setData("Text", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  var data = event.dataTransfer.getData("Text");
  event.target.appendChild(document.getElementById(data));
  event.target.appendChild(document.createTextNode('    '));


  if (data.includes("t- ")){
    if (personal_tags.includes(data)){
      personal_tags.splice(personal_tags.indexOf(data));
    }
    else {
      personal_tags.push(data);
    } 
  }
  
  else {
    if (story_tags.includes(data)){
      story_tags.splice(story_tags.indexOf(data));
    }
  else {
      story_tags.push(data);
    }
  }
  
}

//For editing bio

$("[contenteditable]").blur(function(){
    var $element = $(this);
    if ($element.html().length && !$element.text().trim().length) {
        $element.empty();
    }
});

var showMakeChangesButton = false;
var bio = "";

$("#bio").focusin(() => {
    $("#bio").addClass("form-control");
})
$("#bio").focusout(() => {
    $("#bio").removeClass("form-control");
})

document.getElementById("bio").addEventListener("input", function() {
    bio = $("#bio").text();
    if (!showMakeChangesButton) {
        $("#change-bio").removeClass("hide");
        showMakeChangesButton = true;
    }
}, false);
document.getElementById("change-bio").onclick = function(){
    $.ajax({
        url: '/changebio',
        type: "POST",
        data: JSON.stringify({ bio: $("#bio").text().trim()}),
        contentType: "application/json; charset=UTF-8",
        success: function(response) {
            console.log( response );
            $("#change-bio").addClass("hide");
            $("#bio").removeClass("form-control");
            showMakeChangesButton = false;
        },
        error: function(error) {
            console.log(error);
        }
    });
}

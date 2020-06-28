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

  var tags = document.createElement('div');

  console.log(story_tags);
  for (var i = 0; i < story_tags.length; i++){
    var tag_to_add = document.createElement('span');
    tag_to_add.setAttribute("class", "badge badge-info");
    tag_to_add.textContent = (story_tags[i]);
    tags.appendChild(tag_to_add);
    tags.appendChild(document.createTextNode(' '));
  }

  // Backend stuff
  $.ajax({
        url: '/newstory',
        type: "POST",
        data: JSON.stringify({ title: document.getElementById("story-title").value, content: document.getElementById("story").value, tags:story_tags}),
        contentType: "application/json; charset=UTF-8",
        success: function(response) {
            $("#posts").append(response);
        },
        error: function(error) {
            console.log(error);
        }
    });

  //Reset form values after submitting
  document.getElementById("story-title").value = '';
  document.getElementById("story").value = '';
  document.getElementById("story-box1").innerHTML = box1;
  document.getElementById("story-box2").innerHTML = box2;
  document.getElementById("other-story-tag").value = '';
}

//Save the original state of tag boxes when the page was loaded
var box1, box2;
window.onload = function(){
  box1 = document.getElementById("story-box1").innerHTML;
  box2 = document.getElementById("story-box2").innerHTML;
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
  $.ajax({
        url: '/changetags',
        type: "POST",
        data: JSON.stringify({ tags: personal_tags}),
        contentType: "application/json; charset=UTF-8",
        success: function(response) {
            profile_tags(personal_tags);
        },
        error: function(error) {
            console.log(error);
        }
    });
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

$(".deletepost").click(e => {
    title = $(e.currentTarget).data("val");
    $.ajax({
        url: '/deletestory',
        type: "POST",
        data: JSON.stringify({ title: title }),
        contentType: "application/json; charset=UTF-8",
        success: function(response) {
            $(e.currentTarget).parent().parent().remove();
        },
        error: function(error) {
            console.log(error);
        }
    });
});

document.getElementById("add-new-story-tag").onclick = function(){
  console.log(document.getElementById("other-story-tag").value);
  new_tag = document.createElement('p');
  new_tag.setAttribute("ondragstart", "dragStart(event)");
  new_tag.setAttribute("draggable", "true");
  new_tag.setAttribute("id", document.getElementById("other-story-tag").value);
  new_tag.setAttribute("class", "tags");
  new_tag.appendChild(document.createTextNode(document.getElementById("other-story-tag").value)
  );
  document.getElementById("story-box2").appendChild(new_tag);
  document.getElementById("story-box2").appendChild(document.createTextNode(" "));
}

document.getElementById("add-new-page-tag").onclick = function(){
  console.log(document.getElementById("other-page-tag").value);
  new_tag = document.createElement('p');
  new_tag.setAttribute("ondragstart", "dragStart(event)");
  new_tag.setAttribute("draggable", "true");
  new_tag.setAttribute("id", "t- " + document.getElementById("other-page-tag").value);
  new_tag.setAttribute("class", "tags");
  new_tag.appendChild(document.createTextNode(document.getElementById("other-page-tag").value)
  );

  document.getElementById("tag-box2").appendChild(new_tag);
  document.getElementById("tag-box2").appendChild(document.createTextNode(" "));
}
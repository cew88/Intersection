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
/*
document.getElementById("submit-story").onclick = function(){
  cument.getElementById("posts").appendChild();
}
*/

//Handle profile tags
function profile_tags(personal_tags){
  var yourTags = document.getElementById("tags");
  for (tag_index = 0; tag_index < personal_tags.length; tag_index++){
    tag_to_add = document.createElement('span');
    tag_to_add.setAttribute("class", "badge badge-info");
    tag_to_add.textContent = personal_tags[tag_index];

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

  if (data.includes("t-")){
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


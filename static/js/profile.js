var list_of_tags = [];
var x = ["LGBTQ+", "asian-american"];


var yourTags = document.getElementById("your-tags");
for (tag_index = 0; tag_index < x.length; tag_index++){
  yourTags.appendChild(document.getElementById(x[tag_index]));
  yourTags.appendChild(document.createTextNode(' '));
}




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

  if (list_of_tags.includes(data)){
    list_of_tags.splice(list_of_tags.indexOf(data));
  }
  else {
    list_of_tags.push(data);
  }

  console.log(list_of_tags);
}


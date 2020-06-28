var user_tags = ["abc", "def", "ghi", "jkl"];

var friendGrid = document.getElementById("hello");


for (tag_index = 0; tag_index < user_tags.length; tag_index++){
  var tag = document.createElement('span');
  tag.setAttribute("class", "badge badge-info");
  tag.textContent = (user_tags[tag_index]);
  console.log(tag_index);
  friendGrid.appendChild(tag);
}

var bioCard = document.createElement("div");

//Add filtration



//Generate suggested responses
var list_of_responses = ["I'm so sorry.", 
  "I'm here for you.",
  "This must be so hard for you.",
  "I can't begin to imagine what you're going through.",
  "Is there anything I can do to help?",
  "Do you want to talk about it?",
  "What do you need right now?",
  "I'm happy to listen any time.",
  "I wish there was something I could do.",
  "It makes me really sad to hear this happened.",
  "Thank you for sharing.",
  "This must be hard to talk about.",
  "Thank you for opening up.",
  "I'm in your corner.",
  "I'm proud of you.",
  "You're so brave."];

window.addEventListener('load', function(){ 
  var suggestedComments = document.getElementsByClassName("suggested-comments-div");

  for (post_index = 0; post_index < suggestedComments.length; post_index++){
    var random_responses = [];
    rr_index = 0;

    while (random_responses.length < 3){
      random_num = Math.floor(Math.random() * list_of_responses.length);
      if (random_responses.includes(list_of_responses[random_num]) != true){
        random_responses.push(list_of_responses[random_num]);
        rr_index++;
      }
    }

    for (com_index = 0; com_index < random_responses.length; com_index++){
      comment_text = document.createTextNode(random_responses[com_index]);
      comment_div = document.createElement('div');
      comment_div.setAttribute('class', 'suggested-comment');
      comment_div.appendChild(comment_text);
      
      suggestedComments[post_index].appendChild(comment_div);
    } 
  }
});

var list_of_responses = ["I'm so sorry.", 
  "I'm here for you.",
  "This must be so hard for you.",
  "I can't begin to imagine what you're going through.",
  "Is there anything I can do to help?",
  "Do you want to talk about it?",
  "What do you need right now?",
  "I'm happy to listen any time.",
  "I don't know what to say.",
  "I wish there was something I could do.",
  "It makes me really sad to hear this happen.",
  "Thank you for sharing.",
  "This must be hard to talk about. Thanks for opening up to me.",
  "I'm in your corner.",
  "I'm proud of you."];

var random_responses = [];
i = 0;

while (random_responses.length < 3){
  random_num = Math.floor(Math.random() * list_of_responses.length);
  if (random_responses.includes(list_of_responses[i]) != true){
    console.log("here");
  }
  i++;

  //console.log(list_of_responses[Math.floor(Math.random() * list_of_responses.length));
  
}

console.log(random_responses);
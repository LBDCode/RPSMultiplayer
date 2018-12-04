

//database config
var config = {
  apiKey: "AIzaSyDXOubfrj7FhhrDLPKxk-3Fc9Yur_0Te_Y",
  authDomain: "testproj-eaee1.firebaseapp.com",
  databaseURL: "https://testproj-eaee1.firebaseio.com",
  projectId: "testproj-eaee1",
  storageBucket: "testproj-eaee1.appspot.com",
  messagingSenderId: "25896937240"
  };

firebase.initializeApp(config);

var database = firebase.database();

var player1Wins = 0;
var player2Wins = 0;
var player1Losses = 0;
var player2Losses = 0;
var ties = 0;
var name;

var gameState = $("#gamestate").val().trim();

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
var player1Ref = database.ref("/players/player1");
var player2Ref = database.ref("players/player2");

var 


//check for players
function checkPlayers() {
  var numPlayers;
  connectedRef.on("value", function(snap) {
    if (snap.val()) {
      var con = connectionsRef.push(true);
      con.onDisconnect().remove();
    }
  });

  connectionsRef.on("value", function(snap) {
    numPlayers = snap.numChildren();

    if (numPlayers === 2) {
      $("#gamestate").text("active");
      $("#num-players").text("Ready to play.");
    } else if (numPlayers === 1) {
      $("#num-players").text("Waiting for second player");
    } else if (numPlayers > 2) {
      $("#num-players").text("Only two people will be able to play.");
    } 
    $("#playerMsg").text("Number of connections: " + numPlayers);
  });
};

 
 
$("#nameSbmt").on("click", function() {
  event.preventDefault();
  name = $("#playerName").val();
  var playerNum;
  var snapP1;
  var snapP2;
  
  $("#nameForm").addClass("hidden");
 
  player1Ref.once("value", function(snapshot) {
    snapP1 = snapshot;
  }, function(errorObject) {
      console.log("Err: " + errorObject.code);
  });

  player2Ref.once("value", function(snapshot) {
      snapP2 = snapshot;
  }, function(errorObject) {
      console.log("Err: " + errorObject.code);
  });

  if (!snapP1.exists()) {
    player1Ref.onDisconnect().remove();
    playerNum = 1;

    player1Ref.set({
        name: name,
        curRPS: null,
        wins: "0",
        losses: "0",
        ties: "0"
    });

    updateUI(name, playerNum);

// if no player 2
  } else if (!snapP2.exists()) {
      player2Ref.onDisconnect().remove();
      playerNum = 2;
    
      player2Ref.set({
          name: name,
          curRPS: null,
          wins: "0",
          losses: "0",
          ties: "0"
      });

    updateUI(name, playerNum);
  } 
});


//chat stuff goes here



//
$(".rpsSelect").on("click", function() {
  $(this).addClass("selected");
  
  var selection = $(this).attr("id");
  var playerSlct = selection.slice(-2);
  var rpsStr = selection.slice(0, (selection.length - 2));
  
  if (playerSlct === "P1") {
    player1Ref.update({
      curRPS: rpsStr,
    });
  } else if (playerSlct === "P2") {
    player2Ref.update({
      curRPS: rpsStr,
    });
  };

});

//listen for changes to players, frun checkRPS if both players have a selection
database.ref("/players").on("value", function(snapshot) {
  var player1 = snapshot.val().player1;
  var player2 = snapshot.val().player2;

  console.log(player1.curRPS, player2.curRPS);

  if (player1.curRPS && player2.curRPS) {
    checkRPS(player1.curRPS, player2.curRPS);
  } 

});

function updateUI(pName, pNum) {
  var playDiv = $(".play" + pNum + "RPS");
  var scoreDiv = $("#player" + pNum + "Score");
  $("#num-players").text("Hi " + pName + ". You're player " + pNum + " .");
  $(".chatArea ").removeClass("hidden");
  playDiv.removeClass("hidden");
  scoreDiv.removeClass("hidden");
  
};

//RPS logic
function checkRPS(player1Choice, player2Choice) {
  $(".rpsSelect").removeClass("selected");
  
  if((player1Choice === "rock" && player2Choice === "scissors") || (player1Choice === "paper" && player2Choice === "rock") || (player1Choice == "scissors" && player2Choice === "paper")) {
    //player1 wins
    player1Wins++;
    player2Losses++;
    console.log("Player 1 wins")
  } else if ((player1Choice === player2Choice)) {
    //tie
    ties++;
    console.log("Tie")
  } else {
    //player2 wins
    player1Losses++;
    player2Wins++;
    console.log("Player 2 wins")
  }
  //reset RPS choice vars
  player1Ref.update({
    curRPS: null,
    wins: player1Wins,
    losses: player1Losses,
    ties: ties
  });
  player2Ref.update({
    curRPS: null,
    wins: player2Wins,
    losses: player2Losses,
    ties: ties
  });

  updateScore();
};


function updateScore() {

  database.ref("/players").on("value", function(snapshot) {
    var player1 = snapshot.val().player1;
    var player2 = snapshot.val().player2;
  
    $("#player1Score").text("Wins: " + player1.wins + " Losses: " + player1.losses + "  Ties: " + player1.ties);
    $("#player2Score").text("Wins: " + player2.wins + " Losses: " + player2.losses + "  Ties: " + player2.ties);
  
  });
};


checkPlayers();



var lobbyCtrl = function($scope, $window, $http) {

  var updateUserList = function(rankedUsers, onlineUsers) {
    $scope.rankedUsers = rankedUsers;
    $scope.onlineUsers = onlineUsers;
    $scope.$apply();
  }

  $scope.init = function(username) {
    var opponent = {};

    $scope.friendRequests = [];
    $scope.username = username;
    $scope.match = "";

    socket.emit("set online", username);
    socket.emit("show users");
  }

  socket.on("show users", function(rankedUsers, onlineUsers) {
    updateUserList(rankedUsers, onlineUsers);
  })

  socket.on('private match', function(data) {

    if (typeof data.pairingKey !== 'undefined') {
      $scope.match = data.pairingKey;
      $scope.$apply();
    }

    alert(data.message);

  })

  socket.on('friend request', function(user) {
    $scope.friendRequests.push(user);
    $scope.$apply()
  });

  $scope.subscribeToLobby = function() {
    socket.emit("subscribe", $scope.username);
  }

  $scope.triggerPlay = function() {
    socket.emit("play", {
      pairingKey: $scope.match,
      message: "Move played by: " + $scope.username
    });
  }

  $scope.connectToFriend = function($event, friend) {
    angular.element($event.currentTarget).parent().html(friend.username)
    socket.emit("connect to friend", $scope.username, friend);
  }

  $scope.acceptFriend = function(friend) {
    if (confirm("Play " + friend.username + "?")) {
      socket.emit("accept friend request", friend, $scope.username);
    }
  }

  /*$scope.connectToFriend = function(pairingKey) {
    var postData = {
      'pairingKey': pairingKey
    };

    $http({
      method: 'POST',
      url: '/api/connectToFriend',
      //headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: "test=123"
    }).then(
      function successfulCallback(data) {
        alert(data);
      },
      function failureCallback(data) {
        alert("failed");
      }
    );
  }*/
}

app.controller('lobbyCtrl', ['$scope', '$window', '$http', lobbyCtrl]);

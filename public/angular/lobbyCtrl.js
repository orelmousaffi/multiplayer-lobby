
var lobbyCtrl = function($scope, $window) {

  var updateUserList = function(users) {
    $scope.users = users;
    $scope.$apply();
  }

  var opponent = {};
  $scope.match = "";

  socket.emit("show users");
  socket.on("show users", function(users) {
    updateUserList(users);
  })

  socket.on('private match', function(data) {

    if (typeof data.pairingKey !== 'undefined') {
      $scope.match = data.pairingKey;
      $scope.$apply();
    }

    alert(data.message);

  })

  $scope.subscribeToLobby = function() {
    socket.emit("subscribe", $scope.username);
  }

  $scope.triggerPlay = function() {
    socket.emit("play", {
      pairingKey: $scope.match,
      message: "Move played by: " + $scope.username
    });
  }
}

app.controller('lobbyCtrl', ['$scope', '$window', lobbyCtrl]);

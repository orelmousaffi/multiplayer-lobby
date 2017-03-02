var chatCtrl = function($scope) {

  socket.on("chat", function(msg) {
    $scope.messages.push(msg);
    $scope.$apply();
  });

  $scope.messages = [];

  $scope.sendMsg = function() {
    socket.emit("chat", $scope.message);
    $scope.message = "";
  }
};

app.controller('chatCtrl', chatCtrl);

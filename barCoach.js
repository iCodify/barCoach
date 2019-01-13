var ref = "";
var cocktRef = "";
var storageRef = "";
var listHolder = "";
var uID = "";


function startApp(uid, email, displayName) {
  initialization(uid);

  writeUser(email, displayName);
  
  cocktRef.orderByChild('timestamp').startAt(Date.now()).on('child_added', readData);
  cocktRef.on('child_removed', readData);
  cocktRef.on('child_changed', readData);
  readData();
}

function initialization(uid) {
  uID = uid;
  ref = firebase.database();
  cocktRef = ref.ref('cocktails/');
  storageRef = firebase.storage().ref();
}

function writeUser(email, displayName) {
  ref.ref('log/').push({
    name: displayName,
    email: email,
    uid: uID,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
}

function readData() {
  document.getElementById('list').innerHTML = "Loading...";
  cocktRef.orderByChild('name').once('value').then(function(snapshot) {
    return snapshot;
  }).then(function (snapshot) {
    listHolder = "";
    document.getElementById('list').innerHTML = listHolder;
    listHolder+= "<ul id='ulList' hidden='true'>";
    snapshot.forEach(function(snapshotItem) {
      listMaker(snapshotItem);
    });
    listHolder+="</ul>";
    document.getElementById("list").innerHTML = listHolder;

    ref.ref('privilege/').child(uID).once('value').then(function(snapshot) {
      document.getElementById('ulList').hidden = false;

      if(snapshot.val()==="admin") {
        fullView();
        document.getElementById("add").hidden = false;
        let showIcons = Array.from(document.getElementsByClassName("icon-holder"));
        showIcons.forEach(function(snapshotItem) {
          snapshotItem.hidden = false;
          snapshotItem.style.display = "inline-block";
        });
        let itemOfList =  Array.from(document.getElementsByClassName("material-icons"));
        itemOfList.forEach(function(snapshotItem) {
          snapshotItem.addEventListener('click', function(){
            addListenerLogic(this.parentElement.parentElement, this.parentElement.parentElement.getAttribute("key"), this.innerHTML);
          });
        });
      }
      else if(snapshot.val()==="manager") {
        fullView();
        document.getElementById("add").hidden = false;
        document.getElementById("add-i").addEventListener('click', function(){
          addListenerLogic(this.parentElement.parentElement, this.parentElement.parentElement.getAttribute("key"), this.innerHTML);
        });
      }
      else if(snapshot.val()==="user") {
        fullView();
      }
    }).catch(function(error) {
      console.log(error.message);
    });
  }).catch(function(error) {
    console.log(error.message);
    if(error.message.split(" ")[0] === "permission_denied") {
      document.getElementById('list').innerHTML = "Successfully loged in, waiting for approval.";
    }
  });
}

function listMaker(snapshotItem) {
  listHolder += '<li key="'+snapshotItem.key+'"><img height="100" width="100"src="'+snapshotItem.val().picture+'"/><h3>'+snapshotItem.val().name+'</h3><div class="icon-holder" hidden="true"><i class="material-icons">delete</i><i class="material-icons">edit</i></div></li>'
}

function addListenerLogic(listItem, key, action) {
  if(action==="delete"){
    if(confirm("Are you sure you want to delete this?")){
      cocktRef.child(key).remove();
    }
  }
  else if(action==="edit"){
    window.open('editData.html?'+key);
  }
  else if(action.slice(0, 3)==="add"){
    window.open('addData.html?'+uID);
  }
  else if(action==="view") {
    window.open('viewData.html?'+key);
  }
}

function fullView () {
  document.querySelectorAll('li').forEach(function(node) {
    node.addEventListener('click', function(e) {
      if (e.target !== this)
        return;

      addListenerLogic(this, this.getAttribute("key"), "view");
    });
  });


  document.querySelectorAll('img, h3').forEach(function(node) {
    node.addEventListener('click', function(){
      addListenerLogic(this.parentElement, this.parentElement.getAttribute("key"), "view");
    });
  });
}
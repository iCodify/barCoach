var ref = firebase.database();
var key = window.location.search.slice(1);
var dataRef = ref.ref('cocktails/'+key);
var curID = "";
var listHolder = "";
var nameFirst = "";
dataRef.on('child_removed', readData);
dataRef.on('child_changed', readData);

readData();

function readData() {
  dataRef.once('value').then(function(snapshot) {
    return Object.entries(snapshot.val());
  }).then(function(snapshot){
    listHolder = "";
    document.getElementById("list").innerHTML = listHolder;
    listHolder+= "<ul>";
    iterateObjects(snapshot);
  }).catch(function(error) {
    console.error(error);
  });

}

function listMaker(snapshotItem) {
  listHolder += '<li ref="'+curID+'"><span class="titles">'+snapshotItem[0]+':</span> <span class="view">'+snapshotItem[1]+'</span></li>';
}

function iterateObjects (snapshot) {
    snapshot.forEach(function (snapshotItem) {
      if(typeof snapshotItem[1] === "object") {
        listHolder += '<li>'+snapshotItem[0]+'</li><ul id="'+snapshotItem[0]+'">';
        curID += '/'+snapshotItem[0];
        iterateObjects(Object.entries(snapshotItem[1]));
      }
      else if(snapshotItem[0] === "timestamp" || snapshotItem[0] === "picture"){
      }
      else if(snapshotItem[0] === "name"){
        nameFirst = '<li ref="'+curID+'"><span class="titles">'+snapshotItem[0]+':</span><span class="view">'+snapshotItem[1]+'</span></li>';
      }
      else {
        listMaker(snapshotItem);
      }
    });
    listHolder+="</ul>";

    if(nameFirst){
      listHolder = "<ul>"+nameFirst+listHolder.slice(4);
      nameFirst = "";
    }

    curID = "";
    document.getElementById("list").innerHTML = listHolder;
}
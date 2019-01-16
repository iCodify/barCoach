var ref = firebase.database();
var key = window.location.search.slice(1);
var dataRef = ref.ref('cocktails/'+key);
var curID = "";
var listHolder = "";
var nameFirst = "";
var addIngredientButton =  '<div class="button-holder" id="addIngredientHolder"><button id="addIngredient" onclick="addIngredientListElement(this)" class="button-height">Add ingrediant</button></div>';
var addButtonClicked = false;
var availableInputField = false;

dataRef.on('child_removed', readData);
dataRef.on('child_changed', readData);

readData();

document.getElementById("save").addEventListener("click", saveButtonEvent);

function readData() {
  dataRef.once('value').then(function(snapshot) {
    return Object.entries(snapshot.val());
  }).then(function(snapshot){
    listHolder = "";
    document.getElementById("list").innerHTML = listHolder;
    listHolder+= "<ul>";
    iterateObjects(snapshot);

    document.getElementById("save").hidden = false;
    if (addButtonClicked) {
      document.getElementById("ingredients").innerHTML += '<li ref="/ingredients"><span class="titles"><input placeholder="name" class="long"></span><input placeholder="ml"></li>';
      addButtonClicked = false;
    }
    addListenerOnIngredientItems();
  }).catch(function(error) {
    console.error(error);
  });

}

function listMaker(snapshotItem) {
  listHolder += '<li ref="'+curID+'"><span class="titles">'+snapshotItem[0]+':</span> <input value="'+snapshotItem[1]+'"></li>';
}

function iterateObjects (snapshot) {
    snapshot.forEach(function (snapshotItem) {
      if(typeof snapshotItem[1] === "object") {
        listHolder += '<li>'+snapshotItem[0]+'</li><ul id="'+snapshotItem[0]+'">';
        curID += '/'+snapshotItem[0];
        iterateObjects(Object.entries(snapshotItem[1]));
        if(snapshotItem[0] === "ingredients") {
          listHolder += addIngredientButton;
        }
      }
      else if(snapshotItem[0] === "timestamp" || snapshotItem[0] === "picture"){
        //console.log(snapshotItem[1]);
      }
      else if(snapshotItem[0] === "name"){
        nameFirst = '<li ref="'+curID+'"><span class="titles">'+snapshotItem[0]+':</span><input value="'+snapshotItem[1]+'"></li>';
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

function addIngredientListElement() {
  addButtonClicked = true;
  saveButtonEvent();
  if(!availableInputField){
    document.getElementById("ingredients").innerHTML += '<li ref="/ingredients"><span class="titles"><input placeholder="name" class="long"></span><input placeholder="ml"></li>';
  }
  addListenerOnIngredientItems();
}

function verifyInputField (node, location, inputType) {
  let value = node.value;
  let regData = /[^a-zA-Z0-9- ,.]/g;
  let regNumber = /^\d{1,3}(\.\d{1,2})?$/g;

  console.log(value.match(regData));
  if(value === "" || value === 0 || value.match(regData)) {
    changeInputBackground(node, "red");
    return false;
  }
  else if (location === "/ingredients" && inputType === "number" && !value.match(regNumber)) {
    changeInputBackground(node, "red");
    return false;
  }
  else if (location === "/ingredients" && inputType === "string" && value.length<3) {
    console.log("Short name");
    changeInputBackground(node, "red");
    return false;
  }
  else {
    changeInputBackground(node, "white");
    return true;
  }
}

function changeInputBackground(node, color) {
  node.style.background=color;
}

function setDataToDatabase(location, keyElem, value) {
  ref.ref('cocktails/'+key+location+'/'+keyElem.toLowerCase()).set(value.toUpperCase());
}

function saveButtonEvent () {
  let listLines = document.querySelectorAll('div#list li[ref]');
  listLines.forEach(function(node) {
    let keyElem, value;
    let inputFields = node.querySelectorAll("input");
    let location = node.getAttribute("ref");

    if(inputFields.length === 1) {
      keyElem = node.querySelector("span").innerHTML.slice(0, -1);
      value = inputFields[0].value;
      if(verifyInputField(inputFields[0], location, "number")) {
        setDataToDatabase(location, keyElem, value);
      }
    }
    else if(inputFields.length === 2) {
      availableInputField = true;
      keyElem = inputFields[0].value;
      value = inputFields[1].value;
      if(verifyInputField(inputFields[0], location, "string") && verifyInputField(inputFields[1], location, "number")) {
        availableInputField = false;
        setDataToDatabase(location, keyElem, value);
      }
    }
  });
}

function addListenerOnIngredientItems() {
  document.querySelectorAll('li[ref="/ingredients"]').forEach(function(node) {
    let inputFields = node.querySelectorAll("input");
    if(inputFields.length === 1) {
      node.addEventListener('long-press', function(e) {
        ingredientItemEvent(this);
      });
    }
  });
}

function ingredientItemEvent(listItem) {
  let keyElem = listItem.querySelector("span").innerHTML.slice(0, -1);
  if(confirm('Are you sure you want to delete '+keyElem.toUpperCase()+'?')){
    ref.ref('cocktails/'+key+'/ingredients').child(keyElem).remove();
  }
}
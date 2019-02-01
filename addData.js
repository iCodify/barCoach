var ref = firebase.database();
var dataRef = ref.ref('templates/addCocktail');
var curID = "";
var listHolder = "";
var nameFirst = "";
var addIngredientButton =  '<div class="button-holder" id="addIngredientHolder"><button id="addIngredient" onclick="addIngredientListElement(this)" class="button-height">Add ingrediant</button></div>';
var addButtonClicked = false;

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
  }).catch(function(error) {
    console.log(error);
    console.error(error);
  });

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

function saveButtonEvent () {
  if(verifyData()) {
    console.log("Save");
    let x = Math.floor((Math.random() * 5) + 1);
    let newKey  = ref.ref('cocktails/').push().key;
    let cocktailData = {picture: 'https://firebasestorage.googleapis.com/v0/b/barcoach-28f49.appspot.com/o/cocktails%2Fplaceholders%2Fcocktails_icons_'+x+'.png?alt=media&token=f948ebe7-7655-4b64-b7f0-68359a1abb78', timestamp: firebase.database.ServerValue.TIMESTAMP};
    let ingredientsData = {};
    document.querySelectorAll('li[ref]').forEach(function(node) {
      let inputFields = node.querySelectorAll("input");
      if(inputFields.length === 1) {
        let key = node.querySelector("span").innerHTML.slice(0, -1);
        let attribute = inputFields[0].value.toUpperCase();
        cocktailData[key] = attribute;
      }
      else if(inputFields.length === 2) {
        let key = inputFields[0].value.toLowerCase();
        let attribute = inputFields[1].value;
        ingredientsData[key] = attribute;
      }
    });
    ref.ref('cocktails/'+newKey).set(cocktailData);
    ref.ref('cocktails/'+newKey+'/ingredients').set(ingredientsData);
    location.reload();
  }
  else {
    console.log("Don't save");
  }
}

function listMaker(snapshotItem) {
  if(snapshotItem[0]==="item") {
    listHolder += '<li ref="'+curID+'"><span class="titles"><input placeholder="name" class="long"></span><input placeholder="ml"></li>';
  }
  else {
    listHolder += '<li ref="'+curID+'"><span class="titles">'+snapshotItem[0]+':</span><input value="'+snapshotItem[1]+'"></li>';
  }
}

function addIngredientListElement() {
  let inputs = [];
  let inputsData = "";
  addButtonClicked = true;
  document.getElementById("ingredients").querySelectorAll("input").forEach(function(node) {
    inputs.push(node.value);
  });
  document.getElementById("ingredients").innerHTML += '<li ref="/ingredients"><span class="titles"><input placeholder="name" class="long"></span><input placeholder="ml"></li>';
  
  inputsData = document.getElementById("ingredients").querySelectorAll("input");

  for (let i = 0; i<inputsData.length-2; i++) {
    inputsData[i].value = inputs[i];
  }
  addListenerOnIngredientItems();
}

function addListenerOnIngredientItems() {
  document.querySelectorAll('li[ref="/ingredients"]').forEach(function(node) {
    node.addEventListener('long-press', function(e) {
      ingredientItemEvent(this);
    });
  });
}

function ingredientItemEvent(listItem) {
  if(confirm('Are you sure you want to delete this?')){
    listItem.parentElement.removeChild(listItem);
  }
  else{
    console.log("Pressed 'No'");
  }
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

function verifyData(){
  let verify = 0;
  let nodesLength = document.querySelectorAll('div#list li[ref]').length;
  document.querySelectorAll('div#list li[ref]').forEach(function(node) {
    let inputFields = node.querySelectorAll("input");
    let location = node.getAttribute("ref");

    if(inputFields.length === 1) {
      if(verifyInputField(inputFields[0], location, "string")) {
        verify++;
      }
    }
    else if(inputFields.length === 2) {
      if(verifyInputField(inputFields[0], location, "string") && verifyInputField(inputFields[1], location, "number")) {
        verify++;
      }
    }
  });
  if(nodesLength===verify) {
    verify = 0;
    return true;
  }
  else {
    verify = 0;
    return false;
  }
}
//updated rules on database
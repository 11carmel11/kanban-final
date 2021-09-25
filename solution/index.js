//website setup:
setSectionsContent();

//general variables:
const API = "https://json-bins.herokuapp.com/bin/614df7b11f7bafed863edc29";
const taskColumnIdArray = arrayOfIds();

/**
 * local storage functions:
 */
//adds the input to specific array in local storage:
function addToLocalStorage(key, input) {
  if (!localStorage.getItem("tasks")) {
    createLocalStorageDefaultItem();
  }
  const localStorageTasksObj = JSON.parse(localStorage.getItem("tasks"));
  localStorageTasksObj[key].unshift(input);
  localStorage.setItem("tasks", JSON.stringify(localStorageTasksObj));
}

//replaces the old text with edited text:
function updateLocalStorage(key, indexOfCurrentValue, updatedValue = null) {
  const localStorageTasksObj = JSON.parse(localStorage.getItem("tasks"));
  const section = localStorageTasksObj[key];
  if (updatedValue) {
    section.splice(indexOfCurrentValue, 1, updatedValue);
  } else {
    section.splice(indexOfCurrentValue, 1);
  }
  localStorage.setItem("tasks", JSON.stringify(localStorageTasksObj));
}

/**
 * event handlers functions:
 */
//adds the task to list on click
function addButtonHandler(event) {
  const relevantSection = event.path[1];
  const input = relevantSection.children[2].value;
  if (!input) {
    alert("sorry... please enter your task");
  } else {
    const taskElm = createListElement(input);
    relevantSection.children[1].insertBefore(
      taskElm,
      relevantSection.children[1].children[0]
    ); //appends the new element to the top
    addToLocalStorage(relevantSection.id, input);
    event.target.parentNode.children[2].value = "";
  }
}

//makes the content editable on double click, then adds blur event
function doubleClickHandler(event) {//yuri
  const target = event.target;
  if (target.localName !== "li") {
    return;
  }
  target.setAttribute("contenteditable", true);
  target.focus();
  target.addEventListener("blur", updateTaskHandler);
}

//makes the text uneditable and updates the local storage
function updateTaskHandler(event) {
  const relevantTaskElement = event.target;
  relevantTaskElement.removeAttribute("contenteditable");
  const columnName = event.path[2].id;
  const indexOfOldText = getIndex(columnName, relevantTaskElement);
  const updatedText = relevantTaskElement.innerText;
  relevantTaskElement.innerHTML = updatedText;
  updateLocalStorage(columnName, indexOfOldText, updatedText);
  if (!updatedText) {
    relevantTaskElement.remove();
  }
}

//sets unique name for relevant item, and adds event listener for keydown
function mouseEnterHandler(event) {//yuri
  const target = event.target;
  target.addEventListener("mouseleave", mouseLeaveHandler);
  target.setAttribute("name", "chosen");
  document.body.addEventListener("keydown", keyDownHandler);
}

//resets every change the mouseenter did
function mouseLeaveHandler(event) {//yuri
  const target = event.target;
  target.removeEventListener("keydown", keyDownHandler);
  target.removeAttribute("name");//yuri
  document.body.removeEventListener("keydown", keyDownHandler);
}

//prevents altKey's default, runs shifting task between lists logic
function keyDownHandler(event) {
  if (event.altKey) {
    event.preventDefault();
    altKeyPressedHandler(event.key);
  }
}

//shifting task between lists and updates local storage
function altKeyPressedHandler(keyPressed) {
  if (keyPressed - 3 <= 0) {
    const relevantTaskElement = document.getElementsByName("chosen")[0];
    const oldSectionId =
      relevantTaskElement.closest("section").id;
    const newSectionId = taskColumnIdArray[keyPressed - 1];
    if (newSectionId === oldSectionId) return;
    moveBetweenSections(oldSectionId, newSectionId, relevantTaskElement);
  }
}


//takes input and show tasks that includes it
function searchTasksByQuery(event) {//yuri
  const query = event.target.value;
  hideUnContainingTasks(query);
}

/**
 * extra functions
 */
//moves task between sections and updates the local storage
function moveBetweenSections(oldId, newId, taskToMove) {
  const taskColumnIndex = getIndex(oldId, taskToMove);
  taskToMove.remove();
  const listWrapperElement = document.getElementById(newId).children[1]
  const firstChildOfNewColumn = listWrapperElement.firstChild;
  listWrapperElement.insertBefore(taskToMove, firstChildOfNewColumn);
  updateLocalStorage(oldId, taskColumnIndex);
  addToLocalStorage(newId, taskToMove.innerText);
}

//creates a relevant <li> element
function createListElement(text) {
  const taskElement = document.createElement("li");
  taskElement.classList.add("task");
  taskElement.setAttribute("onmouseenter", "mouseEnterHandler(event)");
  taskElement.setAttribute("onmouseleave", "mouseLeaveHandler(event)");
  taskElement.innerText = text;
  return taskElement;
}

//creates an array of the ids
function arrayOfIds() {//yuri
  let arrOfId = [];
  const sectionsCollection = document.getElementsByTagName("section");
  for (let element of sectionsCollection) {
    arrOfId.push(element.id);
  }
  return arrOfId;
}

//sets every section's content by the local storage:
function setSectionsContent() {
  if (localStorage.getItem("tasks")) {
    const localStorageTasksObj = JSON.parse(localStorage.getItem("tasks"));
    const sectionsNodeList = document.querySelectorAll("section");
    for (let section of sectionsNodeList) {
      const sectionId = section.id;
      const ulElm = section.children[1];
      for (let i = 0; i < localStorageTasksObj[sectionId].length; i++) {
        ulElm.append(createListElement(localStorageTasksObj[sectionId][i]));
      }
    }
  } else {
    //first time the page is loaded
    createLocalStorageDefaultItem();
  }
}

//finds task's index in its list
function getIndex(key, element) {//yuri
  const liElementNodeList = document.getElementById(key).querySelectorAll("li");
  const liElementArr = Array.from(liElementNodeList);
  return liElementArr.indexOf(element);
}

//creates default item for local storage
function createLocalStorageDefaultItem() {
  localStorage.setItem(
    "tasks",
    JSON.stringify({
      todo: [],
      "in-progress": [],
      done: [],
    })
  );
}

//indicate if the first string contains second string
function isIncluded(queryString, containingString) {
  const lowerCaseQuery = queryString.toLowerCase();
  const lowerCaseContainingString = containingString.toLowerCase();
  return lowerCaseContainingString.includes(lowerCaseQuery);
}

//hides tasks that don't contain the query string
function hideUnContainingTasks(queryString) {
  const sectionsNodeList = document.querySelectorAll("section");
  for (let section of sectionsNodeList) {
    for (let liElm of section.children[1].children) {
      if (!isIncluded(queryString, liElm.innerText)) {
        liElm.classList.add("hidden-task");
      } else {
        liElm.classList.remove("hidden-task");
      }
    }
  }
}


// sets which event should happen
// function setsEventsAndHandlers (event) {
//   const target = event.target;
//   const targetTagName = target.nodeName.toLowerCase();
//   switch (targetTagName) {
//     case "div":
//       target.ondblclick = "doubleClickHandler(event)";
//       break;
//     case "li":

//   }

// }

// click for adding
// dblclick for edit
// enter to shift
// input for search

//sets the displayed tasks from the API
async function domFromApiHandler() {
  const jsonObjectFromApi = await fetch(API);
  const objectFromApi = await jsonObjectFromApi.json();
  const jsonTasksObjectFromApi = JSON.stringify(objectFromApi.tasks);
  localStorage.setItem("tasks", jsonTasksObjectFromApi);
  const tasksList = document.querySelectorAll("li");
  for (let task of tasksList) {
    task.remove()
  }
  setSectionsContent()
}


async function syncApiFromDom() {
  const localStorageTasksObj = localStorage.getItem("tasks");
  let tasks = { todo: [], "in-progress": [], done: [] };
  const d = document.querySelectorAll("section");
  for (let b of d) {
    const q = b.children[1].children;
    for (let p of q) {
      tasks[b.id].push(p.innerText);
    }
  }
  // console.log({localStorageTasksObj}, "A", JSON.stringify(arr), "B", arr, "C", JSON.stringify(localStorageTasksObj))

  await fetch(API, {
    method: 'PUT', // Method itself
    headers: {
      'Content-type': 'application/json; charset=UTF-8' // Indicates the content 
    },
    body: JSON.stringify(tasks) // We send data in JSON format
  }
  )

}
//binId:"614df7b11f7bafed863edc29",
// const almostAns = await fetch(URL, {
//   method: "POST",
//   body: JSON.stringify({
//     text,
//   }),
// });
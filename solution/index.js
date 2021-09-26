//general variables:
const API = "https://json-bins.herokuapp.com/bin/614ad95a4021ac0e6c080c0d";
const taskColumnIdArray = arrayOfColumnIds();
const loader = loaderMaker();

//website setup:
setSectionsContent();

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
function doubleClickHandler(event) {
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
  const indexOfOldText = getTaskElementIndex(columnName, relevantTaskElement);
  const updatedText = relevantTaskElement.innerText;
  relevantTaskElement.innerHTML = updatedText;
  updateLocalStorage(columnName, indexOfOldText, updatedText);
  if (!updatedText) {
    relevantTaskElement.remove();
  }
}

//sets unique name for relevant item, and adds event listener for keydown
function mouseEnterHandler(event) {
  const target = event.target;
  target.setAttribute("name", "chosen");
  document.body.addEventListener("keydown", keyDownHandler);
}

//resets every change the mouseenter did
function mouseLeaveHandler(event) {
  const target = event.target;
  if (target.attributes[3].value === "chosen") {
    target.removeAttribute("name");
  }
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
    const oldSectionId = relevantTaskElement.closest("section").id;
    const newSectionId = taskColumnIdArray[keyPressed - 1];
    if (newSectionId === oldSectionId) return;
    moveBetweenSections(oldSectionId, newSectionId, relevantTaskElement);
  }
}

//takes input and show tasks that includes it
function searchTasksByQuery(event) {
  const query = event.target.value;
  hideUnContainingTasks(query);
}

/**
 * extra functions
 */
//moves task between sections and updates the local storage
function moveBetweenSections(oldId, newId, taskToMove) {
  const taskColumnIndex = getTaskElementIndex(oldId, taskToMove);
  taskToMove.remove();
  const listWrapperElement = document.getElementById(newId).children[1];
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
function arrayOfColumnIds() {
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
function getTaskElementIndex(key, element) {
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

//returns json from API
async function getResponseAsJson(URL) {
  const response = await fetch(URL);
  const jsonResponse = await response.json();
  return jsonResponse;
}

//sets the displayed tasks from the API
async function loadDomFromApiHandler() {
  document.body.append(loader);
  try {
    const response = await getResponseAsJson(API);
    loader.remove();
    const tasksObjectFromApi = JSON.parse(response.tasks)
    localStorage.setItem("tasks", JSON.stringify(tasksObjectFromApi));
    const tasksList = document.querySelectorAll("li");
    console.log()
    for (let task of tasksList) {
      task.remove();
    }
    setSectionsContent();
  } catch {
    loader.remove();
    console.log("An error ocurred, so sorry!")
  }  
}

//saves the the current tasks at the API
async function saveDomInApi() {
  document.body.append(loader);
  try {
    const { tasks } = localStorage;
    await fetch(API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    });
    loader.remove();
  } catch {
    loader.remove();
    console.log("An error ocurred, so sorry!")
  }
}

//creates loader element
function loaderMaker() {
  const loader = document.createElement("div");
  loader.classList.add("loader");
  return loader;
}

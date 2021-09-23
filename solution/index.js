//website setup:
setSectionsContent();

//general variables:
const idsArray = arrayOfIds();

/**
 * local storage functions:
 */
//adds the input to specific array in local storage:
function addToLocalStorage(key, input) {
  if (!localStorage.getItem("tasks")) {
    createLocalStorageDefaultItem();
  }
  const localStorageTaskObj = JSON.parse(localStorage.getItem("tasks"));
  localStorageTaskObj[key].unshift(input);
  localStorage.setItem("tasks", JSON.stringify(localStorageTaskObj));
}

//replaces the old text with edited text:
function updateLocalStorage(key, indexOfCurrentValue, updatedValue = null) {
  const localStorageTaskObj = JSON.parse(localStorage.getItem("tasks"));
  const section = localStorageTaskObj[key];
  if (updatedValue) {
    section.splice(indexOfCurrentValue, 1, updatedValue);
  } else {
    section.splice(indexOfCurrentValue, 1);
  }
  localStorage.setItem("tasks", JSON.stringify(localStorageTaskObj));
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
    const relevantSectionId = relevantSection.attributes[0].value;
    addToLocalStorage(relevantSectionId, input);
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
  const key = event.path[2].attributes[0].value;
  const indexOfOldText = getIndex(key, relevantTaskElement);
  const updatedText = relevantTaskElement.innerText;
  relevantTaskElement.innerHTML = updatedText;
  updateLocalStorage(key, indexOfOldText, updatedText);
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
  target.removeAttribute("name");
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
function altKeyPressedHandler(pressed) {
  if (pressed - 3 <= 0) {
    const relevantTaskElement = document.getElementsByName("chosen")[0];
    const oldSectionId =
      relevantTaskElement.closest("section").attributes[0].value;
    const newSectionId = idsArray[pressed - 1];
    if (newSectionId == oldSectionId) return;
    moveBetweenSections(oldSectionId, newSectionId, relevantTaskElement);
  }
}

/**
 * extra functions
 */
//moves task between sections and updates the local storage
function moveBetweenSections(oldId, newId, element) {
  const index = getIndex(oldId, element);
  element.remove();
  document.getElementById(newId).children[1].append(element);
  updateLocalStorage(oldId, index);
  addToLocalStorage(newId, element.innerText);
}

//creates a relevant <li> element
function createListElement(text) {
  const element = document.createElement("li");
  element.classList.add("task");
  element.setAttribute("onmouseenter", "mouseEnterHandler(event)");
  element.setAttribute("onmouseleave", "mouseLeaveHandler(event)");
  element.innerText = text;
  return element;
}

//creates an array of the ids
function arrayOfIds() {
  let arrOfId = [];
  const sectionsCollection = document.getElementsByTagName("section");
  for (let element of sectionsCollection) {
    arrOfId.push(element.id);
  }
  return arrOfId;
}

//sets every section's context by the local storage:
function setSectionsContent() {
  if (localStorage.getItem("tasks")) {
    const localStorageTaskObj = JSON.parse(localStorage.getItem("tasks"));
    const sectionsNodeList = document.querySelectorAll("section");
    for (let section of sectionsNodeList) {
      const sectionId = section.attributes[0].value;
      const ulElm = section.children[1];
      for (let i = 0; i < localStorageTaskObj[sectionId].length; i++) {
        ulElm.append(createListElement(localStorageTaskObj[sectionId][i]));
      }
    }
  } else {
    //first time the page is loaded
    createLocalStorageDefaultItem();
  }
}

//finds task's index in its list
function getIndex(key, element) {
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

//website setup:
setSectionsContent();


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
    localStorage.setItem(
      "tasks",
      JSON.stringify({
        todo: [],
        "in-progress": [],
        done: [],
      })
    );
  }
}


//local storage functions:
function addToLocalStorage(key, input) {
  const localStorageTaskObj = JSON.parse(localStorage.getItem("tasks"));
  localStorageTaskObj[key].unshift(input);
  localStorage.setItem("tasks", JSON.stringify(localStorageTaskObj));
}

function updateLocalStorage(key, indexOfCurrentValue, updatedValue) {
  const localStorageTaskObj = JSON.parse(localStorage.getItem("tasks"));
  const section = localStorageTaskObj[key];
  section.splice(indexOfCurrentValue, 1, updatedValue);
  localStorage.setItem("tasks", JSON.stringify(localStorageTaskObj));
}

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
    const relevantSectionId = relevantSection.attributes[0].value
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
  const liElm = event.target;
  liElm.removeAttribute("contenteditable");
  const key = event.path[2].attributes[0].value;
  const liElmNodeList = document.getElementById(key).querySelectorAll("li");
  const liElmArr = Array.from(liElmNodeList);
  const indexOfOldText = liElmArr.indexOf(liElm);
  const updatedText = liElm.innerText;
  liElm.innerHTML = updatedText;
  updateLocalStorage(key, indexOfOldText, updatedText);
}

function createListElement(text) {
  const element = document.createElement("li");
  element.classList.add("task");
  element.innerText = text;
  return element;
}

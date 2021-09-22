const sections = document.querySelectorAll("section");
setSectionsContent();

function setSectionsContent() {
  if (localStorage.getItem("tasks")) { 
    const localStorageTaskObj = JSON.parse(localStorage.getItem("tasks"));
    for (let section of sections) {
      const sectionId = section.attributes[0].value;
      const ulElm = section.children[1];
      for (let i = 0; i < localStorageTaskObj[sectionId].length; i++) {
        ulElm.append(createListElement(localStorageTaskObj[sectionId][i]));
      }
    }
  } else { //first time the page is loaded
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

function createListElement(text) {
  const element = document.createElement("li");
  element.classList.add("task");
  element.innerText = text;
  return element;
}

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
    resetLocalStorage();
  }
}

function resetLocalStorage() {
  const tasksObj = {
    todo: [],
    "in-progress": [],
    done: [],
  };
  for (let section of sections) {
    const ulElm = section.children[1].children;
    for (let child of ulElm) {
      tasksObj[section.attributes[0].value].push(child.innerText);
    }
  }
  localStorage.removeItem("tasks");
  localStorage.setItem("tasks", JSON.stringify(tasksObj));
}

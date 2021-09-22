function createListElement(text) {
  const element = document.createElement('li');
  element.classList.add('task');
  element.innerText = text;
  //   for (act in eventListeners) {
  //     element.addEventListener(act, eventListeners[act]);
  //   }
  return element;
}

function addButtonHandler(event) {
  const input = event.path[1].children[2].value;
  if (!input) {
    alert('sorry... please enter your task');
  } else {
    const taskElm = createListElement(input);
    event.path[1].children[1].append(taskElm);
  }
}

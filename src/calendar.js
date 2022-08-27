import { getDay, getMonth, getYear, getDaysInMonth } from "./dates";
import { showEventModal } from "./event-modal";
import {state} from "./state";

const template = `
  <section class="calendar" data-view="${state.calendar.view}">
    <div class="inner">
    </div>
  </section>
`;

function onCalendarClick(ev) {
  if (ev.target.classList.contains("cell")) {
    const date = ev.target.getAttribute("data-date");
    showEventModal(date, (value) => {
      if (!state.events.hasOwnProperty(date)) {
        state.events[date] = [];
      }
      state.events[date].push(value);
      updateView();
    });
  }
}

export function initCalendar() {
  state.$element.insertAdjacentHTML('beforeend', template);
  state.calendar.$element = state.$element.querySelector("section.calendar");
  updateView();

  state.calendar.$element.addEventListener("click", onCalendarClick);

  state.calendar.setDate = (date) => {
    state.calendar.date = date;
    updateView();
  }

  setupDragDrop();
}

function updateView() {
  const {date} = state.calendar;

  const cYear = getYear();
  const cMonth = getMonth();
  const cDay = getDay();

  const year = getYear(date);
  const month = getMonth(date);

  const days = getDaysInMonth(year, month);
  let content = "";
  for (let day = 1; day <= days; day++) {
    content += `<div 
    class="cell ${(cYear === year && cMonth === month && cDay === day) ? "act" : ""}" 
    data-date="${year}-${month}-${day}">
      <label>${day}</label>`;

    const events = state.events[`${year}-${month}-${day}`];
    if (events) {
      content += `<ul>
        ${events.map(it => `<li class="ev">${it}</li>`).join("")}
      </ul>`
    }

    content += `</div>`;
  }
  state.calendar.$element.querySelector(".inner").innerHTML = content;

  state.calendar.onDateChange$.publish(date);
}

let isMoving = false;
let activeEvent = null;
let activeCell = null;
function setupDragDrop() {
  window.addEventListener("mousedown", ev => {
    if (!ev.target.classList.contains("ev")) return;
    
    isMoving = true;
    activeEvent = ev.target;
    activeEvent.style.width = `${activeEvent.clientWidth}px`;
    activeEvent.classList.add("moving");
  });

  window.addEventListener("mouseup", ev => {
    if (!isMoving) return;
    
    isMoving = false;
    activeEvent.classList.remove("moving");
    activeEvent.style.top = "";
    activeEvent.style.left = "";

    if (activeCell) {
      const event = activeEvent.innerText;
      const prevCell = activeEvent.parentNode.parentNode;
      const key = activeCell.getAttribute("data-date");
      const prevKey = prevCell.getAttribute("data-date");
      
      state.events[prevKey] = state.events[prevKey].filter(it => it !== event);
      
      if (!state.events[key]) {
        state.events[key] = [];
      }
      state.events[key].push(event);
      
      updateView();
    }
  });

  window.addEventListener("mousemove", ev => {
    if (!isMoving || !activeEvent) return;
    
    if (ev.target.classList.contains("cell")) {
      activeCell = ev.target;
    }

    activeEvent.style.top = `${ev.clientY}px`;
    activeEvent.style.left = `${ev.clientX}px`;
  })
}
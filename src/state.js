class PubSub {
  subscribers = [];

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  publish(data) {
    this.subscribers.forEach(callback => callback(data));
  }
}

function getStoredEvents() {
  const events = window.localStorage.getItem("events");
  return events ? JSON.parse(events) : {};
}

export const state = {
  $element: null,
  calendar: {
    $element: null,
    view: "month",
    date: new Date(),
    onDateChange$: new PubSub(),
    setDate: () => {}
  },
  events: getStoredEvents(),
  version: "1.0.0",
}

let db;

// open connection to indexedDB
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  //  making new budget object store
  db.createObjectStore("new_budget", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  // if online, send the budget to the api
  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function (event) {
  console.log("Error:" + event.target.errorCode);
};

// this part happens if you try to save while offline
// add your new record to the indexdb storage, to be uploaded when online
function saveRecord(record) {
  const transaction = db.transaction(["new_budget"], "readwrite");

  const budgetObjectStore = transaction.objectStore("new_budget");

  budgetObjectStore.add(record);
}
// function to upload the budget
// gets the saved budget and then does a post request to feed it to the api
function uploadBudget() {
  const transaction = db.transaction(["new_budget"], "readwrite");

  const store = transaction.objectStore("new_budget");

  const getEverything = store.getAll();

  getEverything.onsuccess = function () {
    if (getEverything.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getEverything.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
// then clears the store
          const transaction = db.transaction(["new_budget"], "readwrite");

          const store = transaction.objectStore("new_budget");

          store.clear();
        });
    }
  };
}

window.addEventListener("online", uploadBudget);

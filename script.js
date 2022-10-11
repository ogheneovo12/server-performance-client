const startPauseButton = document.getElementById("start_pause_btn"),
  stopButton = document.getElementById("stop_btn"),
  tbody = document.getElementById("tbody"),
  listCounter = document.querySelector(".list_counter"),
  loadingUi = document.querySelector(".loader-overlay");

let isPaused = true,
  intervalId,
  calls = [],
  min = 1,
  max = 10;

const STORE_NAME = "EVENT_CALLS";

const showLoadingUi = () => {
  if (loadingUi) {
    loadingUi.style.display = "flex";
  }
};

const hideLoadingUi = () => {
  if (loadingUi) {
    loadingUi.style.display = "none";
  }
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const createTd = (textContent) => {
  const Td = document.createElement("td");
  Td.textContent = textContent;
  return Td;
};

const createTr = (createdDate, dataLength, data) => {
  const Tr = document.createElement("tr");
  Tr.append(
    createTd(formatDate(createdDate)),
    createTd(dataLength),
    createTd(data)
  );
  return Tr;
};

function buildListUi(newData = {}) {
  console.log({ newData });
  const { data, createdDate } = newData;

  setCounter(storeServerCalls(newData));

  const tr = createTr(createdDate, data?.length, data);
  tbody.prepend(tr);
}

const setCounter = (count) => (listCounter.textContent = count);

const retrieveServerCalls = () => {
  let calls = [];
  try {
    calls = JSON.parse(localStorage.getItem(STORE_NAME)) || [];
  } catch (err) {}
  return calls;
};

function storeServerCalls(newCall) {
  const existingCalls = retrieveServerCalls();
  let newCallList = [...existingCalls, newCall];
  localStorage.setItem(STORE_NAME, JSON.stringify(newCallList));
  return newCallList.length;
}

const generateRandomTimer = () => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateRandomString = () => {
  const str =
    new Date().getTime().toString(36) + Math.random().toString(36).slice(2);
  return str;
};

const makeServerCall = () => {
  fetch("https://ste-ovo.herokuapp.com/api/task", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: generateRandomString(),
      deviceId: localStorage.getItem("deviceId") || "",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data.data)
      buildListUi(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const getDeviceId = () => {
  showLoadingUi();
  fetch("https://ste-ovo.herokuapp.com/api/task/register-device-id")
    .then((response) => response.json())
    .then((data) => {
      hideLoadingUi();
      localStorage.setItem("deviceId", data?.uid);
    })
    .catch((err) => {
      hideLoadingUi();
    });
};

const getExistingCalls = async () => {
  const response = await fetch(
    "https://ste-ovo.herokuapp.com/api/task/register-device-id"
  );
  return await response.json();
};

const stop = () => {
  startPauseButton.textContent = "Start";
  clearInterval(intervalId);
};

const start = () => {
  let timer = generateRandomTimer();
  intervalId = setInterval(() => {
    if (!isPaused) {
      makeServerCall();
    }
  }, timer);
};

const togglePause = () => {
  if (!intervalId) start();
  isPaused = !isPaused;
  startPauseButton.textContent = isPaused ? "Run" : "Pause";
};

//SET EVENTS HANDLERS
startPauseButton.addEventListener("click", togglePause);
stopButton.addEventListener("click", stop);

if (!localStorage.getItem("deviceId")) {
  getDeviceId();
}

import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent.length > 3) {
      element.textContent = "";
    }
  }, 300);
}

function typeText(text, element) {
  let i = 0;

  const typeInterval = setInterval(() => {
    element.textContent += text.charAt(i);

    i++;

    if (i === text.length) {
      clearInterval(typeInterval);
    }
  }, 20);
}

function generateUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueID) {
  return `
    <div class="wrapper ${isAi ? "ai" : ""}">
      <div class="chat"">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}">
        </div>
        <div class="message" id=${uniqueID}>
          ${value}
        </div>
      </div>
    </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  const uniqueID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, "", uniqueID);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueID);

  loader(messageDiv);

  //fetch data from server

  const response = await fetch("https://cognichat.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(parsedData, messageDiv);
  }
  else{
    const error = await response.text();
    messageDiv.inertHTML = "Something went wrong. Please try again later.";
    console.log(error);
}};       

form.addEventListener("submit", handleSubmit);
form.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});
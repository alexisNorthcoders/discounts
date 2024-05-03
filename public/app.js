document
  .getElementById("file-upload-form")
  .addEventListener("submit", (e) => uploadFile(e));
document
  .getElementById("message-form")
  .addEventListener("submit", (e) => sendPrompt(e));
document.getElementById("price").innerHTML = "0.50£";
document.getElementById("price").setAttribute("data-cents", "50");
const chatBox = document.getElementById("chat-box");

function uploadFile(event) {
  event.preventDefault();

  const formData = new FormData();
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  formData.append("file", file);

  if (file.type !== "application/json") {
    document.getElementById("upload-message").classList.remove("hidden");
    document.getElementById("upload-message").innerText =
      "File needs to be type .json!";
    console.error("Only JSON files are allowed.");
    return;
  }

  fetch("http://127.0.0.1:8888/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error uploading file.");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("upload-message").innerText =
        "File uploaded successfully!";
      document.getElementById("upload-message").classList.remove("hidden");
      console.log("File uploaded successfully:", data);
    })
    .catch((error) => {
      console.error("There was a problem with the file upload:", error);
    });
}
function sendPrompt(event) {
  event.preventDefault();
  const userPrompt = document.getElementById("message-input").value;
  document.getElementById("message-input").value=""
  
  chatBox.innerHTML += createUserMessage(userPrompt);
  chatBox.scrollTop = chatBox.scrollHeight;

  fetch("http://127.0.0.1:8888/assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userPrompt }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error sending message.");
      }
      return response.json();
    })
    .then((data) => {
      
      chatBox.innerHTML += createAssistantMessage(data.message)
      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch((error) => {
      console.error("There was a problem sending the message.", error);
    });
}

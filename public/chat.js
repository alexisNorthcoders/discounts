function createUserMessage(message){
    const userMessage = `<div class="flex mt-1 pl-1 bg-gray-200"> <image
    src="assets/avatar.jpeg"
    alt="assistant avatar image"
    width="40"
    height="40"
    class="h-10 w-10 rounded-full object-cover"
    />
    <span class="text-cyan-500 font-bold">User: </span><div id="user-message">${message}</div> 
    </div>`;
    return userMessage
}
function createAssistantMessage(message){
    const assistantMessage = `<div class="flex mt-1 pl-1 bg-white">
<image
  src="assets/assistant.png"
  alt="assistant avatar image"
  width="40"
  height="40"
  class="h-10 w-10 rounded-full object-cover"
/>
<span class="text-blue-500 font-bold">Assistant: </span><div id="assistant-message">${message}</div>`
return assistantMessage
}
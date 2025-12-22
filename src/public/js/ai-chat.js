const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let waitingForAnswer = false;

/* Utility to add message */
function addMessage(text, type = "bot") {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* Start AI Session */
async function initAI() {
    const res = await fetch("/ai/start");
    const data = await res.json();
    addMessage(data.nextQuestion);
}

initAI();

/* Send Answer */
async function sendMessage() {
    const text = input.value.trim();
    if (!text || waitingForAnswer) return;

    addMessage(text, "user");
    input.value = "";
    waitingForAnswer = true;

    const res = await fetch("/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: text })
    });

    const data = await res.json();
    waitingForAnswer = false;

    if (data.done) {
        renderResult(data.recommendations);
    } else {
        addMessage(data.nextQuestion);
    }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});

/* Render AI Result */
function renderResult(result) {
    addMessage("✅ Recommendation Ready");

    addMessage(
        `🔧 Recommended: ${result.recommended.join(", ")}`
    );

    addMessage(
        `🔄 Alternatives: ${result.alternatives.join(", ")}`
    );

    addMessage(`📘 Reason: ${result.reasoning}`);

    if (result.warnings.length) {
        addMessage(`⚠️ Warnings: ${result.warnings.join(", ")}`);
    }
}

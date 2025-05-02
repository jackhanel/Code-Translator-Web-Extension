const translationCache = {}; // Cache original code -> translated code
const backendUrl = "http://localhost:5000/translate_code";

function addTranslateControls(codeBlock) {
  const originalHTML = codeBlock.innerHTML; // Save original HTML with color coding
  const originalClass = codeBlock.className || "language-auto";
  const parentPre = codeBlock.closest("pre");
  const originalPreClass = parentPre.className || "";

  // Create a container div for controls
  const controlsDiv = document.createElement("div");
  controlsDiv.style.display = "flex";
  controlsDiv.style.gap = "10px";
  controlsDiv.style.alignItems = "center";
  controlsDiv.style.marginBottom = "8px";

  // Language selector
  const languageSelect = document.createElement("select");
  languageSelect.style.backgroundColor = "#f8f9fa";
  languageSelect.style.color = "black";
  languageSelect.style.padding = "5px 10px";
  languageSelect.style.border = "1px solid #ccc";
  languageSelect.style.borderRadius = "5px";
  languageSelect.style.cursor = "pointer";
  languageSelect.style.fontSize = "14px";
  languageSelect.style.marginRight = "10px";
  languageSelect.addEventListener("mouseover", () => {
    languageSelect.style.backgroundColor = "#e2e6ea";
  });
  languageSelect.addEventListener("mouseout", () => {
    languageSelect.style.backgroundColor = "#f8f9fa";
  });

  const languages = ["Python", "JavaScript", "C++", "Java", "Ruby", "Go"];
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang;
    languageSelect.appendChild(option);
  });

  let targetLanguage = languageSelect.value;

  languageSelect.addEventListener("change", (event) => {
    targetLanguage = event.target.value;
    translateButton.innerText = `Translate to ${targetLanguage}`;
  });

  // Translate button
  const translateButton = document.createElement("button");
  translateButton.innerText = `Translate to ${targetLanguage}`;
  styleButton(translateButton, "#007bff", "#0069d9");

  // Revert button
  const revertButton = document.createElement("button");
  revertButton.innerText = "Show Original";
  styleButton(revertButton, "#28a745", "#218838");
  revertButton.style.display = "none";

  const workingCodeNode = document.createElement("code");
  workingCodeNode.className = originalClass;
  workingCodeNode.innerHTML = originalHTML;

  codeBlock.replaceWith(workingCodeNode);

  controlsDiv.appendChild(languageSelect);
  controlsDiv.appendChild(translateButton);
  controlsDiv.appendChild(revertButton);
  parentPre.insertBefore(controlsDiv, workingCodeNode);

  translateButton.addEventListener("click", async () => {
    const originalText = workingCodeNode.innerText;

    // Disable button and show spinner
    translateButton.disabled = true;
    translateButton.innerHTML = `<span class="spinner"></span> Translating...`;

    if (translationCache[originalText + targetLanguage]) {
      workingCodeNode.textContent =
        translationCache[originalText + targetLanguage];
    } else {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_language: "auto",
          target_language: targetLanguage,
          code: originalText,
        }),
      });

      const data = await response.json();
      const translatedCode = data.translated_code;
      translationCache[originalText + targetLanguage] = translatedCode;
      workingCodeNode.textContent = translatedCode;
    }

    const langClass = "language-" + mapLanguageToClass(targetLanguage);
    workingCodeNode.className = langClass;
    parentPre.className = langClass;

    if (typeof Prism !== "undefined") {
      workingCodeNode.innerHTML = Prism.highlight(
        workingCodeNode.textContent,
        Prism.languages[mapLanguageToClass(targetLanguage)],
        mapLanguageToClass(targetLanguage)
      );
    }

    // Reset buttons after translation
    translateButton.disabled = false;
    translateButton.style.display = "none";
    revertButton.style.display = "inline-block";
    translateButton.innerText = `Translate to ${targetLanguage}`;
  });

  revertButton.addEventListener("click", () => {
    workingCodeNode.className = originalClass;
    workingCodeNode.innerHTML = originalHTML;
    parentPre.className = originalPreClass;

    translateButton.style.display = "inline-block";
    revertButton.style.display = "none";
  });
}

function styleButton(button, bgColor, hoverColor) {
  button.style.backgroundColor = bgColor;
  button.style.color = "white";
  button.style.border = "none";
  button.style.padding = "5px 10px";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = hoverColor;
  });
  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = bgColor;
  });

  // Add spinner CSS once
  if (!document.getElementById("spinner-styles")) {
    const spinnerStyle = document.createElement("style");
    spinnerStyle.id = "spinner-styles";
    spinnerStyle.innerHTML = `
      .spinner {
        border: 2px solid #f3f3f3;
        border-top: 2px solid white;
        border-radius: 50%;
        width: 14px;
        height: 14px;
        animation: spin 0.8s linear infinite;
        display: inline-block;
        vertical-align: middle;
        margin-right: 8px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(spinnerStyle);
  }
}

function mapLanguageToClass(language) {
  switch (language.toLowerCase()) {
    case "python":
      return "python";
    case "javascript":
      return "javascript";
    case "c++":
      return "cpp";
    case "java":
      return "java";
    case "ruby":
      return "ruby";
    case "go":
      return "go";
    default:
      return "plaintext";
  }
}

window.addEventListener("load", () => {
  const codeBlocks = document.querySelectorAll("pre code");
  codeBlocks.forEach((codeBlock) => {
    addTranslateControls(codeBlock);
  });
});

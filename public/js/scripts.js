// let currentIgnoredContacts = []; // track globally
// let isEditing = false;
// let promptData = {};

// function toggleSidebar() {
//   document.getElementById('sidebar').classList.toggle('collapsed');
// }

// function toggleTheme() {
//   document.body.classList.toggle('dark-mode');
//   const isDark = document.body.classList.contains('dark-mode');
//   localStorage.setItem('theme', isDark ? 'dark' : 'light');
//   const themeBtn = document.getElementById('themeToggleBtn');
//   themeBtn.textContent = isDark ? '🌙' : '🌞';
// }

// document.addEventListener("DOMContentLoaded", () => {
//   // Load theme from localStorage
//   const savedTheme = localStorage.getItem('theme');
//   if (!savedTheme) {
//     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//     if (prefersDark) {
//       document.body.classList.add('dark-mode');
//     }
//   } else {
//     if (savedTheme === 'dark') {
//       document.body.classList.add('dark-mode');
//       const themeBtn = document.getElementById('themeToggleBtn');
//       if (themeBtn) themeBtn.textContent = '🌙';
//     } else {
//       const themeBtn = document.getElementById('themeToggleBtn');
//       if (themeBtn) themeBtn.textContent = '🌞';
//     }
//   }

//   document.querySelectorAll('.sidebar-button').forEach(button => {
//     button.addEventListener('click', (e) => {
//       e.preventDefault();
//       const page = button.getAttribute('data-page');
//       if (page === 'config') {
//         loadConfigPage();
//       } else if (page === 'prompts') {
//         loadPromptPage();
//       }
//     });
//   });

//   loadConfigPage();
// });

// function loadConfigPage() {
//   document.querySelector(".content h1").textContent = "Whatsapp Assistant Configuration";
//   document.querySelector(".config-controls").style.display = "flex";
//   document.getElementById("formContainer").style.display = "block";

//   fetch('/api/config')
//     .then(response => response.json())
//     .then(data => {
//       renderForm(data);
//       const label = document.getElementById("accountLabel");
//       if (label) {
//         label.title = data.admin;
//         label.querySelector("strong").textContent = data.recipient;
//       }
//     })
//     .catch(error => {
//       console.error("Failed to load config.json:", error);
//       document.getElementById("formContainer").innerText = "Failed to load configuration.";
//     });
// }

// function loadPromptPage() {
//   document.querySelector(".content h1").textContent = "Prompt Configuration";
//   document.querySelector(".config-controls").style.display = "none";
//   const formContainer = document.getElementById("formContainer");
//   formContainer.style.display = "block";
//   formContainer.innerHTML = `<div style="padding: 1em;"><h2>Loading Prompts...</h2></div>`;

//   fetch('/api/prompts')
//     .then(res => res.json())
//     .then(data => renderPromptEditor(data))
//     .catch(() => {
//       formContainer.innerHTML = `<p>❌ Failed to load prompts.json</p>`;
//     });
// }


// function renderForm(data) {
//   const container = document.getElementById("formContainer");
//   container.innerHTML = '';

//   const formWrapper = document.createElement("form");
//   formWrapper.className = "config-form";
//   formWrapper.id = "configForm";

//   const createInputRow = (key, value, type = 'text') => {
//     const row = document.createElement("div");
//     row.className = "form-row";
//     const label = document.createElement("label");
//     label.textContent = key;
//     row.appendChild(label);
//     const input = document.createElement("input");
//     input.name = key;
//     input.value = value;
//     input.type = type;
//     input.readOnly = true;
//     if (type === 'checkbox') {
//       input.checked = value;
//       input.disabled = true;
//     }
//     row.appendChild(input);
//     return row;
//   };

//   const createFieldset = (legendText, rows) => {
//     const fieldset = document.createElement("fieldset");
//     const legend = document.createElement("legend");
//     legend.textContent = legendText;
//     fieldset.appendChild(legend);
//     rows.forEach(row => fieldset.appendChild(row));
//     return fieldset;
//   };

//   const basicInfoRows = [
//     createInputRow("admin", data.admin),
//     createInputRow("recipient", data.recipient),
//     createInputRow("location", data.location),
//     createInputRow("timezone", data.timezone)
//   ];

//   const modelSettingsRows = [
//     createInputRow("selectedModel", data.selectedModel),
//     createInputRow("maxTokens", data.maxTokens, "number"),
//     createInputRow("hCount", data.hCount, "number"),
//     createInputRow("debug", data.debug, "checkbox")
//   ];

//   const pathsApiRows = [
//     createInputRow("apiFolder", data.apiFolder),
//     createInputRow("promptsFilePath", data.promptsFilePath),
//     createInputRow("promptsReloadIntervalMs", data.promptsReloadIntervalMs, "number"),
//     createInputRow("ollama.baseUrl", data.ollama?.baseUrl || '')
//   ];

//   const filtersRows = [
//     createInputRow("invertIgnore", data.invertIgnore, "checkbox")
//   ];

//   const ignoredRow = document.createElement("div");
//   ignoredRow.className = "form-row list-row";

//   const label = document.createElement("label");
//   label.textContent = "Ignored Contacts:";
//   ignoredRow.appendChild(label);

//   const listContent = document.createElement("div");
//   listContent.className = "list-content";
//   listContent.id = "ignoredList";
//   ignoredRow.appendChild(listContent);
//   filtersRows.push(ignoredRow);

//   formWrapper.appendChild(createFieldset("Basic Info", basicInfoRows));
//   formWrapper.appendChild(createFieldset("Model Settings", modelSettingsRows));
//   formWrapper.appendChild(createFieldset("Paths & API", pathsApiRows));
//   formWrapper.appendChild(createFieldset("Filters", filtersRows));

//   formWrapper.onsubmit = (e) => {
//     e.preventDefault();
//     const originalSaveText = saveBtn.textContent;
//     saveBtn.textContent = '💾 Saving...';
//     saveBtn.disabled = true;

//     const formData = new FormData(formWrapper);
//     const updatedConfig = {
//       admin: formData.get("admin"),
//       recipient: formData.get("recipient"),
//       location: formData.get("location"),
//       timezone: formData.get("timezone"),
//       selectedModel: formData.get("selectedModel"),
//       maxTokens: Number(formData.get("maxTokens")),
//       hCount: Number(formData.get("hCount")),
//       // debug: formData.get("debug") === "on",
//       debug: formWrapper.querySelector('input[name="debug"]').checked,
//       apiFolder: formData.get("apiFolder"),
//       promptsFilePath: formData.get("promptsFilePath"),
//       promptsReloadIntervalMs: Number(formData.get("promptsReloadIntervalMs")),
//       ollama: {
//         baseUrl: formData.get("ollama.baseUrl")
//       },
//       // invertIgnore: formData.get("invertIgnore") === "on",

//       invertIgnore: formWrapper.querySelector('input[name="invertIgnore"]').checked,

//       ignoredContacts: currentIgnoredContacts.filter(c => c.trim() !== "")
//     };

//     fetch('/api/config', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(updatedConfig, null, 2)
//     })
//       .then(res => res.json())
//       .then(res => {
//         if (res.success) {
//           alert("✅ Config saved.");
//           toggleEdit();
//           renderForm(updatedConfig);
//         } else {
//           alert("❌ Failed to save.");
//         }
//       })
//       .catch(() => alert("❌ Error saving config."))
//       .finally(() => {
//         saveBtn.textContent = originalSaveText;
//         saveBtn.disabled = false;
//       });
//   };

//   container.appendChild(formWrapper);

//    currentIgnoredContacts = data.ignoredContacts || [];
//   renderIgnoredContacts(currentIgnoredContacts, false);
// }

// function toggleEdit() {
//   isEditing = !isEditing;
//   const inputs = document.querySelectorAll('#formContainer input');
//   inputs.forEach(input => {
//     if (input.type === "checkbox") {
//       input.disabled = !isEditing;
//     } else {
//       input.readOnly = !isEditing;
//     }
//   });
//   renderIgnoredContacts(currentIgnoredContacts, isEditing);
//   const editBtn = document.getElementById('editBtn');
//   const saveBtn = document.getElementById('saveBtn');
//   editBtn.textContent = isEditing ? 'Cancel' : 'Edit';
//   saveBtn.style.display = isEditing ? 'inline-block' : 'none';
// }

// function saveConfig() {
//   const form = document.getElementById("configForm");
//   if (form) form.requestSubmit();
// }

// function renderIgnoredContacts(contactArray, editable = false) {
//   const listContent = document.getElementById("ignoredList");
//   if (!listContent) return;

//   listContent.innerHTML = '';

//   if (!editable) {
//     const ul = document.createElement("ul");
//     ul.className = "readonly-list";
//     contactArray.forEach(contact => {
//       const li = document.createElement("li");
//       li.textContent = contact;
//       ul.appendChild(li);
//     });
//     listContent.appendChild(ul);
//     return;
//   }

//   contactArray.forEach((contact, idx) => {
//     const row = document.createElement("div");
//     row.style.display = 'flex';
//     row.style.marginBottom = '4px';
//     row.style.gap = '0.5rem';

//     const input = document.createElement("input");
//     input.type = "text";
//     input.name = "ignoredContacts";
//     input.value = contact;
//     input.readOnly = !editable;
//     row.appendChild(input);

//     if (editable) {
//       const removeBtn = document.createElement("button");
//       removeBtn.type = "button";
//       removeBtn.textContent = "–";
//       removeBtn.title = "Remove contact";
//       removeBtn.onclick = () => {
//         currentIgnoredContacts.splice(idx, 1);
//         renderIgnoredContacts(currentIgnoredContacts, true);
//       };
//       row.appendChild(removeBtn);
//     }

//     listContent.appendChild(row);
//   });

//   if (editable) {
//     const addBtn = document.createElement("button");
//     addBtn.type = "button";
//     addBtn.textContent = "+ Add Contact";
//     addBtn.onclick = () => {
//       currentIgnoredContacts.push('');
//       renderIgnoredContacts(currentIgnoredContacts, true);
//     };
//     listContent.appendChild(addBtn);
//   }
// }

// function renderPromptEditor(data) {
//   const formContainer = document.getElementById("formContainer");
//   formContainer.innerHTML = "";

//   promptData = structuredClone(data); // Keep global state

//   const headerBar = document.createElement("div");
//   headerBar.className = "editor-header";

//   const title = document.createElement("h2");
//   title.textContent = "Prompt Editor";
//   headerBar.appendChild(title);

//   const editBtn = document.createElement("button");
//   editBtn.id = "promptEditBtn";
//   editBtn.textContent = isEditing ? "Cancel" : "Edit";
//   editBtn.onclick = () => {
//     isEditing = !isEditing;
//     renderPromptEditor(promptData);
//   };
//   headerBar.appendChild(editBtn);
//   formContainer.appendChild(headerBar);

//   const form = document.createElement("form");
//   form.id = "promptEditorForm";

//   Object.keys(promptData).forEach(userKey => {
//     const userData = promptData[userKey];
//     const userWrapper = document.createElement("div");
//     userWrapper.className = "user-section";

//     const sectionDiv = document.createElement("div");
//     sectionDiv.className = "user-content";

//     const header = document.createElement("div");
//     header.className = "user-header";

//     const title = document.createElement("h3");
//     title.textContent = userKey + (userKey === "default" ? " (default)" : "");

//     const toggleBtn = document.createElement("button");
//     toggleBtn.type = "button";
//     toggleBtn.textContent = "⯆";
//     toggleBtn.onclick = () => {
//       sectionDiv.classList.toggle("collapsed");
//     };

//     header.appendChild(toggleBtn);
//     header.appendChild(title);

//     if (isEditing && userKey !== "default") {
//       const renameBtn = document.createElement("button");
//       renameBtn.type = "button";
//       renameBtn.textContent = "✏️ Rename";
//       renameBtn.onclick = () => {
//         const newKey = prompt("Enter new user ID:", userKey);
//         if (newKey && !promptData[newKey]) {
//           promptData[newKey] = promptData[userKey];
//           delete promptData[userKey];
//           renderPromptEditor(promptData);
//         }
//       };

//       const deleteBtn = document.createElement("button");
//       deleteBtn.type = "button";
//       deleteBtn.textContent = "🗑️ Delete";
//       deleteBtn.onclick = () => {
//         delete promptData[userKey];
//         renderPromptEditor(promptData);
//       };

//       header.appendChild(renameBtn);
//       header.appendChild(deleteBtn);
//     }

//     userWrapper.appendChild(header);

//     Object.keys(userData).forEach(category => {
//       const catWrapper = document.createElement("div");
//       catWrapper.className = "category-block";

//       const label = document.createElement("label");
//       label.textContent = category;
//       catWrapper.appendChild(label);

//       const textarea = document.createElement("textarea");
//       textarea.name = `${userKey}__${category}`;
//       textarea.rows = userData[category].length + 1;
//       textarea.style.width = "100%";
//       textarea.value = userData[category].join("\n");
//       textarea.readOnly = !isEditing;
//       catWrapper.appendChild(textarea);

//       if (isEditing) {
//         const renameBtn = document.createElement("button");
//         renameBtn.type = "button";
//         renameBtn.textContent = "✏️ Rename";
//         renameBtn.onclick = () => {
//           const newCat = prompt("New category name:", category);
//           if (newCat && !userData[newCat]) {
//             userData[newCat] = userData[category];
//             delete userData[category];
//             renderPromptEditor(promptData);
//           }
//         };

//         const deleteBtn = document.createElement("button");
//         deleteBtn.type = "button";
//         deleteBtn.textContent = "❌ Delete";
//         deleteBtn.onclick = () => {
//           delete userData[category];
//           renderPromptEditor(promptData);
//         };

//         catWrapper.appendChild(renameBtn);
//         catWrapper.appendChild(deleteBtn);
//       }

//       sectionDiv.appendChild(catWrapper);
//     });

//     if (isEditing) {
//       const addCatBtn = document.createElement("button");
//       addCatBtn.type = "button";
//       addCatBtn.textContent = "+ Add Category";
//       addCatBtn.onclick = () => {
//         const newCat = prompt("New category name:");
//         if (newCat && !userData[newCat]) {
//           userData[newCat] = ["Edit me"];
//           renderPromptEditor(promptData);
//         }
//       };
//       sectionDiv.appendChild(addCatBtn);
//     }

//     userWrapper.appendChild(sectionDiv);
//     form.appendChild(userWrapper);
//   });

//   if (isEditing) {
//     const addUserBtn = document.createElement("button");
//     addUserBtn.type = "button";
//     addUserBtn.textContent = "+ Add User";
//     addUserBtn.onclick = () => {
//       const newUser = prompt("Enter new user ID:");
//       if (newUser && !promptData[newUser]) {
//         promptData[newUser] = { "New_Category": ["Edit me"] };
//         renderPromptEditor(promptData);
//       }
//     };
//     form.appendChild(addUserBtn);
//   }

//   if (isEditing) {
//     const saveBtn = document.createElement("button");
//     saveBtn.type = "submit";
//     saveBtn.textContent = "💾 Save";
//     saveBtn.style.marginTop = "1rem";
//     form.appendChild(saveBtn);
//   }

//   form.onsubmit = (e) => {
//     e.preventDefault();
//     const updated = {};

//     const fields = form.querySelectorAll("textarea");
//     fields.forEach(field => {
//       const [user, category] = field.name.split("__");
//       if (!updated[user]) updated[user] = {};
//       updated[user][category] = field.value.split("\n").map(l => l.trim()).filter(Boolean);
//     });

//     if (!updated.default || Object.keys(updated.default).length === 0) {
//       alert("❌ 'default' section must exist and contain at least one category.");
//       return;
//     }

//     fetch("/api/prompts", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(updated, null, 2)
//     })
//       .then(res => res.json())
//       .then(res => {
//         if (res.success) {
//           alert("✅ Prompts saved.");
//           isEditing = false;
//           promptData = updated;
//           renderPromptEditor(promptData);
//         } else {
//           alert("❌ Failed to save.");
//         }
//       })
//       .catch(() => alert("❌ Error saving prompts."));
//   };

//   formContainer.appendChild(form);
// }



// function togglePromptEdit() {
//   isEditing = !isEditing;
//   loadPromptPage(); // Reload the prompt editor with edit mode toggled
// }

// Unified edit/save/cancel control logic across pages
// Unified edit/save/cancel control logic across pages
let currentPage = 'config';
let isEditing = false;
let currentIgnoredContacts = [];
let promptData = {};

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('themeToggleBtn').textContent = isDark ? '🌙' : '🌞';
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem('theme');
  if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  } else if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  document.getElementById('themeToggleBtn').textContent = document.body.classList.contains('dark-mode') ? '🌙' : '🌞';

  document.querySelectorAll('.sidebar-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const page = button.getAttribute('data-page');
      currentPage = page;
      isEditing = false;
      updateGlobalControls();
      renderCurrentPage();
    });
  });

  // Hook global buttons
  document.getElementById("editBtn").onclick = () => {
    isEditing = true;
    updateGlobalControls();
    renderCurrentPage();
  };
  document.getElementById("cancelBtn").onclick = () => {
    isEditing = false;
    updateGlobalControls();
    renderCurrentPage();
  };
  document.getElementById("saveBtn").onclick = () => {
    saveCurrentPage();
  };

  renderCurrentPage();
});

function updateGlobalControls() {
  document.getElementById("editBtn").style.display = isEditing ? "none" : "inline-block";
  document.getElementById("cancelBtn").style.display = isEditing ? "inline-block" : "none";
  document.getElementById("saveBtn").style.display = isEditing ? "inline-block" : "none";
}

function renderCurrentPage() {
  const container = document.getElementById("formContainer");
  container.innerHTML = "";
  if (currentPage === 'config') {
    document.querySelector(".content h1").textContent = "Whatsapp Assistant Configuration";
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        renderConfigEditor(data);
        const label = document.getElementById("accountLabel");
        if (label) {
          label.title = data.admin;
          label.querySelector("strong").textContent = data.recipient;
        }
      })
      .catch(err => {
        container.innerText = "Failed to load configuration.";
        console.error(err);
      });
  } else if (currentPage === 'prompts') {
    document.querySelector(".content h1").textContent = "Prompt Configuration";
    container.innerHTML = `<div style="padding: 1em;"><h2>Loading Prompts...</h2></div>`;
    fetch('/api/prompts')
      .then(res => res.json())
      .then(data => {
        promptData = structuredClone(data);
        renderPromptEditor(promptData);
      })
      .catch(err => {
        container.innerHTML = `<p>❌ Failed to load prompts.json</p>`;
        console.error(err);
      });
  }
}

function saveCurrentPage() {
  if (currentPage === 'config') {
    const form = document.getElementById("configForm");
    const ignoredInputs = form.querySelectorAll("input[name='ignoredContacts']");
    currentIgnoredContacts = Array.from(ignoredInputs).map(input => input.value.trim()).filter(Boolean);
    if (form) form.requestSubmit();
  } else if (currentPage === 'prompts') {
    const updated = {};
    const fields = document.querySelectorAll("#promptEditorForm textarea");
    fields.forEach(field => {
      const [user, category] = field.name.split("__");
      if (!updated[user]) updated[user] = {};
      updated[user][category] = field.value.split("\n").map(l => l.trim()).filter(Boolean);
    });
    if (!updated.default || Object.keys(updated.default).length === 0) {
      alert("❌ 'default' section must exist and contain at least one category.");
      return;
    }
    fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated, null, 2)
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          alert("✅ Prompts saved.");
          isEditing = false;
          promptData = updated;
          updateGlobalControls();
          renderPromptEditor(promptData);
        } else {
          alert("❌ Failed to save prompts.");
        }
      })
      .catch(() => alert("❌ Error saving prompts."));
  }
}

function renderConfigEditor(data) {
  const container = document.getElementById("formContainer");
  container.innerHTML = '';

  const formWrapper = document.createElement("form");
  formWrapper.className = "config-form";
  formWrapper.id = "configForm";

  const createInputRow = (key, value, type = 'text') => {
    const row = document.createElement("div");
    row.className = "form-row";
    const label = document.createElement("label");
    label.textContent = key;
    row.appendChild(label);
    const input = document.createElement("input");
    input.name = key;
    input.value = value;
    input.type = type;
    input.readOnly = !isEditing;
    if (type === 'checkbox') {
      input.checked = value;
      input.disabled = !isEditing;
    }
    row.appendChild(input);
    return row;
  };

  const createFieldset = (legendText, rows) => {
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = legendText;
    fieldset.appendChild(legend);
    rows.forEach(row => fieldset.appendChild(row));
    return fieldset;
  };

  const basicInfoRows = [
    createInputRow("admin", data.admin),
    createInputRow("recipient", data.recipient),
    createInputRow("location", data.location),
    createInputRow("timezone", data.timezone)
  ];

  const modelSettingsRows = [
    createInputRow("selectedModel", data.selectedModel),
    createInputRow("maxTokens", data.maxTokens, "number"),
    createInputRow("hCount", data.hCount, "number"),
    createInputRow("debug", data.debug, "checkbox")
  ];

  const pathsApiRows = [
    createInputRow("apiFolder", data.apiFolder),
    createInputRow("promptsFilePath", data.promptsFilePath),
    createInputRow("promptsReloadIntervalMs", data.promptsReloadIntervalMs, "number"),
    createInputRow("ollama.baseUrl", data.ollama?.baseUrl || '')
  ];

  const filtersRows = [
    createInputRow("invertIgnore", data.invertIgnore, "checkbox")
  ];

  const ignoredRow = document.createElement("div");
  ignoredRow.className = "form-row list-row";
  const label = document.createElement("label");
  label.textContent = "Ignored Contacts:";
  ignoredRow.appendChild(label);
  const listContent = document.createElement("div");
  listContent.className = "list-content";
  listContent.id = "ignoredList";
  ignoredRow.appendChild(listContent);
  filtersRows.push(ignoredRow);

  formWrapper.appendChild(createFieldset("Basic Info", basicInfoRows));
  formWrapper.appendChild(createFieldset("Model Settings", modelSettingsRows));
  formWrapper.appendChild(createFieldset("Paths & API", pathsApiRows));
  formWrapper.appendChild(createFieldset("Filters", filtersRows));

  formWrapper.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(formWrapper);
    const updatedConfig = {
      admin: formData.get("admin"),
      recipient: formData.get("recipient"),
      location: formData.get("location"),
      timezone: formData.get("timezone"),
      selectedModel: formData.get("selectedModel"),
      maxTokens: Number(formData.get("maxTokens")),
      hCount: Number(formData.get("hCount")),
      debug: formWrapper.querySelector('input[name="debug"]').checked,
      apiFolder: formData.get("apiFolder"),
      promptsFilePath: formData.get("promptsFilePath"),
      promptsReloadIntervalMs: Number(formData.get("promptsReloadIntervalMs")),
      ollama: {
        baseUrl: formData.get("ollama.baseUrl")
      },
      invertIgnore: formWrapper.querySelector('input[name="invertIgnore"]').checked,
      ignoredContacts: currentIgnoredContacts
    };

    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedConfig, null, 2)
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          alert("✅ Config saved.");
          isEditing = false;
          updateGlobalControls();
          renderConfigEditor(updatedConfig);
        } else {
          alert("❌ Failed to save.");
        }
      })
      .catch(() => alert("❌ Error saving config."));
  };

  container.appendChild(formWrapper);
  currentIgnoredContacts = data.ignoredContacts || [];
  renderIgnoredContacts(currentIgnoredContacts);
}

function renderIgnoredContacts(contactArray) {
  const listContent = document.getElementById("ignoredList");
  if (!listContent) return;
  listContent.innerHTML = '';

  if (!isEditing) {
    const ul = document.createElement("ul");
    ul.className = "readonly-list";
    contactArray.forEach(contact => {
      const li = document.createElement("li");
      li.textContent = contact;
      ul.appendChild(li);
    });
    listContent.appendChild(ul);
    return;
  }

  contactArray.forEach((contact, idx) => {
    const row = document.createElement("div");
    row.style.display = 'flex';
    row.style.marginBottom = '4px';
    row.style.gap = '0.5rem';

    const input = document.createElement("input");
    input.type = "text";
    input.name = "ignoredContacts";
    input.value = contact;
    row.appendChild(input);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "–";
    removeBtn.title = "Remove contact";
    removeBtn.onclick = () => {
      currentIgnoredContacts.splice(idx, 1);
      renderIgnoredContacts(currentIgnoredContacts);
    };
    row.appendChild(removeBtn);

    listContent.appendChild(row);
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "+ Add Contact";
  addBtn.onclick = () => {
    currentIgnoredContacts.push('');
    renderIgnoredContacts(currentIgnoredContacts);
  };
  listContent.appendChild(addBtn);
}

function renderPromptEditor(data) {
  const container = document.getElementById("formContainer");
  container.innerHTML = '';

  const form = document.createElement("form");
  form.id = "promptEditorForm";
  form.className = "prompt-form";

  Object.entries(data).forEach(([userKey, categories]) => {
    const userSection = document.createElement("div");
    userSection.className = "prompt-user-section";

    const userHeader = document.createElement("div");
    userHeader.className = "prompt-user-header";

    const userTitle = document.createElement("h3");
    userTitle.textContent = userKey === "default" ? "default (system)" : userKey;

    userHeader.appendChild(userTitle);

    if (isEditing && userKey !== "default") {

        const usrbtnGroup = document.createElement("div");
        usrbtnGroup.className = "prompt-btn-group";

      const renameBtn = document.createElement("button");
      renameBtn.type = "button";
      renameBtn.textContent = "✏️👤";
      renameBtn.onclick = () => {
        const newUser = prompt("New user key:", userKey);
        if (newUser && !data[newUser]) {
          data[newUser] = data[userKey];
          delete data[userKey];
          renderPromptEditor(data);
        }
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "🗑️👤";
      deleteBtn.onclick = () => {
        delete data[userKey];
        renderPromptEditor(data);
      };

      usrbtnGroup.appendChild(renameBtn);
      usrbtnGroup.appendChild(deleteBtn);
      userHeader.appendChild(usrbtnGroup);
    }

    userSection.appendChild(userHeader);

    Object.entries(categories).forEach(([categoryKey, lines]) => {
      const catBlock = document.createElement("div");
      catBlock.className = "prompt-category";

      const catLabel = document.createElement("label");
      catLabel.textContent = categoryKey;
      catBlock.appendChild(catLabel);

      const textarea = document.createElement("textarea");
      textarea.name = `${userKey}__${categoryKey}`;
      textarea.value = lines.join("\n");
      textarea.rows = Math.max(4, lines.length + 1);
      textarea.readOnly = !isEditing;
      catBlock.appendChild(textarea);

      if (isEditing) {
        const btnGroup = document.createElement("div");
        btnGroup.className = "prompt-btn-group";

        const renameCatBtn = document.createElement("button");
        renameCatBtn.type = "button";
        renameCatBtn.textContent = "✏️ Rename";
        renameCatBtn.onclick = () => {
          const newCat = prompt("Rename category:", categoryKey);
          if (newCat && !data[userKey][newCat]) {
            data[userKey][newCat] = data[userKey][categoryKey];
            delete data[userKey][categoryKey];
            renderPromptEditor(data);
          }
        };

        const deleteCatBtn = document.createElement("button");
        deleteCatBtn.type = "button";
        deleteCatBtn.textContent = "❌ Delete";
        deleteCatBtn.onclick = () => {
          delete data[userKey][categoryKey];
          renderPromptEditor(data);
        };

        btnGroup.appendChild(renameCatBtn);
        btnGroup.appendChild(deleteCatBtn);
        catBlock.appendChild(btnGroup);
      }

      userSection.appendChild(catBlock);
    });

    if (isEditing) {
      const addCatBtn = document.createElement("button");
      addCatBtn.type = "button";
      addCatBtn.textContent = "+ Add Category";
      addCatBtn.className = "add-category-btn";
      addCatBtn.onclick = () => {
        const newCat = prompt("New category name:");
        if (newCat && !data[userKey][newCat]) {
          data[userKey][newCat] = ["Edit me"];
          renderPromptEditor(data);
        }
      };
      userSection.appendChild(addCatBtn);
    }

    form.appendChild(userSection);
  });

  if (isEditing) {
    const addUserBtn = document.createElement("button");
    addUserBtn.type = "button";
    addUserBtn.textContent = "+ Add User";
    addUserBtn.className = "add-user-btn";
    addUserBtn.onclick = () => {
      const newUser = prompt("Enter new user key:");
      if (newUser && !data[newUser]) {
        data[newUser] = { "New_Category": ["Edit me"] };
        renderPromptEditor(data);
      }
    };
    form.appendChild(addUserBtn);
  }

  container.appendChild(form);
}

let data = [
  {
    title: "D&D",
    collections: [
      {
        title: "Campaign Notes",
        items: [
          {
            title: "Session 1",
            content: {
              text: "Fought goblins",
              checklist: [{ text: "Looted treasure", done: false }],
              images: ["https://placehold.co/400"],
              video: "",
              links: ["https://example.com"]
            }
          }
        ]
      }
    ]
  }
];

const booksContainer = document.getElementById("books-container");
const collectionsContainer = document.getElementById("collections-container");
const itemsContainer = document.getElementById("items-container");

const addBookBtn = document.getElementById("add-book-btn");
const addCollectionBtn = document.getElementById("add-collection-btn");
const addItemBtn = document.getElementById("add-item-btn");

let currentBook = null;
let currentCollection = null;

// ------------------ INLINE EDITING FOR BOOKS/COLLECTIONS ------------------
function enableInlineEditing(el, saveCallback) {
  el.addEventListener("dblclick", () => {
    const oldText = el.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldText;
    input.style.width = "100%";
    el.replaceWith(input);
    input.focus();

    const save = () => {
      const newText = input.value.trim() || oldText;
      saveCallback(newText);
      input.replaceWith(el);
      el.textContent = newText;
    };

    input.addEventListener("blur", save);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") save();
      if (e.key === "Escape") input.replaceWith(el); // Cancel editing
    });
  });
}

// ------------------ RENDER FUNCTIONS ------------------
function renderBooks() {
  booksContainer.innerHTML = "";
  data.forEach((book, idx) => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.textContent = book.title;

    // Select book on click
    card.addEventListener("click", () => selectBook(idx));

    // Inline edit on double-click
    enableInlineEditing(card, newText => book.title = newText);

    // Drag & drop
    card.draggable = true;
    card.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", idx));
    card.addEventListener("dragover", e => e.preventDefault());
    card.addEventListener("drop", e => {
      e.preventDefault();
      const fromIdx = e.dataTransfer.getData("text/plain");
      const moved = data.splice(fromIdx, 1)[0];
      data.splice(idx, 0, moved);
      renderBooks();
    });

    booksContainer.appendChild(card);
  });
}

function renderCollections() {
  collectionsContainer.innerHTML = "";
  if (!currentBook) return;
  currentBook.collections.forEach((col, idx) => {
    const tab = document.createElement("div");
    tab.className = "collection-tab";
    tab.textContent = col.title;

    // Select collection on click
    tab.addEventListener("click", () => selectCollection(idx));

    // Inline edit on double-click
    enableInlineEditing(tab, newText => col.title = newText);

    // Drag & drop
    tab.draggable = true;
    tab.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", idx));
    tab.addEventListener("dragover", e => e.preventDefault());
    tab.addEventListener("drop", e => {
      e.preventDefault();
      const fromIdx = e.dataTransfer.getData("text/plain");
      const moved = currentBook.collections.splice(fromIdx, 1)[0];
      currentBook.collections.splice(idx, 0, moved);
      renderCollections();
    });

    if (idx === 0) tab.classList.add("active");
    collectionsContainer.appendChild(tab);
  });
}

function renderItems() {
  itemsContainer.innerHTML = "";
  if (!currentCollection) return;

  currentCollection.items.forEach((item, idx) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item";

    const acc = document.createElement("div");
    acc.className = "accordion";
    acc.textContent = item.title;

    const content = document.createElement("div");
    content.className = "accordion-content";

    // Build accordion content (text, checklist, images, video, links)
    content.innerHTML = `
      <p>${item.content.text || ""}</p>
      ${(item.content.checklist || []).map(c => `
        <div class="checklist-item">
          <input type="checkbox" ${c.done ? "checked" : ""}>
          ${c.text}
        </div>
      `).join("")}
      ${(item.content.images || []).map(src => `<img src="${src}">`).join("")}
      ${item.content.video ? `<iframe width='300' height='169' src='${item.content.video}' frameborder='0' allowfullscreen></iframe>` : ""}
      ${(item.content.links || []).map(l => `<div><a href="${l}" target="_blank">${l}</a></div>`).join("")}
    `;

    acc.addEventListener("click", () => {
      acc.classList.toggle("active");
      content.style.maxHeight = acc.classList.contains("active") ? content.scrollHeight + "px" : null;
    });

    // Drag & drop
    itemDiv.draggable = true;
    itemDiv.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", idx));
    itemDiv.addEventListener("dragover", e => e.preventDefault());
    itemDiv.addEventListener("drop", e => {
      e.preventDefault();
      const fromIdx = e.dataTransfer.getData("text/plain");
      const moved = currentCollection.items.splice(fromIdx, 1)[0];
      currentCollection.items.splice(idx, 0, moved);
      renderItems();
    });

    // Double-click opens full-page item editor
    itemDiv.addEventListener("dblclick", () => openItemEditor(item));

    itemDiv.appendChild(acc);
    itemDiv.appendChild(content);
    itemsContainer.appendChild(itemDiv);
  });
}



// ------------------ SELECTION ------------------
function selectBook(idx) {
  currentBook = data[idx];
  currentCollection = currentBook.collections[0] || null;
  renderCollections();
  renderItems();
  addCollectionBtn.disabled = false;
  addItemBtn.disabled = !currentCollection;
}

function selectCollection(idx) {
  currentCollection = currentBook.collections[idx];
  document.querySelectorAll(".collection-tab").forEach((t,i) => t.classList.toggle("active", i===idx));
  renderItems();
  addItemBtn.disabled = false;
}

// ------------------ ADD BUTTONS ------------------
// ---------- Add Book Inline ----------
addBookBtn.addEventListener("click", () => {
  const newBook = { title: "", collections: [] };
  data.push(newBook);
  renderBooks();

  // Focus on the new book card
  const lastCard = booksContainer.lastChild;
  const input = document.createElement("input");
  input.type = "text";
  input.value = "";
  lastCard.replaceWith(input);
  input.focus();

  // Save on blur or Enter
  const save = () => {
    newBook.title = input.value.trim() || "New Book";
    renderBooks();
  };
  input.addEventListener("blur", save);
  input.addEventListener("keydown", e => { if (e.key === "Enter") save(); });
});

// ---------- Add Collection Inline ----------
addCollectionBtn.addEventListener("click", () => {
  if (!currentBook) return;
  const newCol = { title: "", items: [] };
  currentBook.collections.push(newCol);
  renderCollections();

  // Focus on the new collection tab
  const lastTab = collectionsContainer.lastChild;
  const input = document.createElement("input");
  input.type = "text";
  input.value = "";
  lastTab.replaceWith(input);
  input.focus();

  const save = () => {
    newCol.title = input.value.trim() || "New Collection";
    renderCollections();
  };
  input.addEventListener("blur", save);
  input.addEventListener("keydown", e => { if (e.key === "Enter") save(); });
});

// ---------- Add Item Directly Opens Editor ----------
addItemBtn.addEventListener("click", () => {
  if (!currentCollection) return;
  const newItem = { title: "New Item", content: { text:"", checklist: [], images: [], video:"", links: [] } };
  currentCollection.items.push(newItem);
  openItemEditor(newItem); // open full-page editor immediately
});


//----------------
// Item Editor
//----------------


// === Item Editor Integration ===
const editorContainer = document.getElementById("item-editor-container");
const editorTitle = document.getElementById("editor-title");
const editorContent = document.getElementById("editor-content");
const checklistUl = document.getElementById("checklist-items");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const deleteBtn = document.getElementById("delete-btn");
const addChecklistBtn = document.getElementById("add-checklist-btn");
const addImageBtn = document.getElementById("add-image-btn");
const addVideoBtn = document.getElementById("add-video-btn");
const addLinkBtn = document.getElementById("add-link-btn");

let editingItem = null;

// Double-click to open editor
function setupItemEditing() {
  document.querySelectorAll(".item").forEach(itemDiv => {
    itemDiv.addEventListener("dblclick", () => {
      const title = itemDiv.querySelector(".accordion").textContent.trim();
      editingItem = currentCollection.items.find(i => i.title === title);
      openItemEditor(editingItem);
    });
  });
}


function openItemEditor(item) {
  // Hide the main UI
  document.getElementById("menu-bar").style.display = "none";
  booksContainer.style.display = "none";
  collectionsContainer.style.display = "none";
  itemsContainer.style.display = "none";

  // Show the editor
  editorContainer.classList.remove("hidden");

  // Set title
  editorTitle.value = item.title;

  // Build full WYSIWYG content: text + images + video + links
  editorContent.innerHTML = `
    <p>${item.content.text || ""}</p>
    ${(item.content.images || []).map(src => `<img src="${src}">`).join("")}
    ${item.content.video ? `<iframe width="400" height="225" src="${item.content.video}" frameborder="0" allowfullscreen></iframe>` : ""}
    ${(item.content.links || []).map(l => `<div><a href="${l}" target="_blank">${l}</a></div>`).join("")}
  `;

  // Render checklist separately
  renderChecklist(item.content.checklist);

  // Assign the current item to editingItem so Save/Delete buttons work
  editingItem = item;
}


function renderChecklist(checklist) {
  checklistUl.innerHTML = "";
  (checklist || []).forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${c.done ? "checked" : ""}>
      <input type="text" value="${c.text}">
      <button>×</button>
    `;
    li.querySelector("button").addEventListener("click", () => li.remove());
    checklistUl.appendChild(li);
  });
}

// Toolbar formatting commands
document.querySelectorAll("#toolbar-buttons button[data-command]").forEach(btn => {
  btn.addEventListener("click", () => {
    const command = btn.getAttribute("data-command");
    document.execCommand(command, false, null);
    editorContent.focus();
  });
});

// Add media + link buttons
addImageBtn.addEventListener("click", () => {
  const url = prompt("Enter image URL:");
  if (url) document.execCommand("insertImage", false, url);
});
addVideoBtn.addEventListener("click", () => {
  const url = prompt("Enter YouTube embed URL (iframe src):");
  if (url) {
    const iframe = `<iframe width='400' height='225' src='${url}' frameborder='0' allowfullscreen></iframe>`;
    document.execCommand("insertHTML", false, iframe);
  }
});
addLinkBtn.addEventListener("click", () => {
  const url = prompt("Enter link URL:");
  if (url) document.execCommand("createLink", false, url);
});

// Add checklist item
addChecklistBtn.addEventListener("click", () => {
  const li = document.createElement("li");
  li.innerHTML = `
    <input type="checkbox">
    <input type="text" placeholder="New checklist item">
    <button>×</button>
  `;
  li.querySelector("button").addEventListener("click", () => li.remove());
  checklistUl.appendChild(li);
});

// Cancel
cancelBtn.addEventListener("click", () => {
  closeEditor();
});

// Delete
deleteBtn.addEventListener("click", () => {
  if (!editingItem) return;
  if (confirm(`Delete "${editingItem.title}"?`)) {
    currentCollection.items = currentCollection.items.filter(i => i !== editingItem);
    closeEditor();
    selectCollection(currentCollection, document.querySelector(".collection-tab.active"));
  }
});

// Save
saveBtn.addEventListener("click", () => {
  if (!editingItem) return;
  editingItem.title = editorTitle.value;
  editingItem.content.text = editorContent.innerHTML;
  editingItem.content.checklist = Array.from(checklistUl.children).map(li => ({
    text: li.querySelector('input[type="text"]').value,
    done: li.querySelector('input[type="checkbox"]').checked
  }));

  closeEditor();
  selectCollection(currentCollection, document.querySelector(".collection-tab.active"));
});


function closeEditor() {
  editorContainer.classList.add("hidden");
  document.getElementById("menu-bar").style.display = "";
  booksContainer.style.display = "";
  collectionsContainer.style.display = "";
  itemsContainer.style.display = "";
  editingItem = null;
}

// Re-enable double-click after rendering items
const oldSelectCollection = selectCollection;
selectCollection = function(collection, tabElement) {
  oldSelectCollection(collection, tabElement);
  setupItemEditing();
};


// ------------------ INITIAL RENDER ------------------
renderBooks();

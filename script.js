const data = [
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
          },
          {
            title: "Session 2",
            content: {
              text: "Visited town",
              checklist: [{ text: "Bought potions", done: true }],
              images: [],
              video: "",
              links: []
            }
          }
        ]
      },
      {
        title: "Character Sheets",
        items: [
          { title: "Thorin", content: { text: "Dwarf Fighter", checklist: [], images: [], video: "", links: [] } },
          { title: "Elyra", content: { text: "Elf Wizard", checklist: [], images: [], video: "", links: [] } }
        ]
      },
      {
        title: "World Lore",
        items: [
          { title: "Kingdoms", content: { text: "Five kingdoms exist", checklist: [], images: [], video: "", links: [] } }
        ]
      }
    ]
  },
  {
    title: "Books I've Read",
    collections: [
      { title: "Fantasy", items: Array.from({ length: 10 }, (_, i) => ({ title: `Fantasy Book ${i + 1}`, content: { text: "Lorem ipsum...", checklist: [], images: [], video: "", links: [] } })) },
      { title: "Sci-Fi", items: Array.from({ length: 10 }, (_, i) => ({ title: `Sci-Fi Book ${i + 1}`, content: { text: "Lorem ipsum...", checklist: [], images: [], video: "", links: [] } })) },
      { title: "Mystery", items: Array.from({ length: 10 }, (_, i) => ({ title: `Mystery Book ${i + 1}`, content: { text: "Lorem ipsum...", checklist: [], images: [], video: "", links: [] } })) },
      { title: "Non-Fiction", items: Array.from({ length: 10 }, (_, i) => ({ title: `Non-Fiction Book ${i + 1}`, content: { text: "Lorem ipsum...", checklist: [], images: [], video: "", links: [] } })) },
      { title: "Biography", items: Array.from({ length: 10 }, (_, i) => ({ title: `Biography Book ${i + 1}`, content: { text: "Lorem ipsum...", checklist: [], images: [], video: "", links: [] } })) },
      { title: "Self-Help", items: Array.from({ length: 10 }, (_, i) => ({ title: `Self-Help Book ${i + 1}`, content: { text: "Lorem ipsum...", checklist: [], images: [], video: "", links: [] } })) }
    ]
  },
  {
    title: "Consulting",
    collections: [
      {
        title: "Project A",
        items: [
          {
            title: "Meeting Notes",
            content: {
              text: "Discussed roadmap",
              checklist: [{ text: "Follow up with client", done: false }],
              images: [],
              video: "",
              links: []
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

let currentBook = null;
let currentCollection = null;

// Render Books Grid
data.forEach(book => {
  const card = document.createElement("div");
  card.className = "book-card";
  card.textContent = book.title;
  card.addEventListener("click", () => selectBook(book));
  booksContainer.appendChild(card);
});

function selectBook(book) {
  currentBook = book;
  collectionsContainer.innerHTML = "";
  itemsContainer.innerHTML = "";
  book.collections.forEach((collection, idx) => {
    const tab = document.createElement("div");
    tab.className = "collection-tab";
    if (idx === 0) tab.classList.add("active");
    tab.textContent = collection.title;
    tab.addEventListener("click", () => selectCollection(collection, tab));
    collectionsContainer.appendChild(tab);
    if (idx === 0) selectCollection(collection, tab);
  });
  enableCollectionDrag();
}

function selectCollection(collection, tabElement) {
  currentCollection = collection;
  itemsContainer.innerHTML = "";
  document.querySelectorAll(".collection-tab").forEach(tab => tab.classList.remove("active"));
  tabElement.classList.add("active");

  collection.items.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item";
    itemDiv.innerHTML = `
      <div class="accordion">${item.title}</div>
      <div class="accordion-content">
        <p>${item.content.text || ""}</p>
        ${(item.content.checklist || [])
          .map(c => `<div class='checklist-item'><input type='checkbox' ${c.done ? "checked" : ""}>${c.text}</div>`)
          .join("")}
        ${(item.content.images || [])
          .map(src => `<img src='${src}'>`)
          .join("")}
        ${item.content.video ? `<iframe width='300' height='169' src='${item.content.video}' frameborder='0' allowfullscreen></iframe>` : ""}
        ${(item.content.links || [])
          .map(l => `<div><a href='${l}' target='_blank'>${l}</a></div>`)
          .join("")}
      </div>`;
    itemsContainer.appendChild(itemDiv);
  });

  setupAccordions();
  enableItemDrag();
}

function setupAccordions() {
  document.querySelectorAll(".accordion").forEach(acc => {
    acc.addEventListener("click", function () {
      this.classList.toggle("active");
      const content = this.nextElementSibling;
      if (this.classList.contains("active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });
}

function enableBookDrag() {
  const bookCards = document.querySelectorAll(".book-card");
  bookCards.forEach((card, idx) => {
    card.draggable = true;
    card.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", idx);
      card.style.opacity = 0.5;
    });
    card.addEventListener("dragend", () => {
      card.style.opacity = 1;
    });
    card.addEventListener("dragover", e => {
      e.preventDefault();
      card.style.border = "2px dashed #4CAF50";
    });
    card.addEventListener("dragleave", () => {
      card.style.border = "1px solid #ccc";
    });
    card.addEventListener("drop", e => {
      e.preventDefault();
      const fromIdx = e.dataTransfer.getData("text/plain");
      const toIdx = idx;
      const moved = data.splice(fromIdx, 1)[0];
      data.splice(toIdx, 0, moved);
      booksContainer.innerHTML = "";
      data.forEach(book => {
        const newCard = document.createElement("div");
        newCard.className = "book-card";
        newCard.textContent = book.title;
        newCard.addEventListener("click", () => selectBook(book));
        booksContainer.appendChild(newCard);
      });
      enableBookDrag();
    });
  });
}
enableBookDrag();

function enableCollectionDrag() {
  const tabs = document.querySelectorAll(".collection-tab");
  tabs.forEach((tab, idx) => {
    tab.draggable = true;
    tab.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", idx);
    });
    tab.addEventListener("dragover", e => {
      e.preventDefault();
      tab.style.background = "#ddd";
    });
    tab.addEventListener("dragleave", () => {
      tab.style.background = tab.classList.contains("active") ? "#4CAF50" : "#f1f1f1";
    });
    tab.addEventListener("drop", e => {
      e.preventDefault();
      const fromIdx = e.dataTransfer.getData("text/plain");
      const toIdx = idx;
      const moved = currentBook.collections.splice(fromIdx, 1)[0];
      currentBook.collections.splice(toIdx, 0, moved);
      selectBook(currentBook);
    });
  });
}

function enableItemDrag() {
  const items = document.querySelectorAll("#items-container .item");
  items.forEach((item, idx) => {
    item.draggable = true;
    item.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", idx);
      item.style.opacity = 0.5;
    });
    item.addEventListener("dragend", () => {
      item.style.opacity = 1;
    });
    item.addEventListener("dragover", e => {
      e.preventDefault();
      item.style.border = "2px dashed #4CAF50";
    });
    item.addEventListener("dragleave", () => {
      item.style.border = "1px solid #ddd";
    });
    item.addEventListener("drop", e => {
      e.preventDefault();
      const fromIdx = e.dataTransfer.getData("text/plain");
      const toIdx = idx;
      const moved = currentCollection.items.splice(fromIdx, 1)[0];
      currentCollection.items.splice(toIdx, 0, moved);
      selectCollection(currentCollection, document.querySelector(".collection-tab.active"));
    });
  });
}

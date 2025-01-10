const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const NOTES_FILE = path.join(__dirname, "../data/notes.json");

const loadNotes = () => {
  try {
    return JSON.parse(fs.readFileSync(NOTES_FILE, "utf8"));
  } catch (error) {
    return [];
  }
};

const saveNotes = (notes) => {
  if (!fs.existsSync(path.dirname(NOTES_FILE))) {
    fs.mkdirSync(path.dirname(NOTES_FILE), { recursive: true });
  }
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
};
const mainMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "Add Note",
        "List Notes",
        "Search Notes",
        "Add Tag to Note",
        "Search by Tag",
        "Delete Note",
        "Exit",
      ],
    },
  ]);

  switch (action) {
    case "Add Note":
      return addNotePrompt();
    case "List Notes":
      return listNotes();
    case "Search Notes":
      return searchNotesPrompt();
    case "Add Tag to Note":
      return addTagPrompt();
    case "Search by Tag":
      return searchByTagPrompt();
    case "Delete Note":
      return deleteNotePrompt();
    case "Exit":
      return console.log("Goodbye!");
  }
};

const addNotePrompt = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Enter note title:",
    },
    {
      type: "input",
      name: "content",
      message: "Enter note content:",
    },
    {
      type: "input",
      name: "tags",
      message: "Enter tags (comma-separated):",
    },
  ]);

  const tags = answers.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  addNote(answers.title, answers.content, tags);
  await continuePrompt();
};

const searchNotesPrompt = async () => {
  const { query } = await inquirer.prompt([
    {
      type: "input",
      name: "query",
      message: "Enter search term:",
    },
  ]);
  searchNotes(query);
  await continuePrompt();
};

const addTagPrompt = async () => {
  const notes = loadNotes();
  const { noteId } = await inquirer.prompt([
    {
      type: "list",
      name: "noteId",
      message: "Select note to tag:",
      choices: notes.map((note) => ({
        name: `${note.title} (${note.id})`,
        value: note.id,
      })),
    },
  ]);

  const { tag } = await inquirer.prompt([
    {
      type: "input",
      name: "tag",
      message: "Enter new tag:",
    },
  ]);

  addTag(noteId, tag);
  await continuePrompt();
};

const searchByTagPrompt = async () => {
  const { tag } = await inquirer.prompt([
    {
      type: "input",
      name: "tag",
      message: "Enter tag to search for:",
    },
  ]);
  searchByTag(tag);
  await continuePrompt();
};

const continuePrompt = async () => {
  const { continue: shouldContinue } = await inquirer.prompt([
    {
      type: "confirm",
      name: "continue",
      message: "Would you like to continue?",
      default: true,
    },
  ]);

  if (shouldContinue) {
    await mainMenu();
  } else {
    console.log("Goodbye!");
  }
};

const addNote = (title, content, tags = []) => {
  const notes = loadNotes();
  const note = {
    id: Date.now().toString(),
    title,
    content,
    tags,
    createdAt: new Date().toISOString(),
  };
  notes.push(note);
  saveNotes(notes);
  console.log("Note added successfully!");
  return note;
};

const deleteNote = (noteId) => {
  const notes = loadNotes();
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex === -1) {
    console.log("Note not found!");
    return false;
  }

  notes.splice(noteIndex, 1);
  saveNotes(notes);
  console.log("Note deleted successfully!");
  return true;
};

const deleteNotePrompt = async () => {
  const notes = loadNotes();
  if (notes.length === 0) {
    console.log("No notes to delete!");
    return await continuePrompt();
  }

  const { noteId } = await inquirer.prompt([
    {
      type: "list",
      name: "noteId",
      message: "Select note to delete:",
      choices: notes.map((note) => ({
        name: `${note.title} (${note.id})`,
        value: note.id,
      })),
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Are you sure you want to delete this note?",
      default: false,
    },
  ]);

  if (confirm) {
    deleteNote(noteId);
  }
  await continuePrompt();
};

const listNotes = async () => {
  const notes = loadNotes();
  notes.forEach((note) => {
    console.log(`\nID: ${note.id}`);
    console.log(`Title: ${note.title}`);
    console.log(`Content: ${note.content}`);
    console.log(`Tags: ${note.tags.join(", ")}`);
    console.log(`Created: ${note.createdAt}`);
  });
  await continuePrompt();
};

const searchNotes = (query) => {
  const notes = loadNotes();
  const results = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase())
  );
  results.forEach((note) => {
    console.log(`\nID: ${note.id}`);
    console.log(`Title: ${note.title}`);
    console.log(`Content: ${note.content}`);
  });
};

const addTag = (noteId, tag) => {
  const notes = loadNotes();
  const noteIndex = notes.findIndex((note) => note.id === noteId);
  if (noteIndex === -1) {
    console.log("Note not found!");
    return;
  }
  if (!notes[noteIndex].tags.includes(tag)) {
    notes[noteIndex].tags.push(tag);
    saveNotes(notes);
    console.log("Tag added successfully!");
  }
};

const searchByTag = (tag) => {
  const notes = loadNotes();
  const results = notes.filter((note) => note.tags.includes(tag));
  results.forEach((note) => {
    console.log(`\nID: ${note.id}`);
    console.log(`Title: ${note.title}`);
    console.log(`Tags: ${note.tags.join(", ")}`);
  });
};

module.exports = {
  mainMenu,
  addNote,
  listNotes,
  searchNotes,
  addTag,
  searchByTag,
  deleteNote,
};

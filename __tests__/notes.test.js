const fs = require("fs");
const inquirer = require("inquirer");
const {
  mainMenu,
  addNote,
  listNotes,
  searchNotes,
  addTag,
} = require("../src/notes");

// Mock dependencies
jest.mock("fs");
jest.mock("inquirer");

describe("Notes CLI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.writeFileSync.mockClear();
    fs.readFileSync.mockClear();
  });

  // Test note operations
  describe("Note Operations", () => {
    test("should add a new note", () => {
      fs.readFileSync.mockReturnValue("[]");

      const note = addNote("Test Title", "Test Content", ["test-tag"]);

      expect(note).toHaveProperty("id");
      expect(note.title).toBe("Test Title");
      expect(note.content).toBe("Test Content");
      expect(note.tags).toEqual(["test-tag"]);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test("should add tag to existing note", () => {
      const mockNote = {
        id: "123",
        title: "Test",
        content: "Content",
        tags: [],
      };
      fs.readFileSync.mockReturnValue(JSON.stringify([mockNote]));

      addTag("123", "new-tag");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("new-tag")
      );
    });
  });

  // Test interactive menu
  describe("Interactive Menu", () => {
    test("should handle add note flow", async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ action: "Add Note" })
        .mockResolvedValueOnce({
          title: "Test Title",
          content: "Test Content",
          tags: "tag1, tag2",
        })
        .mockResolvedValueOnce({ continue: false });

      fs.readFileSync.mockReturnValue("[]");

      await mainMenu();

      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test("should handle search notes", async () => {
      const mockNotes = [
        {
          id: "123",
          title: "Test Note",
          content: "Search Content",
          tags: ["test"],
        },
      ];

      fs.readFileSync.mockReturnValue(JSON.stringify(mockNotes));

      const result = searchNotes("Search");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Test Note");
    });
  });

  // Test file operations
  describe("File Operations", () => {
    test("should create data directory if not exists", () => {
      fs.existsSync.mockReturnValue(false);
      fs.readFileSync.mockReturnValue("[]");

      addNote("Test", "Content", []);

      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    test("should handle file read errors", () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      const notes = listNotes();
      expect(notes).toEqual([]);
    });
  });
});

// src/utils/registerQuillModules.js
// Registers Quill extensions exactly once for the entire app.
// Import this file in any component that uses Quill before calling useQuill().

import Quill from "quill";
import QuillTableBetterModule from "quill-table-better";

const QuillTableBetter = QuillTableBetterModule.default || QuillTableBetterModule;

// Guard: only register if not already registered to prevent the
// "Overwriting modules/table-better" console warning.
if (!Quill.imports["modules/table-better"]) {
    Quill.register("modules/table-better", QuillTableBetter);
}

export { QuillTableBetter };

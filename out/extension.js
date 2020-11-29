// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const { execSync } = require('child_process');
function activate(context) {
    const enter = vscode.commands.registerCommand("checktext.checkText", (args) => __awaiter(this, void 0, void 0, function* () {
        yield checktext(args["language"]);
    }));
    context.subscriptions.push(enter);
}
exports.activate = activate;
function checktext(langs) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const lineNumber = editor.selection.active.line;
        const lineText = editor.document.lineAt(lineNumber).text;
        const lineLength = lineText.length;
        let line = editor.document.lineAt(editor.selection.active.line);
        let text = line.text.trim();
        let json = execSync(`do.pl '${text}' ${langs}`);
        json = JSON.parse(`${json}`);
        if (json["ok"] == "true") {
            yield shellcommand();
            yield vscode.commands.executeCommand("cursorRight");
            yield linebreak();
        }
        else {
            yield linebreak();
        }
        function linebreak() {
            return __awaiter(this, void 0, void 0, function* () {
                // Insert \n
                yield vscode.commands.executeCommand("lineBreakInsert");
                // Move to the right to set the cursor to the next line
                yield vscode.commands.executeCommand("cursorRight");
                // Get current line
                let newLine = yield editor.document.lineAt(editor.selection.active.line)
                    .text;
                // If it's blank, don't do anything
                if (newLine.length === 0)
                    return;
                // On lines containing only whitespace, we need to move to the right
                // to have the cursor at the correct indentation level.
                // Otherwise, we set the cursor to the beginning of the first word.
                if (newLine.match(/^\s+$/)) {
                    yield vscode.commands.executeCommand("cursorEnd");
                }
                else {
                    yield vscode.commands.executeCommand("cursorWordEndRight");
                    yield vscode.commands.executeCommand("cursorHome");
                }
            });
        }
        function shellcommand() {
            return __awaiter(this, void 0, void 0, function* () {
                // vscode.window.showInformationMessage("Edit text" + "from: " + line.text + " to: " + `${text.toString()}`);
                vscode.window.showInformationMessage(`${json["message"]}`);
                yield editor.edit(textEditor => {
                    textEditor.replace(new vscode.Range(new vscode.Position(lineNumber, line.firstNonWhitespaceCharacterIndex), new vscode.Position(lineNumber, lineLength)), json["to"]["code"]);
                });
            });
        }
    });
}
//# sourceMappingURL=extension.js.map
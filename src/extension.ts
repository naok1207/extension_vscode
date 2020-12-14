// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
"use strict";
import * as vscode from 'vscode';
const { execSync } = require('child_process');

export function activate(context: vscode.ExtensionContext) {
	const enter = vscode.commands.registerCommand("checktext.checkText", async (args) => {
		await checktext(args["language"]);
	});
	context.subscriptions.push(enter);
}

async function checktext(langs: string) {
  const editor: vscode.TextEditor = vscode.window.activeTextEditor;
  const lineNumber: number = editor.selection.active.line;
  const lineText: string = editor.document.lineAt(lineNumber).text;
  const lineLength: number = lineText.length;

  let line = editor.document.lineAt(editor.selection.active.line);
  let text = line.text.trim();

  let json = execSync(`do.pl '${text}' ${langs}`);
  json = JSON.parse(`${json}`);

  if (json["ok"] == "true") {
    if (json["from"]["code"].replace(/\s+/g, "") != json["to"]["code"].replace(/\s+/g, "")) {
      await showMessage()
    }
    await linebreak();
  } else {
    await linebreak();
  }

  async function linebreak() {
    // Insert \n
    await vscode.commands.executeCommand("lineBreakInsert");

    // Move to the right to set the cursor to the next line
    await vscode.commands.executeCommand("cursorRight");

    // Get current line
    let newLine = await editor.document.lineAt(editor.selection.active.line)
      .text;

    // If it's blank, don't do anything
    if (newLine.length === 0) return;

    // On lines containing only whitespace, we need to move to the right
    // to have the cursor at the correct indentation level.
    // Otherwise, we set the cursor to the beginning of the first word.
    if (newLine.match(/^\s+$/)) {
      await vscode.commands.executeCommand("cursorEnd");
    } else {
      await vscode.commands.executeCommand("cursorWordEndRight");
      await vscode.commands.executeCommand("cursorHome");
    }
  }

  async function showMessage() {
    const messageJudge = json["messages"][0]["message"];
    const messageExpr = json["messages"][1]["message"];
    const content = `${messageJudge}記述です。${json["to"]["language"]}の記述 '${json["to"]["code"]}' に修正しますか？`;
    if (messageExpr != '') {
      vscode.window.showInformationMessage(messageExpr);
    }
    const message = vscode.window.showInformationMessage( content,  "yes", "no" );
    message.then((value) => {
      if(value == 'yes') {
        changeText();
      }
    });
  }

  async function changeText() {
    await editor.edit(textEditor => {
      textEditor.replace(
        new vscode.Range(new vscode.Position(lineNumber, line.firstNonWhitespaceCharacterIndex), new vscode.Position(lineNumber, lineLength)),
        json["to"]["code"]
      );
    });
  }

  async function insertIndent() {
    await editor.edit(textEditor => {
      textEditor.insert(
        new vscode.Position(lineNumber + 1, 0),
        "\t".repeat(line.firstNonWhitespaceCharacterIndex / 2 + 1)
      )
    })
  }
}
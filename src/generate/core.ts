import * as vscode from "vscode";

import { ResultStream } from "./resultStream";
import {
    generateCode as rustGenerateCode,
    ISelectionRange,
} from "@crates/cursor-core";

class SelectionRange implements ISelectionRange {
    private _offset: number;
    private _length: number;

    constructor(offset: number, length: number) {
        this._offset = offset;
        this._length = length;
    }

    get offset(): number {
        return this._offset;
    }

    get length(): number {
        return this._length;
    }
}

export async function generateCode(
    prompt: string,
    document: vscode.TextDocument,
    selection: vscode.Selection,
    cancellationToken: vscode.CancellationToken,
    resultStream: ResultStream<String>
): Promise<void> {
    const filePath = document.uri.fsPath;
    const workspaceDirectory =
        vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath ?? null;
    const documentText = document.getText();
    const selectionStartOffset = document.offsetAt(selection.start);
    const selectionEndOffset = document.offsetAt(selection.end);
    const selectionRange = new SelectionRange(
        selectionStartOffset,
        selectionEndOffset - selectionStartOffset
    );

    const abortController = new AbortController();
    cancellationToken.onCancellationRequested(() => {
        abortController.abort();
    });
    const { signal: abortSignal } = abortController;

    await rustGenerateCode({
        prompt,
        documentText,
        filePath,
        workspaceDirectory,
        selectionRange,
        resultStream,
        abortSignal,
    });
}
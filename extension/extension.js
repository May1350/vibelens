const vscode = require('vscode');
const VibeLensSyncCore = require('./VibeLensSyncCore');

function activate(context) {
    // 1. 저장된 이메일이 있는지 확인
    const savedEmail = context.globalState.get('vibelensEmail');
    const syncCore = new VibeLensSyncCore({
        accountEmail: savedEmail || "Login Required",
        context: context
    });

    const provider = new VibeLensWebviewProvider(context.extensionUri, syncCore);

    const updateTimer = setInterval(() => provider.updateView(), 1000);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('vibelens-status', provider),
        {
            dispose: () => {
                syncCore.dispose();
                clearInterval(updateTimer);
            }
        }
    );
}

class VibeLensWebviewProvider {
    constructor(extensionUri, syncCore) {
        this._extensionUri = extensionUri;
        this._syncCore = syncCore;
    }

    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };

        webviewView.webview.onDidReceiveMessage(async message => {
            if (message.command === 'copyKey') {
                const syncKey = 'AG-SYNC-' + Math.random().toString(36).substring(2, 7).toUpperCase();
                vscode.env.clipboard.writeText(syncKey);
                vscode.window.showInformationMessage('VibeLens: Sync Key copied to clipboard!');
            } else if (message.command === 'ready') {
                this.updateView();
            } else if (message.command === 'login') {
                // [NEW] 전용 로그인 로직
                const email = await vscode.window.showInputBox({
                    prompt: "Enter your VibeLens account email",
                    placeHolder: "yourname@example.com"
                });

                if (email && email.includes('@')) {
                    await this._syncCore.setAccount(email);
                    vscode.window.showInformationMessage(`VibeLens: Welcome, ${email}!`);
                    this.updateView();
                }
            } else if (message.command === 'openDashboard') {
                vscode.env.openExternal(vscode.Uri.parse('https://vibelens-fxnro0ske-may1350s-projects.vercel.app/'));
            }
        });

        const fs = require('fs');
        const path = require('path');
        const htmlPath = path.join(this._extensionUri.fsPath, 'sidebar.html');
        webviewView.webview.html = fs.readFileSync(htmlPath, 'utf8');
    }

    async updateView() {
        if (!this._view) return;
        const realData = await this._syncCore.captureCurrentState();
        this._view.webview.postMessage({ type: 'update', payload: realData });
    }
}

function deactivate() { }
module.exports = { activate, deactivate };

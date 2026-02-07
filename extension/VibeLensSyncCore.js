const http = require('http');
const https = require('https');
const vscode = require('vscode');
const { execSync } = require('child_process');

/**
 * VibeLens Sync Core - AGQ MATCHED ENGINE
 * Automatically detects Antigravity language server and fetches real quota.
 */
class VibeLensSyncCore {
    constructor(config) {
        this.port = 48829;
        this.context = config.context;
        this.accountEmail = config.accountEmail;
        this.server = null;
        this.lsInfo = null; // Stores { port, token }

        this.startServer();
    }

    startServer() {
        this.server = http.createServer((req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (req.url === '/sync-data') {
                this.captureCurrentState().then(data => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                });
            } else {
                res.end('VibeLens Bridge Active');
            }
        });
        this.server.on('error', () => { });
        this.server.listen(this.port, '127.0.0.1');
    }

    async setAccount(email) {
        this.accountEmail = email;
        await this.context.globalState.update('vibelensEmail', email);
    }

    dispose() {
        if (this.server) this.server.close();
    }

    /**
     * ANTIGRAVITY PROCESS DETECTION (COPY OF AGQ LOGIC)
     */
    async detectLanguageServer() {
        try {
            // 1. Get process list
            const pgrepOut = execSync('pgrep -fl language_server').toString().trim();
            const lines = pgrepOut.split('\n');

            for (const line of lines) {
                if (line.includes('--csrf_token')) {
                    const pidMatch = line.match(/^(\d+)/);
                    const tokenMatch = line.match(/--csrf_token[=\s]+([a-zA-Z0-9\-]+)/);
                    if (!pidMatch || !tokenMatch) continue;

                    const pid = pidMatch[1];
                    const token = tokenMatch[1];

                    // 2. Find listening ports for this PID
                    const lsofOut = execSync(`lsof -nP -a -iTCP -sTCP:LISTEN -p ${pid}`).toString().trim();
                    const portMatches = lsofOut.match(/:(\d+)\s+\(LISTEN\)/g);

                    if (portMatches) {
                        const ports = portMatches.map(m => m.match(/:(\d+)/)[1]);
                        // Try each port with a simple request
                        for (const port of ports) {
                            const working = await this.testPort(port, token);
                            if (working) {
                                return { port, token };
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error('[VibeLens] Process detection failed:', e.message);
        }
        return null;
    }

    testPort(port, token) {
        return new Promise(resolve => {
            const options = {
                hostname: '127.0.0.1',
                port,
                path: '/exa.language_server_pb.LanguageServerService/GetUserStatus',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Codeium-Csrf-Token': token,
                    'Connect-Protocol-Version': '1',
                },
                rejectUnauthorized: false,
                timeout: 1000,
            };
            const req = https.request(options, res => {
                resolve(res.statusCode === 200);
            });
            req.on('error', () => resolve(false));
            req.write(JSON.stringify({ metadata: { ideName: 'antigravity', extensionName: 'vibelens' } }));
            req.end();
        });
    }

    /**
     * FETCH REAL QUOTA DATA
     */
    async fetchRealQuota(port, token) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: '127.0.0.1',
                port,
                path: '/exa.language_server_pb.LanguageServerService/GetUserStatus',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Codeium-Csrf-Token': token,
                    'Connect-Protocol-Version': '1',
                },
                rejectUnauthorized: false,
                timeout: 3000,
            };
            const req = https.request(options, res => {
                let body = '';
                res.on('data', d => body += d);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on('error', reject);
            req.write(JSON.stringify({ metadata: { ideName: 'antigravity', extensionName: 'antigravity', locale: 'en' } }));
            req.end();
        });
    }

    async captureCurrentState() {
        let models = [];
        let dailyUsage = 0;
        const globalReset = new Date();
        globalReset.setUTCHours(24, 0, 0, 0);

        try {
            if (!this.lsInfo || Math.random() < 0.1) {
                this.lsInfo = await this.detectLanguageServer();
            }

            if (this.lsInfo) {
                const data = await this.fetchRealQuota(this.lsInfo.port, this.lsInfo.token);
                const userStatus = data.userStatus;

                const planInfo = userStatus.planStatus?.planInfo || {};
                dailyUsage = (planInfo.monthlyPromptCredits || 50000) - (userStatus.planStatus?.availablePromptCredits || 0);

                const rawModels = userStatus.cascadeModelConfigData?.clientModelConfigs || [];
                models = rawModels
                    .filter(m => m.quotaInfo)
                    .map(m => {
                        const resetTime = new Date(m.quotaInfo.resetTime).getTime();
                        const percentage = Math.round((m.quotaInfo.remainingFraction || 0) * 100);
                        const isFull = percentage >= 100;

                        return {
                            name: m.label || m.modelOrAlias?.model || "AI Model",
                            percentage: percentage,
                            info: isFull ? 'Status: Full' : `${percentage}% Left`,
                            resetAt: resetTime,
                            resetIn: isFull ? "" : this.getRelativeResetTime(resetTime)
                        };
                    });

                models.sort((a, b) => {
                    const aFull = a.percentage >= 100;
                    const bFull = b.percentage >= 100;
                    if (aFull !== bFull) return aFull ? 1 : -1;
                    if (!aFull && !bFull) return a.resetAt - b.resetAt;
                    return a.name.localeCompare(b.name);
                });
            }
        } catch (e) {
            console.error('[VibeLens] Sync Error:', e.message);
        }

        if (models.length === 0) {
            models = [{
                name: 'Antigravity Sync',
                percentage: 0,
                info: 'Connecting...',
                resetIn: this.getRelativeResetTime(globalReset.getTime())
            }];
        }

        return {
            email: this.accountEmail || "Login Required",
            timestamp: Date.now(),
            dailyUsage: dailyUsage,
            models: models
        };
    }

    getRelativeResetTime(targetTimestamp) {
        if (!targetTimestamp) return "Calculating...";
        const diff = targetTimestamp - Date.now();
        if (diff <= 0) return "Ready";

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}

module.exports = VibeLensSyncCore;

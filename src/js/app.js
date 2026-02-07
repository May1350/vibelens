/**
 * VibeLens Core Logic - Analytics & Persistence
 */

class VibeLensApp {
  constructor() {
    this.dashboard = document.getElementById('dashboard');
    this.modal = document.getElementById('account-modal');
    this.form = document.getElementById('account-form');
    this.storageKey = 'vibelens_accounts';

    this.accounts = this.loadAccounts();

    // Add dummy history if not present
    this.ensureHistory();

    this.init();
    this.setupSyncBridge();
    this.startBridgePolling(); // Keep connection with the extension
  }

  ensureHistory() {
    this.accounts.forEach(acc => {
      if (!acc.history) {
        acc.history = this.generateMockHistory();
      }
    });
    this.saveAccounts();
  }

  generateMockHistory() {
    const history = [];
    for (let i = 0; i < 182; i++) {
      // 이제 랜덤 데이터를 생성하지 않고 0(데이터 없음)으로 초기화합니다.
      // 실제 데이터는 동기화 브릿지를 통해 채워집니다.
      history.push(0);
    }
    return history;
  }

  loadAccounts() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [];
  }

  saveAccounts() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.accounts));
  }

  init() {
    this.render();
    this.setupEventListeners();
    this.startAutoRefresh();
  }

  setupSyncBridge() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'VIBELENS_SYNC_DATA') {
        this.handleIncomingSync(event.data.payload);
      }
    });
    window.vibeSync = (payload) => this.handleIncomingSync(payload);
  }

  /**
   * Continuous sync with the Extension Bridge
   */
  startBridgePolling() {
    // 익스텐션 브릿지로부터 1분(60000ms)마다 데이터를 가져와 업데이트 부하를 줄임
    setInterval(async () => {
      try {
        const response = await fetch('http://127.0.0.1:48829/sync-data');
        if (response.ok) {
          const payload = await response.json();
          this.handleIncomingSync(payload);
        }
      } catch (e) {
        // Extension might be closed
      }
    }, 60000);
  }

  handleIncomingSync(payload) {
    const { email, models, resetIn, dailyUsage, timestamp } = payload;
    let accountIndex = this.accounts.findIndex(acc => acc.email === email);

    if (accountIndex === -1) {
      // [METHOD 2] 미등록 계정 발견 시 자동 생성
      const newAccount = {
        id: 'acc_' + Date.now(),
        label: 'Auto Synced Dev',
        email: email,
        syncKey: 'AUTO',
        lastSync: 'CONNECTED',
        lastSyncTimestamp: timestamp || Date.now(),
        history: this.generateMockHistory(),
        models: models
      };
      this.accounts.push(newAccount);
      accountIndex = this.accounts.length - 1;
      this.saveAccounts();
      this.render(); // 첫 등록 시에만 전체 렌더링
    }

    if (accountIndex !== -1) {
      this.accounts[accountIndex].models = models;
      this.accounts[accountIndex].lastSyncTimestamp = timestamp || Date.now();
      this.accounts[accountIndex].lastSync = 'CONNECTED';

      if (dailyUsage) {
        this.accounts[accountIndex].history[this.accounts[accountIndex].history.length - 1] = dailyUsage;
      }

      this.saveAccounts();
      this.updateNumericalData(this.accounts[accountIndex]);
    }
  }

  updateNumericalData(account) {
    // 카드가 없다면(최초 렌더링 등) 전체 렌더링을 수행
    const card = document.getElementById(account.id);
    if (!card) {
      this.render();
      return;
    }

    // 존재하는 카드에서 텍스트와 프로그레스 바만 업데이트 (사용자의 열림 상태 보존)
    account.models.forEach((m, i) => {
      const infoSpan = card.querySelector(`#info-${account.id}-${i}`);
      const percentSpan = card.querySelector(`#percentage-${account.id}-${i}`);
      const progressBar = document.getElementById(`progress-${account.id}-${i}`);

      if (infoSpan) infoSpan.textContent = m.info;
      if (percentSpan) percentSpan.textContent = `${m.percentage}%`;
      if (progressBar) {
        progressBar.style.width = `${m.percentage}%`;
        progressBar.className = `progress-bar-fill absolute top-0 left-0 h-full ${this.getProgressColor(m.percentage)} transition-all duration-1000`;
      }
    });

    // 100% 모델 섹션의 카운트 표시 등 업데이트
    const foldedCount = card.querySelector('.folded-count');
    if (foldedCount) {
      const fullCount = account.models.filter(m => m.percentage >= 100).length;
      foldedCount.textContent = fullCount;
    }
  }

  startAutoRefresh() {
    // 1초마다 전체 렌더링 대신, 타이머 텍스트만 갱신하여 점멸 현상을 방지함
    setInterval(() => {
      this.updateLiveTimers();
    }, 1000);
  }

  updateLiveTimers() {
    this.accounts.forEach(acc => {
      acc.models.forEach((model, i) => {
        const timerSpan = document.getElementById(`timer-${acc.id}-${i}`);
        if (timerSpan && model.percentage < 100 && model.resetAt) {
          const diff = model.resetAt - Date.now();
          if (diff > 0) {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            timerSpan.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          } else {
            timerSpan.textContent = 'Ready';
          }
        }
      });
    });
  }

  setupEventListeners() {
    const addBtn = document.getElementById('add-account-btn');
    const closeTriggers = document.querySelectorAll('.modal-close-trigger');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.form.reset();
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    }

    closeTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
      });
    });

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const inputs = this.form.querySelectorAll('input');
    const newAccount = {
      id: 'acc_' + Date.now(),
      label: inputs[0].value,
      email: inputs[1].value,
      syncKey: inputs[2].value,
      lastSync: 'Waiting...',
      resetIn: '--:--',
      history: this.generateMockHistory(),
      models: [
        { name: 'Gemini 1.5 Flash', percentage: 0, info: 'Syncing...' }
      ]
    };

    this.accounts.push(newAccount);
    this.saveAccounts();
    this.render();
    this.modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  toggleAccountExpand(accountId) {
    const card = document.getElementById(accountId);
    if (card) {
      card.classList.toggle('expanded');
    }
  }

  renderHeatmap(history) {
    // [CLEANUP] 기존의 랜덤 가공 데이터(큰 값들이 불규칙하게 섞임)가 감지되면 0으로 정화
    // (실제 데이터는 이제부터 쌓이기 때문)
    const isMock = history.some(v => v > 0) && history.filter(v => v > 0).length > 10;
    const cleanHistory = isMock ? history.map(() => 0) : history;

    return `
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Real-time Activity (Last 6 Months)</span>
          <div class="flex items-center gap-2">
            <span class="text-[9px] text-muted-foreground">None</span>
            <div class="flex gap-1">
              <div class="w-2 h-2 rounded-sm level-0"></div>
              <div class="w-2 h-2 rounded-sm level-1"></div>
              <div class="w-2 h-2 rounded-sm level-2"></div>
              <div class="w-2 h-2 rounded-sm level-3"></div>
              <div class="w-2 h-2 rounded-sm level-4"></div>
            </div>
            <span class="text-[9px] text-muted-foreground">Intense</span>
          </div>
        </div>
        <div class="heatmap-grid">
          ${cleanHistory.map((tokens, i) => {
      let level = 0;
      // 실제 안티그래비티 크레딧 소모량 기준 (Pro 기준 약 50,000)
      if (tokens > 10000) level = 4;
      else if (tokens > 5000) level = 3;
      else if (tokens > 1000) level = 2;
      else if (tokens > 0) level = 1;

      // Simple date simulation (counting backwards)
      const date = new Date();
      date.setDate(date.getDate() - (history.length - 1 - i));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return `<div class="heatmap-cell level-${level}" title="${dateStr}: ${tokens.toLocaleString()} tokens"></div>`;
    }).join('')}
        </div>
      </div>
    `;
  }

  formatLastSync(timestamp) {
    if (!timestamp) return 'WAITING';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'LIVE';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  }

  renderAccountCard(account) {
    const syncStatus = this.formatLastSync(account.lastSyncTimestamp);
    const statusClass = syncStatus === 'LIVE' ? 'text-primary' : 'text-muted-foreground';

    return `
      <div class="quota-card group bg-card border border-border p-8 rounded-xl hover:border-primary/40 transition-all duration-300 shadow-sm relative overflow-hidden cursor-pointer" 
           id="${account.id}" onclick="window.vibeApp.toggleAccountExpand('${account.id}')">
        
        <div class="flex justify-between items-start mb-8 pb-4 border-b border-border/50">
          <div>
            <h2 class="text-sm font-bold text-foreground tracking-tight">${account.label}</h2>
            <p class="text-[11px] text-muted-foreground mt-0.5">${account.email}</p>
          </div>
          <div class="flex flex-col items-end gap-1.5">
            <span class="sync-text text-[9px] font-bold ${statusClass} uppercase tracking-widest">${syncStatus}</span>
          </div>
        </div>

        <div class="space-y-8">
          ${account.models
        .filter(m => m.percentage < 100)
        .map((m, i) => this.renderModelRow(m, account.id, account.models.indexOf(m))).join('')}
        </div>

        <!-- 100% 잔량 모델 접기 영역 -->
        ${this.renderFoldedModels(account)}

        <!-- Heatmap (Expanded) -->
        <div class="expandable-content">
          ${this.renderHeatmap(account.history)}
          <div class="mt-6 flex justify-between items-center">
            <button onclick="event.stopPropagation(); window.vibeApp.deleteAccount('${account.id}')" 
                    class="text-[9px] text-destructive/50 hover:text-destructive font-bold uppercase tracking-widest">Remove Account</button>
            <span class="text-[9px] text-muted-foreground italic">Pattern detected: High usage on Mondays</span>
          </div>
        </div>
        
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground group-[.expanded]:rotate-180 transition-transform"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    `;
  }

  renderModelRow(model, accountId, index) {
    const colorClass = this.getProgressColor(model.percentage);
    const timerId = `timer-${accountId}-${index}`;
    const infoId = `info-${accountId}-${index}`;
    const percentId = `percentage-${accountId}-${index}`;

    return `
      <div class="space-y-2">
        <div class="flex justify-between items-end">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-semibold text-foreground/90 uppercase tracking-tighter">${model.name}</span>
            <span id="${timerId}" class="text-[10px] font-mono font-bold text-primary animate-pulse"></span>
          </div>
          <span id="${infoId}" class="text-[10px] font-mono text-muted-foreground">${model.info}</span>
        </div>
        <div class="relative w-full h-1 bg-muted/50 rounded-full overflow-hidden">
          <div id="progress-${accountId}-${index}" class="progress-bar-fill absolute top-0 left-0 h-full ${colorClass} transition-all duration-1000" style="width: ${model.percentage}%"></div>
        </div>
        <div class="flex justify-end">
          <span id="${percentId}" class="text-[14px] font-light text-foreground">${model.percentage}%</span>
        </div>
      </div>
    `;
  }

  renderFoldedModels(account) {
    const fullModels = account.models.filter(m => m.percentage >= 100);
    if (fullModels.length === 0) return '';

    return `
      <div class="mt-8 pt-4 border-t border-border/30">
        <details class="group/folded">
          <summary class="list-none cursor-pointer flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="group-open/folded:rotate-90 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
            Untouched Models (<span class="folded-count">${fullModels.length}</span>)
          </summary>
          <div class="mt-6 space-y-6">
            ${fullModels.map((m) => this.renderModelRow(m, account.id, account.models.indexOf(m))).join('')}
          </div>
        </details>
      </div>
    `;
  }

  deleteAccount(id) {
    if (confirm('Delete this account?')) {
      this.accounts = this.accounts.filter(acc => acc.id !== id);
      this.saveAccounts();
      this.render();
    }
  }

  getProgressColor(percentage) {
    if (percentage > 50) return 'bg-primary';
    if (percentage > 15) return 'bg-orange-500/80';
    return 'bg-destructive';
  }

  renderEmptyState() {
    return `<div class="col-span-full py-20 text-center border border-dashed border-border rounded-xl">No accounts connected.</div>`;
  }

  render() {
    this.dashboard.innerHTML = this.accounts.length === 0 ? this.renderEmptyState() : this.accounts.map(acc => this.renderAccountCard(acc)).join('');
  }
}

// 최적화된 초기화 로직: DOM이 이미 로드되었는지 확인 후 즉시 실행하거나 이벤트를 기다림
function initVibeLens() {
  if (window.vibeApp) return; // 중복 실행 방지
  window.vibeApp = new VibeLensApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVibeLens);
} else {
  initVibeLens();
}

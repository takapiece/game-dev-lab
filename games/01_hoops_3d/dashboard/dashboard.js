// Learning Dashboard & Curriculum Explorer Logic

const CURRICULUM_DATA = {
  '01_hoops_3d': {
    title: 'HOOPS 3D',
    subtitle: 'スマホ向け 3D バスケットボール シミュレーター',
    icon: '🏀',
    phases: [
      {
        id: 'phase_01',
        name: 'Phase 1',
        title: '3Dコアモック & 放物線シュート',
        badgeClass: 'phase-1',
        difficulty: '★☆☆☆☆',
        playUrl: '../phases/phase_01_3d_mock/index.html',
        overview: {
          goal: '3D空間の基本設定、木目コート・NBAゴールの生成、プレイヤーの移動・ドリブル同期、および放物線シュートの物理計算とWeb Audio音響合成のコアゲームプレイを形にする。',
          points: [
            '外部画像（テクスチャ）や音声ファイル（mp3）を使わず、Canvas APIとWeb Audio APIで完全プロシージャル生成。',
            '高校物理の「斜方投射」の公式を用いた美しいアーチを描く放物線シュート。',
            'NBA 2K風のグリーンリリースメーター（0.55秒のタイミング一致で100%成功）。',
            'PC（キーボード）＆スマホ（タッチジョイスティック）のクロスプラットフォーム対応。'
          ],
          adr: 'ADR-001 (Three.js採用), ADR-002 (動的アセット生成), ADR-004 (グリーンリリース機構)'
        },
        knowledge: [
          {
            topic: '📐 3D右手座標系 & Three.js の基本',
            desc: 'Three.js は画面奥が -Z、上方向が +Y、右方向が +X の右手系を採用しています。ゴールを (0, 3.05, -5.25) に配置し、プレイヤーがゴールを見据えるように角度を計算します。',
            highlight: 'Vector3.clone() や sub(), addScaledVector() を活用してベクトル演算を行うのが3Dゲームの基本です。'
          },
          {
            topic: '🚀 斜方投射（放物線）の物理数式',
            desc: 'シュート開始点からリングまでの水平距離と、希望する最高到達点（peakHeight）から、重力加速度 g = -18.5 を考慮して初速度 (vx, vy, vz) を逆算します。',
            formula: 'tUp = √((2 * (peakHeight - y0)) / -g) \nvy = -g * tUp \nvx = (xg - x0) / (tUp + tDown)'
          },
          {
            topic: '🔊 Web Audio API によるシンセサイズ音響',
            desc: '音声オシレーター（Oscillator）の周波数を短時間で急降下させることで「木目コートのドリブル音」を、ホワイトノイズにバンドパスフィルターをかけることで「ネット通過音（Swish）」を合成します。',
            highlight: 'ブラウザの自動再生ポリシーを回避するため、最初のユーザー操作（画面タップ/クリック）で AudioContext.resume() を呼ぶ必要があります。'
          }
        ],
        aiGuide: {
          tips: [
            '3D空間の座標系（Y軸が高さ、Z軸が前後）をAIに明確に伝える。',
            '「シュートを入れて」ではなく「最高到達点とゴール座標を通る放物線の初速度ベクトルを計算する関数」のように物理仕様を具体的に指示する。',
            'HTML5 Canvas によるプロシージャルテクスチャ生成を指示する場合、解像度（256x256など）と描画手順（背景色→白線）を指定する。'
          ],
          prompts: [
            {
              title: '放物線シュート計算のプロンプト',
              bad: 'ボールがリングに入るようにシュートの計算を作って。',
              good: 'Three.jsでプレイヤー位置(x0, y0, z0)からゴール(0, 3.05, -5.25)に向かって放物線を描くシュート初速ベクトル(vx, vy, vz)を計算する関数を書いて。重力は -18.5m/s^2、最高到達点はゴールより約3m高い位置として、上昇時間と下降時間から初速度を求めてください。',
              reason: '物理公式（斜方投射）の前提定数（重力、最高点、目標座標）を具体的に与えることで、AIが正確な数学コードを一発で生成できます。'
            },
            {
              title: 'Web Audio ドリブル音生成のプロンプト',
              bad: 'バスケのドリブルの音を鳴らして。',
              good: '外部音声ファイルを使わず、Web Audio API の OscillatorNode を使ってバスケットボールが木目コートに弾む音（playBounce）を合成するクラスを作って。周波数を 140Hz から 35Hz へ 0.08秒で急減衰させ、ローパスフィルター(450Hz)を通す設計にしてください。',
              reason: '使用するWeb技術（Web Audio API）、オシレーターの種類、周波数パラメータを明示することで、高品質なシンセサイザーコードが得られます。'
            }
          ]
        },
        troubleshooting: [
          {
            code: 'ERR-001',
            title: 'CanvasTexture の更新とロード順序エラー',
            symptom: 'コートが黒く塗りつぶされたまま白線が表示されない。',
            cause: 'Canvasに描画した直後に `texture.needsUpdate = true` を設定していなかったため、Three.jsのGPU転送がスキップされていた。',
            fix: 'Canvas描画処理完了後に必ず `texture.needsUpdate = true` を明記する。',
            lesson: 'Three.jsではプログラム描画したテクスチャを変更した場合、GPUに再転送するフラグを立てる必要がある。'
          },
          {
            code: 'ERR-002',
            title: 'Web Audio API のユーザージェスチャー制限 (NotAllowedError)',
            symptom: 'ゲーム開始直後に効果音が鳴らない、コンソールに警告が出る。',
            cause: 'モダンブラウザはユーザー操作（クリック/タップ）前の自動音声再生を禁止している。',
            fix: 'スタートボタンや最初のキー入力イベント内で `sounds.init()` および `sounds.resume()` を呼び出す。',
            lesson: 'ブラウザのセキュリティ・UX仕様（User Gesture Requirement）を理解し、初期化タイミングを制御する。'
          }
        ],
        files: [
          { name: 'main.js', summary: 'ゲーム全体のメインループ、Three.jsシーン初期化、カメラワーク制御' },
          { name: 'player.js', summary: 'プレイヤー3Dモデル、移動・ドリブル・シュートメーター判定' },
          { name: 'ball.js', summary: 'バスケットボールの放物線物理シミュレーション、リム・バックボード衝突判定' },
          { name: 'court.js', summary: 'HTML5 Canvasによる木目コート・白線テクスチャ生成、NBAゴール' },
          { name: 'controls.js', summary: 'PCキーボード（WASD/SPACE）＆スマホ仮想ジョイスティック入力制御' },
          { name: 'audio.js', summary: 'Web Audio API によるドリブル音・スキーク音・スウィッシュ音の合成' }
        ]
      },
      {
        id: 'phase_02',
        name: 'Phase 2',
        title: '1v1 AIディフェンダー & コンテスト・ブロック',
        badgeClass: 'phase-2',
        difficulty: '★★☆☆☆',
        playUrl: '../phases/phase_02_1v1_defender/index.html',
        overview: {
          goal: '敵AIディフェンダーを導入し、ボールマンとゴールの間に回り込むインテリジェントなポジショニング、幾何学的シュートコンテスト判定（0%〜100%）、および至近距離ブロック物理を実現する。',
          points: [
            'Bulls 風レッド＆ブラックジャージの3D AIディフェンダーモデル。',
            '幾何ベクトルの内分点計算による「ボールマンとゴールの間」への自動回り込み。',
            'プレイヤーのシュート gather モーションを察知した反応遅延（0.12秒）付きジャンプコンテスト。',
            '距離・角度（内積）・手の高さからコンテスト妨害度（WIDE OPEN 〜 SMOTHERED）を算出し、シュート成功率と弾道ブレに反映。',
            '至近距離ブロック（叩き落とし）判定と Web Audio API による専用スラップ打撃音。'
          ],
          adr: 'ADR-008 (AIディフェンス思考ルーチンと幾何コンテスト判定の導入)'
        },
        knowledge: [
          {
            topic: '🧠 AIステートマシンパターン (State Machine)',
            desc: 'AIは状況に応じて GUARD（マーク中）、CONTEST（シュート妨害）、REBOUND（ルーズボール回収）の3つの状態を自律的に遷移します。',
            highlight: '複雑な行動ロジックも、状態（State）に分割して switch や if で記述することで、保守性が格段に高まります。'
          },
          {
            topic: '📐 ベクトルの内積（Dot Product）による正面判定',
            desc: '「ディフェンダーがプレイヤーとゴールの間に立っているか」を、プレイヤーからゴールへの向きベクトルと、プレイヤーからディフェンダーへの向きベクトルの内積（dot product）で判定します。',
            formula: 'Alignment = Dot(toHoop.normalize(), toDefender.normalize())\n// 1.0 = 正面、0.0 = 真横、-1.0 = 背後'
          },
          {
            topic: '⚖️ ゲームバランスにおける「遅延（Latency）と慣性」',
            desc: 'AIが完璧にプレイヤーを追従するとゲームが理不尽になります。適度な反応ディレイ（0.12秒）や移動慣性を入れることで、プレイヤーが急な切り返し（クロスオーバー）でズレを作れる「抜け感」を生み出しています。'
          }
        ],
        aiGuide: {
          tips: [
            'AIの「強さ」を一発で決め打ちさせず、反応遅延（reactionDelay）や追従速度（speed）、ブロック確率（blockProb）などをパラメータ化させる。',
            '「敵を動かして」ではなく「プレイヤー座標とゴール座標の内分点にクッション距離（1.65m）離れて立つポジショニング関数」のように幾何学条件を指定する。',
            'コンテスト計算では「距離」「角度」「手の高さ」の3要素を乗算して 0.0〜1.0 に正規化する数式をAIに提案させる。'
          ],
          prompts: [
            {
              title: 'AIディフェンダーのポジショニング指示',
              bad: '敵のディフェンスがプレイヤーについてくるようにして。',
              good: 'Three.jsで1v1のAIディフェンダーを作ってください。プレイヤー座標 playerPos とゴール座標 hoopPos を結ぶ直線上において、プレイヤーからゴール方向に guardDistance = 1.65m 離れた目標位置 targetPos をベクトル演算で計算し、ディフェンダーがそこへスムーズに移動して常にプレイヤーと正対する update(delta, player) を実装してください。',
              reason: 'バスケットボールのディフェンス原理（ボールマンとゴールの間に入る）をベクトルの内分点として明確に指定することで、プロ品質のAIロジックが得られます。'
            },
            {
              title: 'シュートコンテスト判定のプロンプト',
              bad: '敵が近くにいたらシュートを入りにくくして。',
              good: 'シュートを打った際、ディフェンダーによる妨害度（0.0〜1.0）を計算する calculateContest(player) メソッドを実装してください。(1) 距離減衰（1.1m以内は最大、3.8m以上は0）、(2) ゴール方向とディフェンダー方向のベクトルの内積（Alignment）、(3) ディフェンダーがジャンプ中かどうかの手の高さ係数、の3つを掛け合わせて算出してください。',
              reason: '「距離」「角度の内積」「高さ」という3つの計算要素を明確に提示することで、破綻のない数学的コンテスト判定をAIが実装できます。'
            }
          ]
        },
        troubleshooting: [
          {
            code: 'ERR-003',
            title: 'UIオーバーレイの pointer-events によるクリック透過',
            symptom: '画面上部の「目次へ戻る」ボタンを押しても反応しない。',
            cause: '全画面を覆う親要素 `.ui-overlay` に `pointer-events: none` が設定されており、子要素の `.brand-card` やリンクに `pointer-events: auto` が指定されていなかった。',
            fix: 'インタラクティブなボタンやカードに個別に `pointer-events: auto` を明記する。',
            lesson: 'HUDとゲーム画面を重ねるWeb 3D開発では、CSSの `pointer-events` の透過・ブロック制御が必須。'
          }
        ],
        files: [
          { name: 'defender.js', summary: '1v1 AIディフェンダー（ステートマシン、内分点追従、コンテスト判定、近接ブロック）' },
          { name: 'main.js', summary: 'Defenderを統合したメインループ、コンテスト評価フィードバック表示' },
          { name: 'ball.js', summary: 'コンテスト度合いに応じたシュートブレ率計算、ブロック叩き落とし物理' },
          { name: 'audio.js', summary: 'Web Audio API によるブロック打撃音（playBlock）の追加' },
          { name: 'player.js', summary: 'コンテスト情報を受け取るシュートリリース処理' },
          { name: 'court.js', summary: '3Dコート＆ゴール' },
          { name: 'controls.js', summary: 'PC/スマホ操作コントローラー（ESC/Mキーでの目次復帰）' }
        ]
      }
    ]
  }
};

// State
let currentPhaseIndex = 1; // Default to Phase 2 (latest)
let currentTabId = 'overview';
let selectedFileName = 'defender.js';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initPhaseList();
  initTabs();
  renderCurrentPhase();
});

function initPhaseList() {
  const phaseListEl = document.getElementById('phase-list');
  if (!phaseListEl) return;
  phaseListEl.innerHTML = '';

  const phases = CURRICULUM_DATA['01_hoops_3d'].phases;
  phases.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = `phase-item ${idx === currentPhaseIndex ? 'active' : ''}`;
    item.innerHTML = `
      <div class="phase-item-header">
        <span class="phase-badge ${p.badgeClass}">${p.name}</span>
        <span style="font-size: 0.75rem; color: #ffd700;">${p.difficulty}</span>
      </div>
      <div class="phase-item-title">${p.title}</div>
    `;
    item.addEventListener('click', () => {
      currentPhaseIndex = idx;
      document.querySelectorAll('.phase-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      renderCurrentPhase();
    });
    phaseListEl.appendChild(item);
  });
}

function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTabId = tab.dataset.tab;
      
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`panel-${currentTabId}`);
      if (activePanel) activePanel.classList.add('active');

      if (currentTabId === 'code') {
        renderCodeExplorer();
      }
    });
  });
}

function renderCurrentPhase() {
  const phase = CURRICULUM_DATA['01_hoops_3d'].phases[currentPhaseIndex];

  // Update header info
  document.getElementById('display-phase-name').innerText = `${phase.name}: ${phase.title}`;
  document.getElementById('btn-launch-game').href = phase.playUrl;

  // 1. Render Overview
  const overviewContainer = document.getElementById('overview-content');
  if (overviewContainer) {
    overviewContainer.innerHTML = `
      <div class="cards-grid">
        <div class="info-card">
          <div class="info-card-header"><span class="icon">🎯</span> このフェーズの目標 (Goal)</div>
          <div class="info-card-body">
            <p>${phase.overview.goal}</p>
            <div class="highlight-box green">
              <strong>📑 関連 ADR (意思決定ログ):</strong>
              ${phase.overview.adr}
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-header"><span class="icon">✨</span> 実装のポイント & 見どころ</div>
          <div class="info-card-body">
            <ul>
              ${phase.overview.points.map(pt => `<li><span style="color: #00e676;">✔</span> ${pt}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Render Knowledge Tab
  const knowledgeContainer = document.getElementById('knowledge-content');
  if (knowledgeContainer) {
    knowledgeContainer.innerHTML = `
      <div class="cards-grid">
        ${phase.knowledge.map(k => `
          <div class="info-card">
            <div class="info-card-header">${k.topic}</div>
            <div class="info-card-body">
              <p>${k.desc}</p>
              ${k.formula ? `<div class="prompt-box" style="color: #67e8f9;">${k.formula}</div>` : ''}
              ${k.highlight ? `<div class="highlight-box">${k.highlight}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 3. Render AI Prompting Guide
  const aiGuideContainer = document.getElementById('ai-guide-content');
  if (aiGuideContainer) {
    aiGuideContainer.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><span class="icon">💡</span> AIペアプログラミングの鉄則 & 指示のコツ</div>
        <div class="info-card-body">
          <ul>
            ${phase.aiGuide.tips.map(tip => `<li><span style="color: #fdb927;">★</span> ${tip}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1.1rem; color: #fff;">
          📝 プロンプト具体例（悪い例 vs 良い例）
        </h3>
        ${phase.aiGuide.prompts.map(p => `
          <div class="prompt-compare-grid">
            <div class="prompt-card bad">
              <div class="prompt-card-title">❌ 曖昧な指示 (Bad Prompt)</div>
              <div class="prompt-box">${p.bad}</div>
              <div class="prompt-reason">
                <strong>問題点:</strong> 前提条件（座標系や数学的定義）が抜けているため、AIが意図と異なるコードを生成しやすい。
              </div>
            </div>

            <div class="prompt-card good">
              <div class="prompt-card-title">⭕ 具体的で高品質な指示 (Good Prompt)</div>
              <div class="prompt-box">${p.good}</div>
              <div class="prompt-reason">
                <strong>理由:</strong> ${p.reason}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 4. Render Troubleshooting
  const troubleshootingContainer = document.getElementById('troubleshooting-content');
  if (troubleshootingContainer) {
    troubleshootingContainer.innerHTML = `
      <div class="error-list">
        ${phase.troubleshooting.map(err => `
          <div class="error-card">
            <div class="error-card-header">
              <span class="error-code">${err.code}</span>
              <span class="error-title">${err.title}</span>
            </div>
            <div class="error-details-grid">
              <div class="error-detail-box">
                <strong>🚨 発生した現象 (Symptom):</strong>
                ${err.symptom}
              </div>
              <div class="error-detail-box">
                <strong>🔍 原因 (Root Cause):</strong>
                ${err.cause}
              </div>
              <div class="error-detail-box" style="border-left: 2px solid #00e676;">
                <strong>🛠️ 修正方法 (Solution):</strong>
                ${err.fix}
              </div>
              <div class="error-detail-box" style="border-left: 2px solid #fdb927;">
                <strong>💡 生徒への学び (Key Takeaway):</strong>
                ${err.lesson}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 5. Render Play Preview
  const playPreviewIframe = document.getElementById('play-preview-iframe');
  if (playPreviewIframe) {
    playPreviewIframe.src = phase.playUrl;
  }

  // Reset default selected file for Code Explorer
  selectedFileName = phase.files[0].name;
  if (currentTabId === 'code') {
    renderCodeExplorer();
  }
}

async function renderCodeExplorer() {
  const phase = CURRICULUM_DATA['01_hoops_3d'].phases[currentPhaseIndex];
  const fileTreeEl = document.getElementById('file-tree-list');
  const codeFileNameEl = document.getElementById('code-file-name');
  const codeAnnotationEl = document.getElementById('code-file-summary');
  const codeDisplayEl = document.getElementById('code-display');

  if (!fileTreeEl) return;

  fileTreeEl.innerHTML = '';
  phase.files.forEach(f => {
    const item = document.createElement('div');
    item.className = `file-item ${f.name === selectedFileName ? 'active' : ''}`;
    item.innerHTML = `<span>📄</span> ${f.name}`;
    item.addEventListener('click', () => {
      selectedFileName = f.name;
      renderCodeExplorer();
    });
    fileTreeEl.appendChild(item);
  });

  const curFile = phase.files.find(f => f.name === selectedFileName) || phase.files[0];
  codeFileNameEl.innerText = curFile.name;
  codeAnnotationEl.innerText = curFile.summary;

  // Fetch actual code content from phase folder
  const filePath = `../phases/${phase.id === 'phase_01' ? 'phase_01_3d_mock' : 'phase_02_1v1_defender'}/src/${curFile.name}`;
  try {
    const res = await fetch(filePath);
    if (res.ok) {
      const codeText = await res.text();
      codeDisplayEl.textContent = codeText;
    } else {
      codeDisplayEl.textContent = `// ${curFile.name} のコードを読み込み中...`;
    }
  } catch (e) {
    codeDisplayEl.textContent = `// コード読み込みエラー: ${e.message}`;
  }
}

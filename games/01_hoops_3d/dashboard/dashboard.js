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

// Educational Annotations & Quick Jump Map
const CODE_ANNOTATIONS = {
  'defender.js': {
    jumps: [
      { label: '🧠 ステートマシン定義', match: 'export const DefenderState' },
      { label: '📐 内分点ポジショニング', match: 'const targetPos = playerPos.clone()' },
      { label: '🎯 内積による正面判定', match: 'const alignment = Math.max(0, shooterToHoop.dot' },
      { label: '🚫 近接ブロック判定', match: 'tryBlock(player)' }
    ],
    notes: [
      {
        match: 'export const DefenderState',
        title: '🧠 AIステートマシンの定義',
        desc: 'ディフェンダーの行動を3つの状態（GUARD: マーク, CONTEST: シュート妨害, REBOUND: ルーズボール回収）に分割して管理します。',
        formula: 'GUARD -> (シュート感知) -> CONTEST -> (ボール浮遊) -> REBOUND -> GUARD'
      },
      {
        match: 'const targetPos = playerPos.clone()',
        title: '📐 ベクトルの内分点計算（ポジショニング）',
        desc: 'バスケットボールの原則「ボールマンとゴールの間に入る」ため、プレイヤーからゴールへ向かう単位ベクトルにクッション距離（guardDistance = 1.65m）を足した目標座標を計算します。',
        formula: 'TargetPos = PlayerPos + (HoopPos - PlayerPos).normalize() * 1.65m'
      },
      {
        match: 'const alignment = Math.max(0, shooterToHoop.dot',
        title: '📐 ベクトルの内積（Dot Product）による正面判定',
        desc: '「プレイヤーからゴールへのベクトル」と「プレイヤーからディフェンダーへのベクトル」の内積（dot）を計算。正面に立ちはだかっていれば 1.0、真横なら 0.0 になります。',
        formula: 'Alignment = Dot(v_hoop, v_defender) = cos(θ)'
      },
      {
        match: 'tryBlock(player)',
        title: '🚫 近接ブロック判定 & 叩き落とし物理',
        desc: '至近距離（1.35m以内）かつディフェンダーが最高到達点付近でジャンプしている場合、75%の確率でシュートを叩き落とします。'
      }
    ]
  },
  'ball.js': {
    jumps: [
      { label: '🚀 斜方投射の初速度逆算', match: 'const peakHeight = Math.max' },
      { label: '🎯 コンテスト減衰', match: 'const degradedQuality = Math.max(0' },
      { label: '💥 ブロック物理', match: 'block(blockerPosition)' },
      { label: '🏀 ゴール＆リム衝突判定', match: 'Check Hoop & Rim Collision' }
    ],
    notes: [
      {
        match: 'const peakHeight = Math.max',
        title: '🚀 高校物理：斜方投射の初速度逆算',
        desc: '最高到達点 peakHeight とゴール座標、重力加速度 g = -18.5 から、上昇時間 tUp と下降時間 tDown を計算し、初速度ベクトル (vx, vy, vz) を決定します。',
        formula: 'tUp = √((2 * (peakHeight - y0)) / -g)\nvy = -g * tUp,  vx = dx / (tUp + tDown)'
      },
      {
        match: 'const degradedQuality = Math.max(0',
        title: '🎯 ディフェンスコンテストによる成功率低下',
        desc: 'ディフェンダーのプレッシャー（contestFactor: 0〜1.0）に応じて、タイミング品質を減衰させ、弾道ブレ（deviationMax）を増加させます。'
      },
      {
        match: 'block(blockerPosition)',
        title: '💥 ブロックによる軌道変更 & 得点キャンセル',
        desc: '叩き落とされたボールは得点判定フラグ（isShotAttempt）を即座に false にし、ディフェンダーから離れる下向きのベクトルへ初速度を書き換えます。'
      }
    ]
  },
  'player.js': {
    jumps: [
      { label: '🎯 2K風グリーンリリース', match: 'const error = Math.abs(this.shotChargeTime' },
      { label: '🏀 放物線シュート発射', match: 'releaseShot(contestFactor' },
      { label: '🌊 サイン波ドリブル同期', match: 'this.dribbleTimer += delta' }
    ],
    notes: [
      {
        match: 'const error = Math.abs(this.shotChargeTime',
        title: '🎯 2K風グリーンライト判定機構',
        desc: 'ボタン長押し時間と理想時間（0.55秒）の誤差を指数関数カーブで評価。誤差が極小の場合、成功率100%のパーフェクトスウィッシュとなります。'
      },
      {
        match: 'this.dribbleTimer += delta',
        title: '🌊 三角関数（サイン波）によるドリブルバウンド',
        desc: '三角関数 Math.sin(dribbleTimer) を用いて、プレイヤーの腕とボールの上下動を周期的に同期させます。'
      }
    ]
  },
  'audio.js': {
    jumps: [
      { label: '🔊 ドリブル音合成', match: 'playBounce(intensity' },
      { label: '🔊 ブロック打撃音合成', match: 'playBlock()' },
      { label: '🔊 スウィッシュ音合成', match: 'playSwish()' }
    ],
    notes: [
      {
        match: 'playBounce(intensity',
        title: '🔊 Web Audio API によるドリブル音合成',
        desc: '140Hzのサイン波を0.08秒で35Hzへ急降下させ、木目フロアのローパスフィルター(450Hz)を通すことで、リアルなバウンド音を合成。'
      },
      {
        match: 'playBlock()',
        title: '🔊 ブロック時の重いスラップ音合成',
        desc: '280Hzの三角波アタック音（打撃感）と、ハイパスフィルター付きホワイトノイズ（手のひらの摩擦音）を合成した専用効果音です。'
      }
    ]
  }
};

// State
let currentPhaseIndex = 1; // Default to Phase 2 (latest)
let currentTabId = 'overview';
let selectedFileName = 'defender.js';
let showAnnotations = true;
let currentRawCode = '';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initPhaseList();
  initTabs();
  initControls();
  initTooltipEvents();
  renderCurrentPhase();
});

function initControls() {
  const chkAnn = document.getElementById('chk-annotations');
  if (chkAnn) {
    chkAnn.addEventListener('change', (e) => {
      showAnnotations = e.target.checked;
      renderCodeDisplay();
    });
  }

  const btnCopy = document.getElementById('btn-copy-code');
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      if (currentRawCode) {
        try {
          await navigator.clipboard.writeText(currentRawCode);
          btnCopy.innerHTML = '<span>✔</span> コピー完了!';
          setTimeout(() => {
            btnCopy.innerHTML = '<span>📋</span> コピー';
          }, 2000);
        } catch (err) {
          console.error('Copy failed', err);
        }
      }
    });
  }
}

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

  // Default selected file for Code Explorer
  const availableFiles = phase.files.map(f => f.name);
  if (!availableFiles.includes(selectedFileName)) {
    selectedFileName = availableFiles[0];
  }
  if (currentTabId === 'code') {
    renderCodeExplorer();
  }
}

async function renderCodeExplorer() {
  const phase = CURRICULUM_DATA['01_hoops_3d'].phases[currentPhaseIndex];
  const fileTreeEl = document.getElementById('file-tree-list');
  const codeFileNameEl = document.getElementById('code-file-name');
  const codeAnnotationEl = document.getElementById('code-file-summary');
  const jumpListEl = document.getElementById('jump-pills-list');

  if (!fileTreeEl) return;

  // 1. Render File Tree
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

  // 2. Render Quick Jump Pills
  if (jumpListEl) {
    jumpListEl.innerHTML = '';
    const fileAnnotationData = CODE_ANNOTATIONS[curFile.name];
    if (fileAnnotationData && fileAnnotationData.jumps) {
      document.getElementById('jump-anchors-bar').style.display = 'flex';
      fileAnnotationData.jumps.forEach(j => {
        const pill = document.createElement('button');
        pill.className = 'jump-pill';
        pill.innerText = j.label;
        pill.addEventListener('click', () => {
          scrollToCodeMatch(j.match);
        });
        jumpListEl.appendChild(pill);
      });
    } else {
      document.getElementById('jump-anchors-bar').style.display = 'none';
    }
  }

  // 3. Fetch Code Content
  const filePath = `../phases/${phase.id === 'phase_01' ? 'phase_01_3d_mock' : 'phase_02_1v1_defender'}/src/${curFile.name}`;
  try {
    const res = await fetch(filePath);
    if (res.ok) {
      currentRawCode = await res.text();
      renderCodeDisplay();
    } else {
      document.getElementById('code-display').innerHTML = `<div style="padding: 20px; color: #94a3b8;">// ${curFile.name} のコードを読み込み中...</div>`;
    }
  } catch (e) {
    document.getElementById('code-display').innerHTML = `<div style="padding: 20px; color: #ff3d00;">// コード読み込みエラー: ${e.message}</div>`;
  }
}

function renderCodeDisplay() {
  const codeDisplayEl = document.getElementById('code-display');
  if (!codeDisplayEl || !currentRawCode) return;

  const curAnnotationData = CODE_ANNOTATIONS[selectedFileName];
  const notes = curAnnotationData ? curAnnotationData.notes : [];

  const lines = currentRawCode.split('\n');
  codeDisplayEl.innerHTML = '';

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const lineDiv = document.createElement('div');
    lineDiv.className = 'code-line';
    lineDiv.id = `line-${lineNum}`;

    const numSpan = document.createElement('span');
    numSpan.className = 'line-num';
    numSpan.innerText = lineNum;

    const contentSpan = document.createElement('span');
    contentSpan.className = 'line-content';
    contentSpan.innerHTML = highlightSyntaxLine(rawLine);

    lineDiv.appendChild(numSpan);
    lineDiv.appendChild(contentSpan);
    codeDisplayEl.appendChild(lineDiv);

    // Check if this line matches an annotation
    if (showAnnotations && notes && notes.length > 0) {
      const matchingNote = notes.find(n => rawLine.includes(n.match));
      if (matchingNote) {
        const annotationContainer = document.createElement('div');
        annotationContainer.className = 'inline-annotation-container';
        annotationContainer.innerHTML = `
          <div class="inline-annotation-card">
            <div class="annotation-header">💡 ${matchingNote.title}</div>
            <div class="annotation-body">${matchingNote.desc}</div>
            ${matchingNote.formula ? `<div class="annotation-formula">${matchingNote.formula}</div>` : ''}
          </div>
        `;
        codeDisplayEl.appendChild(annotationContainer);
      }
    }
  });
}

function scrollToCodeMatch(matchText) {
  const lines = currentRawCode.split('\n');
  const lineIdx = lines.findIndex(l => l.includes(matchText));
  if (lineIdx !== -1) {
    const targetEl = document.getElementById(`line-${lineIdx + 1}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add('target-highlight');
      setTimeout(() => {
        targetEl.classList.remove('target-highlight');
      }, 2000);
    }
  }
}

// Interactive API Dictionary for Hover Tooltips (Beginner to Advanced)
const API_DICTIONARY = {
  // === JavaScript 基礎構文 (Beginner Core) ===
  'this': {
    category: '📘 JS 基礎構文',
    desc: '自分自身（インスタンス）を指差すキーワード。クラスで作られた「自分自身のデータ（例: 自分の位置 this.mesh.position、自分の速度）」にアクセスする時に使います。',
    example: 'this.speed = 8.5; // 自分自身のプロパティに代入'
  },
  'class': {
    category: '📘 JS 基礎構文',
    desc: '設計図（クラス）を作るキーワード。プレイヤーやボールなど、同じ仕組みを持つオブジェクトを量産するための「金型」を定義します。',
    example: 'export class Player { ... }'
  },
  'constructor': {
    category: '📘 JS 基礎構文',
    desc: '初期化関数（コンストラクタ）。new で設計図から実体を生み出した瞬間に、1回だけ自動で実行される「誕生・準備」の特別な関数です。',
    example: 'constructor(scene, color) { this.scene = scene; }'
  },
  'const': {
    category: '📘 JS 基礎構文',
    desc: '書き換え禁止の変数（定数）。一度入れた値を後から変更できない安全な入れ物。バグを防ぐため現代のJavaScriptでは基本これを使います。',
    example: 'const gravity = -18.5;'
  },
  'let': {
    category: '📘 JS 基礎構文',
    desc: '書き換え可能な変数。スコアの加算やタイマーのカウントアップなど、後から中身を上書き・変更できる入れ物です。',
    example: 'let score = 0; score += 2;'
  },
  'new': {
    category: '📘 JS 基礎構文',
    desc: '実体化（インスタンス生成）。クラス（設計図）から、画面上で動く本物のオブジェクトを新しく生み出すキーワードです。',
    example: 'const ball = new Ball(scene);'
  },
  'return': {
    category: '📘 JS 基礎構文',
    desc: '計算結果を返す・関数を終了するキーワード。計算した答えを呼び出し元に届けて、その関数の処理を終えます。',
    example: 'return Math.max(0, result);'
  },
  'import': {
    category: '📘 JS 基礎構文',
    desc: 'モジュールの輸入。別のファイルで作られた便利なクラスや関数を持ち込んで使えるようにします。',
    example: 'import * as THREE from \'three\';'
  },
  'export': {
    category: '📘 JS 基礎構文',
    desc: 'モジュールの輸出。このファイルで作ったクラスや関数を、他のファイルでも使えるように公開します。',
    example: 'export class Defender { ... }'
  },
  'if': {
    category: '📘 JS 基礎構文',
    desc: '条件分岐。「もし〜ならAを実行」とプログラムの進行を枝分かれさせる最も基本的な構文です。',
    example: 'if (this.isShooting) { this.updateShot(); }'
  },
  'else': {
    category: '📘 JS 基礎構文',
    desc: '条件分岐（それ以外）。if の条件に当てはまらなかった場合に実行する処理を指定します。',
    example: 'if (hit) { score++; } else { streak = 0; }'
  },
  'switch': {
    category: '📘 JS 基礎構文',
    desc: 'たくさんの条件分け。AIの状態（GUARD / CONTEST / REBOUND）など、複数の選択肢に応じて処理を綺麗に整理します。',
    example: 'switch (this.state) { case DefenderState.GUARD: ... }'
  },
  'case': {
    category: '📘 JS 基礎構文',
    desc: 'switch文の分岐先。「値が〇〇のとき」という個別のケースを定義します。',
    example: 'case DefenderState.CONTEST: this.contest(); break;'
  },
  'break': {
    category: '📘 JS 基礎構文',
    desc: '処理の脱出。switch文やループ文（for/while）の処理をそこで終了して外へ抜けます。',
    example: 'break; // switch文を抜ける'
  },
  'async': {
    category: '📘 JS 基礎構文',
    desc: '非同期関数。裏で少し時間がかかる処理（ファイル読み込みや通信など）を行う特別な関数を定義します。',
    example: 'async function loadAudio() { ... }'
  },
  'await': {
    category: '📘 JS 基礎構文',
    desc: '待ち合わせ。async関数の中で使い、少し時間がかかる非同期処理が終わるのを順番に待ちます。',
    example: 'const res = await fetch(\'data.json\');'
  },
  'null': {
    category: '📘 JS 基礎構文',
    desc: '空っぽ（意図的に値が存在しない状態）。「何も入っていない」ことを明示する特別な値です。',
    example: 'this.target = null;'
  },
  'undefined': {
    category: '📘 JS 基礎構文',
    desc: '未定義（値がまだセットされていない状態）。変数を宣言した直後などの初期状態です。',
    example: 'if (obj === undefined) { ... }'
  },

  // === Three.js 3D Vector & Math ===
  'clone': {
    category: '🎮 Three.js ベクトル',
    desc: 'ベクトルの複製を作成します。元の座標値を書き換えずに一時計算を行いたい時に必須です。',
    example: 'const tempPos = playerPos.clone();'
  },
  'sub': {
    category: '🎮 Three.js ベクトル',
    desc: 'ベクトルの引き算を行います（v1 - v2）。AからBへの方向と直線距離を求める時に使います。',
    example: 'const toHoop = hoopPos.clone().sub(playerPos);'
  },
  'subVectors': {
    category: '🎮 Three.js ベクトル',
    desc: '2つのベクトルの差（a - b）を計算し、自身に結果を代入します。',
    example: 'direction.subVectors(target, origin);'
  },
  'normalize': {
    category: '🎮 Three.js ベクトル',
    desc: 'ベクトルの向きを変えずに長さを「1（単位ベクトル）」にします。移動速度を掛け算する前のベースを作ります。',
    example: 'const dir = toHoop.normalize();'
  },
  'dot': {
    category: '🎮 Three.js ベクトル (内積)',
    desc: '2つのベクトルの内積（向きの一致度）を計算。正面なら1.0、直角なら0.0、背後なら-1.0を返します。',
    example: 'const alignment = shooterToHoop.dot(shooterToDef);'
  },
  'addScaledVector': {
    category: '🎮 Three.js ベクトル',
    desc: 'ベクトルに倍率（速度や距離）を掛け算しながら足し合わせます（v1 + v2 * s）。',
    example: 'pos.addScaledVector(velocity, delta);'
  },
  'distanceTo': {
    category: '🎮 Three.js ベクトル',
    desc: '2点間の直線距離（三平方の定理 √(Δx² + Δz²)）を計算します。ディフェンスとの距離判定に活用。',
    example: 'const dist = playerPos.distanceTo(defenderPos);'
  },
  'applyAxisAngle': {
    category: '🎮 Three.js ベクトル',
    desc: '指定した回転軸（例: Y軸）を中心に、指定した角度（ラジアン）だけベクトルを回転させます。',
    example: 'offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);'
  },
  'set': {
    category: '🎮 Three.js メソッド',
    desc: 'X, Y, Z の座標値を一度に代入・再設定します。',
    example: 'velocity.set(vx, vy, vz);'
  },

  // === JavaScript 数学関数 (Math) ===
  'Math.sin': {
    category: '📐 数学・物理',
    desc: 'サイン波（-1.0 〜 +1.0）を周期的に返します。ドリブルや歩行の上下動ループアニメーションの基本です。',
    example: 'const bounceY = Math.abs(Math.sin(timer * 8));'
  },
  'Math.cos': {
    category: '📐 数学・物理',
    desc: 'コサイン波を返します。円運動やサイン波と組み合わせた足の前後スイングに使います。',
    example: 'const offsetX = Math.cos(angle) * radius;'
  },
  'Math.sqrt': {
    category: '📐 数学・物理',
    desc: '√x（平方根）を計算します。物理の斜方投射で最高点までの到達時間を求める公式に使われます。',
    example: 'const tUp = Math.sqrt((2 * h) / -g);'
  },
  'Math.atan2': {
    category: '📐 数学・物理',
    desc: 'XとZの移動量から、プレイヤーが向くべき回転角度（ラジアン）を360度全方位で計算します。',
    example: 'const angle = Math.atan2(dirX, dirZ);'
  },
  'Math.max': {
    category: '📐 数学・物理',
    desc: '与えられた数値の中で最も大きい値を返します。下限ガード（0以下にならないようにする等）で活用。',
    example: 'const successRate = Math.max(0, quality - contest);'
  },
  'Math.min': {
    category: '📐 数学・物理',
    desc: '与えられた数値の中で最も小さい値を返します。上限リミッター（1.0を超えないようにする等）で活用。',
    example: 'const power = Math.min(1.0, chargeTime / 0.55);'
  },
  'Math.abs': {
    category: '📐 数学・物理',
    desc: '絶対値（プラスの大きさ）を返します。目標時間との誤差（ズレの大きさ）を計算する時に使います。',
    example: 'const error = Math.abs(chargeTime - 0.55);'
  },

  // === Three.js 3D Objects & Materials ===
  'CanvasTexture': {
    category: '🎨 Three.js テクスチャ',
    desc: 'HTML5 Canvas にプログラム描画した図形（木目コートや白線）を3D表面に貼り付けるテクスチャ。',
    example: 'const texture = new THREE.CanvasTexture(canvas);'
  },
  'MeshStandardMaterial': {
    category: '🌟 Three.js マテリアル',
    desc: '光の反射（粗さ roughness や金属感 metalness）を物理ベースでリアルに表現する標準マテリアル。',
    example: 'new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.4 });'
  },
  'Mesh': {
    category: '🧱 Three.js 3D物体',
    desc: '形状（ジオメトリ）と見た目（マテリアル）を組み合わせた、3D空間に配置できる本物の物体。',
    example: 'const mesh = new THREE.Mesh(geometry, material);'
  },
  'Group': {
    category: '📦 Three.js グループ',
    desc: '複数の3Dパーツ（頭、胴体、腕、足など）を1つにまとめるフォルダのような入れ物。',
    example: 'this.mesh = new THREE.Group();'
  },

  // === Web Audio API ===
  'AudioContext': {
    category: '🔊 Web Audio API',
    desc: 'ブラウザ上でリアルタイムに音波を合成・加工・出力するためのオーディオ処理環境。',
    example: 'const ctx = new (window.AudioContext || window.webkitAudioContext)();'
  },
  'createOscillator': {
    category: '🔊 Web Audio API',
    desc: 'サイン波や矩形波、三角波などの基本音波を発振します。周波数を急降下させてバウンド音を合成。',
    example: 'const osc = ctx.createOscillator(); osc.frequency.setValueAtTime(140, ctx.currentTime);'
  },
  'createBiquadFilter': {
    category: '🔊 Web Audio API',
    desc: '高音をカット（ローパス）したり特定の周波数を強調する音響フィルター。体育館の響きを再現。',
    example: 'const filter = ctx.createBiquadFilter(); filter.type = "lowpass";'
  },
  'requestAnimationFrame': {
    category: '⏱️ Web API アニメーション',
    desc: 'ブラウザの画面リフレッシュレート（60FPS/120FPS）に合わせて次フレームの更新関数を呼び出します。',
    example: 'requestAnimationFrame(this.animate.bind(this));'
  }
};

// Tooltip Management
function initTooltipEvents() {
  const tooltipEl = document.getElementById('code-tooltip');
  const codeDisplayEl = document.getElementById('code-display');
  if (!tooltipEl || !codeDisplayEl) return;

  codeDisplayEl.addEventListener('mouseover', (e) => {
    const glossaryTarget = e.target.closest('.tok-glossary');
    if (glossaryTarget) {
      const termKey = glossaryTarget.dataset.term;
      const dictItem = API_DICTIONARY[termKey];
      if (dictItem) {
        // Set category class for dynamic coloring
        let catClass = 'cat-js';
        if (dictItem.category.includes('Three.js')) catClass = 'cat-three';
        else if (dictItem.category.includes('数学')) catClass = 'cat-math';
        else if (dictItem.category.includes('Audio')) catClass = 'cat-audio';

        const isFunc = termKey.includes('Math.') || ['clone', 'sub', 'subVectors', 'normalize', 'dot', 'addScaledVector', 'distanceTo', 'applyAxisAngle', 'set', 'createOscillator', 'createBiquadFilter', 'requestAnimationFrame'].includes(termKey);

        tooltipEl.innerHTML = `
          <div class="tooltip-header">
            <span class="tooltip-term">${termKey}${isFunc ? '()' : ''}</span>
            <span class="tooltip-category ${catClass}">${dictItem.category}</span>
          </div>
          <div class="tooltip-desc">${dictItem.desc}</div>
          ${dictItem.example ? `<div class="tooltip-example">${dictItem.example}</div>` : ''}
        `;
        tooltipEl.classList.remove('hidden');
        positionTooltip(e, tooltipEl);
      }
    }
  });

  codeDisplayEl.addEventListener('mousemove', (e) => {
    if (!tooltipEl.classList.contains('hidden')) {
      positionTooltip(e, tooltipEl);
    }
  });

  codeDisplayEl.addEventListener('mouseout', (e) => {
    const glossaryTarget = e.target.closest('.tok-glossary');
    if (glossaryTarget) {
      tooltipEl.classList.add('hidden');
    }
  });
}

function positionTooltip(e, tooltipEl) {
  const padding = 16;
  let x = e.clientX + padding;
  let y = e.clientY + padding;

  const tooltipWidth = tooltipEl.offsetWidth || 340;
  const tooltipHeight = tooltipEl.offsetHeight || 150;

  // Prevent right overflow
  if (x + tooltipWidth > window.innerWidth - padding) {
    x = e.clientX - tooltipWidth - padding;
  }

  // Prevent bottom overflow
  if (y + tooltipHeight > window.innerHeight - padding) {
    y = e.clientY - tooltipHeight - padding;
  }

  tooltipEl.style.left = `${Math.max(padding, x)}px`;
  tooltipEl.style.top = `${Math.max(padding, y)}px`;
}

// Lightweight Syntax Highlighter for JavaScript with Beginner & Advanced Glossary Detection
function highlightSyntaxLine(line) {
  if (!line) return '&nbsp;';

  const esc = str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Check for line comment
  if (line.includes('//')) {
    const splitIdx = line.indexOf('//');
    const before = line.substring(0, splitIdx);
    const comment = line.substring(splitIdx);
    return highlightCodeTokens(esc(before)) + `<span class="tok-comment">${esc(comment)}</span>`;
  }

  return highlightCodeTokens(esc(line));
}

function highlightCodeTokens(str) {
  // 1. Strings ('...' or "..." or `...`)
  str = str.replace(/(['"`])(.*?)\1/g, '<span class="tok-str">$1$2$1</span>');

  // 2. Numbers (including hex 0x...)
  str = str.replace(/\b(0x[0-9a-fA-F]+|\d+(\.\d+)?)\b/g, '<span class="tok-num">$1</span>');

  // 3. Types / Built-in Objects
  const types = ['THREE', 'Vector3', 'Group', 'Mesh', 'PerspectiveCamera', 'WebGLRenderer', 'Scene', 'Color', 'FogExp2', 'BoxGeometry', 'SphereGeometry', 'CylinderGeometry', 'TorusGeometry', 'MeshStandardMaterial', 'MeshPhysicalMaterial', 'CanvasTexture', 'AudioContext', 'OscillatorNode', 'Date', 'document', 'window'];
  const typeRegex = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
  str = str.replace(typeRegex, '<span class="tok-type">$1</span>');

  // 4. Keywords
  const keywords = ['import', 'export', 'class', 'constructor', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'new', 'this', 'async', 'await', 'switch', 'case', 'break', 'for', 'while', 'true', 'false', 'null', 'undefined'];
  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  str = str.replace(keywordRegex, '<span class="tok-kw">$1</span>');

  // 5. Glossary Terms (Wrap recognized terms with tok-glossary)
  // Sort terms by length descending so Math.sin matches before Math
  const dictTerms = Object.keys(API_DICTIONARY).sort((a, b) => b.length - a.length);
  dictTerms.forEach(term => {
    const escapedTerm = term.replace('.', '\\.');
    const termRegex = new RegExp(`(?<!data-term=")\\b(${escapedTerm})\\b(?![^<]*>)`, 'g');
    str = str.replace(termRegex, `<span class="tok-glossary" data-term="${term}">$1</span>`);
  });

  // 6. Function calls: foo(...)
  str = str.replace(/\b([a-zA-Z0-9_$]+)\s*(?=\()/g, '<span class="tok-func">$1</span>');

  return str;
}

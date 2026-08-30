/**
 * ==========================================================================
 * 01_button_screen_transition - メインスクリプト (main.js)
 *
 * 【このコードで学べること】
 * 1. addEventListener を使ったボタンクリックの検知
 * 2. ゲームで一般的な「画面の切り替え」（クラスの付け替え）
 * 3. Web制作で一般的な「別ページへの遷移」（location.href）
 * 4. Web Audio API によるクリック効果音の再生（外部ファイル不要）
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. HTML要素の取得
// --------------------------------------------------------------------------
// ボタン要素
const startButton = document.querySelector('#btn-start-wrapper');
const backButton = document.querySelector('#btn-back-wrapper');

// 画面要素（タイトル画面とゲーム画面）
const screenTitle = document.querySelector('#screen-title');
const screenGame = document.querySelector('#screen-game');

// 画面遷移モードのラジオボタン（SPA切り替えか、別ページ遷移か）
const modeRadios = document.querySelectorAll('input[name="transition-mode"]');

// --------------------------------------------------------------------------
// 2. クリック効果音の生成 (Web Audio API)
//    ※音声ファイルがなくても、ブラウザ内部で短い効果音を生成して鳴らします
// --------------------------------------------------------------------------
let audioContext = null;

function playClickSound(freq = 600) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioContext.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.09);
  } catch (e) {
    // 音声再生がブロックされた場合は何もしない
  }
}

// --------------------------------------------------------------------------
// 3. 画面遷移処理
// --------------------------------------------------------------------------

/**
 * 現在選択されている遷移モードを取得 ('spa' または 'page')
 */
function getSelectedMode() {
  const checked = document.querySelector('input[name="transition-mode"]:checked');
  return checked ? checked.value : 'spa';
}

/**
 * スタートボタンが押されたときの処理
 */
function onStartClick() {
  playClickSound(520); // ピピッという効果音

  const mode = getSelectedMode();

  if (mode === 'spa') {
    // 【方式A: SPA画面切り替え】
    // タイトル画面を非表示にして、ゲーム画面を表示する
    screenTitle.classList.remove('active');
    screenGame.classList.add('active');
    console.log('画面遷移: タイトル画面 -> ゲーム画面 (同一ページ内切り替え)');
  } else {
    // 【方式B: 別ページへの遷移】
    // 実際に別ファイル (next_page.html) に遷移する
    console.log('画面遷移: next_page.html へ移動中...');
    setTimeout(() => {
      window.location.href = './next_page.html';
    }, 150); // 少しだけ余韻を残して遷移
  }
}

/**
 * 戻るボタンが押されたときの処理
 */
function onBackClick() {
  playClickSound(400);

  // ゲーム画面を非表示にして、タイトル画面を表示する
  screenGame.classList.remove('active');
  screenTitle.classList.add('active');
  console.log('画面遷移: ゲーム画面 -> タイトル画面');
}

// --------------------------------------------------------------------------
// 4. イベントリスナーの登録（ボタンに処理を紐づける）
// --------------------------------------------------------------------------
startButton.addEventListener('click', onStartClick);
backButton.addEventListener('click', onBackClick);

console.log('01_button_screen_transition: スクリプト初期化完了');

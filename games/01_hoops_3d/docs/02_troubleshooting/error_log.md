# 🛠️ トラブルシューティング & エラー解決ログ (Error Log)

プログラミングにおいて、**エラーは「失敗」ではなく「コードの仕組みを深く理解するチャンス」** です。
開発中に実際に直面したエラーと、その原因特定・修正（デバッグ）手順をここにすべて記録します。

---

## 📑 エラー事例一覧

| ID | 発生箇所 | 現象概要 | 主な原因 | 解決状況 |
| :--- | :--- | :--- | :--- | :---: |
| **[ERR-001](#err-001)** | `src/main.js` | 起動時に3D画面が真っ暗になる | インスタンス初期化順序の誤り（未定義アクセス） | ✅ 解決 |
| **[ERR-002](#err-002)** | npm / MCP | `npm error 404 Not Found` でパッケージが見つからない | パッケージ名の誤り (`server-google-drive` $\rightarrow$ `server-gdrive`) | ✅ 解決 |
| **[ERR-003](#err-003)** | Phase 2 タッチ操作 | シュートボタンが反応しない・押したままになる | ボタン外での `touchend` / `touchcancel` を確実に取得できない | ✅ 解決 |
| **[ERR-004](#err-004)** | `src/player.js` / `defender.js` | シュート後にボールが戻らず、敵選手が追従してこない | ボール回収条件の距離依存と、REBOUND状態でのAI立ち往生 | ✅ 解決 |
| **[ERR-005](#err-005)** | `src/ball.js` / `player.js` | 40本打ってもシュートが入らない（過剰難易度＆メーター不可視） | メーターwidth未更新、20msの超シビア判定、リム判定の厳格化 | ✅ 解決 |

---

### [ERR-001] 起動時に3D画面が真っ暗になり描画されない

* **発生日:** 2026-08-15
* **現象:**
  * 画面上のHTML/CSS UI（スコアボード、ボタン等）は正常に表示されているが、中央の3Dコートやプレイヤーが表示されず、背景が真っ暗なまま停止した。
* **エラーメッセージ (Browser Console):**
  ```text
  TypeError: Cannot read properties of undefined (reading 'position')
      at Game.updateCameraPosition (main.js:117)
      at Game.initScene (main.js:50)
      at new Game (main.js:21)
  ```
* **根本原因 (Root Cause):**
  * `Game` クラスのコンストラクタ内で、`initScene()` を `initGameObjects()` より先に実行していました。
  * `initScene()` の末尾で `this.updateCameraPosition(true)` を呼び出していたため、まだ生成されていない `this.player`（値は `undefined`）の `position` プロパティを参照しようとして JavaScript が例外エラーでクラッシュし、描画ループ（`requestAnimationFrame`）が起動しませんでした。
* **修正方法 (Fix):**
  1. `this.updateCameraPosition(true)` の実行順序を、`this.initGameObjects()` が完了した後に移動。
  2. `updateCameraPosition()` 関数の先頭に防御的ガード（Defensive Guard）を追加：
     ```javascript
     updateCameraPosition(instant = false) {
       if (!this.player) return; // playerが未生成なら何もしないで安全に戻る
       const pPos = this.player.position;
       // ...
     }
     ```
* **💡 生徒への学び (Key Takeaways for Students):**
  * **初期化順序（ライフサイクル）の重要性**: 「使う前に作る（初期化する）」というオブジェクトの順序関係を意識すること。
  * **防御的プログラミング (Defensive Programming)**: 変数が `null` や `undefined` の可能性を考慮して早期リターン（ガード節）を書いておくと、不意のクラッシュを防げる。

---

### [ERR-002] npm パッケージのインストール時に 404 Not Found エラー

* **発生日:** 2026-08-15
* **現象:**
  * MCP サーバー設定で Google Drive 連携用のパッケージを呼び出した際、404 エラーが発生して接続が終了した。
* **エラーメッセージ:**
  ```text
  npm error code E404
  npm error 404 Not Found - GET https://registry.npmjs.org/@modelcontextprotocol%2fserver-google-drive - Not found
  The requested resource '@modelcontextprotocol/server-google-drive@*' could not be found
  ```
* **根本原因 (Root Cause):**
  * 指定したパッケージ名 `@modelcontextprotocol/server-google-drive` が npm レジストリに存在していなかった。
* **修正方法 (Fix):**
  * 正しい公式パッケージ名である `@modelcontextprotocol/server-gdrive` に修正して再実行した。
* **💡 生徒への学び (Key Takeaways for Students):**
  * パッケージマネージャー（npm）の `404 Not Found` は、スペルミスや略称（`gdrive`）による名称違いが主な原因です。公式ドキュメントや npmjs.com で正確なパッケージ名を確認する習慣が大切です。

---

### [ERR-003] Phase 2のシュートボタンが反応しない・押したままになる

* **発生日:** 2026-08-18
* **現象:**
  * PCの通常クリックではシュートできるが、スマートフォンやタッチ操作では、指がボタンから少し外れたときにリリースを検出できず、シュートが完了しない場合があった。
* **根本原因 (Root Cause):**
  * `touchstart` と `touchend` をシュートボタンへ個別登録していた。
  * 押している間に指がボタン領域の外へ移動した場合、ボタン側で終了イベントを確実に受け取れなかった。
* **修正方法 (Fix):**
  * マウス、タッチ、ペンを共通に扱える Pointer Eventsへ統一した。
  * `setPointerCapture()` を使い、指がボタン外へ移動しても `pointerup` を受け取れるようにした。
  * `pointercancel`、`lostpointercapture`、ウィンドウの `blur` でも必ずシュート状態を解除する安全処理を追加した。
* **💡 生徒への学び (Key Takeaways for Students):**
  * **Pointer Events:** マウス、指、ペンを別々に実装せず、1つのイベント方式で扱える。
  * **Pointer Capture:** ドラッグ中や長押し中にポインターが要素外へ出ても、最後まで操作を追跡できる。
  * **キャンセル処理:** 正常な終了だけでなく、画面切替やOSによる中断も考えると、入力が固まらない安全なゲーム操作になる。

---

### [ERR-004] シュート後にボールが戻らず、敵AIディフェンダーが追従してこない

* **発生日:** 2026-08-30
* **現象:**
  * シュートを打った後、ボールがゴール下でバウンドしたまま手元に戻ってこない。
  * 敵AIディフェンダーがゴール下に落ちたボールの場所で立ち止まり、プレイヤーをマーク（追従）しなくなる。
* **根本原因 (Root Cause):**
  1. `player.js` のボール回収条件が `distToBall < 1.3 && ball.position.y < 0.35` となっており、シュート地点（5〜6m離れた位置）からゴール下まで歩いて拾いに行かないと回収できない設計になっていた。
  2. ボールが床に落ちたままで `ball.state === BallState.FREE_BOUNCE` が継続するため、`defender.js` が `REBOUND` モード（ボール回収優先）のまま解除されず、ゴール下のボール位置で立ち往生していた。
* **修正方法 (Fix):**
  1. `player.js` に `freeBallTimer` を導入し、床にバウンドして 0.75 秒経過後に自動的にボールマンの手元へボールが返却（リセット）される仕様にした。
  2. ボールが手元に戻った（`ball.state === BallState.DRIBBLE`）瞬間にディフェンダーが即座に `GUARD` モードへ戻り、ボールマンへのマーク追従を再開するようにした。
* **💡 生徒への学び (Key Takeaways for Students):**
  * **ステートマシンの連鎖不具合:** 1つのオブジェクトの状態（ボールが回収されない）が、別のAIの状態（ディフェンダーがリバウンドモードから抜け出せない）を固まらせる原因になる。状態遷移の終了条件とフォールバック（時間経過での自動リセット）を設けることが大切。

---

### [ERR-005] 40本打ってもシュートが入らない（メーター不可視と過剰な難易度判定）

* **発生日:** 2026-09-05
* **現象:**
  * シュートを40本打っても1本もゴールに入らない。敵の妨害なのか、確率なのか、自分の操作が悪いのか分からない状態になった。
* **根本原因 (Root Cause):**
  1. **シュートメーターのゲージ幅（width）未更新バグ:** 横型メーターであるにもかかわらず、スクリプト側で `style.height` を更新していたため、画面上でゲージが横に全く伸びず、プレイヤーがタイミングを目視できていなかった。
  2. **パーフェクトグリーンの許容誤差がわずか 20ms（超シビア）:** `timingQuality >= 0.92` の判定が厳しすぎ、約1フレーム（20ミリ秒）の誤差で外れる仕様になっていた。
  3. **シューターズタッチ（リング衝突時の吸い込み）の欠如:** リングの衝突判定がシビアすぎ、わずかでも中心からズレると100%リムで跳ね飛ばされて入らないようになっていた。
  4. **ディフェンスのコンテスト判定範囲の過大:** 3.8m離れていても妨害が入る仕様になっており、常にシュート弾道が歪められていた。
* **修正方法 (Fix):**
  1. `main.js` で `style.width` を更新するように修正し、緑のスイートスポットを視覚的に発光するようにした。
  2. `player.js` の許容時間（`shotTolerance`）を大幅に緩和し、滑らかなカーブ（1.15乗）で GOOD TIMING（黄色）でも気持ちよく入るようにした。
  3. `ball.js` に「シューターズタッチ（Soft Rim Attraction / Friendly Roll）」を導入。リング縁をかすめても内側へポロッと吸い込まれるリアルなバスケ物理を実装。
  4. `defender.js` の妨害距離を 2.3m 以内に限定し、離れていれば確実に WIDE OPEN になるようにした。
* **💡 生徒への学び (Key Takeaways for Students):**
  * **ゲームフィールの重要性:** 数学的に厳密すぎる判定は、プレイヤーに「理不尽なストレス」を与えてしまう。ゲーム開発では「少し甘めに判定して気持ちよく成功させる演出（コヨーテタイムやシューターズタッチ）」が非常に大切。
  * **UIのバグがゲーム難易度を破壊する:** 「メーターが見えていない」だけで、ユーザーは何が起きているかわからなくなる。視覚フィードバックの正確性を常に第一に確認すること。



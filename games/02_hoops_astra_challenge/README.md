# HOOPS: WORLD TOUR — 制作開始パッケージ

版：1.23 / 更新日：2026-09-20（日本時間） / 状態：G0合格・G3のスマホ操作/WebGL試作版

最新Windows：`Builds/g3-20260920-10/Hoops.exe`。touch 12＋runtime 131＋world 174＝317件成功。[Windows検証](Evidence/g3-20260920-10/VALIDATION.md)。最新Web：`Builds/web-g3-20260920-10/`、ブラウザーのタッチ検証8件成功。[Web検証](Evidence/web-g3-20260920-10/VALIDATION.md)と[引継ぎ](HANDOFF.md)。

G0合格版 `Builds/g0-20260920-02/HoopsG0.exe` と [G0記録](Evidence/g0-20260920-02/VALIDATION.md) は保全済み。再ビルド手順は `Build-G1.ps1 -EditorPath <Unity.exeの実パス>`。ソース正本はUnityProject、固定版はEvidence内のsource.zip。配布用ではない。

次はスマホ実機で横持ち操作・速度・音を確認。2026-09-20のLAN試遊先は `http://192.168.1.10:8765/`（PC/配信プロセス稼働中だけ、外部公開なし）。[方針](docs/00_roadmap/MOBILE_WEB_PLAN.md)と[起動手順](docs/01_sessions/session_20260920_mobile_web.md)。要件Markdown v1.13、Word v1.6で未同期・レイアウト未検証。板専用音・床材差と人間による試聴は残る。

**既存アセットで先に公開可能な3Dバスケットを組み立て、Blenderによる独自化と教材化は後から行う。**

企画名は「Astra短時間完成チャレンジ」。ゲーム名「HOOPS: WORLD TOUR」は仮称。初期パッケージ作成時は資料のみ。現在の実装と検証状況は冒頭の最新版とHANDOFFを参照。

## 1. 読む順番

| 順 | ファイル | 役割 |
|---|---|---|
| 1 | [企画書](docs/00_roadmap/PROJECT_PROPOSAL.md) | 会話の経緯、目的、作品像、優先順位 |
| 2 | [要件定義書](docs/00_roadmap/REQUIREMENTS.md) | 初版の実装範囲と完成条件の正本 |
| 3 | [精査・意思決定記録](docs/00_roadmap/REVIEW_DECISIONS.md) | 過去の説明の訂正、採用・保留の根拠 |
| 4 | [アセット候補・出典台帳](docs/00_roadmap/ASSET_SOURCES.md) | CC0中心の調達候補、利用条件、確認状況 |
| 5 | [Astra指示書](ASTRA_BRIEF.md) | ローカル制作エージェントへの実行指示 |
| 6 | [技術設計](docs/03_architecture/TECHNICAL_DESIGN.md) | ボール制御、得点判定、ワールド構成 |
| 7 | [受入試験](docs/03_architecture/ACCEPTANCE_TESTS.md) | 実機で検証すべき項目と出荷判定 |
| 8 | [公開・教材化計画](docs/01_sessions/PUBLICATION_COURSE_PLAN.md) | SNSでの見せ方、計測、後日の教材化 |
| 9 | [制作ログ](docs/01_sessions/DEVLOG.md) / [エラーログ](docs/02_troubleshooting/ERROR_LOG.md) | 実際の作業・失敗の追記先 |
| 10 | [引継ぎ](HANDOFF.md) | 現在地、未確認事項、次の一手 |

人間向けのWord閲覧版は `docs/00_roadmap/01_企画書.docx` と `02_要件定義書.docx`。同名内容のMarkdownから生成した閲覧用スナップショットであり、**実装時の正本はMarkdown**。変更時はMarkdownを先に直し、Wordを再生成する。両方を別々に手編集しない。

## 2. 保存場所と既存資料の保護

実在を確認した保存系列は `Work/Game/games/02_hoops_astra_challenge/`。会話中の「WORK/Gemes」や「Games」は呼び方であり、既存フォルダを改名していない。

[このプロジェクトのDriveフォルダ](https://drive.google.com/drive/folders/1EElKwxVhOi6dZyAqfNiIHHZVqCFiIcLP)

兄弟フォルダ `../01_hoops_3d/` は従来のThree.js教材であり、読み取り参照に留める。上位 `Game/GEMINI.md` にある独立プロジェクト・相対パス・設計判断の記録方針を引き継ぐ。新たなグローバルルールや締め作業Skillは作らない。既存の上位ルール、AGENTS、Skill、引継ぎ文書がローカルにあれば制作開始時に確認する。

今回、既存教材、共通ポータル、既存GEMINI.md、Git設定は変更していない。新ゲームのポータル登録は、実際に起動できる成果物ができてから別途判断する。

## 3. 今回の仕様の要点

- 攻撃側固定の3Dバスケチャレンジ。CPUは守備のみ。攻守交代のある完全な1on1ではない。
- Street → Gym → Arena → Neon。各コート3本成功で次へ。初版完成は4コート通しのWindows x64ビルド。
- 既存のCC0人物・環境素材を優先。ボール、リングの衝突形状、必要な簡易モーションは小さな自作で補う。
- 移動、自動ドリブル、長押し・離すシュート、タイミングと守備圧、得点、リトライ、音・演出を完成させる。
- Blenderは初版の必須工程にしない。ただし取得済み素材の短い補正が最短経路なら許容する。
- オンライン、5対5、CPU攻撃、リバウンド争奪、課金、ロスターは初版対象外。

## 4. 先に知るべき訂正

無料の価格表示と、AI入力・改変・素材再配布の許可は別問題。Starter Assetsは独自EULA表示、一般のAsset Store素材にはAI利用の制限条項があるため、個別許可の確認前に自動採用しない。CC0素材も、配布サイト全体の文章やプレビュー画像までCC0という意味ではない。[S03][S04][S10]

Green Releaseは「入力タイミングが良かった」という判定。飛行後も物理で衝突する設計なので、必ず入るとは宣伝しない。実際の得点はリングを上から通過した時だけ加算する。

リセットは制作工程を二分する時計ではない。利用枠・期限・残数はアカウント画面で確認し、進捗は各チェックポイントで保存する。既存リセットの利用は人間が操作し、購入・追加課金は自動実行しない。[S02]

出典IDの一覧と、会話・内部資料・外部確認の区別は [ASSET_SOURCES.md](docs/00_roadmap/ASSET_SOURCES.md) に記載した。

## 5. 開始文

> このフォルダのREADME.md、HANDOFF.md、ASTRA_BRIEF.mdを読み、要件定義書と精査記録を参照して制作を開始してください。まず既存教材を変更しないこと、実行環境、使用できるUnity操作手段、素材の利用条件を確認してください。確認できた範囲でG0から進め、各ゲートで動くビルドと証拠を残してください。購入、公開、権利不明素材の投入、既存ファイルの破壊的変更は行わないでください。




2026-09-20追記：ユーザーのプライベート外部試遊希望に従いitch.io RestrictedへWeb G3-10を設置。 https://takapiece.itch.io/hoops-world-tour-playtest 。所有者ログインで起動/SHOOT、未ログインで閲覧拒否を確認。共有パスワードは本人の入力/保存待ち。実機未確認、一般公開なし。詳細はEvidence/private-hosting-20260920/README.md。

itch.io更新：共有パスワード設定済み。未ログインでパスワード要求画面を確認（2026-09-20）。スマホ実機の確認待ち。 https://takapiece.itch.io/hoops-world-tour-playtest

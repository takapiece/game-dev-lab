# アセット候補・出典台帳

版1.2 / 更新：2026-09-20 / **G1でA01人物1体と同パックの基本動作を採用。環境候補は未取得**

## G1取得・検証・採用（2026-09-20）

- A01：作者公式ページ→作者がリンクする公開Drive配布からHumanoid版Casual.fbx、別ファイルAnimations.fbx、License.txtを取得。追加購入0円、ログインなし。取得元とSHA-256は [原本台帳](../../SourceAssets/QuaterniusModularMen/PROVENANCE.md) と同フォルダのsha256.json。
- 権利：公式表示と取得License.txtのCC0 1.0を照合。今回のモデル・動作のコピー、改変、ゲームへの組込み、許諾条件を保持したソース同梱に使用。サイト文章・作者ロゴ等までCC0とは扱わない。
- Unity実検証：CasualのAvatarはvalid=true/human=true。素の高さ約1.86m。人物本体0クリップ。Animations.fbxは非previewの24クリップを確認。Idle/Walk/Runをブレンド、Root Motion無効。
- 人物は同じ基体を攻守2名に使用し配色・足元マーカーで区別。ドリブル・シュートは収録済みとは主張せず、自作の手位置制御で補った。G2の動作品質評価は未完。
- 証拠：`../../Evidence/g1-20260920-02/asset-check.json`、G1固定ソース、通常試遊記録。A02の別製品Universal Animation Libraryは今回未取得。
- A07：床・ゴール・ボール・背景の簡易構造は自作生成。バウンド/リリース/成功/失敗音は自作波形。外部音源は未使用。
- 外部環境A03～A06と条件付きB01～B06は未採用。素材の公開・外部送信・課金は実行していない。

## G0で実際に使用したもの（2026-09-20）

- U00：Unity 6000.6.2f1に同梱の `com.unity.template.urp-blank-17.2.1.tgz` からURP設定とProjectSettingsを使用。URP本体は17.6.0。無料価格表示で採用したAsset Store素材ではない。
- 同梱LICENSE.mdはUnity Companion Licenseへの参照。2026-09-20に [公式本文v1.4](https://unity.com/legal/licenses/unity-companion-license) を読み、有効なUnity Engine License下でのUnityアプリ制作と著作権・ライセンス表示の条件を確認。CC0とは扱わない。素材のAI利用全般を一括許可したとの判断ではない。
- 出典・著作権表示：`../../UnityProject/THIRD_PARTY_NOTICES.md`。元LICENSEの保存：`../../Evidence/g0-20260920-02/unity-template-LICENSE.md`。元アーカイブのSHA-256：同フォルダのsha256.json。
- A07：G0用の床・回転立体はUnity基本形状、自作C#コード。球・リング・人物・音源はまだ実装・取得していない。
- 状態：G0の設定として導入・ビルド・通常ウィンドウ描画確認済み。ゲーム素材候補A01～A06、B01～B06は未採用。追加購入0件。公開・素材単体再配布は未実施。

## 1. 調達の原則

既存の公式CC0素材を第一候補にし、使えるものから少数を取り込む。初版で新規モデル生成OSS、商用生成API、大量アセット一括導入を行わない。価格0円、無料版の範囲、AI入力・改変、完成ゲーム配布、ソース・素材再配布を別々に確認する。

以下の「確認済み」は公式ページにその記載があること。ファイルの中身やUnityでの動作保証ではない。実際の採用は取得した版のLICENSE等を確認し、台帳の状態を「取得」「検証」「採用」へ進めてから確定する。

## 2. 第一候補

| ID | 用途と候補 | 今回確認した範囲 | 導入ゲート・不足時の代替 |
|---|---|---|---|
| A01 | 人物：Quaternius Ultimate Modular Men [S05] | CC0、11モデル、Animated、FBX/OBJ/Blendの表示 | 1体のリグ・歩行を先に試す。バスケ動作は保証しない。色違い2名で開始 |
| A02 | 基本動作：Quaternius Universal Animation Library [S06] | CC0、Humanoid向け。無料版と上位版あり | 無料版内の実クリップを確認。全120超が無料とは扱わない |
| A03 | Street：Downtown City MegaKit [S07] | CC0、全体300超。無料範囲とSource版の区分あり | 無料のFBX等から少数を導入。Unity専用Source版を要求しない |
| A04 | Street代替：Kenney City Kit (Suburban) [S08] | CC0、40ファイルの公式表示 | 見た目を合わせた建物だけ使う |
| A05 | Neon：Modular Sci-Fi Megakit [S09] | CC0、277モデル、FBX/OBJ/Blend/glTFの表示 | 壁・柱・床など必要部品だけ。発光はUnity側で統一 |
| A06 | 床・壁・光：Poly Haven [S10] | 素材本体はCC0。再配布も可。サイト本文等は別条件 | 木床・金属・コンクリート・HDRIの個別ファイルは未選定。初版は1K～2K中心 |
| A07 | ゴール・球・簡易シェル：自作 | 新規制作の設計方針。外部調達ではない | 見た目と衝突を分け、Unityの基本形状・メッシュで不足を補う |

### 同梱範囲に関する注意

Downtown City MegaKitのエンジン用完成プロジェクト、専用シェーダー、Blendソースは上位Source版の説明にある。無料版から同じ完成シーンが手に入る前提にしない。[S07]

Universal Animation Libraryも、無料のクリップ一覧を実際に確認する。走行素材があっても、ドリブル、両手のボール保持、シュートの手首リリースが揃うと推測しない。[S06]

人物・環境は同じローポリ寄りの質感に寄せる。リアル系の大型シーンを丸ごと入れるより、共通マテリアル、光、カメラで印象を揃える。

## 3. 条件付き・後順位の候補

| ID | 候補 | 公開ページでの確認 | 今回の扱い |
|---|---|---|---|
| B01 | Unity Starter Assets - ThirdPerson / URP [S04] | 無料、Unity6.0のURP対応表示、Non standard EULA、70.7MB | 独自EULAと依存関係を確認後に限る。未解決なら自作CharacterController＋A01へ |
| B02 | Boxing Arena - Game Level [S15] | 無料、491.4MB、Standard EULA、2022.3.8の各パイプライン対応 | AI入力条件と改装・Unity6互換が未確認。初版の必須素材にしない |
| B03 | Mixamo [S16] | Adobe IDで無料、キャラクター・アニメのプロジェクト利用案内 | CC0ではない。素材再配布・AI入力などの個別条件を確認。ログインを迂回しない |
| B04 | Human Throwing Animations FREE [S17] | 無料、Standard EULA。作者も配布先に関係なく同EULAと明示 | 一般投擲とバスケシュートを同一視しない。AI条件未解決なら使わない |
| B05 | Synty Sidekick Free Starter | 会話内で候補に挙がったが今回は再検証していない | 採用保留。存在・無料範囲・規約・互換を取得前に確認 |
| B06 | Recreation Park | 会話内で候補に挙がったが今回は公式本文を再取得していない | 採用保留。街小物はA03/A04で代用可能 |

## 4. 権利とAI作業に関するゲート

Unity Asset Store一般規約のAppendix 1には、許可なく素材等をAI/MLの入力等へ用いることに関する文言がある。完成ゲームへの組込み許可だけを理由に、素材をAstraへ投入してよいとは判断しない。独自EULAの素材はその内容も別に確認する。[S03][S04]

本チャレンジでは、その適用範囲が不明な素材をAIに読み込ませたり外部へ送ったりせず、CC0または自作で作業を継続する。これはリスク回避の採用方針であって、すべてのエディター支援が一律禁止だと断言するものではない。

CC0素材は再配布しやすい一方、人物の肖像・商標等まで保証するものではない。元データ、ライセンス、出典を保管し、実在チームのロゴ等を追加しない。Poly HavenのCC0対象は素材本体であり、サイト文章・サンプルレンダー・ロゴ等は別。無許可のサイト一括スクレイピングも行わない。[S10]

StoreやMixamoを使った場合、完成ゲームに埋め込むことと、FBX・テクスチャ・モーションを配布教材に同梱することは分けて判断する。公開用ソースは自作部分と許可された素材だけにし、未確認素材を含む既存フォルダをそのまま公開しない。

## 5. 実際に取得するときの記入欄

各素材について次を追記する。今回のファイルは候補台帳であり、ダウンロード完了を装う行はない。

```text
Asset ID:
状態: 候補 / 取得 / 検証 / 採用 / 却下
取得日時・提供元・製品版:
元ファイル名・SHA-256:
LICENSEファイルまたは許可根拠:
費用: 未取得 / 0円 / 承認済み金額
AI入力: 確認済み根拠 / 未解決
ゲーム配布: 確認済み根拠 / 未解決
素材・教材ソース再配布: 確認済み根拠 / 除外
保存先: プロジェクト相対パス
使用世界:
リグ・クリップ・実寸・URP表示テスト:
変更内容:
最終判断・確認者:
```

## 6. 出典一覧と確認範囲

会話は企画意思の根拠、内部ファイルは既存活動の記録、公式外部資料は製品・利用条件等の根拠として区別する。以下は長文転載ではなく確認箇所の索引。

### 内部資料・参考リポジトリ

- [I01] [セッション05：2v2・ロスター・ON-FIRE](https://drive.google.com/file/d/1RFq8SSNIGF81wcudSs51qWq1bY70hNb5/view) — 2026-09-05更新の制作記録を今回再取得。現行ビルドの実行結果ではない。
- [I02] [Game/GEMINI.md](https://drive.google.com/file/d/1LjLqJUB3BNKBQljJlIrCRFDNu-CQtstu/view) — 独立ゲーム、相対パス、ログ分類の既存ルールを再取得。
- [I03] [既存game.json](https://drive.google.com/file/d/16s52mR0eh_9MYEyLb90ARmN4T2ru3Ed0/view) — この会話に添付・提示済みの全文。Phase2のメタデータであり、Phase4記録の否定材料にはしない。
- [I04] [az9713/gpt-6-astra-tennis-game README](https://github.com/az9713/gpt-6-astra-tennis-game/blob/main/README.md) — 今回GitHub接続で末尾の再ビルド・検証・公開境界を再取得。第三者の自己報告であり、本件の成功保証ではない。取得blob SHA: `cae568b9e768f7d2f8022db62728a15e042b264b`。
- [I05] [既存HOOPS教材フォルダ](https://drive.google.com/drive/folders/1vv82bvsh62jYsv8MH44h3qigbGv_VnsP) — 前段の会話で確認した資料の置き場所。今回は変更しない。

### 公式公開情報

- [S01] [OpenAI / GPT-6 Astra紹介](https://openai.com/index/gpt-6-astra/) — ゲーム制作例を確認。特定のPC上の自動化可用性とは別。
- [S02] [OpenAI / Work・Codexの利用枠](https://help.openai.com/en/articles/20001516-managing-usage-with-gpt-6-astra-in-work-and-codex) — 公式検索結果本文で共有枠・リセット種別・Settings→Usage案内を確認。直接ページ取得は失敗。個人残量は未確認。
- [S03] [Unity Asset Store Terms and EULA](https://unity.com/legal/as-terms) — 一般利用条件、再配布、AI入力に関する条項。条文の適用解釈は個別確認が必要。
- [S04] [Starter Assets - ThirdPerson / URP](https://assetstore.unity.com/packages/essentials/starter-assets-thirdperson-urp-196526) — 無料、対応表、独自EULA表示を確認。同梱契約本文は未取得。
- [S05] [Quaternius Ultimate Modular Men](https://quaternius.com/packs/ultimatemodularcharacters.html) — モデル数・形式・CC0表示。
- [S06] [Quaternius Universal Animation Library](https://quaternius.com/packs/universalanimationlibrary.html) — アニメ用途、ライセンス、無料版と上位版の区分。
- [S07] [Quaternius Downtown City MegaKit](https://quaternius.com/packs/downtowncitymegakit.html) — 全体規模、無料範囲、Source版の収録内容。
- [S08] [Kenney City Kit (Suburban)](https://kenney.nl/assets/city-kit-suburban) — 40ファイル、CC0、無料ダウンロードの案内。
- [S09] [Quaternius Modular Sci-Fi Megakit](https://quaternius.com/packs/modularscifimegakit.html) — 277モデルとファイル形式・CC0表示。
- [S10] [Poly Haven License / Terms](https://polyhaven.com/license) — 素材本体のCC0、再配布、サイト内容とアクセスに関する別条件。
- [S11] [Unity Personal](https://unity.com/products/unity-personal) — 利用資格と無料プランの範囲。条件は着手時にも確認。
- [S12] [Unity6 Rigidbody.linearVelocity](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Rigidbody-linearVelocity.html) — 速度設定とkinematic状態、毎物理ステップでの速度上書きに関する注意。
- [S13] [Unity6 Rigidbody.isKinematic](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Rigidbody-isKinematic.html) — 制御方式切替のAPI。
- [S14] [Unity6 衝突判定モード](https://docs.unity3d.com/ja/6000.0/Manual/choose-collision-detection-mode.html) — 精度・処理量・用途の違い。CCDを得点保証とは扱わない。
- [S15] [Boxing Arena - Game Level](https://assetstore.unity.com/packages/3d/environments/boxing-arena-game-level-331688) — 無料、491.4MB、Standard EULAと対応表。
- [S16] [Adobe Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) — Adobe IDでの利用とプロジェクト用途の案内。
- [S17] [Human Throwing Animations FREE](https://assetstore.unity.com/packages/3d/animations/human-throwing-animations-free-345572) / [作者のライセンス説明](https://www.keviniglesias.com/) — 無料サンプルとStandard EULA。別配布元ならCC0になるわけではない。
- [S18] [Unity6 CharacterController.Move](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/CharacterController.Move.html) — 自作移動の参照先。利用Unity版に合わせる。
- [S19] [Unity6 Physics Material](https://docs.unity3d.com/6000.0/Documentation/Manual/class-PhysicsMaterial.html) — 反発・摩擦設定の参照先。

## 7. 更新方針

価格や互換表が変わっても、当時確認した記録は消さず再確認日を追加する。課金素材への置換、ライセンス変更、同梱範囲の差はREVIEW_DECISIONSへ反映。未取得・未検証は明記したままにする。

2026-09-20 G2移動調整：既存Animations.fbx内のRun_Left/Run_Right/Run_Backも使用開始。追加取得はなし。SourceAssetsの原本FBXは変更せず、Unity側.metaでIdle/Walk/Runと方向別3種をループ設定にする。骨の補正・ドリブル周期・バウンド音は自作コード。

2026-09-20 G3：4環境の建物・高窓・梁・ベンチ・観客席・照明塔・ネオンフレーム、および衣装用材質とヘッドバンドはG3WorldBuildによる自作。人物と動作は導入済みQuaterniusのまま、外部素材の追加取得・購入なし。環境の文字はUnity TextMeshの標準フォントを利用。新しい音楽・音源は未追加。

2026-09-20 Street音楽：ユーザー提供のM4A 2曲を原本保管し、明示選択されたTake 1だけをローカル試遊へ採用。VLCでWAVにデコードし、UnityではVorbis/Streamingを使用。CC0素材とは分類しない。正確な生成モデル・条件の詳細は未提供。[原本と採用経緯](../../SourceAssets/Audio/Street/PROVENANCE.md)、[ハッシュ](../../SourceAssets/Audio/Street/sha256.json)。外部取得・購入・公開なし。Take 2はビルド未収録。

2026-09-20 G3-06：追加のGym/Arena/Neon各2曲とStreet歓声動画2本をユーザーから受領。ユーザー指定のGym/Neon Take 1、Arena Take 2をStreet Take 1とともに採用。動画2本の音声を通常得点/Streetクリアへ短縮して使用。原本とハッシュ、選択、抽出区間は[音源保管一覧](../../SourceAssets/Audio/README.md)。生成モデル/条件詳細は未提供、CC0とは分類しない。新規購入・外部取得/公開なし。

2026-09-20 G3-07：ユーザー提供のボール/リング/ネット動画3本を原本保管し、最初の衝撃を単発化して使用。抽出区間・フェード・増幅・ハッシュは[出典記録](../../SourceAssets/Audio/BallEffects/PROVENANCE.md)。CC0とは分類せずローカル試遊のみ。板専用音・世界ごとの音響差は未実装。


2026-09-20 G3-08：ユーザー提供Arena歓声1動画をローカル試遊へ採用。原本不変、2.4秒切出し/フェード/5倍ゲイン。[出典](../../SourceAssets/Audio/ArenaCheers/PROVENANCE.md)。生成条件詳細は未提供、CC0とは分類しない。購入・公開なし。

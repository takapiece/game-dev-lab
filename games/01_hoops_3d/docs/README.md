# 🏀 HOOPS 3D 開発ナレッジ & 学習ポータル

本ポータルは、スマホ向け本格3Dバスケットボールゲーム『HOOPS 3D』の制作プロセスを、プログラミング教室の生徒さんが体系的に追体験・学習できるようにまとめたドキュメントハブです。

---

## 📚 ドキュメント構成マップ

```mermaid
graph TD
    Portal["📖 docs/README.md (本ポータル)"] --> Road["🗺️ 00_roadmap/<br>全体仕様 & 意思決定 (ADR)"]
    Portal --> Sess["📝 01_sessions/<br>セッション別 制作手順"]
    Portal --> Bug["🛠️ 02_troubleshooting/<br>エラー解決ログ & デバッグ"]
    Portal --> Arch["📐 03_architecture/<br>数式・物理・音響解説"]

    Road --> Req["requirements.md<br>(5段階ロードマップ)"]
    Road --> Dec["decisions.md<br>(設計判断ログ ADR)"]

    Sess --> S1["session_01_3d_mock.md<br>(第1回 3Dモック制作)"]

    Bug --> Err["error_log.md<br>(ERR-001, ERR-002...)"]
    Bug --> Dbg["debugging_guide.md<br>(F12デバッグ入門)"]

    Arch --> Phy["physics_and_shooting.md<br>(放物線シュート数式)"]
    Arch --> Cam["coordinate_and_camera.md<br>(3D座標系 & カメラ)"]
    Arch --> Aud["audio_synthesis.md<br>(Web Audio音響合成)"]
```

---

## 📑 ドキュメント目次

### 1. [00_roadmap (全体仕様 & 意思決定)](./00_roadmap/)
* **[requirements.md](./00_roadmap/requirements.md)**: 最終形から逆算した難易度別5段階の要件定義書。
* **[decisions.md](./00_roadmap/decisions.md)**: **【重要】設計判断ログ (ADR)**。なぜ Three.js を選んだか、なぜコード音源にしたかの決定理由。

### 2. [01_sessions (セッション別 制作手順)](./01_sessions/)
* **[session_01_3d_mock.md](./01_sessions/session_01_3d_mock.md)**: 第1回「3Dコート・物理・シュートメーター・初期モック」の作成手順。
* **[template.md](./01_sessions/template.md)**: 今後のセッション用フォーマット。

### 3. [02_troubleshooting (エラー解決 & デバッグ)](./02_troubleshooting/)
* **[error_log.md](./02_troubleshooting/error_log.md)**: 発生したエラー（ERR-001, ERR-002）と修正内容、生徒への学び。
* **[debugging_guide.md](./02_troubleshooting/debugging_guide.md)**: ブラウザ開発者ツールを使ったデバッグ実践ガイド。

### 4. [03_architecture (数学・物理・仕組みの解説)](./03_architecture/)
* **[physics_and_shooting.md](./03_architecture/physics_and_shooting.md)**: 斜方投射と放物線シュートの数学・物理公式。
* **[coordinate_and_camera.md](./03_architecture/coordinate_and_camera.md)**: 3D右手座標系と3種類のカメラワーク（Broadcast / Follow / High）。
* **[audio_synthesis.md](./03_architecture/audio_synthesis.md)**: Web Audio API によるリアルタイム音響合成の仕組み。

---

## 🚀 ゲームの起動方法
```bash
# games/01_2k_hoops/ ディレクトリ内で実行
npm run dev

# ブラウザでアクセス: http://localhost:5173/
```

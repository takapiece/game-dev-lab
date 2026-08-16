# 🌐 Windows / Mac クロスプラットフォーム & 相対アドレス規約

Windows と macOS 間を Google Drive や Git で同期・移行してもリンク切れやエラーを起こさないための必須規約です。

---

## 1. 相対パス (Relative Path) の徹底
* **プロジェクト内ドキュメント (.md) のリンク:**
  * ❌ 禁止: `file:///D:/GoogleDrive/Work/Game/...`, `C:\Users\...`, `/Users/...` などの絶対パス。
  * ⭕ 必須: `./00_roadmap/decisions.md` や `../src/court.js` などの**標準相対パス**。
* **ソースコード内のインポート:**
  * ⭕ `import { sounds } from './audio.js';` や `import * as THREE from 'three';`

---

## 2. パス区切り文字 (Path Separator)
* すべてのマークダウンリンクおよびコード内パス指定には、Windows・Mac共通で動作するスラッシュ（`/`）を使用する（バックスラッシュ `\` は使用しない）。

---

## 3. 改行コード & 文字コード
* 文字コード: **UTF-8**
* 改行コード: **LF**（または Git の `core.autocrlf` 設定に準拠）

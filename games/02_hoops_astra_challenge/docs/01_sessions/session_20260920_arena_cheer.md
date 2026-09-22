# Arena専用歓声の取り込み

ユーザーがArena用動画を追加。受領した1本を通常得点・クリアで共用し、Streetの既存2本と鳴り分ける。

## 手順と挙動

1. 原本をSourceAssets/Audio/ArenaCheersへコピーし、SHA-256を記録する。
2. VLCで全長WAVへ変換し、[prepare_arena.py](../../Evidence/audio-arena-cheer-20260920/prepare_arena.py)で1.18–3.58秒を2.4秒へ切り出す。開始20ms/終了250msフェードと5倍ゲイン。最大振幅0.332でクリッピングなし。
3. UnityへArenaCheer.wavをPCM/DecompressOnLoadで導入。HoopsAudio.ResultがWorldIndex=2の実得点でのみ選択する。Streetは従来どおり通常/クリアを別素材にし、Gym/Neonは歓声なし。
4. 既存の歓声Sourceを再利用。SE音量・Mute・Pause/再開・R/世界切替/タイトルの停止に従う。Arena BGMは選択済みTake 2を保持する。
5. audio/world/visualレビューでクリップの長さと非ゼロデータ、全世界の実得点と歓声の選択/一回再生/終了、ArenaのPause位置保持/ミュート復帰を検証する。結果は[HANDOFF](../../HANDOFF.md)を参照。

## 未確認

元動画は1本だけで、別収録のクリア専用歓声はない。音量や響きの聴感はユーザー試遊で確認する。板専用音・床材差・Gym/Neonの歓声は未実装。購入・公開なし。

## 💡 このセッションで学んだプログラミング概念

- 場面別の選択：同じ得点イベントでも現在世界を見て音を切り替える。
- 再利用：場面が増えてもAudioSourceを増殖させず、既存の停止/復帰を共用する。
- ゲインとピーク：小さい音は増幅できるが、最大振幅を計測して音割れを避ける。

# 作業報告書 — index.html 下バーにロック統合（通常画面で完結）

日付: 2026-06-20
対象リポジトリ: GitHub `wisellwisell2/compass-board`

## 作業概要
配置編集を `arrange.html` の別ページに行かせるのをやめ、**通常画面 `index.html` の下バーだけで完結**するようにした。下バーに「ロック」ボタンを追加し、ロック解除中だけカードをドラッグ移動できる。移動は zoom・スクロール・フェーズオフセットを補正して「バビッと飛ぶ」問題を再発させない。移動したら自動で `localStorage["compassBoard.v1"]` に保存し、再読み込みでも位置が残る。「読み込み」は JSON / Excel を選べるようにした。`arrange.html` は参考実装として残置（通常導線からは外した）。

## 変更ファイル
- `index.html`（このファイルのみ）
- `arrange.html`：変更なし（参考実装として残置）

## 実装内容
1. **下バー構成**（[index.html](index.html) `#dock`）を `[🧭コンパス] [📥読み込み] [📤保存] [🔒ロック] [⋯メニュー]` に変更（`dkLock` ボタンを 保存 と メニュー の間に追加）。
2. **ロック（カード移動 ON/OFF）**
   - `let locked = true`（初期ロック）。`toggleLock()`／`updateLockUI()` を追加し、`dkLock` で切替。
   - 表示：ロック中＝`🔒 ロック`、解除中＝`🔓 移動可`（解除中はボタンをハイライト＝`.toggled`、`body.move-mode` を付与しカードに `cursor:grab` と緑破線アウトラインを表示）。
   - 起動時に `updateLockUI()` を呼び初期状態をロックに固定。
3. **zoom-safe ドラッグ**（`attachCardPointer` を全面書き換え）
   - 旧実装の「300ms ロングプレスで掴む＋画面座標をそのまま代入」を廃止。原因だった zoom 無補正を解消。
   - `boardScale() = board.getBoundingClientRect().width / board.offsetWidth`（≈現在の CSS `zoom`）を毎イベント計算し、`boardPoint(clientX,clientY)` で画面座標→ボード内座標へ変換（zoom・board位置を補正）。
   - **ロック中はドラッグせずタップ判定のみ**（`handleCardTap` で詳細表示）。**解除中だけ**しきい値 9px 超でドラッグ開始。
   - ドロップ時はカード中心 X からフェーズ判定→`phaseId`／`x=フェーズ相対座標`／`y` を保存し `touchCard()`→`save()`（自動 localStorage 保存）。
   - 2本指検知でドラッグを中断しピンチ俯瞰へ委譲（`activePointers`）。リスナを `document` に張り、指がカード外へ出ても確実に後始末。
   - タップ分岐は `ev.target` が要素でない場合 `elCard` を渡す防御を追加。
4. **読み込みチューザ**：`openLoadChooser()` を追加し、`dkLoad` から `🗂️ JSONを読み込む（全置換）`／`📊 Excel/xlsx を読み込む（カード追加）` をシートで選択（既存 `importFile`／`importXlsx` を流用）。
5. **保存**：`dkSave` は従来どおり `exportJSON()`（JSONエクスポート）。表記は「保存」。

## 動作確認
ローカル配信（`http://127.0.0.1:8766/index.html`、空 localStorage→SEED 32枚）で Playwright 検証。

- 下バー＝`[🧭コンパス][📥読み込み][📤保存][🔒ロック][⋯メニュー]`、初期 `move-mode=false`（ロック中）。
- **ロック中**：60×40px ドラッグでもカード移動 **0px**、localStorage 不変。タップ1回で選択、2回で詳細オーバーレイが開く。
- **解除**：ボタンが `🔓 移動可`、`move-mode=true`。
- **解除＋zoom=0.5 ドラッグ**：押下時ジャンプ **0px**、画面 60×40px に対しボード **120×80px**（=Δ/zoom）正確、保存（c02: x=176, y=224, phaseId=ph1）。
- **再読み込み**：c02 が 176/224 を維持（localStorage 往復OK）。
- **読み込み**：シート「読み込み」に JSON / Excel の2項目。
- **コンパス**：ボード⇔コンパス表示が切替（ラベルも追従）。
- GitHub Pages（ライブ）反映の確認: 本報告コミットの push 後に別途実施（下記）。

## 既知の問題
- ユーザーの実データはローカルに無い（github.io オリジンの localStorage 内）。最終確認は実機・実データでライブ確認が必要。
- ピンチ俯瞰を**カード上から2本指で開始**した場合、最初の指がドラッグ候補になり得る（移動モード時）。2本指検知でドラッグは中断するが、開始ジェスチャが不安定なら空き領域から始めるのが確実。
- 旧来の「ロングプレスで掴む」操作感は廃止（ロック解除で即ドラッグに変更）。意図的変更。

## 動作確認（ライブ反映ログ）
- コミット SHA: `48ef546422a350c34e3a938698bc1525e4753dee`（push 済み `0c9d4f4..48ef546 main -> main`）。
- GitHub Pages: commit `48ef546` で `built`。ライブ `index.html` に `dkLock`・`boardScale`・`openLoadChooser` を確認。
- ライブ・スモークテスト（Playwright, テストブラウザの SEED）:
  - 下バー = `dkView / dkLoad / dkSave / dkLock / dkMenu`。
  - ロック中ドラッグ移動 **0px**。解除後 zoom=0.5 で押下ジャンプ **0px**、ドラッグ画面 60×40px→ボード **120×80px**、`localStorage` 保存反映。
- 確認URL: https://wisellwisell2.github.io/compass-board/
- 報告書URL: https://github.com/wisellwisell2/compass-board/blob/main/REPORT_20260620_002_INDEX_DOCK_LOCK.md

## 次に出すべき指示 / 次アクション案（チャッピー宛・コピペ可）
```
index.html の下バー版で実機（PC＋スマホ）確認をお願いします。
1. 通常URL https://wisellwisell2.github.io/compass-board/ を強制リロード。
2. 下バーが [コンパス][読み込み][保存][ロック][…] で、初期がロック中か。
3. ロック中：カードを触っても動かない／タップで詳細が開く。
4. 「ロック」を押して「移動可」にし、ピンチ俯瞰してからカードをドラッグ → 飛ばず、離した位置に残るか。
5. 再読み込みで位置が保持されるか。
6. 「読み込み」から JSON/Excel が選べるか。「保存」でJSONが書き出せるか。
問題なければ arrange.html はアーカイブ扱いにするか判断してください。
```

## 老いて惨めな伝書鳩に次の指示を伝えさせてください
- 配置編集は **index.html の下バーで完結**。`arrange.html` は参考実装として残置（主導線にしない）。
- 飛び対策は index.html 本体に内蔵：`boardScale()`/`boardPoint()` で zoom 補正、`locked` で移動 ON/OFF、移動時に `localStorage["compassBoard.v1"]` 自動保存。
- 下バー＝`[コンパス][読み込み][保存][ロック][…]`、初期ロック。読み込みは JSON/Excel 選択シート、保存は exportJSON。
- 残タスク候補：①ライブ実機確認 ②カード上始動ピンチの安定化 ③arrange.html のアーカイブ判断。

## 追加修正（pull-to-refresh：ドラッグ時に画面が更新しようとする）
- 症状：俯瞰（縮小表示）などで指ドラッグしようとすると「引っ張って更新（pull-to-refresh）」やバウンスが発動して操作しづらい。
- 原因：実スクロール要素は `#boardScroll` だが `overscroll-behavior` が `body` にしか無く、`overscroll-behavior` は継承しないため効いていなかった。
- 対応（`index.html` CSS）：
  - `html,body` に `overscroll-behavior:none` を追加（従来 body のみ→html にも）。
  - `#boardScroll` に `overscroll-behavior:none` を追加（実スクロール要素＝ここが本丸）。
  - `#compassView`（針ビューのスクロール要素）にも `overscroll-behavior:none` を追加。
  - 移動モード中のカードは既に `touch-action:none`（ドラッグ中にブラウザのスクロール/更新が割り込まない）。
- 確認：computed で `#boardScroll`/`html` とも `overscroll-behavior:none`、移動モード時カード `touch-action:none`／ロック時 `auto`。zoom=0.6 で押下ジャンプ0・ドラッグ100px(=60/0.6) と非回帰。

# KAKERO Phase 1 Data Loader 作業報告書

作成日: 2026-06-16

## 1. 作業目的

KAKERO Phase 1 として、`KAKERO_DATA_v0.1.md` / `sample_board.json` / `sample_haiku_output.json` をもとに、サンプル盤面データが実際にUIへ流れるかを確認する最小実装を作成した。

今回の目的はAI本実装ではなく、KAKERO内部データ v0.1 の骨格が画面上で成立するかをレビューできる状態にすること。

## 2. 作成・更新した成果物

作成:

- `kakero-phase1/index.html`
- `kakero-phase1/sample_board.json`
- `kakero-phase1/sample_haiku_output.json`
- `REPORT_20260616_001_KAKERO_PHASE1_DATA_LOADER.md`

更新:

- `kakero-wbs/WBS.md`
- `kakero-wbs/DECISION_LOG.md`

実装コミット:

- `3bfc5d9 Add KAKERO Phase 1 data loader`

## 3. 変更内容の要約

`kakero-wbs/` は資料置き場として扱い、実装PoCは `kakero-phase1/` に分離した。理由は、ルート `index.html` が既存の人生コンパス本体であり、資料ページや既存ページを壊さずにPhase 1のデータローダーだけをレビューできるようにするため。

`kakero-phase1/index.html` では以下を実装した。

- `sample_board.json` の読み込み
- `schema_version` / boardメタ情報 / nodes件数 / edges件数の表示
- JSON読み込み失敗・構造破損時のエラー表示
- card -> subcard -> task の階層表示
- 状態バッジ表示
- `depends_on` エッジによる未解決依存の表示
- `health_map` の総合けんこうポイント、レーン、スコア、コメント表示
- `memory_items` を「きこうか君に覚えてほしいことリスト」として表示
- `sample_haiku_output.json` の読み込み
- Haiku出力サンプルをカード候補として表示
- 「盤面に追加（仮）」ボタンによるローカル状態への仮追加

WBSにはPhase 1実装PoCの追加タスクを追記した。DECISION_LOGには、Phase 1実装PoCを `kakero-phase1/` に分けて置く判断を追記した。

## 4. 実施した確認

- `python -m json.tool kakero-phase1/sample_board.json`
- `python -m json.tool kakero-phase1/sample_haiku_output.json`
- ローカルHTTPサーバーで `http://127.0.0.1:8016/kakero-phase1/` を表示
- ブラウザ上で board / Haiku sample の読み込み状態が `OK` になることを確認
- 初期表示で cards 2件、health lanes 6件、memory_items 2件が表示されることを確認
- 「盤面に追加（仮）」実行後に cards 3件、nodes 18件、edges 15件へ増えることを確認
- 追加後にボタンが無効化され、二重追加されないことを確認
- スマホ幅 390px で横スクロールが出ないことを確認
- 既存ルート `index.html` に差分がないことを確認
- `.claude/` フォルダには変更していない

## 5. 未解決事項・注意点

- 保存はローカル状態のみ。リロードするとHaiku候補の仮追加は消える。
- 本物のHaiku API、APIキー、Cloudflare Workers、中継APIは未実装。
- `sample_haiku_output.json` の変換はサンプルpatchを取り込むだけで、実際の生成ロジックではない。
- `health_map` の自動反映精度、コメント生成、スコア更新ロジックは未確定。
- card / subcard / task の編集、移動、削除、状態変更は今回未実装。
- 価格、980円プラン、Plus呼称、丁々発止回数、超丁々発止原価制御は未確定のまま。
- 卵は確定仕様ではなく、突発イベント/隠し報酬/無料ユーザー向け試食体験の代表案のまま。

## 6. 次にやるべきこと

次はPhase 1.5として、今回の読み取り専用UIを「手で直せる盤面」に近づけるのがよい。

- card / subcard / task の編集PoC
- 状態変更PoC
- card追加時の `health_map` 仮反映
- memory_items の追加・編集PoC
- ローカル保存方式の仮実装
- 壊れたJSONや不足フィールドに対するバリデーション表示の強化

## 7. 次にCodex/Claude Codeへ出すべき具体的な指示文

## 次の指示

KAKERO Phase 1 の続きとして、`kakero-phase1/index.html` をもとに「手で直せる盤面」PoCへ進めてください。

目的:

サンプルデータを表示するだけでなく、AI出力や盤面データをユーザーが手で修正できる最小体験を確認する。

今回やること:

1. card / subcard / task の編集PoCを追加する
   - タイトルを編集できる
   - status を `todo` / `active` / `done` / `locked` / `draft` から変更できる
   - 編集結果は画面上のローカル状態に反映する
   - 永続保存は必須ではない

2. task の追加・削除PoCを追加する
   - subcard配下にtaskを追加できる
   - taskを削除できる
   - nodes / edges の件数表示が更新される

3. memory_items の追加・編集PoCを追加する
   - 「会話ログではなく、明示的な記憶項目」という見え方を維持する
   - pinned / visibility の扱いは仮でよい

4. health_map への仮反映を追加する
   - card追加やstatus変更で、どのhealth laneに影響しそうかを表示する
   - スコアの本ロジックは確定しない
   - 未確定事項は `OPEN_QUESTIONS.md` に逃がす

5. Goodhart回避を守る
   - ゲーム報酬のためにカードや進捗を盛る設計にしない
   - health_map指標と報酬を機械的に連動させない

今回やらないこと:

- Haiku API本実装
- APIキー設定
- Cloudflare Workers実装
- 課金本番決済
- 召喚体6体の作り込み
- 超丁々発止の本実装
- ミニゲーム本実装
- 複数端末同期
- 価格や事業判断の確定
- `.claude/` フォルダへの変更

完了条件:

- card / subcard / task を手で編集できる
- taskを追加・削除できる
- memory_items を追加・編集できる
- 画面上の件数と階層表示が更新される
- health_mapへの影響が仮表示される
- 既存ページを壊していない
- 作業報告書を `REPORT_YYYYMMDD_XXX_KAKERO_PHASE1_EDITABLE_BOARD.md` として作成する
- 変更内容、コミットID、確認したことを報告書にまとめる

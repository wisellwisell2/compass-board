# KAKERO Data v0.1

作成日: 2026-06-16

## 目的

KAKEROの初期実装で使う内部データ構造を定義する。

正式OKF準拠は不要。  
OKF風の自前JSONでよい。

初期実装しやすさを優先しつつ、後からAIで変換できる程度に `nodes / edges` 的な考え方を持たせる。

## 基本方針

- JSON 1つで盤面の主要状態を持つ
- 会話ログは保存しない
- 継続性は board / nodes / edges / health_map / memory_items が持つ
- AIには必要な盤面状態だけを渡す
- 正式OKFや複雑なグラフDBには寄せすぎない

## トップレベル構造

```json
{
  "schema_version": "kakero.v0.1",
  "board": {},
  "nodes": [],
  "edges": [],
  "health_map": {},
  "memory_items": [],
  "metadata": {}
}
```

## schema_version

データ構造のバージョン。

初期値:

```json
"kakero.v0.1"
```

## board

盤面全体の状態。

主な役割:

- 現在フェーズ
- 今月モード
- 表示順
- 最後に開いた場所
- 今日タスク候補

例:

```json
{
  "id": "board_main",
  "title": "KAKERO Board",
  "current_phase": "phase_0_5",
  "monthly_mode": "現金化と生活安定優先",
  "today_slots": {
    "attack": [],
    "defense": [],
    "prepare": []
  }
}
```

## nodes

KAKERO上に存在するものをノードとして持つ。

初期に扱う node type:

| type | 意味 |
| --- | --- |
| card | 人生コンパス上のカード |
| subcard | カードを構成する中分類 |
| task | 今すぐ着手できる小タスク |
| health_item | けんこうマップ項目 |
| memory_item | 覚えてほしいこと |

## cards

`type: "card"` のnode。

役割:

- やりたいこと本体
- フェーズ
- 状態
- 成功条件
- 表示順

主要フィールド:

```json
{
  "id": "card_001",
  "type": "card",
  "title": "体重を落とす",
  "status": "active",
  "phase": "phase_0_5",
  "success": "体重と生活リズムが改善し、無理なく続く状態になっている",
  "source": "haiku",
  "metadata": {}
}
```

## subcards

`type: "subcard"` のnode。

カードを構成する中分類。

例:

- 食事を整える
- 睡眠を戻す
- 歩く
- 記録する

## tasks

`type: "task"` のnode。

今すぐ着手できる粒度の小タスク。

例:

```json
{
  "id": "task_001",
  "type": "task",
  "title": "今日の体重を記録する",
  "status": "todo",
  "effort": "small",
  "due_policy": "no_pressure"
}
```

`due_policy: "no_pressure"` は、催促しない、赤くしない、責めないための初期メモ。

## edges

ノード同士の関係。

初期に扱う edge type:

| type | 意味 |
| --- | --- |
| contains | 親子関係。card -> subcard -> task |
| depends_on | 依存関係 |
| affects | けんこうマップ項目への影響 |
| remembers | board/card と memory_item の関連 |
| related_to | ゆるい関連 |

例:

```json
{
  "id": "edge_001",
  "type": "contains",
  "from": "card_001",
  "to": "subcard_001"
}
```

## health_map

生活けんこうマップの状態。

初期は複雑にしすぎず、以下を持てばよい。

- score
- mode
- lanes
- updated_by

例:

```json
{
  "score": 52,
  "mode": "黄信号・現金化優先",
  "lanes": {
    "life_base": { "label": "生活基盤", "score": 2 },
    "body": { "label": "心身", "score": 1 },
    "work": { "label": "仕事", "score": 2 },
    "money": { "label": "金", "score": 1 },
    "family": { "label": "家族", "score": 0 },
    "time_margin": { "label": "時間余白", "score": -1 }
  },
  "updated_by": ["card_001"]
}
```

## memory_items

きこうか君に覚えてほしいこと。

会話ログの代わりに、本人が選んだ事実だけを持つ。

例:

```json
{
  "id": "mem_001",
  "type": "memory_item",
  "text": "催促や赤い警告が苦手",
  "visibility": "ai_context",
  "pinned": true
}
```

## metadata

作成日時、更新日時、データ移行、表示設定など。

例:

```json
{
  "created_at": "2026-06-16T00:00:00+09:00",
  "updated_at": "2026-06-16T00:00:00+09:00",
  "locale": "ja-JP",
  "source": "manual"
}
```

## AI入力方針

Haiku等のAIには、会話ログではなく以下を渡す。

- 現在のboard
- 主要cards
- 関連edges
- health_map
- memory_items
- 今回のユーザー発話

## v0.1ではやらないこと

- 正式OKF完全準拠
- 複数端末同期
- 会話ログ永続保存
- 複雑な権限モデル
- 本番課金状態との連動


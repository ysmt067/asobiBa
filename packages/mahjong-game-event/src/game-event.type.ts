import type {Tile} from './tile.type';

/** 対局の席。対局の起家を 0 とし、反時計回り（手番の順）に 1, 2, 3 */
export type Seat = 0 | 1 | 2 | 3;

/** 席ごとの値。添字が Seat に対応する */
export type PerSeat<T> = [T, T, T, T];

export type Wind = 'east' | 'south' | 'west' | 'north';

/** 1 回の打牌に複数のロンがあったときの扱い。atamahane = 頭ハネ */
export type MultipleRonRule = 'atamahane' | 'double-ron' | 'triple-ron';

/** すべてのイベントに共通する項目 */
type GameEventBase<TType extends string> = {
  /** イベントごとに一意な ID。購読側の重複排除に使う */
  eventId: string;
  /** 公開するイベントの形のバージョン */
  schemaVersion: 1;
  type: TType;
  gameId: string;
  /** 局 ID。Pub/Sub の順序キーにも使う */
  roundId: string;
  /** 局の中の通し番号。局の開始が 1 */
  sequence: number;
  /** 発生した時刻（ISO 8601） */
  occurredAt: string;
};

/** 局の開始（配牌） */
export type RoundStartedEvent = GameEventBase<'round-started'> & {
  roundWind: Wind;
  /** 何局目か（東 1 局なら 1） */
  roundNumber: 1 | 2 | 3 | 4;
  honba: number;
  /** 供託されているリーチ棒の本数 */
  riichiSticks: number;
  dealer: Seat;
  /** 局の開始時点の持ち点 */
  scores: PerSeat<number>;
  doraIndicator: Tile;
  /** 配牌（席ごとに 13 枚） */
  hands: PerSeat<Tile[]>;
  rules: {multipleRon: MultipleRonRule};
};

/** ツモ */
export type TileDrawnEvent = GameEventBase<'tile-drawn'> & {
  seat: Seat;
  tile: Tile;
  /** wall = 通常のツモ、dead-wall = 嶺上牌 */
  source: 'wall' | 'dead-wall';
};

/** 打牌 */
export type TileDiscardedEvent = GameEventBase<'tile-discarded'> & {
  seat: Seat;
  tile: Tile;
  /** ツモ切りなら true、手出しなら false */
  tsumogiri: boolean;
  /** リーチ宣言の打牌なら true */
  riichi: boolean;
};

/** 鳴き（チー・ポン・カン） */
export type CallMadeEvent = GameEventBase<'call-made'> & {
  seat: Seat;
  callType: 'chi' | 'pon' | 'daiminkan' | 'ankan' | 'kakan';
  /** 晒した牌（鳴いた牌を含む） */
  tiles: Tile[];
  /** 他家の打牌を鳴いたときの、その牌と打牌した席（暗槓・加槓では省略） */
  calledFrom?: {seat: Seat; tile: Tile};
};

/** カンのあとの新ドラ */
export type DoraRevealedEvent = GameEventBase<'dora-revealed'> & {
  doraIndicator: Tile;
};

/** 和了。ダブロン・トリロンのときは和了者ごとに 1 イベント */
export type WonEvent = GameEventBase<'won'> & {
  seat: Seat;
  winType: 'tsumo' | 'ron';
  /** ロンのときの放銃者 */
  from?: Seat;
  winningTile: Tile;
  /** 和了したときの手牌（和了牌を除く） */
  hand: Tile[];
  yaku: {name: string; han: number}[];
  han: number;
  fu: number;
  uraDoraIndicators: Tile[];
  scoreChanges: PerSeat<number>;
};

/** 流局 */
export type RoundDrawnEvent = GameEventBase<'round-drawn'> & {
  reason: 'exhaustive' | 'nine-terminals' | 'four-winds' | 'four-riichi' | 'four-kans' | 'triple-ron';
  /** 荒牌平局のときの聴牌者 */
  tenpaiSeats: Seat[];
  scoreChanges: PerSeat<number>;
};

/** 局の終了 */
export type RoundEndedEvent = GameEventBase<'round-ended'> & {
  /** 局の終了時点の持ち点 */
  scores: PerSeat<number>;
};

export type GameEvent =
  | RoundStartedEvent
  | TileDrawnEvent
  | TileDiscardedEvent
  | CallMadeEvent
  | DoraRevealedEvent
  | WonEvent
  | RoundDrawnEvent
  | RoundEndedEvent;

export type GameEventType = GameEvent['type'];

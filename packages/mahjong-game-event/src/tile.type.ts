type Suit = 'm' | 'p' | 's';
type NumberRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 数牌。m = 萬子、p = 筒子、s = 索子（例: "1m"） */
export type NumberTile = `${NumberRank}${Suit}`;

/** 赤ドラの五（"5mr" / "5pr" / "5sr"） */
export type RedFiveTile = `5${Suit}r`;

/** 字牌。1z = 東、2z = 南、3z = 西、4z = 北、5z = 白、6z = 發、7z = 中 */
export type HonorTile = `${1 | 2 | 3 | 4 | 5 | 6 | 7}z`;

export type Tile = NumberTile | RedFiveTile | HonorTile;

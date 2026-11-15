import type {GameEvent} from './game-event.type';

export type ParseGameEventResult = {success: true; event: GameEvent} | {success: false; error: string};

/**
 * 受け取ったメッセージを公開するイベントとして検証する。
 * 形が正しければ GameEvent を、正しくなければ理由を返す（例外は投げない）。
 */
export function parseGameEvent(_input: unknown): ParseGameEventResult {
  throw new Error('Not implemented');
}

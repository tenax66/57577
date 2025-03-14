// https://github.com/internet-development/www-sacred

// NOTE(jimmylee)
// Vendored from
// https://github.com/JohannesKlauss/react-hotkeys-hook/blob/main/src/index.ts

import useHotkeys from './use-hotkeys';
import type { Options, Keys, HotkeyCallback } from './types';
import { HotkeysProvider, useHotkeysContext } from './hotkeys-provider';
import { isHotkeyPressed } from './is-hotkey-pressed';
import useRecordHotkeys from './use-record-hotkeys';

export {
  useHotkeys,
  useRecordHotkeys,
  useHotkeysContext,
  isHotkeyPressed,
  HotkeysProvider,
  Options,
  Keys,
  HotkeyCallback,
};

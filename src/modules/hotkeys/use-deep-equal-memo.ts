// https://github.com/internet-development/www-sacred

import { useRef } from 'react';

import * as Utilities from '../../common/srcl/utilities';

export default function useDeepEqualMemo<T>(value: T) {
  const ref = useRef<T | undefined>(undefined);

  if (!Utilities.deepEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

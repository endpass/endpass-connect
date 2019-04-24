import {
  map,
  merge,
  pipe,
  filter,
  fromPromise,
  fromIter,
} from 'callbag-basics';
import subscribe from 'callbag-subscribe';
import concatMap from 'callbag-concat-map';
import takeWhile from 'callbag-take-while';
import fromEmitter from '@/streams/factory/fromEmitter';
import { INPAGE_EVENTS } from '@/constants';
import tap from 'callbag-tap';
import middleware from '@/streams/inpageProvider/middleware';
import actionState from './actionState';
import createAction from './createAction';

const createMiddlewareStream = (context, action) => {
  const res = pipe(
    fromIter(middleware),
    // tap(x => console.log('fun', x.name)),
    takeWhile(() => action.state !== actionState.END),
    // tap(x => console.log('data->', x)),
    concatMap(fn =>
      fromPromise(
        fn(context, action),
        // (async function f() {
        //   console.log('[calling]', fn.name);
        //   const res = await fn(context, action);
        //   console.log('res', res);
        // })(),
      ),
    ),
  );

  return res;
};

export default function createInpageProviderStream(context) {
  const emitter = context.getEmitter();

  const requestPipe = pipe(fromEmitter(emitter, INPAGE_EVENTS.REQUEST));
  const settingsPipe = pipe(fromEmitter(emitter, INPAGE_EVENTS.SETTINGS));

  return pipe(
    merge(requestPipe, settingsPipe),
    map(request => createAction(request, context.getInpageProviderSettings())),
    // tap(x => console.log('action', x)),
    filter(x => x && x.request),
    // tap(x => console.log('req', x)),
    concatMap(action => createMiddlewareStream(context, action)),
    subscribe({
      error: err => console.error(err),
    }),
  );
}

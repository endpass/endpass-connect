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
// import tap from 'callbag-tap';
import actionState from './actionState';
import middleware from './middleware';
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
        //   await fn(context, action);
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
    filter(x => x && x.request),
    concatMap(action => createMiddlewareStream(context, action)),
    subscribe({
      error: err => console.error(err),
    }),
  );
}

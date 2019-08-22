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
// import tap from 'callbag-tap';
import fromEmitter from '@/streams/factory/fromEmitter';
import { INPAGE_EVENTS } from '@/constants';
import middleware from '@/streams/inpageProvider/middleware';
import actionState from './actionState';
import createAction from './createAction';

const createMiddlewareStream = (context, action) => {
  const middleWare$ = pipe(
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

  return middleWare$;
};

export default function createInpageProviderStream(context) {
  const emitter = context.getEmitter();

  const request$ = pipe(fromEmitter(emitter, INPAGE_EVENTS.REQUEST));
  const settings$ = pipe(fromEmitter(emitter, INPAGE_EVENTS.SETTINGS));

  return pipe(
    merge(request$, settings$),
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

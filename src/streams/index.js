// export default function createStream(context) {
//  createInpageProviderStream(context);
// }

// export const createAuthStream = (context) => {
//   const messenger = context.getMessenger();
//   return pipe(
//     fromEmitter(messenger, MESSENGER_METHODS.LOGIN_STATE),
//     // loginState
//     map(state => state),
//     map(({isLogin, isPermission}) => isLogin && isPermission)),
//     dropRepeats(),
//     subscribe({
//       error: err => console.error(err),
//     }),
//   );
// };
//
// export const createWidgetStream = (context) => {
//   const auth$ = context.auth$;
//   return pipe(
//     auth$,
//     concat((isAuth) =>
//       isAuth
//         ? context.getWidget().mount()
//         : context.getWidget().unmount()
//     ),
//   );
// };
//
// export const createStream = (context) => {
//   createAuthStream(context);
//
//   createWidgetStream(context);
// };

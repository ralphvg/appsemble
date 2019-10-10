import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';

import reducer, { closeMenu, initialState, MenuAction, MenuState, openMenu } from './menu';

describe('Menu Redux', () => {
  let store: MockStoreEnhanced<MenuState, ThunkDispatch<MenuState, undefined, MenuAction>>;

  beforeEach(() => {
    store = createMockStore<MenuState, ThunkDispatch<MenuState, undefined, MenuAction>>([thunk])(
      initialState,
    );
  });

  it('should return the default state', () => {
    expect(reducer(undefined, ({} as unknown) as MenuAction)).toStrictEqual(initialState);
  });

  it('handles OPEN actions', () => {
    expect(reducer(initialState, { type: 'menu/OPEN' })).toStrictEqual({ isOpen: true });
  });

  it('handles CLOSE actions', () => {
    expect(reducer({ isOpen: true }, { type: 'menu/CLOSE' })).toStrictEqual({ isOpen: false });
  });

  it('should create an open action', async () => {
    await store.dispatch(openMenu());
    expect(store.getActions()[0]).toStrictEqual({
      type: 'menu/OPEN',
    });
  });

  it('should create a close action', async () => {
    await store.dispatch(closeMenu());
    expect(store.getActions()[0]).toStrictEqual({
      type: 'menu/CLOSE',
    });
  });
});

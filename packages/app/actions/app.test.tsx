import { App } from '@appsemble/types';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';

import * as getDB from '../utils/getDB';
import reducer, {
  AppAction,
  AppState,
  GET_ERROR,
  GET_START,
  GET_SUCCESS,
  getApp,
  initialState,
} from './app';

const emptyApp: App = {
  id: 1,
  authentication: [],
  pages: [],
  resources: {},
};

jest.mock('../utils/settings', () => ({
  __esModule: true,
  default: {
    app: {
      id: 1,
      authentication: [],
      pages: [],
      resources: {},
    },
  },
}));

describe('App Redux', () => {
  let store: MockStoreEnhanced<AppState, ThunkDispatch<AppState, undefined, AppAction>>;

  beforeEach(() => {
    store = createMockStore<AppState, ThunkDispatch<AppState, undefined, AppAction>>([thunk])(
      initialState,
    );
  });

  it('should return the default state', () => {
    expect(reducer(undefined, ({} as unknown) as AppAction)).toStrictEqual(initialState);
  });

  it('should handle GET_START actions', () => {
    expect(
      reducer(
        {
          app: emptyApp,
          error: Error('Beep'),
        },
        { type: GET_START },
      ),
    ).toStrictEqual(initialState);
  });

  it('should handle GET_ERROR actions', () => {
    expect(reducer(initialState, { type: GET_ERROR, error: Error('Example') })).toStrictEqual({
      app: null,
      error: Error('Example'),
    });
  });

  it('should handle GET_SUCCESS actions', () => {
    expect(
      reducer(initialState, {
        type: GET_SUCCESS,
        db: null,
        app: emptyApp,
      }),
    ).toStrictEqual({ app: emptyApp, error: null });
  });

  it('should handle EDIT_SUCCESS actions', () => {
    expect(
      reducer(
        { app: emptyApp, error: null },
        {
          type: 'editor/EDIT_SUCCESS',
          app: { ...emptyApp, pages: [{ name: 'Test Page', blocks: [] }] },
        },
      ),
    ).toStrictEqual({
      error: null,
      app: { ...emptyApp, pages: [{ name: 'Test Page', blocks: [] }] },
    });
  });

  it('should create getApp actions when app does not exist', async () => {
    const error = Error('This is a test error');
    const spy = jest.spyOn(getDB, 'default');
    spy.mockRejectedValue(error);

    await store.dispatch(getApp());
    const actions = store.getActions();

    expect(actions).toStrictEqual([
      { type: GET_START },
      {
        type: GET_ERROR,
        error,
      },
    ]);
  });

  it('should create getApp actions when app exists', async () => {
    const spy = jest.spyOn(getDB, 'default');
    spy.mockResolvedValue({} as any);

    await store.dispatch(getApp());
    const actions = store.getActions();

    expect(actions).toStrictEqual([
      { type: GET_START },
      {
        type: GET_SUCCESS,
        db: {},
        app: emptyApp,
      },
    ]);

    expect(spy).toHaveBeenCalledWith(emptyApp);
    spy.mockRestore();
  });
});

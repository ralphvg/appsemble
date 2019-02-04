import 'roboto-fontface';
import { init } from '@sentry/browser';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

import './index.css';
import App from './components/App';
import * as reducers from './actions';
import resolveJsonPointers from './utils/resolveJsonPointers';

const { sentryDsn } = document.documentElement.dataset;
init({ dsn: sentryDsn });

if ('serviceWorker' in navigator) {
  runtime.register();
}

const composeEnhancers =
  // eslint-disable-next-line no-underscore-dangle
  (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
const store = createStore(combineReducers(reducers), composeEnhancers(applyMiddleware(thunk)));

// Used by the live editor to communicate new app recipes
window.addEventListener('message', event => {
  if (event.data.type === 'editor/EDIT_SUCCESS') {
    const app = resolveJsonPointers(event.data.app);
    store.dispatch({ type: event.data.type, app });

    const replaceStyle = (id, style) => {
      const oldNode = document.getElementById(id);
      const newNode = document.createElement('style');
      newNode.appendChild(document.createTextNode(style));
      newNode.id = id;

      if (oldNode) {
        document.head.replaceChild(newNode, oldNode);
      } else {
        document.head.appendChild(newNode);
      }
    };

    replaceStyle('appsemble-style-core', event.data.style);
    replaceStyle('appsemble-style-shared', event.data.sharedStyle);
  }
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
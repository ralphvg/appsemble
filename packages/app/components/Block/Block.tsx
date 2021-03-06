import { useMessages } from '@appsemble/react-components';
import { Block as BlockType } from '@appsemble/types';
import { baseTheme, normalize, normalizeBlockName } from '@appsemble/utils';
import classNames from 'classnames';
import { EventEmitter } from 'events';
import React from 'react';
import ReactDOM from 'react-dom';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { ShowDialogAction } from '../../types';
import { ActionCreators } from '../../utils/actions';
import { callBootstrap } from '../../utils/bootstrapper';
import injectCSS from '../../utils/injectCSS';
import makeActions from '../../utils/makeActions';
import prefixBlockURL from '../../utils/prefixBlockURL';
import settings from '../../utils/settings';
import { useAppDefinition } from '../AppDefinitionProvider';
import { useServiceWorkerRegistration } from '../ServiceWorkerRegistrationProvider';
import styles from './Block.css';

const FA_URL = Array.from(document.styleSheets, sheet => sheet.href).find(
  href => href && href.startsWith(`${window.location.origin}/fa/`),
);

interface BlockProps {
  data?: any;
  className?: string;
  ee: EventEmitter;

  /**
   * The block to render.
   */
  block: BlockType;
  extraCreators?: ActionCreators;

  /**
   * XXX: Define this type
   */
  flowActions: any;

  showDialog: ShowDialogAction;
  ready(block: BlockType): void;
  pageReady: Promise<void>;
}

/**
 * Render a block on a page.
 *
 * A shadow DOM is created for the block. All CSS files for each block definition are added to the
 * shadow DOM. Then the bootstrap function of the block definition is called.
 */
export default function Block({
  block,
  className,
  data,
  ee,
  extraCreators,
  flowActions,
  pageReady,
  ready,
  showDialog,
}: BlockProps): React.ReactElement {
  const history = useHistory();
  const match = useRouteMatch();
  const location = useLocation();
  const push = useMessages();
  const { blockManifests, definition } = useAppDefinition();

  const ref = React.useRef<HTMLDivElement>();
  const cleanups = React.useRef<Function[]>([]);
  const [initialized, setInitialized] = React.useState(false);
  const pushNotifications = useServiceWorkerRegistration();

  const blockName = normalizeBlockName(block.type);
  const manifest = blockManifests.find(m => m.name === blockName && m.version === block.version);

  React.useEffect(
    () => () => {
      cleanups.current.forEach(async fn => fn());
    },
    [],
  );

  React.useEffect(() => {
    const div = ref.current;
    if (initialized || (!div && manifest.layout !== 'hidden') || !pageReady) {
      return;
    }
    setInitialized(true);

    const shadowRoot = div?.attachShadow({ mode: 'closed' }) ?? null;

    const events = {
      emit: Object.fromEntries(
        (manifest.events?.emit ?? []).map(key => [
          key,
          block.events?.emit?.[key]
            ? (d: any, error?: string) =>
                ee.emit(block.events.emit[key], d, error === '' ? 'Error' : error)
            : () => {},
        ]),
      ),
      on: Object.fromEntries(
        (manifest.events?.listen ?? []).map(key => [
          key,
          block.events?.listen?.[key]
            ? (callback: (data: any, error?: string) => void) =>
                ee.on(block.events.listen[key], callback)
            : () => {},
        ]),
      ),
      off: Object.fromEntries(
        (manifest.events?.listen ?? []).map(key => [
          key,
          block.events?.listen?.[key]
            ? (callback: (data: any, error?: string) => void) =>
                ee.off(block.events.listen[key], callback)
            : () => {},
        ]),
      ),
    };

    const actions = makeActions({
      actions: manifest.actions,
      definition,
      context: block,
      history,
      showDialog,
      extraCreators,
      flowActions,
      pushNotifications,
      pageReady,
      ee,
    });
    const { theme: pageTheme } = definition.pages.find(
      page => normalize(page.name) === match.path.slice(1).split('/')[0],
    );
    const BULMA_URL = document.querySelector('#bulma-style-app') as HTMLLinkElement;
    const [bulmaBase] = BULMA_URL.href.split('?');
    const theme = {
      ...baseTheme,
      ...definition.theme,
      ...pageTheme,
      ...block.theme,
    };

    const urlParams = new URLSearchParams(theme);
    urlParams.sort();

    const bulmaUrl =
      definition.theme || pageTheme || block.theme ? `${bulmaBase}?${urlParams}` : bulmaBase;

    const utils = {
      showMessage: push,
      addCleanup(fn: Function) {
        cleanups.current.push(fn);
      },
    };

    (async () => {
      if (shadowRoot) {
        await Promise.all(
          [
            bulmaUrl,
            FA_URL,
            ...manifest.files
              .filter(url => url.endsWith('.css'))
              .map(url => prefixBlockURL(block, url)),
            `${window.location.origin}/api/organizations/${settings.organizationId}/style/shared`,
            `${window.location.origin}/api/organizations/${settings.organizationId}/style/block/${manifest.name}`,
            `${window.location.origin}/api/apps/${settings.id}/style/block/${manifest.name}`,
            (document.getElementById('appsemble-style-shared') as HTMLLinkElement)?.href,
          ].map(url => injectCSS(shadowRoot, url)),
        );
      }

      await callBootstrap(manifest, {
        actions,
        block,
        data: data || location.state,
        events,
        pageParameters: match.params,
        theme,
        shadowRoot,
        utils,
      });

      ready(block);
    })();
  }, [
    block,
    data,
    definition,
    ee,
    extraCreators,
    flowActions,
    history,
    initialized,
    location,
    manifest,
    match,
    pageReady,
    push,
    pushNotifications,
    ready,
    showDialog,
  ]);

  switch (manifest.layout) {
    case 'float':
      return ReactDOM.createPortal(
        <div ref={ref} className={classNames(styles.float, className)} />,
        document.body,
      );
    case 'static':
      return <div ref={ref} className={classNames(styles.static, className)} />;
    case 'hidden':
      return null;
    default:
      return <div ref={ref} className={classNames(styles.grow, className)} />;
  }
}

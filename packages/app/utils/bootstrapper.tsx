import { AppsembleBootstrapEvent, BootstrapFunction, BootstrapParams } from '@appsemble/sdk';
import { BlockManifest } from '@appsemble/types';
import { Promisable } from 'type-fest';

import prefixBlockURL from './prefixBlockURL';

const bootstrappers = new Map<string, BootstrapFunction>();
const resolvers = new Map<string, ((fn: BootstrapFunction) => void)[]>();
const loadedBlocks = new Set<string>();

/**
 * Register a bootstrap function for a block.
 *
 * @param scriptNode The script node on which to register the bootstrap function.
 * @param event the event that was used to register the bootstrap function.
 * @param blockDefId The id of the block definition for which a boostrap function is being
 * registered.
 */
export function register(
  scriptNode: HTMLScriptElement,
  event: AppsembleBootstrapEvent,
  blockDefId: string,
): void {
  const { document, fn } = event.detail;
  if (scriptNode !== event.target || scriptNode !== document.currentScript) {
    throw new Error(
      'Block bootstrapper was registered from within an unhandled node. What’s going on?',
    );
  }
  if (bootstrappers.has(blockDefId)) {
    throw new Error(
      'It appears this block has already been bootstrapped. Did you call bootstrap twice?',
    );
  }
  if (!(fn instanceof Function)) {
    throw new Error(
      'No function was passed to bootstrap(). It takes a function as its first argument.',
    );
  }
  bootstrappers.set(blockDefId, fn);
  const callbacks = resolvers.get(blockDefId);
  resolvers.delete(blockDefId);
  if (!callbacks) {
    throw new Error('This block shouldn’t have been loaded. What’s going on?');
  }
  callbacks.forEach(resolve => resolve(fn));
}

function getBootstrap(blockDefId: string): Promisable<BootstrapFunction> {
  if (bootstrappers.has(blockDefId)) {
    return bootstrappers.get(blockDefId);
  }
  if (!resolvers.has(blockDefId)) {
    resolvers.set(blockDefId, []);
  }
  const waiting = resolvers.get(blockDefId);
  return new Promise(resolve => {
    waiting.push(resolve);
  });
}

/**
 * Call the bootstrap function for a block definition
 *
 * @param blockDef The block definition whose bootstrap function to call.
 * @param params any named parameters that will be passed to the block boostrap function.
 */
export async function callBootstrap(
  manifest: BlockManifest,
  params: BootstrapParams,
): Promise<void> {
  if (!loadedBlocks.has(manifest.name)) {
    manifest.files
      .filter(url => url.endsWith('.js'))
      .forEach(url => {
        const script = document.createElement('script');
        script.src = prefixBlockURL({ type: manifest.name, version: manifest.version }, url);
        script.addEventListener('AppsembleBootstrap', (event: AppsembleBootstrapEvent) => {
          event.stopImmediatePropagation();
          event.preventDefault();
          register(script, event, manifest.name);
        });
        document.head.appendChild(script);
      });
    loadedBlocks.add(manifest.name);
  }
  const bootstrap = await getBootstrap(manifest.name);
  await bootstrap(params);
}

import { configureLogger, handleError } from '@appsemble/node-utils';
import { cosmiconfig } from 'cosmiconfig';
import path from 'path';
import yargs from 'yargs';

import { CREDENTIALS_ENV_VAR } from './lib/authentication';
import initAxios from './lib/initAxios';

export default async function main(argv) {
  const explorer = cosmiconfig('appsembleServer');
  const found = await explorer.search(process.cwd());

  let parser = yargs
    .option('verbose', {
      alias: 'v',
      describe: 'Increase verbosity',
      type: 'count',
    })
    .option('quiet', {
      alias: 'q',
      describe: 'Decrease verbosity',
      type: 'count',
    })
    .option('remote', {
      description: 'The Appsemble host that should be used.',
      default: 'http://localhost:9999',
    })
    .option('client-credentials', {
      description: `OAuth2 client credentials formatted as "client_id:client_secret". This may also be defined in the ${CREDENTIALS_ENV_VAR} environment variable.`,
    })
    .middleware([configureLogger, initAxios])
    .commandDir(path.join(__dirname, 'commands'))
    .demandCommand(1)
    .fail(handleError)
    .help()
    .completion();
  if (found) {
    parser = parser.config(found.config);
  }
  parser.parse(argv);
}

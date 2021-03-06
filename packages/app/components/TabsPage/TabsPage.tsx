import { TabsPage as TabsPageType } from '@appsemble/types';
import { normalize } from '@appsemble/utils';
import classNames from 'classnames';
import React from 'react';
import { Link, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import BlockList from '../BlockList';

type TabsPageProps = Omit<React.ComponentPropsWithoutRef<typeof BlockList>, 'blocks'> &
  Pick<TabsPageType, 'subPages'>;

export default function TabsPage({
  subPages,
  ...blockListProps
}: TabsPageProps): React.ReactElement {
  const match = useRouteMatch<{ subPage: string }>();

  return (
    <>
      <div className="tabs is-centered is-medium">
        <ul>
          {subPages.map(({ name }) => (
            <li
              key={name}
              className={classNames({
                'is-active': normalize(name) === match.params.subPage,
              })}
            >
              <Link to={`${normalize(name)}`}>{name}</Link>
            </li>
          ))}
        </ul>
      </div>
      <Switch>
        {subPages.map(({ blocks, name }) => (
          <Route
            key={name}
            exact
            path={`${match.path}/${normalize(name)}`}
            render={() => <BlockList {...blockListProps} blocks={blocks} />}
          />
        ))}

        <Redirect to={`${match.url}/${normalize(subPages[0].name)}`} />
      </Switch>
    </>
  );
}

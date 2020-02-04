import { Icon } from '@appsemble/react-components';
import { normalize } from '@appsemble/utils';
import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAppDefinition } from '../AppDefinitionProvider';
import styles from './BottomNavigation.css';

export default function BottomNavigation(): React.ReactElement {
  const { definition } = useAppDefinition();
  const location = useLocation();
  const currentPage = definition.pages.find(
    p => normalize(p.name) === location.pathname.split('/')[1],
  );

  const navigation = (currentPage && currentPage.navigation) || definition.navigation;
  if (navigation !== 'bottom') {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <ul className={styles.list}>
        {definition.pages
          .filter(page => !page.parameters && !page.hideFromMenu)
          .map(page => (
            <li key={page.name} className="bottom-nav-item">
              <NavLink
                activeClassName="is-active"
                className="bottom-nav-item-link"
                to={`/${normalize(page.name)}`}
              >
                {page.icon ? <Icon icon={page.icon} iconSize="3x" size="large" /> : null}
                <span>{page.name}</span>
              </NavLink>
            </li>
          ))}
      </ul>
    </nav>
  );
}

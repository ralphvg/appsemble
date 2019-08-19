import { BlockProps } from '@appsemble/react';
import { Loader } from '@appsemble/react-components';
import { remapData } from '@appsemble/utils';
import React from 'react';
import { FormattedMessage, InjectedIntlProps } from 'react-intl';

import { Actions, Parameters } from '../../../types';
import styles from './ListBlock.css';
import messages from './messages';

interface Item {
  id?: number;
}

interface ListBlockState {
  data: Item[];
  error: boolean;
  loading: boolean;
}

export default class ListBlock extends React.Component<
  BlockProps<Parameters, Actions> & InjectedIntlProps,
  ListBlockState
> {
  state: ListBlockState = { data: undefined, error: false, loading: true };

  async componentDidMount(): Promise<void> {
    const { actions } = this.props;

    try {
      const data = await actions.onLoad.dispatch();
      this.setState({ data, loading: false });
    } catch (e) {
      this.setState({ error: true, loading: false });
    }
  }

  onClick(item: Item): void {
    const { actions } = this.props;

    if (actions.onClick) {
      actions.onClick.dispatch(item);
    }
  }

  render(): React.ReactNode {
    const { block, actions, intl } = this.props;
    const { data, error, loading } = this.state;
    const { fields } = block.parameters;

    if (loading) {
      return <Loader />;
    }

    if (error) {
      return <FormattedMessage {...messages.error} />;
    }

    if (!data.length) {
      return <FormattedMessage {...messages.noData} />;
    }

    return (
      <table className="table is-hoverable is-striped is-fullwidth">
        <thead>
          <tr>
            {fields.map(field => (
              <th key={`header.${field.name}`}>{field.label || field.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, dataIndex) => (
            <tr
              key={item.id || dataIndex}
              className={actions.onClick.type !== 'noop' ? styles.clickable : undefined}
              onClick={() => this.onClick(item)}
            >
              {fields.map(field => {
                const value = remapData(field.name, item, { intl });

                return (
                  <td key={field.name}>
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

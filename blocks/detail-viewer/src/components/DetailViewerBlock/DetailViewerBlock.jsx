import PropTypes from 'prop-types';
import React from 'react';
import { remapData } from '@appsemble/utils/remap';

import FileRenderer from '../renderers/FileRenderer';
import GeoCoordinatesRenderer from '../renderers/GeoCoordinatesRenderer';
import StringRenderer from '../renderers/StringRenderer';
import styles from './DetailViewerBlock.css';

const renderers = {
  file: FileRenderer,
  geocoordinates: GeoCoordinatesRenderer,
  string: StringRenderer,
};

/**
 * The main component for the Appsemble detail-viewer block.
 */
export default class DetailViewerBlock extends React.Component {
  static propTypes = {
    /**
     * The actions as passed by the Appsemble interface.
     */
    actions: PropTypes.shape().isRequired,
    /**
     * The url parameters as passed by the Appsemble interface.
     */
    pageParameters: PropTypes.shape().isRequired,
    /**
     * The block as passed by the Appsemble interface.
     */
    block: PropTypes.shape().isRequired,
  };

  state = {
    data: {},
  };

  async componentDidMount() {
    const { actions, pageParameters } = this.props;

    const data = await actions.load.dispatch(pageParameters);
    this.setState({ data });
  }

  render() {
    const { block } = this.props;
    const { data } = this.state;

    // Display loading when data is in its default state.
    if (Object.entries(data).length === 0 && data.constructor === Object) {
      return 'Loading…';
    }

    return (
      <div className={styles.root}>
        {block.parameters.fields.map((field, index) => {
          // Always default to string if type is not supported in renderers list.
          const Component = renderers[field.type] || renderers.string;

          return (
            <Component
              key={field.name || field.label || `${field.type}.${index}`}
              block={block}
              data={data}
              field={field}
              value={field.name ? remapData(field.name, data) : null}
            />
          );
        })}
      </div>
    );
  }
}

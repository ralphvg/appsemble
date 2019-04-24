import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getApp } from '../../actions/app';
import { initAuth } from '../../actions/user';
import AppContext from './AppContext';

function mapStateToProps(state) {
  return {
    app: state.app.app,
    ready: !!state.user.initialized,
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    {
      getApp,
      initAuth,
    },
  )(AppContext),
);

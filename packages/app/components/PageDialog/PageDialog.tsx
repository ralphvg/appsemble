import { Modal } from '@appsemble/react-components';
import classNames from 'classnames';
import React from 'react';

import { ShowDialogParams } from '../../types';
import BlockList from '../BlockList';
import styles from './PageDialog.css';

interface PageDialogProps extends Omit<React.ComponentPropsWithoutRef<typeof BlockList>, 'blocks'> {
  dialog: ShowDialogParams;
}

/**
 * The dialog component to render on a page when the `dialog` action is dispatched.
 */
export default function PageDialog({
  dialog = null,
  ...props
}: PageDialogProps): React.ReactElement {
  return (
    <Modal
      cardClassName={classNames({ [styles.fullscreen]: dialog && dialog.fullscreen })}
      closable={dialog && dialog.closable}
      isActive={!!dialog}
      onClose={dialog && dialog.close}
      title={dialog && dialog.title}
    >
      {dialog && (
        <BlockList
          blocks={dialog.blocks}
          data={dialog.data}
          extraCreators={dialog.actionCreators}
          {...props}
        />
      )}
    </Modal>
  );
}

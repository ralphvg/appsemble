import {
  Card,
  CardContent,
  CardFooter,
  CardFooterItem,
  CardHeader,
  CardHeaderTitle,
  Container,
  Modal,
  SelectField,
  InputField,
} from '@appsemble/react-bulma';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './messages';
import styles from './CreateAppCard.css';
import templates from '../../../../templates';

export default class CreateAppCard extends React.Component {
  state = {
    modalOpen: false,
    selectedTemplate: 0,
    appName: '',
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onClick = async () => {
    this.setState({ modalOpen: true });
  };

  onClose = async () => {
    this.setState({ modalOpen: false });
  };

  onCreate = async event => {
    event.preventDefault();

    const {
      createApp,
      history,
      push,
      intl: { formatMessage },
    } = this.props;
    const { appName, selectedTemplate } = this.state;

    try {
      const template = templates[selectedTemplate].recipe;
      const app = await createApp({ ...template, name: appName });

      history.push(`/editor/${app.id}`);
    } catch (e) {
      if (e.response && e.response.status === 409) {
        push({ body: formatMessage(messages.nameConflict, { name: appName }) });
      } else {
        push({ body: formatMessage(messages.error) });
      }
    }
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const { modalOpen, selectedTemplate, appName } = this.state;
    return (
      <div className={styles.createAppCardContainer}>
        <Card className={styles.createAppCard} onClick={this.onClick}>
          <CardContent>
            <FormattedMessage {...messages.createApp} />
          </CardContent>
        </Card>
        <Container component="form" onSubmit={this.onCreate}>
          <Modal active={modalOpen} ModalCloseProps={{ size: 'large' }} onClose={this.onClose}>
            <Card>
              <CardHeader>
                <CardHeaderTitle>
                  <FormattedMessage {...messages.createAppTitle} />
                </CardHeaderTitle>
              </CardHeader>
              <CardContent>
                <InputField
                  label={formatMessage(messages.name)}
                  maxLength={30}
                  minLength={1}
                  name="appName"
                  onChange={this.onChange}
                  placeholder={formatMessage(messages.name)}
                  required
                  value={appName}
                />
                <SelectField
                  label={formatMessage(messages.template)}
                  name="selectedTemplate"
                  onChange={this.onChange}
                  value={selectedTemplate}
                >
                  {templates.map((template, index) => (
                    <option key={template.name} value={index}>
                      {template.name}
                    </option>
                  ))}
                </SelectField>
              </CardContent>
              <CardFooter>
                <CardFooterItem className="is-link" component="a" onClick={this.onClose}>
                  <FormattedMessage {...messages.cancel} />
                </CardFooterItem>
                <CardFooterItem
                  className={styles.cardFooterButton}
                  component="button"
                  type="submit"
                >
                  <FormattedMessage {...messages.create} />
                </CardFooterItem>
              </CardFooter>
            </Card>
          </Modal>
        </Container>
      </div>
    );
  }
}

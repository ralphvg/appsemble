import React from 'react';
import PropTypes from 'prop-types';

import styles from './Card.css';
import messages from './messages';

/**
 * A single card in the feed.
 */
export default class Card extends React.Component {
  static propTypes = {
    /**
     * The actions as passed by the Appsemble interface.
     */
    actions: PropTypes.shape().isRequired,
    /**
     * The Appsemble block for which to render the card.
     */
    block: PropTypes.shape().isRequired,
    intl: PropTypes.shape().isRequired,
    utils: PropTypes.shape().isRequired,
    /**
     * The content for this specific card to render.
     */
    content: PropTypes.shape().isRequired,
    /**
     * Remapper functions that have been prepared by a parent component.
     */
    remappers: PropTypes.shape().isRequired,
    /**
     * Update function that can be called to update a single resource
     */
    onUpdate: PropTypes.func.isRequired,
  };

  replyContainer = React.createRef();

  state = {
    message: '',
    replies: [],
  };

  async componentDidMount() {
    const { actions, block, content } = this.props;
    const parentId = block.parameters?.reply?.parentId || 'parentId';

    const replies = await actions.loadReply.dispatch({ $filter: `${parentId} eq '${content.id}'` });
    this.setState({ replies });
  }

  onAvatarClick = async event => {
    event.preventDefault();
    const { actions, content, onUpdate } = this.props;
    const data = await actions.avatarClick.dispatch(content);

    if (data) {
      onUpdate(data);
    }
  };

  onChange = event => {
    this.setState({ message: event.target.value });
  };

  onSubmit = event => {
    event.preventDefault();
  };

  onClick = async () => {
    const { actions, block, content, utils, intl } = this.props;
    const { message, replies } = this.state;

    try {
      const contentField = block.parameters?.reply?.content || 'content';
      const parentId = block.parameters?.reply?.parentId || 'parentId';

      const result = await actions.submitReply.dispatch({
        [parentId]: content.id,
        [contentField]: message,
      });

      this.setState({
        replies: [...replies, result],
        message: '',
      });

      // Scroll to the bottom of the reply container
      this.replyContainer.current.scrollTop = this.replyContainer.current.scrollHeight;
    } catch (e) {
      utils.showMessage(intl.formatMessage(messages.replyError));
    }
  };

  render() {
    const { actions, block, content, intl, remappers } = this.props;
    const { message, replies } = this.state;

    const title = remappers.title(content);
    const subtitle = remappers.subtitle(content);
    const heading = remappers.heading(content);
    const picture = remappers.picture(content);
    const description = remappers.description(content);

    // XXX: Replace with avatar/icon and a default icon
    const avatarContent = (
      <figure className="image is-48x48">
        <img
          alt={intl.formatMessage(messages.avatar)}
          src="https://bulma.io/images/placeholders/96x96.png"
        />
      </figure>
    );

    return (
      <article className={`card ${styles.root}`}>
        <div className="card-content">
          <div className="media">
            {actions.avatarClick.type === 'link' ? (
              <a
                className={`media-left ${styles.avatar}`}
                href={actions.avatarClick.href()}
                onClick={this.onAvatarClick}
              >
                {avatarContent}
              </a>
            ) : (
              <button
                className={`media-left ${styles.avatar}`}
                onClick={this.onAvatarClick}
                type="button"
              >
                {avatarContent}
              </button>
            )}
            <header className="media-content">
              {title && <h4 className="title is-4 is-marginless">{title}</h4>}
              {subtitle && <h5 className="subtitle is-5 is-marginless">{subtitle}</h5>}
              {heading && <p className="subtitle is-6">{heading}</p>}
            </header>
          </div>
        </div>
        {picture && (
          <div className="card-image">
            <figure className={styles.figure}>
              <img
                alt={title || subtitle || heading || description}
                className={styles.image}
                src={`${block.parameters.pictureBase}/${picture}`}
              />
            </figure>
          </div>
        )}
        <div className="card-content">
          {description && <p className="content">{description}</p>}
          <div ref={this.replyContainer} className={styles.replies}>
            {replies.map(reply => {
              const author = remappers.author(reply);
              const replyContent = remappers.content(reply);
              return (
                <div key={reply.id} className="content">
                  <h6 className="is-marginless">
                    {author || intl.formatMessage(messages.anonymous)}
                  </h6>
                  <p>{replyContent}</p>
                </div>
              );
            })}
          </div>
          <form className={styles.replyForm} noValidate onSubmit={this.onSubmit}>
            <input
              className="input"
              onChange={this.onChange}
              placeholder={intl.formatMessage(messages.reply)}
              value={message}
            />
            {/* eslint-disable-next-line no-inline-comments */}
            {/* onSubmit is not used because of buggy interactions with ShadowDOM, React.
                See: https://github.com/spring-media/react-shadow-dom-retarget-events/issues/13 */}
            <button className={`button ${styles.replyButton}`} onClick={this.onClick} type="button">
              <span className="icon is-small">
                <i className="fas fa-paper-plane" />
              </span>
            </button>
          </form>
        </div>
      </article>
    );
  }
}
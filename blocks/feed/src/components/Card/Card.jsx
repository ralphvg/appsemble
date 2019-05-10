import React from 'react';
import PropTypes from 'prop-types';

import styles from './Card.css';

// XXX: Temporary dummy data
const replies = [];

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

  state = {
    message: '',
  };

  onAvatarClick = async event => {
    const { actions, content, onUpdate } = this.props;
    event.preventDefault();
    const data = await actions.avatarClick.dispatch(content);

    if (data) {
      await onUpdate(data);
    }
  };

  onChange = event => {
    this.setState({ message: event.target.value });
  };

  onSubmit = event => {
    event.preventDefault();
  };

  render() {
    const { actions, content, block, remappers } = this.props;
    const { message } = this.state;

    const title = remappers.title(content);
    const subtitle = remappers.subtitle(content);
    const heading = remappers.heading(content);
    const picture = remappers.picture(content);
    const description = remappers.description(content);

    // XXX: Replace with avatar/icon and a default icon
    const avatarContent = (
      <figure className="image is-48x48">
        <img alt="Placeholder" src="https://bulma.io/images/placeholders/96x96.png" />
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
          <div className={styles.replies}>
            {replies.map(reply => (
              <div key={`${reply.author}${reply.content}`} className="content">
                <h6 className="is-marginless">{reply.author}</h6>
                <p>{reply.content}</p>
              </div>
            ))}
          </div>
          <form className={styles.replyForm} noValidate onSubmit={this.onSubmit}>
            <input className="input" onChange={this.onChange} value={message} />
            <button className={`button ${styles.replyButton}`} type="submit">
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

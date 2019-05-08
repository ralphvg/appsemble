import { FormattedMessage } from 'react-intl';

declare module 'react-intl' {
  interface ExtractableMessage {
    [key: string]: string;
  }

  function defineMessages<T extends ExtractableMessage>(
    messages: T,
  ): { [K in keyof T]: FormattedMessage.MessageDescriptor };
}

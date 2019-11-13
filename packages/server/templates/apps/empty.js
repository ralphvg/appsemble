export default {
  name: 'Empty App',
  description:
    'Empty App is a bare-bones application containing two pages with buttons switching between them.',
  definition: {
    name: 'Empty App',
    defaultPage: 'Example Page A',
    theme: {
      themeColor: '#000000',
    },
    pages: [
      {
        name: 'Example Page A',
        blocks: [
          {
            type: 'action-button',
            version: '0.9.0',
            parameters: {
              icon: 'arrow-right',
            },
            actions: {
              onClick: {
                type: 'link',
                to: 'Example Page B',
              },
            },
          },
        ],
      },
      {
        name: 'Example Page B',
        blocks: [
          {
            type: 'action-button',
            version: '0.9.0',
            parameters: {
              icon: 'arrow-left',
            },
            actions: {
              onClick: {
                type: 'link',
                to: 'Example Page A',
              },
            },
          },
        ],
      },
    ],
  },
};

export default {
  name: 'Holiday App',
  description: 'A simple app that fetches holiday information for various countries',
  recipe: {
    name: 'Holidays',
    defaultPage: 'Holidays in NL',
    pages: [
      {
        name: 'Holidays in NL',
        blocks: [
          {
            type: 'list',
            actions: {
              load: {
                url:
                  'https://cors-anywhere.herokuapp.com/https://date.nager.at/Api/v2/NextPublicHolidays/NL',
                type: 'request',
              },
            },
            version: '1.0.0',
            parameters: {
              fields: [
                {
                  name: 'date',
                  label: 'Date',
                },
                {
                  name: 'name',
                  label: 'Name (EN)',
                },
                {
                  name: 'localName',
                  label: 'Name (NL)',
                },
              ],
            },
          },
        ],
      },
      {
        name: 'Holidays in US',
        blocks: [
          {
            type: 'list',
            actions: {
              load: {
                url:
                  'https://cors-anywhere.herokuapp.com/https://date.nager.at/Api/v2/NextPublicHolidays/US',
                type: 'request',
              },
            },
            version: '1.0.0',
            parameters: {
              fields: [
                {
                  name: 'date',
                  label: 'Date',
                },
                {
                  name: 'name',
                  label: 'Name (EN)',
                },
              ],
            },
          },
        ],
      },
      {
        name: 'Holidays in DE',
        blocks: [
          {
            type: 'list',
            actions: {
              load: {
                url:
                  'https://cors-anywhere.herokuapp.com/https://date.nager.at/Api/v2/NextPublicHolidays/DE',
                type: 'request',
              },
            },
            version: '1.0.0',
            parameters: {
              fields: [
                {
                  name: 'date',
                  label: 'Date',
                },
                {
                  name: 'name',
                  label: 'Name (EN)',
                },
                {
                  name: 'localName',
                  label: 'Name (DE)',
                },
              ],
            },
          },
        ],
      },
      {
        name: 'Holidays in ES',
        blocks: [
          {
            type: 'list',
            actions: {
              load: {
                url:
                  'https://cors-anywhere.herokuapp.com/https://date.nager.at/Api/v2/NextPublicHolidays/ES',
                type: 'request',
              },
            },
            version: '1.0.0',
            parameters: {
              fields: [
                {
                  name: 'date',
                  label: 'Date',
                },
                {
                  name: 'name',
                  label: 'Name (EN)',
                },
                {
                  name: 'localName',
                  label: 'Name (ES)',
                },
              ],
            },
          },
        ],
      },
    ],
  },
};
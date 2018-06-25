module.exports = (api) => {
  const production = api.env() === 'production';
  const development = !production;

  const presets = [
    ['@babel/preset-env', {
      spec: false,
      loose: true,
      modules: false,
      useBuiltIns: 'usage',
    }],
    ['@babel/preset-stage-0', {
      loose: true,
      useBuiltIns: true,
      decoratorsLegacy: true,
    }],
    ['@babel/preset-react', {
      useBuiltIns: true,
      development,
    }],
  ];

  const plugins = [
    '@babel/plugin-transform-react-inline-elements',
    'babel-plugin-react-intl-auto',
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      useBuiltIns: true,
      useESModules: false,
    }],
    production && ['babel-plugin-transform-react-remove-prop-types', {
      removeImport: true,
    }],
    'babel-plugin-transform-react-class-to-function',
    development && 'react-hot-loader/babel',
  ];

  return {
    presets,
    plugins: plugins.filter(Boolean),
  };
};

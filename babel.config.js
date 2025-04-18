module.exports = {
  presets: [ 'module:metro-react-native-babel-preset' ],

  // This happens because react native has conflict with @babel/plugin-transform-private-methods plugin
  // https://github.com/ethers-io/ethers.js/discussions/4309#discussioncomment-6694524
  plugins: [ 
    'react-native-reanimated/plugin',
    'optional-require',
    [ '@babel/plugin-transform-private-methods', {
      'loose': true
    } ]
  ]
};

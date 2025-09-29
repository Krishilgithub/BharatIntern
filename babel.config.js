module.exports = {
  presets: [
<<<<<<< HEAD
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
=======
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-object-rest-spread',
  ],
>>>>>>> f6b022e8927e779bd7865a71bacf1552f748231d
};

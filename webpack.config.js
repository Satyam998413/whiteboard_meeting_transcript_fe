module.exports = {
  // ... other webpack config options
  ignoreWarnings: [
    {
      module: /flowbite-react/,
      message: /Failed to parse source map/,
    },
  ],
}; 
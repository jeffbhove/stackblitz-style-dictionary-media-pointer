const StyleDictionary = require('style-dictionary');

const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;

const pointerTypeArr = ['coarse', 'fine'];
const filesArr = [];

pointerTypeArr.forEach((pointerType) => {
  StyleDictionary.registerTransform({
    name: 'media/pointer',
    type: 'name',
    transformer: function (token) {
      return token.name.replace(`-${pointerType}`, '');
    },
  });

  StyleDictionary.registerTransform({
    name: 'media/pointerType',
    type: 'attribute',
    transformer: function (token) {
      const originalAttrs = token.attributes || {};
      const pointerTypeAttr = {};

      if (
        originalAttrs['media'] &&
        originalAttrs['media'] === 'pointer' &&
        token.name.indexOf(`-${pointerType}`) !== -1
      ) {
        pointerTypeAttr['pointer'] = pointerType;
      }

      return Object.assign(pointerTypeAttr, originalAttrs);
    },
  });

  StyleDictionary.registerFormat({
    name: 'css/media-pointer',
    formatter: function ({ dictionary, file, options }) {
      const { outputReferences } = options;
      return (
        fileHeader({ file }) +
        `@media (pointer: ${pointerType}) { :root {\n` +
        formattedVariables({ format: 'css', dictionary, outputReferences }) +
        '\n}}\n'
      );
    },
  });

  filesArr.push({
    destination: `build/${pointerType}.css`,
    format: `css/media-pointer`,
    filter: (token) => {
      return (
        token.attributes['pointer'] &&
        token.attributes['pointer'] === pointerType
      );
    },
    options: {
      outputReferences: true,
    },
  });
});

StyleDictionary.extend({
  source: [`tokens/size.json`, `tokens/size-core.json`],

  platforms: {
    css: {
      transformGroup: `css`,
      transforms: [
        'attribute/cti',
        'name/cti/kebab',
        'media/pointerType',
        'media/pointer',
      ],
      files: filesArr,
    },
  },
}).buildAllPlatforms();

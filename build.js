const StyleDictionary = require('style-dictionary');

const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;

const pointerTypeArr = ['coarse', 'fine'];
const filesArr = [];
const transformsArr = ['attribute/cti', 'name/cti/kebab'];

pointerTypeArr.forEach((pointerType) => {
  /**
   * If a token has an attribute where 'media' is equal to 'pointer',
   * and the token name contains the current pointer type,
   * add a new attribute to the token where 'pointer' is the
   * current pointer type.
   *
   *  "controlMinTarget": {
   *    "coarse": {
   *      "value": "{base.size.48}",
   *        "attributes": {
   *          "media": "pointer",
   *          "pointer": "coarse" // This attribue will be added
   *        }
   *      }
   *    }
   *  }
   */
  StyleDictionary.registerTransform({
    name: `media/pointerType/${pointerType}`,
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

  transformsArr.push(`media/pointerType/${pointerType}`);

  /**
   * Remove the pointer type from the token name so that the same
   * token name is generated for each pointer type.
   */
  StyleDictionary.registerTransform({
    name: `media/pointer/${pointerType}`,
    type: 'name',
    transformer: function (token) {
      return token.name.replace(`-${pointerType}`, '');
    },
  });

  transformsArr.push(`media/pointer/${pointerType}`);

  /**
   * Create a format to use for a Media block for pointers.
   */
  StyleDictionary.registerFormat({
    name: `css/media-pointer/${pointerType}`,
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

  /**
   * Each pointer type should generate it's own file, and will filter the
   * tokens to only include those that have the pointer attribute matching
   * the current point type.
   */
  filesArr.push({
    destination: `build/${pointerType}.css`,
    format: `css/media-pointer/${pointerType}`,
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
      transforms: transformsArr,
      files: filesArr,
    },
  },
}).buildAllPlatforms();

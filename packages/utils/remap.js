const property = '.';
const filter = '|';


const filters = {
  get: name => object => (Object.hasOwnProperty.call(object, name) ? object[name] : undefined),
  lower: () => Function.call.bind(String.prototype.toLowerCase),
  upper: () => Function.call.bind(String.prototype.toUpperCase),
};


/**
 * Compile a filter string into a function.
 *
 * This function defines a set of chained remapping filters into a callable function. A filter is
 * written using a pipe (`|`) operator, followed by the name of the filter. For example:
 *
 * ```js
 * '|lower'
 * '|upper'
 * ```
 *
 * A shorthand syntax exists for getting an object property. Simply add a dot (`.`) operator instead
 * of a pipe. This passes the name as an argument to the `get` filter.
 *
 * Besides the shorthand syntax for the `get` filter, it is not yet possible to pass arguments.
 *
 * @param {string} mapperString The string which defines the filters that should be used.
 * @returns {Function} the resulting mapper function.
 */
export function compileFilters(mapperString) {
  const { length } = mapperString;
  const result = [];
  let type = property;
  let current = '';

  function processCurrent() {
    if (type === property) {
      result.push(filters.get(current));
    } else if (Object.hasOwnProperty.call(filters, current)) {
      result.push(filters[current]());
    } else {
      throw new Error(`Invalid filter ${current}`);
    }
    current = '';
  }

  for (let i = 0; i < length; i += 1) {
    const char = mapperString.charAt(i);
    if (i === 0 && (char === property || char === filter)) {
      type = char;
    } else if (char === property) {
      processCurrent();
      type = property;
    } else if (char === filter) {
      processCurrent();
      type = filter;
    } else {
      current += char;
    }
  }
  processCurrent();
  return value => result.reduce((acc, fn) => fn(acc), value);
}


/**
 * Map data given a set of mapping specifications.
 *
 * Example:
 *
 * ```js
 * > mapData({
 * >   fooz: 'foo.bar|upper'
 * > }, {
 * >   foo: {
 * >     bar: 'baz'
 * >   }
 * > });
 * { fooz: 'BAZ' }
 * ```
 *
 * @param {*} mapperData An (optionally nested) object which defines what to output.
 * @param {*} inputData The input data which should be mapped.
 * @returns {*} The resulting data as specified by the `mapperData` argument.
 */
export function remapData(mapperData, inputData) {
  if (typeof mapperData === 'string') {
    return compileFilters(mapperData)(inputData);
  }
  if (Array.isArray(mapperData)) {
    return mapperData.map(value => remapData(value, inputData));
  }
  if (mapperData instanceof Object) {
    return Object.entries(mapperData)
      .reduce((acc, [key, value]) => {
        acc[key] = remapData(value, inputData);
        return acc;
      }, {});
  }
  throw new Error('Invalid mapper data');
}
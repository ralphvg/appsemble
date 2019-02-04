/**
 * Extract all blocks from an app recipe.
 *
 * @param {Object} app The app from which to extract the blocks.
 * @returns {Object<String,Object>} A mapping of paths in the app recipe to blocks. The returnes
 *   blocks are the same instance as that in the app recipe.
 */
export default function getAppBlocks(app) {
  const blocks = {};
  app.pages.forEach((page, pageIndex) => {
    page.blocks.forEach((block, blockIndex) => {
      const blockPath = `pages.${pageIndex}.blocks.${blockIndex}`;
      blocks[blockPath] = block;
      if (!block.actions) {
        return;
      }
      Object.entries(block.actions).forEach(([actionKey, action]) => {
        if (!Object.hasOwnProperty.call(action, 'blocks')) {
          return;
        }
        action.blocks.forEach((actionBlock, actionBlockIndex) => {
          const fullBlockPath = `${blockPath}.actions.${actionKey}.blocks.${actionBlockIndex}`;
          blocks[fullBlockPath] = actionBlock;
        });
      });
    });
  });
  return blocks;
}
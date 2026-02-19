/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// plugins/remark-add-platform-metadata.js
import { visit } from 'unist-util-visit';

const platformClasses = {
  '[A]': 'platform-indicator-android',
  '[I]': 'platform-indicator-ios',
  '[W]': 'platform-indicator-web',
};

const processHeaderMarkers = () => {
  return (ast) => {
    visit(ast, 'heading', (node) => {
      let textContent = '';
      let markers = [];

      visit(node, 'text', (textNode) => {
        // Split header into text and platform markers
        const headerParts = textNode.value
          .split(/(\[A\]|\[I\]|\[W\])/g)
          .filter((headerPart) => headerPart !== '');

        // Assume that the first part is always the text content, and the rest are markers
        textContent = headerParts.shift().trimEnd();

        // Sort markers to ensure consistent order
        markers = headerParts.sort();
      });

      if (markers.length === 0) {
        return;
      }

      const newChildren = [{ type: 'text', value: textContent }];

      markers.forEach((marker) => {
        newChildren.push({
          type: 'mdxJsxTextElement',
          name: 'span',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'className',
              value: platformClasses[marker],
            },
          ],
          children: [],
          data: { isPlatformIndicator: true },
        });
      });

      node.children = newChildren;
    });
  };
};

const removeHeaderJSX = () => {
  return (ast) => {
    const classes = Object.values(platformClasses);

    visit(ast, 'heading', (node) => {
      node.children = node.children.filter((child) => {
        if (child.type === 'mdxJsxTextElement') {
          const classAttr = child.attributes?.find(
            (a) => a.name === 'className'
          );

          return !(classAttr && classes.includes(classAttr.value));
        }

        return true;
      });
    });
  };
};

export { processHeaderMarkers, removeHeaderJSX };

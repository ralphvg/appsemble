import { attach } from '@appsemble/sdk';
import './index.css';


attach(({ actions }) => {
  let node;
  if (actions.click.type === 'link') {
    node = document.createElement('a');
    node.href = actions.click.href();
  } else {
    node = document.createElement('button');
    node.type = 'button';
  }
  node.addEventListener('click', (event) => {
    event.preventDefault();
    actions.click.dispatch();
  }, true);
  return node;
});
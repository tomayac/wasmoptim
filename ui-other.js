import { metaThemeColor } from './dom.js';

const colorSchemeChange = (e) => {
  if (e.matches) {
    metaThemeColor.content = 'rgb(32, 33, 36)';
    return;
  }
  metaThemeColor.content = '#fff';
};
matchMedia('(prefers-color-scheme: dark)').addEventListener(
  'change',
  colorSchemeChange,
);
colorSchemeChange(matchMedia('(prefers-color-scheme: dark)'));

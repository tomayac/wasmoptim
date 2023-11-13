import { overwriteCheckbox } from './dom';

overwriteCheckbox.parentNode.hidden = false;

overwriteCheckbox.addEventListener('change', () => {
  localStorage.setItem('overwrite', overwriteCheckbox.checked);
});

if (localStorage.getItem('overwrite') !== 'true') {
  overwriteCheckbox.checked = false;
} else {
  overwriteCheckbox.checked = true;
}

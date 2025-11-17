document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[data-icon]').forEach(a => {
    const iconName = a.getAttribute('data-icon');
    if (iconName) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'material-icons';
      iconSpan.textContent = iconName;
      a.prepend(iconSpan);
    }
  });
});
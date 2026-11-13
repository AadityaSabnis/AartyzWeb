(async function auditCardVisibility() {
  function visible(selector) {
    const cards = [...document.querySelectorAll(selector)];
    return cards.length > 0 && cards.every(card => {
      const style = getComputedStyle(card);
      return card.getBoundingClientRect().width > 0 && Number(style.opacity) > 0
        && style.visibility === 'visible';
    });
  }

  // Catalogue completion and route restoration can reopen the currently visible page.
  for (const page of ['men', 'women', 'decor', 'home']) {
    go(page, {historyMode:'none'});
    go(page, {historyMode:'none'});
    if (!visible('#page-' + page + ' .cat-tile')) {
      throw new Error('Category tiles are hidden after reopening ' + page);
    }
  }

  go('shop', {historyMode:'none'});
  if (!visible('#page-shop .prod-card')) {
    throw new Error('Newly rendered product cards are hidden');
  }
  return {status:'passed', checks:5};
})

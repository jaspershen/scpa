(() => {
    const searchInput = document.getElementById('article-search');
    const yearFilter = document.getElementById('year-filter');
    const cards = Array.from(document.querySelectorAll('.article-card'));
    const count = document.getElementById('article-count');
    const empty = document.getElementById('archive-empty');

    if (!searchInput || !yearFilter || !cards.length || !count || !empty) return;

    const normalize = (value) => value.toLocaleLowerCase('zh-CN').replace(/\s+/g, '');

    const updateResults = () => {
        const query = normalize(searchInput.value.trim());
        const year = yearFilter.value;
        let visible = 0;

        cards.forEach((card) => {
            const matchesQuery = !query || normalize(card.dataset.search || card.textContent).includes(query);
            const matchesYear = year === 'all' || card.dataset.year === year;
            const show = matchesQuery && matchesYear;
            card.hidden = !show;
            if (show) visible += 1;
        });

        count.textContent = `显示 ${visible} 篇`;
        empty.hidden = visible !== 0;
    };

    searchInput.addEventListener('input', updateResults);
    yearFilter.addEventListener('change', updateResults);

    const scrollToArticle = () => {
        if (!window.location.hash) return;
        const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.scrollIntoView({ block: 'start' });
            target.focus({ preventScroll: true });
        }
    };

    window.addEventListener('hashchange', scrollToArticle);
    window.addEventListener('load', scrollToArticle, { once: true });
    if (document.fonts?.ready) document.fonts.ready.then(scrollToArticle);
})();

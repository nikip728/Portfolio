export function initPageInteractions() {
  const backToTop = document.querySelector<HTMLAnchorElement>('[data-back-to-top]');
  let frame: number | undefined;
  const updateBackToTop = () => {
    frame = undefined;
    if (backToTop) {
      // Do not remove a focused link while someone is navigating with a keyboard.
      backToTop.hidden = window.scrollY < Math.max(480, window.innerHeight * 0.8)
        && document.activeElement !== backToTop;
    }
  };
  const scheduleUpdate = () => {
    if (frame === undefined) frame = window.requestAnimationFrame(updateBackToTop);
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  backToTop?.addEventListener('blur', scheduleUpdate);
  updateBackToTop();

  const projectBrowser = document.querySelector<HTMLElement>('[data-project-browser]');
  const projectFilters = projectBrowser?.querySelectorAll<HTMLButtonElement>('[data-project-filter]') ?? [];
  const projectCards = projectBrowser?.querySelectorAll<HTMLElement>('[data-project-tags]') ?? [];
  const emptyProjects = projectBrowser?.querySelector<HTMLElement>('[data-project-empty]');
  const projectFilterListeners: Array<[HTMLButtonElement, EventListener]> = [];
  if (emptyProjects) {
    const applyProjectFilter = (button: HTMLButtonElement) => {
      const category = button.dataset.projectFilter;
      if (!category) throw new Error('Project filter button is missing its category');
      let visibleCount = 0;
      for (const card of projectCards) {
        const tags = card.dataset.projectTags?.split('|') ?? [];
        const visible = category === 'all'
          || tags.some(tag => tag.toLowerCase() === category.toLowerCase());
        card.hidden = !visible;
        if (visible) visibleCount++;
      }
      for (const filter of projectFilters) {
        filter.setAttribute('aria-pressed', String(filter === button));
      }
      emptyProjects.hidden = visibleCount > 0;
    };
    for (const button of projectFilters) {
      const listener: EventListener = () => applyProjectFilter(button);
      button.addEventListener('click', listener);
      projectFilterListeners.push([button, listener]);
      if (button.getAttribute('aria-pressed') === 'true') applyProjectFilter(button);
    }
  }

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map<Element, Animation>();
  const revealed = new WeakSet<Element>();
  let observer: IntersectionObserver | undefined;
  const stopReveals = () => {
    observer?.disconnect();
    for (const [element, animation] of animations) {
          animation.cancel();
          revealed.add(element);
        }
    animations.clear();
  };
  const startReveals = () => {
    stopReveals();
    if (preference.matches || !('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || preference.matches) continue;
        observer?.unobserve(entry.target);
        revealed.add(entry.target);
        const animation = animations.get(entry.target);
        if (entry.target.contains(document.activeElement)) {
          animation?.cancel();
          animations.delete(entry.target);
        } else {
          animation?.play();
        }
      }
    }, { threshold: 0, rootMargin: '0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      // Never fade content that is already on screen, including after an anchor jump.
      if (element.getBoundingClientRect().top < window.innerHeight) revealed.add(element);
      if (revealed.has(element)) return;
            // Hold the first frame before the element enters the viewport, not after it is visible.
            const animation = element.animate([
              { opacity: 0, transform: 'translateY(40px) scale(0.985)' },
              { opacity: 1, transform: 'translateY(0) scale(1)' },
            ], { duration: 720, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' });
            animation.pause();
            animation.currentTime = 0;
            animations.set(element, animation);
            const finish = () => {
              if (animations.get(element) !== animation) return;
              animations.delete(element);
              // The underlying styles are already the final, visible state.
              animation.cancel();
            };
            animation.finished.then(finish, finish);
            observer?.observe(element);
    });
  };
  const handleFocus = (event: FocusEvent) => {
    for (const [element, animation] of animations) {
      if (event.target instanceof Node && element.contains(event.target)) {
        animation.cancel();
        animations.delete(element);
        revealed.add(element);
        observer?.unobserve(element);
      }
    }
  };
  document.addEventListener('focusin', handleFocus);
  preference.addEventListener('change', startReveals);
  startReveals();

  return () => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    stopReveals();
    window.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', scheduleUpdate);
    window.removeEventListener('pageshow', scheduleUpdate);
    backToTop?.removeEventListener('blur', scheduleUpdate);
    for (const [button, listener] of projectFilterListeners) {
      button.removeEventListener('click', listener);
    }
    document.removeEventListener('focusin', handleFocus);
    preference.removeEventListener('change', startReveals);
  };
}

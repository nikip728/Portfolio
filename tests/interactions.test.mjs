import test from 'node:test';
import assert from 'node:assert/strict';
import { initPageInteractions } from '../src/lib/interactions.ts';

function setup(t, { reducedMotion = false, intersectionObserver = true, animate = true, revealTops = [1400, 1800] } = {}) {
  const events = () => {
    const listeners = new Map();
    return {
      addEventListener: t.mock.fn((type, listener) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(listener);
      }),
      removeEventListener: t.mock.fn((type, listener) => listeners.get(type)?.delete(listener)),
      dispatch(type, event = {}) {
        for (const listener of listeners.get(type) ?? []) listener(event);
      },
    };
  };
  class FakeNode {}
  class FakeElement extends FakeNode {
    hidden = false;
    children = [];
    dataset = {};
    attributes = new Map();
    top = 1400;
    getBoundingClientRect() { return { top: this.top }; }
    constructor() {
      super();
      Object.assign(this, events());
    }
    contains(node) {
      return node === this || this.children.some(child => child.contains(node));
    }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
  }
  const animations = [];
  if (animate) {
    FakeElement.prototype.animate = t.mock.fn(function (keyframes, options) {
      let resolveFinished, rejectFinished;
      const animation = {
        currentTime: null,
        playState: 'running',
        effectActive: true,
        pause: t.mock.fn(() => { animation.playState = 'paused'; }),
        play: t.mock.fn(() => { animation.playState = 'running'; }),
        cancel: t.mock.fn(() => {
          animation.playState = 'idle';
          animation.effectActive = false;
          rejectFinished(new Error('Animation canceled'));
        }),
        finished: new Promise((resolve, reject) => {
          resolveFinished = resolve;
          rejectFinished = reject;
        }),
        finish() {
          animation.playState = 'finished';
          resolveFinished();
        },
      };
      animations.push({ target: this, keyframes, options, animation });
      return animation;
    });
  }
  const observers = [];
  class FakeIntersectionObserver {
    observed = new Set();
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observe = t.mock.fn(target => {
        const prepared = animations.find(record => record.target === target);
        assert.ok(prepared, 'animation must exist before observation');
        assert.equal(prepared.animation.playState, 'paused');
        assert.equal(prepared.animation.currentTime, 0);
        assert.equal(prepared.options.fill, 'both');
        assert.equal(prepared.keyframes[0].opacity, 0);
        this.observed.add(target);
      });
      this.unobserve = t.mock.fn(target => this.observed.delete(target));
      this.disconnect = t.mock.fn(() => this.observed.clear());
      observers.push(this);
    }
    deliver(target, isIntersecting) {
      if (this.observed.has(target)) this.callback([{ target, isIntersecting }]);
    }
  }
  const link = new FakeElement();
  const reveals = revealTops.map(top => Object.assign(new FakeElement(), { top }));
  const projectFilters = ['all', 'UI/UX', 'Front-End'].map(category => {
    const filter = new FakeElement();
    filter.dataset.projectFilter = category;
    filter.setAttribute('aria-pressed', String(category === 'all'));
    return filter;
  });
  const projectCards = ['UI/UX', 'Front-end', 'UI/UX|Front-end', 'Figma'].map(tags => {
    const card = new FakeElement();
    card.dataset.projectTags = tags;
    return card;
  });
  const emptyProjects = new FakeElement();
  emptyProjects.hidden = true;
  const projectBrowser = new FakeElement();
  projectBrowser.querySelectorAll = selector => {
    if (selector === '[data-project-filter]') return projectFilters;
    if (selector === '[data-project-tags]') return projectCards;
    throw new Error(`Unexpected project browser selector: ${selector}`);
  };
  projectBrowser.querySelector = selector => {
    if (selector === '[data-project-empty]') return emptyProjects;
    throw new Error(`Unexpected project browser selector: ${selector}`);
  };
  const preference = { ...events(), matches: reducedMotion };
  const frames = new Map();
  let nextFrame = 0;
  const window = {
    ...events(), scrollY: 0, innerHeight: 1000,
    matchMedia: t.mock.fn(() => preference),
    requestAnimationFrame: t.mock.fn(callback => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    }),
    cancelAnimationFrame: t.mock.fn(id => frames.delete(id)),
  };
  if (intersectionObserver) window.IntersectionObserver = FakeIntersectionObserver;
  const document = {
    ...events(), activeElement: null,
    querySelector: t.mock.fn(selector => {
      if (selector === '[data-back-to-top]') return link;
      if (selector === '[data-project-browser]') return projectBrowser;
      throw new Error(`Unexpected document selector: ${selector}`);
    }),
    querySelectorAll: t.mock.fn(selector => {
      assert.equal(selector, '[data-reveal]');
      return reveals;
    }),
  };
  const globals = { window, document, Element: FakeElement, Node: FakeNode, IntersectionObserver: FakeIntersectionObserver };
  const originals = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let cleanup;
  t.after(() => {
    try {
      cleanup?.();
    } finally {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    }
  });
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  cleanup = initPageInteractions();
  return {
    window, document, link, reveals, preference, observers, animations, FakeElement, frames, cleanup,
    projectFilters, projectCards, emptyProjects,
    flushFrames() {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(0);
    },
  };
}

test('project filters match tags case-insensitively and report empty categories', t => {
  const env = setup(t);
  const [all, uiUx, frontEnd] = env.projectFilters;
  assert.ok(env.projectCards.every(card => !card.hidden));
  assert.equal(env.emptyProjects.hidden, true);
  assert.equal(all.getAttribute('aria-pressed'), 'true');

  uiUx.dispatch('click');
  assert.deepEqual(env.projectCards.map(card => !card.hidden), [true, false, true, false]);
  assert.equal(uiUx.getAttribute('aria-pressed'), 'true');
  assert.equal(all.getAttribute('aria-pressed'), 'false');

  frontEnd.dispatch('click');
  assert.deepEqual(env.projectCards.map(card => !card.hidden), [false, true, true, false]);
  assert.equal(env.emptyProjects.hidden, true);

  for (const card of env.projectCards) card.dataset.projectTags = 'Figma';
  uiUx.dispatch('click');
  assert.ok(env.projectCards.every(card => card.hidden));
  assert.equal(env.emptyProjects.hidden, false);
});

test('floating-top is hidden initially and updates at the scroll threshold through a coalesced RAF', t => {
  const env = setup(t);
  const { window, link } = env;
  assert.equal(link.hidden, true);
  assert.equal(window.matchMedia.mock.calls[0].arguments[0], '(prefers-reduced-motion: reduce)');
  window.scrollY = 800;
  window.dispatch('scroll');
  window.dispatch('scroll');
  assert.equal(link.hidden, true);
  assert.equal(window.requestAnimationFrame.mock.callCount(), 1);
  env.flushFrames();
  assert.equal(link.hidden, false);
  window.scrollY = 799;
  window.dispatch('scroll');
  env.flushFrames();
  assert.equal(link.hidden, true);
  window.innerHeight = 200;
  window.scrollY = 480;
  window.dispatch('resize');
  env.flushFrames();
  assert.equal(link.hidden, false);
  window.scrollY = 479;
  window.dispatch('pageshow');
  env.flushFrames();
  assert.equal(link.hidden, true);
});

test('floating-top retains focus near the top, then hides after blur', t => {
  const env = setup(t);
  env.document.activeElement = env.link;
  env.window.dispatch('scroll');
  env.flushFrames();
  assert.equal(env.link.hidden, false);
  env.document.activeElement = null;
  env.link.dispatch('blur');
  assert.equal(env.link.hidden, false);
  env.flushFrames();
  assert.equal(env.link.hidden, true);
});

test('reduced motion prevents reveal observation and animation', t => {
  const env = setup(t, { reducedMotion: true });
  assert.equal(env.observers.length, 0);
  assert.equal(env.animations.length, 0);
  assert.equal(env.document.querySelectorAll.mock.callCount(), 0);
});

test('reveal prepares the hidden first frame before observation and plays only once on intersection', t => {
  const env = setup(t);
  const observer = env.observers[0];
  const target = env.reveals[0];
  assert.deepEqual([...observer.observed], env.reveals);
  assert.equal(env.animations.length, 2);
  for (const { animation, options } of env.animations) {
    assert.equal(animation.pause.mock.callCount(), 1);
    assert.equal(animation.currentTime, 0);
    assert.equal(animation.playState, 'paused');
    assert.equal(animation.effectActive, true);
    assert.equal(animation.play.mock.callCount(), 0);
    assert.equal(options.fill, 'both');
  }
  observer.deliver(target, false);
  assert.equal(env.animations[0].animation.play.mock.callCount(), 0);
  assert.equal(observer.unobserve.mock.callCount(), 0);
  observer.deliver(target, true);
  assert.equal(env.animations.length, 2);
  assert.equal(env.animations[0].animation.play.mock.callCount(), 1);
  assert.equal(env.animations[1].animation.play.mock.callCount(), 0);
  assert.deepEqual(env.animations[0].keyframes, [
    { opacity: 0, transform: 'translateY(40px) scale(0.985)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' },
  ]);
  assert.equal(env.animations[0].options.duration, 720);
  assert.equal(observer.options.rootMargin, '0px');
  assert.equal(observer.unobserve.mock.callCount(), 1);
  assert.equal(observer.unobserve.mock.calls[0].arguments[0], target);
  observer.deliver(target, true);
  assert.equal(env.animations.length, 2);
  assert.equal(env.animations[0].animation.play.mock.callCount(), 1);
  assert.equal(observer.unobserve.mock.callCount(), 1);
});

test('initially visible and already passed content is never faded on initialization or preference changes', t => {
  const env = setup(t, { revealTops: [-200, 0, 500, 999, 1000, 1400] });
  assert.deepEqual([...env.observers[0].observed], env.reveals.slice(4));
  assert.deepEqual(env.animations.map(record => record.target), env.reveals.slice(4));
  for (const target of env.reveals.slice(0, 4)) env.observers[0].deliver(target, true);
  assert.equal(env.animations.length, 2);
  env.preference.matches = true;
  env.preference.dispatch('change');
  env.preference.matches = false;
  env.preference.dispatch('change');
  assert.deepEqual([...env.observers[1].observed], []);
  assert.equal(env.animations.length, 2);
});

test('reduced motion exposes pending and running animations and never re-observes them', t => {
  const env = setup(t);
  const observer = env.observers[0];
  observer.deliver(env.reveals[0], true);
  assert.equal(env.animations[0].animation.playState, 'running');
  assert.equal(env.animations[1].animation.playState, 'paused');
  assert.equal(env.animations.length, 2);
  env.preference.matches = true;
  env.preference.dispatch('change');
  assert.equal(observer.disconnect.mock.callCount(), 1);
  for (const { animation } of env.animations) {
    assert.equal(animation.cancel.mock.callCount(), 1);
    assert.equal(animation.effectActive, false);
  }
  assert.equal(env.observers.length, 1);
  env.preference.matches = false;
  env.preference.dispatch('change');
  assert.equal(env.observers.length, 2);
  assert.equal(env.observers[1].observe.mock.callCount(), 0);
});

for (const missing of ['IntersectionObserver', 'animate']) {
  test(`missing ${missing} leaves all reveal elements naturally visible`, t => {
    const env = setup(t, missing === 'animate' ? { animate: false } : { intersectionObserver: false });
    assert.equal(env.observers.length, 0);
    assert.equal(env.animations.length, 0);
    assert.ok(env.reveals.every(target => !target.hidden));
    assert.equal(env.document.querySelectorAll.mock.callCount(), 0);
    env.window.scrollY = 1000;
    env.window.dispatch('scroll');
    env.flushFrames();
    assert.equal(env.link.hidden, false);
    assert.doesNotThrow(() => env.preference.dispatch('change'));
  });
}

test('focus inside a revealing element cancels only its animation', t => {
  const env = setup(t);
  const child = new env.FakeElement();
  env.reveals[0].children.push(child);
  for (const target of env.reveals) env.observers[0].deliver(target, true);
  env.document.dispatch('focusin', { target: {} });
  env.document.dispatch('focusin', { target: env.link });
  assert.equal(env.animations[0].animation.cancel.mock.callCount(), 0);
  env.document.dispatch('focusin', { target: child });
  assert.equal(env.animations[0].animation.cancel.mock.callCount(), 1);
  assert.equal(env.animations[1].animation.cancel.mock.callCount(), 0);
  env.document.dispatch('focusin', { target: child });
  assert.equal(env.animations[0].animation.cancel.mock.callCount(), 1);
});

test('focus inside a waiting offscreen animation exposes and unobserves it without playing', async t => {
  const env = setup(t);
  const observer = env.observers[0];
  const child = new env.FakeElement();
  env.reveals[0].children.push(child);
  const animation = env.animations[0].animation;
  assert.equal(animation.playState, 'paused');
  env.document.dispatch('focusin', { target: child });
  await Promise.resolve();
  assert.equal(animation.cancel.mock.callCount(), 1);
  assert.equal(animation.effectActive, false);
  assert.equal(animation.play.mock.callCount(), 0);
  assert.equal(observer.observed.has(env.reveals[0]), false);
  assert.equal(observer.observed.has(env.reveals[1]), true);
  observer.deliver(env.reveals[0], true);
  env.document.dispatch('focusin', { target: child });
  assert.equal(animation.cancel.mock.callCount(), 1);
  assert.equal(animation.play.mock.callCount(), 0);
  env.preference.dispatch('change');
  assert.equal(env.observers[1].observe.mock.callCount(), 0);
  assert.equal(env.animations.length, 2);
});

test('finishing cancels the fill effect, removes tracking, and never resets visible content to hidden', async t => {
  const env = setup(t, { revealTops: [1400] });
  const observer = env.observers[0];
  const animation = env.animations[0].animation;
  observer.deliver(env.reveals[0], true);
  animation.finish();
  await Promise.resolve();
  assert.equal(animation.cancel.mock.callCount(), 1);
  assert.equal(animation.effectActive, false);
  assert.equal(observer.observed.size, 0);
  env.document.dispatch('focusin', { target: env.reveals[0] });
  env.preference.dispatch('change');
  assert.equal(animation.cancel.mock.callCount(), 1, 'finished animation is no longer tracked');
  assert.equal(env.observers[1].observe.mock.callCount(), 0);
  assert.equal(env.animations.length, 1, 'visible content must not receive a new hidden first frame');
  env.cleanup();
  assert.equal(animation.cancel.mock.callCount(), 1);
});

test('cleanup cancels all pending and running animations and removes interaction listeners', async t => {
  const env = setup(t);
  env.observers[0].deliver(env.reveals[0], true);
  env.window.dispatch('scroll');
  assert.equal(env.frames.size, 1);
  env.cleanup();
  await Promise.resolve();
  assert.equal(env.frames.size, 0);
  assert.equal(env.observers[0].observed.size, 0);
  for (const { animation } of env.animations) {
    assert.equal(animation.cancel.mock.callCount(), 1);
    assert.equal(animation.effectActive, false);
    animation.finish();
  }
  await Promise.resolve();
  env.preference.dispatch('change');
  env.document.dispatch('focusin', { target: env.reveals[0] });
  env.window.dispatch('scroll');
  env.window.dispatch('resize');
  env.window.dispatch('pageshow');
  env.link.dispatch('blur');
  assert.equal(env.frames.size, 0);
  assert.equal(env.observers.length, 1);
  assert.equal(env.animations.length, 2);
  for (const { animation } of env.animations) assert.equal(animation.cancel.mock.callCount(), 1);
});

test('an element containing focus cancels its prepared animation instead of playing', t => {
  const env = setup(t);
  env.document.activeElement = env.reveals[0];
  env.observers[0].deliver(env.reveals[0], true);
  assert.equal(env.animations.length, 2);
  assert.equal(env.animations[0].animation.play.mock.callCount(), 0);
  assert.equal(env.animations[0].animation.cancel.mock.callCount(), 1);
  assert.equal(env.animations[0].animation.effectActive, false);
  assert.equal(env.observers[0].unobserve.mock.callCount(), 1);
});

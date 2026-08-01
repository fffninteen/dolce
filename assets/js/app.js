(function () {
'use strict';
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var curtain = document.getElementById('curtain');
if (curtain) {
var root = document.documentElement;
if (reduced) {
curtain.remove();
} else {
var MIN_MS = 1400;
var born = Date.now();
root.classList.add('is-locked');
var lift = function () {
if (curtain.classList.contains('is-up')) return;
curtain.classList.add('is-up');
root.classList.remove('is-locked');
setTimeout(function () { curtain.remove(); }, 1000);
};
window.addEventListener('load', function () {
setTimeout(lift, Math.max(0, MIN_MS - (Date.now() - born)));
});
setTimeout(lift, 3600);
['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (ev) {
window.addEventListener(ev, lift, { once: true, passive: true });
});
}
}
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);
window.addEventListener('load', function () { window.scrollTo(0, 0); });
var head = document.querySelector('.head');
var hero = document.querySelector('.hero');
var zones = [].slice.call(document.querySelectorAll('[data-head]'));
if (head) {
var solidAt = function () {
return hero ? Math.max(120, hero.offsetHeight - head.offsetHeight - 40) : 120;
};
var threshold = solidAt();
var ticking = false;
var sync = function () {
var y = window.scrollY;
head.classList.toggle('is-solid', y > threshold);
var line = y + head.offsetHeight * 0.6;
for (var k = zones.length - 1; k >= 0; k--) {
if (zones[k].offsetTop <= line) {
head.style.setProperty('--head-bg', zones[k].dataset.head);
break;
}
}
ticking = false;
};
window.addEventListener('scroll', function () {
if (!ticking) { ticking = true; requestAnimationFrame(sync); }
}, { passive: true });
window.addEventListener('resize', function () { threshold = solidAt(); sync(); });
sync();
}
var nodes = document.querySelectorAll('[data-anim]');
if (reduced) {
for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('is-in');
} else {
var io = new IntersectionObserver(function (entries, obs) {
entries.forEach(function (e) {
if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
});
}, { rootMargin: '0px 0px -6% 0px' });
for (var j = 0; j < nodes.length; j++) io.observe(nodes[j]);
}
var burger = document.querySelector('.burger');
var nav = document.getElementById('nav');
if (burger && nav) {
burger.addEventListener('click', function () {
var open = burger.getAttribute('aria-expanded') === 'true';
burger.setAttribute('aria-expanded', String(!open));
nav.classList.toggle('is-open', !open);
});
nav.addEventListener('click', function (e) {
if (e.target.tagName === 'A') {
burger.setAttribute('aria-expanded', 'false');
nav.classList.remove('is-open');
}
});
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && nav.classList.contains('is-open')) {
burger.setAttribute('aria-expanded', 'false');
nav.classList.remove('is-open');
burger.focus();
}
});
}
var revTrack = document.querySelector('.rev-track');
if (revTrack) {
var revIndex = 0;
var revStep = function () {
var card = revTrack.firstElementChild;
if (!card) return revTrack.clientWidth;
var gap = parseFloat(getComputedStyle(revTrack).columnGap) || 0;
return card.getBoundingClientRect().width + gap;
};
var revLast = function () {
return Math.max(0, revTrack.children.length -
Math.max(1, Math.round(revTrack.clientWidth / revStep())));
};
[].slice.call(document.querySelectorAll('.rev-arrow')).forEach(function (btn) {
btn.addEventListener('click', function () {
var last = revLast();
revIndex += +btn.dataset.dir;
if (revIndex > last) revIndex = 0;
else if (revIndex < 0) revIndex = last;
revTrack.scrollTo({ left: revIndex * revStep(), behavior: reduced ? 'auto' : 'smooth' });
});
});
var revSync;
revTrack.addEventListener('scroll', function () {
clearTimeout(revSync);
revSync = setTimeout(function () {
revIndex = Math.min(revLast(), Math.round(revTrack.scrollLeft / revStep()));
}, 120);
}, { passive: true });
}
var chips = [].slice.call(document.querySelectorAll('.tag[data-target]'));
var track = document.querySelector('.chips-track');
var chipsBar = document.querySelector('.chips');
function showPanel(id, focusChip) {
chips.forEach(function (c) {
var on = c.dataset.target === id;
c.classList.toggle('is-active', on);
c.setAttribute('aria-selected', String(on));
c.tabIndex = on ? 0 : -1;
var panel = document.getElementById(c.dataset.target);
if (panel) panel.hidden = !on;
if (!on) return;
if (focusChip) c.focus();
if (track && track.scrollWidth > track.clientWidth) {
track.scrollTo({
left: c.offsetLeft - track.clientWidth / 2 + c.offsetWidth / 2,
behavior: reduced ? 'auto' : 'smooth'
});
}
});
var panels = document.querySelector('.panels');
if (!panels) return;
var line = (head ? head.offsetHeight : 0) + (chipsBar ? chipsBar.offsetHeight : 0);
if (panels.getBoundingClientRect().top < line) {
window.scrollTo({
top: panels.getBoundingClientRect().top + window.scrollY - line - 8,
behavior: reduced ? 'auto' : 'smooth'
});
}
}
chips.forEach(function (chip, i) {
chip.addEventListener('click', function () { showPanel(chip.dataset.target, false); });
chip.addEventListener('keydown', function (e) {
var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
var to = step ? (i + step + chips.length) % chips.length
: e.key === 'Home' ? 0
: e.key === 'End' ? chips.length - 1 : -1;
if (to < 0) return;
e.preventDefault();
showPanel(chips[to].dataset.target, true);
});
});
document.addEventListener('click', function (e) {
var a = e.target.closest && e.target.closest('a[href^="#"]');
if (!a) return;
var id = a.getAttribute('href');
if (id.length < 2) return;
var target = document.querySelector(id);
if (!target) return;
e.preventDefault();
var pad = target.hasAttribute('data-flush') ? 0 : (head ? head.offsetHeight : 0) + 8;
window.scrollTo({
top: target.getBoundingClientRect().top + window.scrollY - pad,
behavior: reduced ? 'auto' : 'smooth'
});
});
})();
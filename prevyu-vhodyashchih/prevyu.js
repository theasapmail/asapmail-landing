// prevyu-vhodyashchih/prevyu.js — превью строки письма в списке входящих.
// Обрезка в превью настоящая: контейнеры фиксированной ширины и text-overflow,
// то есть тема и прехедер обрезаются там же, где их обрежет клиент с таким же
// шрифтом и шириной, а не по «примерно N символов».
(function () {
  'use strict';
  if (typeof document === 'undefined' || !document.querySelector('[data-inbox]')) return;

  var $ = function (sel) { return document.querySelector(sel); };
  var all = function (sel) { return document.querySelectorAll(sel); };

  function setAll(sel, text) {
    all(sel).forEach(function (el) { el.textContent = text; });
  }

  function hint(el, text, tone) {
    el.textContent = text;
    el.className = 'inb__hint inb__hint--' + tone;
  }

  function update() {
    var from = $('#p-from').value.trim() || 'Отправитель';
    var subj = $('#p-subj').value.trim() || '(без темы)';
    var pre = $('#p-pre').value.trim();
    var snip = pre || 'Открыть в браузере. Отписаться от рассылки.';

    setAll('[data-from]', from);
    setAll('[data-subj]', subj);
    setAll('[data-snip]', snip);
    setAll('[data-ava]', from[0].toUpperCase());

    var sl = subj.length;
    var st = sl <= 33 ? 'ok' : sl <= 70 ? 'warn' : 'bad';
    var sm = sl + ' симв. — ';
    if (sl <= 33) sm += 'влезет целиком и на телефоне, и на десктопе';
    else if (sl <= 70) sm += 'на телефоне может не влезть (там видно ~33 символа) — сверьтесь с превью';
    else sm += 'длинно: телефон показывает ~33 символа, десктоп ~70 — хвост не увидит никто';
    hint($('[data-subj-hint]'), sm, st);

    var pl = pre.length;
    if (!pl) {
      hint($('[data-pre-hint]'), 'прехедер пуст — клиент подставит первый текст письма, часто это «Открыть в браузере»', 'bad');
    } else if (pl < 40) {
      hint($('[data-pre-hint]'), pl + ' симв. — коротко: хвост строки добьётся текстом из тела письма', 'warn');
    } else if (pl <= 110) {
      hint($('[data-pre-hint]'), pl + ' симв. — хорошо, главное держите в первых 40', 'ok');
    } else {
      hint($('[data-pre-hint]'), pl + ' симв. — длинновато, дальше ~110 не покажет никто', 'warn');
    }
  }

  ['p-from', 'p-subj', 'p-pre'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', update);
  });
  update();
})();

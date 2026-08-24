// szhatie-css/minify.js — сжатие CSS целиком в браузере, без сервера.
// Строки, url(...) и calc(...) не трогаются: внутри них пробелы и единицы значимы.
(function () {
  'use strict';

  function minifyCss(input) {
    var saved = [];
    function keep(chunk) {
      saved.push(chunk);
      return '\u0000' + (saved.length - 1) + '\u0000';
    }
    var out = String(input).replace(/\r\n?/g, '\n');
    // 1. Неприкасаемое — в сторону.
    out = out.replace(/"(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*'/g, keep);
    out = out.replace(/url\(\s*[^)]*\)/gi, keep);
    out = out.replace(/calc\((?:[^()]|\([^()]*\))*\)/gi, keep);
    // 2. Комментарии — долой.
    out = out.replace(/\/\*[\s\S]*?\*\//g, '');
    // 3. Пробелы: последовательности — в один, вокруг знаков препинания — долой.
    // Пробел перед `:` не трогаем: `a :hover` и `a:hover` — разные селекторы.
    out = out
      .replace(/\s+/g, ' ')
      .replace(/ ?([{};,>~]) ?/g, '$1')
      .replace(/: /g, ':')
      .replace(/\( /g, '(')
      .replace(/ \)/g, ')');
    // 4. Точки с запятой перед закрывающей скобкой и задвоенные — лишние.
    out = out.replace(/;+}/g, '}').replace(/;;+/g, ';');
    // 5. Нулевые длины: `margin:0px` → `margin:0`. `%` не трогаем — `0%` значим
    // в keyframes и flex-basis.
    out = out.replace(/([:, ])0(?:px|em|rem|ex|ch|vw|vh|vmin|vmax|pt|pc|cm|mm|in|q)(?=[ ;}),]|$)/gi, '$10');
    // 6. Цвета: `#ffffff` → `#fff`, когда все три пары совпадают.
    out = out.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(?![0-9a-f])/gi, '#$1$2$3');
    // 7. Вернуть отложенное на место. Циклом: внутри url(...) могла прятаться
    // строка — плейсхолдеры бывают вложенными.
    while (/\u0000\d+\u0000/.test(out)) {
      out = out.replace(/\u0000(\d+)\u0000/g, function (_, i) {
        return saved[+i];
      });
    }
    return out.trim();
  }

  window.emailVerstkaMinifyCss = minifyCss;
})();

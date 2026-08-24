// szhatie-html/minify.js — сжатие HTML целиком в браузере, без сервера.
// Бережный к письмам вариант: условные комментарии Outlook и содержимое
// <pre>/<textarea>/<script>/<style> не трогаются, пробел между инлайн-тегами
// (`</a> <a>`) сохраняется — склеить его значит потерять пробел между словами.
(function () {
  'use strict';

  // Теги, вокруг которых пробельный узел не рендерится: текст не может лежать
  // прямо в <table>/<tr>, а вокруг метаданных head пробелы не значат ничего.
  var STRUCTURAL = 'html|head|body|table|thead|tbody|tfoot|tr|td|th|col|colgroup|meta|link|title|base|br|hr';
  // Блочные контейнеры текста: пробелы сразу после открытия, перед закрытием
  // и между соседними блоками схлопываются без последствий для рендера.
  var BLOCK = 'td|th|div|p|h1|h2|h3|h4|h5|h6|li|ul|ol|blockquote|center|section|header|footer|nav|article|figure';

  function minifyHtml(input) {
    var saved = [];
    function keep(chunk) {
      saved.push(chunk);
      return '\u0000' + (saved.length - 1) + '\u0000';
    }
    var out = String(input).replace(/\r\n?/g, '\n');
    // 1. Неприкасаемое — в сторону: условные комментарии Outlook — рабочая
    // разметка, а в pre/textarea/script/style пробелы значимы.
    out = out.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, keep);
    out = out.replace(/<(pre|textarea|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, keep);
    // 2. Остальные комментарии — долой.
    out = out.replace(/<!--[\s\S]*?-->/g, '');
    // 3. Пробельные последовательности — в один пробел.
    out = out.replace(/\s+/g, ' ');
    // 4. Пробелы вокруг структурных тегов: `</tr> <tr>` → `</tr><tr>`.
    out = out
      .replace(new RegExp('\\s+(</?(?:' + STRUCTURAL + ')\\b)', 'gi'), '$1')
      .replace(new RegExp('(</?(?:' + STRUCTURAL + ')\\b[^>]*>)\\s+', 'gi'), '$1');
    // 5. Края блочного контейнера и стык двух блоков: `<td> текст` → `<td>текст`.
    out = out
      .replace(new RegExp('(<(?:' + BLOCK + ')\\b[^>]*>)\\s+', 'gi'), '$1')
      .replace(new RegExp('\\s+(</(?:' + BLOCK + ')\\s*>)', 'gi'), '$1')
      .replace(new RegExp('(</(?:' + BLOCK + ')\\s*>) (?=<(?:' + BLOCK + ')\\b)', 'gi'), '$1');
    // 6. Вернуть отложенное на место.
    out = out.replace(/\u0000(\d+)\u0000/g, function (_, i) {
      return saved[+i];
    });
    return out.trim();
  }

  window.emailVerstkaMinifyHtml = minifyHtml;
})();

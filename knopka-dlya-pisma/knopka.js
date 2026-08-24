// knopka-dlya-pisma/knopka.js — генератор bulletproof-кнопки для email.
// Паттерн из docs/email-kb/patterns/knopka.md: фон и типографика на ячейке,
// отступы и display:block на ссылке (кликается вся плашка), mso-padding-alt
// дублирует отступы для Outlook, white-space:nowrap запрещает перенос.
(function () {
  'use strict';

  function escText(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  function escAttr(s) {
    return escText(s).replace(/"/g, '&quot;');
  }

  // #abc → #aabbcc; всё невалидное → запасной цвет.
  function normHex(s, fallback) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(s).trim());
    if (!m) return fallback;
    var h = m[1].toLowerCase();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return '#' + h;
  }

  function snippet(o) {
    var bg = normHex(o.bg, '#3b6bff');
    var color = normHex(o.color, '#ffffff');
    var radius = Math.max(0, Math.min(40, o.radius | 0));
    var size = Math.max(11, Math.min(28, o.size | 0));
    var pv = Math.max(6, Math.min(30, o.pv | 0));
    var ph = Math.max(10, Math.min(60, o.ph | 0));
    var pad = pv + 'px ' + ph + 'px';
    var font = { Arial: 'Arial,sans-serif', Verdana: 'Verdana,sans-serif', Tahoma: 'Tahoma,sans-serif', Georgia: 'Georgia,serif' }[o.font] || 'Arial,sans-serif';
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">\n' +
      '  <tr>\n' +
      '    <td align="center" bgcolor="' + bg.toUpperCase() + '"\n' +
      '        style="' + (radius ? 'border-radius:' + radius + 'px;' : '') + 'background-color:' + bg + ';font-family:' + font + ';\n' +
      '               font-size:' + size + 'px;color:' + color + ';line-height:normal;font-weight:bold;\n' +
      '               mso-padding-alt:' + pad + ';white-space:nowrap">\n' +
      '      <a href="' + escAttr(o.url) + '" target="_blank"\n' +
      '         style="color:' + color + ';text-decoration:none;display:block;padding:' + pad + '">' + escText(o.text) + '</a>\n' +
      '    </td>\n' +
      '  </tr>\n' +
      '</table>';
  }

  // Контраст по WCAG: подсветить нечитаемые сочетания фона и текста.
  function contrast(hex1, hex2) {
    function lum(hex) {
      var c = [1, 3, 5].map(function (i) {
        var v = parseInt(hex.slice(i, i + 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    var a = lum(hex1);
    var b = lum(hex2);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  window.emailVerstkaKnopka = { snippet: snippet, normHex: normHex, contrast: contrast };

  if (typeof document === 'undefined' || !document.querySelector('[data-gen]')) return;

  var $ = function (sel) { return document.querySelector(sel); };
  var fields = ['text', 'url', 'bg', 'color', 'radius', 'size', 'pv', 'ph', 'font'];

  function read() {
    var o = {};
    fields.forEach(function (f) { o[f] = $('#f-' + f).value; });
    return o;
  }

  function render() {
    var o = read();
    var code = snippet(o);
    $('[data-code]').value = code;
    $('[data-prev-light]').innerHTML = code;
    $('[data-prev-dark]').innerHTML = code;
    var notes = [];
    var ratio = contrast(normHex(o.bg, '#3b6bff'), normHex(o.color, '#ffffff'));
    if (ratio < 3) notes.push('⚠ контраст текста и фона ' + ratio.toFixed(1) + ':1 — на плашке будет плохо читаться, WCAG требует хотя бы 4.5:1');
    if ((o.radius | 0) > 0) notes.push('в Outlook скругление не сработает — углы будут прямыми, это нормально: макет обязан оставаться приличным и так');
    $('[data-notes]').innerHTML = notes.map(function (n) { return '<li>' + n + '</li>'; }).join('');
  }

  fields.forEach(function (f) { $('#f-' + f).addEventListener('input', render); });
  $('[data-copy]').addEventListener('click', function () {
    var b = this;
    var res = $('[data-code]');
    function done(ok) {
      b.textContent = ok ? 'Скопировано' : 'Не удалось';
      setTimeout(function () { b.textContent = 'Скопировать'; }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(res.value).then(function () { done(true); }, function () { done(false); });
    } else {
      res.select();
      done(document.execCommand('copy'));
    }
  });
  render();
})();

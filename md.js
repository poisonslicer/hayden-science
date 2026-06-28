/* md.js — tiny, dependency-free Markdown → HTML renderer.
 * Supports headings, bold/italic, inline code, links, images, ordered/unordered
 * lists, blockquotes, horizontal rules, fenced code blocks, and paragraphs.
 * Plenty for project write-ups; not a full CommonMark implementation. */
(function () {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function inline(t) {
    return t
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, a, u) => `<img alt="${a}" src="${u}">`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, u) => `<a href="${u}" target="_blank" rel="noopener">${a}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function render(src) {
    src = (src || '').replace(/\r\n?/g, '\n');
    const lines = src.split('\n');
    let html = '', i = 0;
    const isBlock = l => /^(#{1,6})\s|^\s*[-*]\s|^\s*\d+\.\s|^>\s?|^```|^(-{3,}|\*{3,}|_{3,})\s*$/.test(l);

    while (i < lines.length) {
      const line = lines[i];

      if (/^```/.test(line)) {
        let code = ''; i++;
        while (i < lines.length && !/^```/.test(lines[i])) { code += esc(lines[i]) + '\n'; i++; }
        i++; html += `<pre><code>${code}</code></pre>`; continue;
      }
      if (/^\s*$/.test(line)) { i++; continue; }

      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { const lv = h[1].length; html += `<h${lv}>${inline(esc(h[2]))}</h${lv}>`; i++; continue; }

      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { html += '<hr>'; i++; continue; }

      if (/^\s*[-*]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(inline(esc(lines[i].replace(/^\s*[-*]\s+/, '')))); i++; }
        html += '<ul>' + items.map(x => `<li>${x}</li>`).join('') + '</ul>'; continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(inline(esc(lines[i].replace(/^\s*\d+\.\s+/, '')))); i++; }
        html += '<ol>' + items.map(x => `<li>${x}</li>`).join('') + '</ol>'; continue;
      }
      if (/^>\s?/.test(line)) {
        const bq = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { bq.push(inline(esc(lines[i].replace(/^>\s?/, '')))); i++; }
        html += `<blockquote>${bq.join('<br>')}</blockquote>`; continue;
      }

      const para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlock(lines[i])) { para.push(lines[i]); i++; }
      html += `<p>${inline(esc(para.join(' ')))}</p>`;
    }
    return html;
  }

  window.renderMarkdown = render;
})();

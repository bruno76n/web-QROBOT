// NEGATIVE FIXTURE: dangerouslySetInnerHTML / innerHTML / eval must break the lint (docs/13 §6).
export function Bad({ html }: { html: string }) {
  document.body.innerHTML = html;
  eval(html);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

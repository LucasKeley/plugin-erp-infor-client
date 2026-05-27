function normText(str) {
  return str.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function calcularTempo(dataTexto) {
  const [dia, mes, ano] = dataTexto.split('/').map(Number);
  const inicio = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  let anos = hoje.getFullYear() - inicio.getFullYear();
  let meses = hoje.getMonth() - inicio.getMonth();
  if (meses < 0) { anos--; meses += 12; }
  return { anos, meses };
}

function buscarCampo(labelTexto) {
  const TARGET = normText(labelTexto);
  const els = document.querySelectorAll('h6, p, span, label, b, strong, td, th');
  for (const el of els) {
    if (el.children.length > 0) continue;
    if (normText(el.textContent) !== TARGET) continue;
    let valorEl = el.nextElementSibling;
    if (!valorEl) {
      const pai = el.parentElement;
      if (pai) {
        const irmaos = Array.from(pai.children);
        valorEl = irmaos[irmaos.indexOf(el) + 1] || null;
      }
    }
    if (valorEl) return valorEl.textContent.trim();
  }
  return null;
}

function buscarNumeroContrato() {
  const els = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div');
  for (const el of els) {
    const text = el.textContent.trim();
    if (!normText(text).includes('contrato')) continue;
    const match = text.match(/#(\d+)/);
    if (match) return match[1];
  }
  return null;
}

function processarPagina() {
  const dataVigencia = buscarCampo('Vigência inicial:');
  if (!dataVigencia || !/^\d{2}\/\d{2}\/\d{4}$/.test(dataVigencia)) return;

  const TARGET = normText('Vigência inicial:');
  for (const el of document.querySelectorAll('h6, p, span, label, b, strong, td, th')) {
    if (el.children.length > 0) continue;
    if (normText(el.textContent) !== TARGET) continue;

    let valorEl = el.nextElementSibling;
    if (!valorEl) {
      const pai = el.parentElement;
      if (pai) {
        const irmaos = Array.from(pai.children);
        valorEl = irmaos[irmaos.indexOf(el) + 1] || null;
      }
    }
    if (!valorEl) continue;
    if (valorEl.nextElementSibling && valorEl.nextElementSibling.classList.contains('contrato-badge')) continue;

    const { anos, meses } = calcularTempo(dataVigencia);
    const contrato = buscarNumeroContrato();

    const badge = document.createElement('div');
    badge.className = 'contrato-badge';
    badge.style.cssText = 'margin-top:4px;padding:3px 10px;background:#1a5276;color:#fff;border-radius:12px;font-size:12px;font-weight:500;display:inline-block;white-space:nowrap;letter-spacing:0.3px;';
    const prefixo = contrato ? `Contrato ${contrato} — ` : '';
    badge.textContent = `${prefixo}Tempo desde a ativação: ${anos} ano${anos !== 1 ? 's' : ''} / ${meses} ${meses !== 1 ? 'meses' : 'mês'}`;
    valorEl.insertAdjacentElement('afterend', badge);
    break;
  }
}

processarPagina();

const observer = new MutationObserver(() => processarPagina());
observer.observe(document.body, { childList: true, subtree: true });

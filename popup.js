document.getElementById('btn').addEventListener('click', async () => {
  const divResultado = document.getElementById('resultado');
  const divErro = document.getElementById('erro');
  divResultado.style.display = 'none';
  divErro.style.display = 'none';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let frames;
  try {
    frames = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: buscarDados
    });
  } catch (e) {
    divErro.style.display = 'block';
    divErro.textContent = 'Erro ao acessar a página: ' + e.message;
    return;
  }

  const encontrado = frames.map(f => f.result).find(r => r !== null);

  if (!encontrado) {
    divErro.style.display = 'block';
    divErro.textContent = 'Dados não encontrados. Abra o modal do contrato e tente novamente.';
    return;
  }

  setRow('box-numero', 'res-numero', encontrado.contrato);
  setRow('box-tipo',   'res-tipo',   encontrado.tipo);
  document.getElementById('res-data').textContent  = encontrado.data;
  document.getElementById('res-tempo').textContent =
    `${encontrado.anos} ano${encontrado.anos !== 1 ? 's' : ''} / ${encontrado.meses} ${encontrado.meses !== 1 ? 'meses' : 'mês'}`;
  divResultado.style.display = 'flex';
});

function setRow(boxId, valId, valor) {
  const box = document.getElementById(boxId);
  if (valor) {
    document.getElementById(valId).textContent = valor;
    box.style.display = 'flex';
  } else {
    box.style.display = 'none';
  }
}

// Injetada em cada frame — deve ser auto-contida
function buscarDados() {
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

  // Busca genérica: label → valor no próximo irmão
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

  function injetarBadge(valorEl, dataTexto, contrato) {
    if (valorEl.nextElementSibling && valorEl.nextElementSibling.classList.contains('contrato-badge')) return;
    const { anos, meses } = calcularTempo(dataTexto);
    const badge = document.createElement('div');
    badge.className = 'contrato-badge';
    badge.style.cssText = 'margin-top:4px;padding:3px 10px;background:#1a5276;color:#fff;border-radius:12px;font-size:12px;font-weight:500;display:inline-block;white-space:nowrap;';
    const prefixo = contrato ? `Contrato ${contrato} — ` : '';
    badge.textContent = `${prefixo}Tempo desde a ativação: ${anos} ano${anos !== 1 ? 's' : ''} / ${meses} ${meses !== 1 ? 'meses' : 'mês'}`;
    valorEl.insertAdjacentElement('afterend', badge);
  }

  // Precisa encontrar vigência para confirmar que estamos no frame certo
  const dataVigencia = buscarCampo('Vigência inicial:');
  if (!dataVigencia || !/^\d{2}\/\d{2}\/\d{4}$/.test(dataVigencia)) return null;

  const contrato = buscarNumeroContrato();
  const tipo     = buscarCampo('Tipo:');

  // Injeta badge na vigência
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
    if (valorEl) { injetarBadge(valorEl, dataVigencia, contrato); break; }
  }

  return { data: dataVigencia, contrato, tipo, ...calcularTempo(dataVigencia) };
}

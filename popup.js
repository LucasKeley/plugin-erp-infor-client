let dadosColetados = null;

document.getElementById('btn').addEventListener('click', async () => {
  const divResultado = document.getElementById('resultado');
  const divErro = document.getElementById('erro');
  const divTipoCampo = document.getElementById('tipo-campo');
  const divChecklist = document.getElementById('checklist-area');

  divResultado.style.display = 'none';
  divErro.style.display = 'none';
  divTipoCampo.style.display = 'none';
  divChecklist.style.display = 'none';
  dadosColetados = null;

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

  const results = frames.map(f => f.result).filter(r => r !== null);
  const primary = results.find(r => r.isPrimary);

  if (!primary) {
    divErro.style.display = 'block';
    divErro.textContent = 'Dados não encontrados. Abra o modal do contrato e tente novamente.';
    return;
  }

  // Merge fields from secondary frames (other iframes may have address, PPPoE, etc.)
  const merged = { ...primary };
  for (const r of results) {
    if (r.isPrimary) continue;
    if (!merged.pppoe         && r.pppoe)         merged.pppoe         = r.pppoe;
    if (!merged.plano         && r.plano)         merged.plano         = r.plano;
    if (!merged.splitter      && r.splitter)      merged.splitter      = r.splitter;
    if (!merged.portaSplitter && r.portaSplitter) merged.portaSplitter = r.portaSplitter;
    if (!merged.contrato      && r.contrato)      merged.contrato      = r.contrato;
    if (!merged.tipo          && r.tipo)          merged.tipo          = r.tipo;
  }
  dadosColetados = merged;

  setRow('box-numero', 'res-numero', merged.contrato);
  setRow('box-tipo',   'res-tipo',   merged.tipo);
  document.getElementById('res-data').textContent  = merged.data;
  document.getElementById('res-tempo').textContent =
    `${merged.anos} ano${merged.anos !== 1 ? 's' : ''} / ${merged.meses} ${merged.meses !== 1 ? 'meses' : 'mês'}`;
  divResultado.style.display = 'flex';
  divTipoCampo.style.display = 'flex';
});

document.getElementById('btn-moto').addEventListener('click', () => gerarChecklist('moto'));
document.getElementById('btn-carro').addEventListener('click', () => gerarChecklist('carro'));

document.getElementById('btn-copiar').addEventListener('click', () => {
  const ta = document.getElementById('checklist-texto');
  ta.select();
  ta.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(ta.value).then(() => {
    const btn = document.getElementById('btn-copiar');
    btn.textContent = 'Copiado!';
    setTimeout(() => { btn.textContent = 'Copiar texto'; }, 2000);
  });
});

function gerarChecklist(tipo) {
  if (!dadosColetados) return;
  const d = dadosColetados;

  const anos           = d.anos;
  const meses          = d.meses;
  const contrato       = d.contrato       || '';
  const pppoe          = d.pppoe          || '';
  const plano          = d.plano          || '___';
  const splitter       = d.splitter       || '';
  const portaSplitter  = d.portaSplitter  || '';

  const tipoCliente = (d.tipo || '').toLowerCase();
  const ehResidencial = tipoCliente.includes('resid');
  const ehEmpresarial = tipoCliente.includes('empres');

  const planoLinha = ehResidencial
    ? `Plano do cliente: ${plano} MB | (X) Residencial ( ) Empresarial`
    : ehEmpresarial
    ? `Plano do cliente: ${plano} MB | ( ) Residencial (X) Empresarial`
    : `Plano do cliente: ${plano} MB | ( ) Residencial ( ) Empresarial`;

  let texto;

  if (tipo === 'moto') {
    texto =
`— CHECKLIST ENCAMINHAMENTO PARA CAMPO MOTO —

Tempo de contrato (desde a ativação): ${anos} anos / ${meses} meses
${planoLinha}

Tratativa realizada com o Sr. (a):
Contato:
Via: WhatsApp ( ) Ligação ( )

Problema relatado pelo cliente:
Verificações realizadas remotamente:
Verificações para realizar in loco:

dBm Cliente:
dBm CTO:
Contrato: ${contrato}
Usuário PPPoE: ${pppoe}

Extrato de autenticação: Normal ( ) Com quedas ( )
Roteador em comodato: Sim( ) | Não ( )
Modelo do roteador em comodato:
Redirecionamento de portas: Sim ( ) | Não ( )
Quantidade de equipamentos conectados à rede no momento da verificação:
Precisa de escada para acessar equipamentos? Sim ( ) Não ( )

Endereço:
Ponto de Referência:

Coordenadas do cliente:

Visita agendada para _/_/_ Manhã ( ) Tarde ( )
Disponível para encaixe: Sim ( ) | Não ( )
Cliente possui restrição de horário? ( )Sim | ( )Não | Qual?:`;
  } else {
    texto =
`— CHECKLIST ENCAMINHAMENTO PARA CAMPO CARRO —

Tempo de contrato (desde a ativação): ${anos} anos / ${meses} meses
${planoLinha}

Tratativa realizada com o Sr. (a):
Contato:
Via: WhatsApp ( ) Ligação ( )

Gpon Apagada ( ) | Verificar cabo drop ( ) | Mudança Interna ( ) | Auditoria dBm ( ) | Colar equipamento/Parafusar ( )

Problema relatado pelo cliente:

Verificações realizadas remotamente:

Verificações para realizar in loco:

Foi realizada alguma negociação com o cliente: ( )Sim | ( )Não | Qual:

dBm Cliente:
dBm CTO:
dBm de retorno OLT - RX:

Contrato: ${contrato}
Usuário PPPoE: ${pppoe}

Endereço:
Ponto de Referência:

Coordenadas do Cliente:
Coordenadas da CTO:
Cliente ativo na CTO: ${splitter}
Porta: ${portaSplitter}
Splitter confirmado: Sim ( ) | Não ( )

Visita agendada para __/__/__ Manhã ( ) Tarde ( )
Disponível para encaixe: Sim ( ) | Não ( )
Cliente possui restrição de horário? ( )Sim | ( )Não | Qual?`;
  }

  document.getElementById('checklist-texto').value = texto;
  document.getElementById('checklist-area').style.display = 'flex';
  document.getElementById('btn-copiar').textContent = 'Copiar texto';
}

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

  // Collect all fields regardless of frame — extract plano from "Descrição Etiqueta:"
  const contrato = buscarNumeroContrato();
  const tipo     = buscarCampo('Tipo:');

  const descEtiqueta = buscarCampo('Descrição Etiqueta:') || buscarCampo('Plano:') || buscarCampo('Velocidade:') || buscarCampo('Banda:') || null;
  let plano = null;
  if (descEtiqueta) {
    const matchMB = descEtiqueta.match(/(\d+)\s*MB/i);
    plano = matchMB ? matchMB[1] : descEtiqueta;
  }

  const pppoe         = buscarCampo('Usuário PPPoE:') || buscarCampo('Login PPPoE:') || buscarCampo('PPPoE:') || buscarCampo('Usuário:') || null;
  const splitter      = buscarCampo('Splitter:') || null;
  const portaSplitter = buscarCampo('Porta Splitter:') || null;

  const dataVigencia = buscarCampo('Vigência inicial:');

  // Primary frame: has the contract date
  if (dataVigencia && /^\d{2}\/\d{2}\/\d{4}$/.test(dataVigencia)) {
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
    return {
      isPrimary: true,
      data: dataVigencia, contrato, tipo, plano, pppoe, splitter, portaSplitter,
      ...calcularTempo(dataVigencia)
    };
  }

  // Secondary frame: no contract date, but may have address/PPPoE/plan
  if (pppoe || endereco || plano || splitter || portaSplitter || contrato || tipo) {
    return { isPrimary: false, contrato, tipo, plano, pppoe, splitter, portaSplitter };
  }

  return null;
}

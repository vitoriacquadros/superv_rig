// script.js
const firebaseConfig = {
  apiKey: "AIzaSyBNLGsUrMFLSA9NmqkKPlouWeO7ttvM6Fc",
  authDomain: "armazensrig.firebaseapp.com",
  databaseURL: "https://armazensrig-default-rtdb.firebaseio.com",
  projectId: "armazensrig",
  storageBucket: "armazensrig.appspot.com",
  messagingSenderId: "561768076694",
  appId: "1:561768076694:web:3f9cba366f19eed543f9b7"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const overlay = document.getElementById('overlay');
const formulario = document.getElementById('formulario');
const tituloPortao = document.getElementById('tituloPortao');
const idPortaoInput = document.getElementById('idPortao');
const statusSelect = document.getElementById('status');
const observacoesInput = document.getElementById('observacoes');
const ordemSAPInput = document.getElementById('ordemSAP');
const historicoLista = document.getElementById('historicoLista');
const container = document.querySelector('.planta-container');

const botoes = [
  { id: 'P03', pos: ['15%', '14%'], data: 'RIG1-0260-ARMF-PA03' },
  { id: 'P04', pos: ['10%', '20%'], data: 'RIG1-0260-ARMF-PA04' },
  { id: 'P02', pos: ['50%', '14%'], data: 'RIG1-0260-ARMF-PA02' },
  { id: 'P01', pos: ['50%', '22%'], data: 'RIG1-0260-ARMF-PA01' },
  { id: 'P01', pos: ['50%', '30%'], data: 'RIG1-0260-ARME-PA01' },
  { id: 'P01', pos: ['50%', '38%'], data: 'RIG1-0260-ARMD-PA01' },
  { id: 'P02', pos: ['12%', '36%'], data: 'RIG1-0260-ARMD-PA02' },
  { id: 'P02', pos: ['16%', '27%'], data: 'RIG1-0260-ARME-PA02' },
  { id: 'P02', pos: ['30%', '60%'], data: 'RIG1-0260-ARMB-PA02' },
  { id: 'P02', pos: ['30%', '53%'], data: 'RIG1-0260-ARMC-PA02' },
  { id: 'P01', pos: ['60%', '60%'], data: 'RIG1-0260-ARMB-PA01' },
  { id: 'P01', pos: ['60%', '53%'], data: 'RIG1-0260-ARMC-PA01' },
  { id: 'P06', pos: ['60%', '69%'], data: 'RIG1-0260-ARMA-PA06' },
  { id: 'P05', pos: ['40%', '75%'], data: 'RIG1-0260-ARMA-PA05' },
  { id: 'P04', pos: ['20%', '75%'], data: 'RIG1-0260-ARMA-PA04' },
  { id: 'P02', pos: ['20%', '70%'], data: 'RIG1-0260-ARMA-PA02' },
  { id: 'P03', pos: ['37%', '64%'], data: 'RIG1-0260-ARMA-PA03' },
  { id: 'Portão CR120', pos: ['55%', '75%'], data: 'RIG1-CR120' },
  { id: 'P01', pos: ['65%', '65%'], data: 'RIG1-0260-ARMA-PA01 CR150' }
];

botoes.forEach(({ id, pos, data }) => {
  const el = document.createElement('div');
  el.className = 'portao';
  el.id = `portao-${id}-${data}`;
  el.dataset.id = data;
  el.style.top = pos[0];
  el.style.left = pos[1];
  el.innerText = id;
  el.onclick = () => abrirFormulario(data);
  container.appendChild(el);
});

function abrirFormulario(idPortao) {
  idPortaoInput.value = idPortao;
  tituloPortao.textContent = 'Portão: ' + idPortao;
  overlay.style.display = 'block';
  formulario.style.display = 'block';

  db.ref('portoes/' + idPortao).get().then(snapshot => {
    if (snapshot.exists()) {
      const dados = snapshot.val();
      statusSelect.value = dados.status || '';

      // Preenche a última observação e ordem SAP do histórico
      const ultimo = dados.historico?.at(-1);
      observacoesInput.value = ultimo?.observacoes || '';
      ordemSAPInput.value = ultimo?.ordemSAP || '';

      montarHistorico(dados.historico || []);
    } else {
      statusSelect.value = '';
      observacoesInput.value = '';
      ordemSAPInput.value = '';
      montarHistorico([]);
    }
  });
}

function fecharFormulario() {
  overlay.style.display = 'none';
  formulario.style.display = 'none';
  limparHistorico();
}

function montarHistorico(lista) {
  historicoLista.innerHTML = '';
  if (lista.length === 0) {
    historicoLista.innerHTML = '<small>Nenhum histórico registrado.</small>';
    return;
  }
  lista.slice().reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'historico-item';
    div.textContent = `${item.data} - ${item.status} - ${item.observacoes || ''}` + (item.ordemSAP ? ` (SAP: ${item.ordemSAP})` : '');
    historicoLista.appendChild(div);
  });
}

function limparHistorico() {
  historicoLista.innerHTML = '';
}

function salvarStatus(event) {
  event.preventDefault();

  const idPortao = idPortaoInput.value;
  const status = statusSelect.value;
  const observacoes = observacoesInput.value.trim();
  const ordemSAP = ordemSAPInput.value.trim();
  const dataInput = document.getElementById('dataHora').value;

  if (!idPortao || !status) {
    alert('Por favor, selecione um status.');
    return;
  }

  const refPortao = db.ref('portoes/' + idPortao);

  refPortao.get().then(snapshot => {
    let historico = [];
    if (snapshot.exists()) {
      const dadosAtuais = snapshot.val();
      historico = dadosAtuais.historico || [];
    }

    // Usa data selecionada pelo usuário ou atual se estiver vazia
    const dataFormatada = dataInput
      ? new Date(dataInput).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const novoRegistro = {
      status: status,
      observacoes: observacoes,
      ordemSAP: ordemSAP,
      data: dataFormatada
    };

    historico.push(novoRegistro);

    refPortao.set({ status: status, historico: historico }).then(() => {
      console.log('Salvo com sucesso:', novoRegistro);
      atualizarVisualPortao(idPortao, status);
      fecharFormulario();
    }).catch(err => {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar dados. Verifique o console.');
    });
  });
}


function atualizarVisualPortao(idPortao, status) {
  const botoes = document.querySelectorAll('.portao');
  botoes.forEach(botao => {
    if (botao.dataset.id === idPortao) {
      botao.classList.remove('fechar', 'manutencao');
      if (status === 'fechado') {
        botao.classList.add('fechar');
      } else if (status === 'manutencao') {
        botao.classList.add('manutencao');
      }
    }
  });
}

function carregarStatusPortoes() {
  db.ref('portoes').get().then(snapshot => {
    if (snapshot.exists()) {
      const portoes = snapshot.val();
      Object.entries(portoes).forEach(([idPortao, dados]) => {
        atualizarVisualPortao(idPortao, dados.status);
      });
    }
  });
}

window.onload = () => {
  carregarStatusPortoes();
};

function mostrarPopupUltimosDados() {
  const textarea = document.getElementById('popup-conteudo');
  const agora = new Date().toLocaleDateString('pt-BR');
  
  db.ref('portoes').get().then(snapshot => {
    if (!snapshot.exists()) {
      alert('Nenhum dado encontrado.');
      return;
    }
    
    const dados = snapshot.val();
    let texto = `⚠ Portões ${agora}\n\n`;
    const grupos = {};

    Object.entries(dados).forEach(([id, item]) => {
      const armazem = id.split('-')[2].substring(0, 4).toUpperCase();
      if (!grupos[armazem]) grupos[armazem] = [];

      const linha = `${item.status === 'fechado' ? '❌' : '✅'} ${id}`;
      grupos[armazem].push({ linha, obs: item.historico?.at(-1)?.observacoes });
    });

    Object.entries(grupos).forEach(([arma, arr]) => {
      texto += `\n${arma}\n\n`;
      arr.forEach(({ linha, obs }) => {
        texto += `${linha}\n`;
        if (obs) texto += `\n- ${obs}\n`;
      });
    });

    textarea.value = texto.trim();
    document.getElementById('popup-dados').style.display = 'block';
  }).catch(error => {
    console.error('Erro ao buscar dados:', error);
    alert('Erro ao carregar dados. Tente novamente mais tarde.');
  });
}

function copiarPopupDados() {
  const area = document.getElementById('popup-conteudo');
  area.select();
  document.execCommand('copy');
}

function fecharPopupDados() {
  document.getElementById('popup-dados').style.display = 'none';
}

function baixarComoTxt() {
  const texto = document.getElementById('popup-conteudo').value;
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portoes_status.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
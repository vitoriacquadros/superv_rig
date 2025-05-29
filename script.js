// firebaseConfig.js ou no início do seu script.js
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

// Referência aos elementos
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const conteudo = document.getElementById('conteudo');
const authContainer = document.getElementById('firebase-auth-container');

// Escutador de login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-password').value;

  firebase.auth().signInWithEmailAndPassword(email, senha)
    .then((userCredential) => {
      const user = userCredential.user;
      document.getElementById("user-name").textContent = user.displayName || "Usuário";
      document.getElementById("user-email").textContent = user.email;
      authContainer.style.display = 'none';
      conteudo.style.display = 'block';
    })
    .catch((error) => {
      console.error("Erro ao fazer login:", error);
      loginError.textContent = "Email ou senha inválidos.";
    });
}
);


// Mantém usuário logado ao recarregar
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário autenticado:", user.email);
    document.getElementById("user-name").textContent = user.displayName || "Usuário";
    document.getElementById("user-email").textContent = user.email;
    document.getElementById('firebase-auth-container').style.display = 'none';
    document.getElementById('conteudo').style.display = 'block';
  } else {
    console.log("Nenhum usuário logado.");
  }
});



const overlay = document.getElementById('overlay');
const formulario = document.getElementById('formulario');
const tituloPortao = document.getElementById('tituloPortao');
const idPortaoInput = document.getElementById('idPortao');
const statusSelect = document.getElementById('status');
const ordemSAPInput1 = document.getElementById('ordemSAP1');
const statusSAPSelect = document.getElementById('statusSAP');
const observacoesInput = document.getElementById('observacoes');
let indiceHistoricoEditando = null;
const historicoLista = document.getElementById('historicoLista');
const container = document.querySelector('.planta-container');

const botoes = [
  { id: 'P03', pos: ['15%', '14%'], data: 'RIG1-0260-ARMF-PA03 (Portão lado rodovia 01 - Movimentação)' },
  { id: 'P04', pos: ['10%', '20%'], data: 'RIG1-0260-ARMF-PA04 (Portão lado rodovia 02 - Misturas)' },
  { id: 'P02', pos: ['50%', '14%'], data: 'RIG1-0260-ARMF-PA02 (Portão lado píer 02 - Misturas)' },
  { id: 'P01', pos: ['50%', '22%'], data: 'RIG1-0260-ARMF-PA01 (Portão lado píer 01 - Movimentação' },
  { id: 'P01', pos: ['50%', '30%'], data: 'RIG1-0260-ARME-PA01 (Portão lado píer)' },
  { id: 'P01', pos: ['50%', '38%'], data: 'RIG1-0260-ARMD-PA01 (Portão lado píer)' },
  { id: 'P02', pos: ['12%', '36%'], data: 'RIG1-0260-ARMD-PA02 (Portão lado rodovia)' },
  { id: 'P02', pos: ['16%', '27%'], data: 'RIG1-0260-ARME-PA02 (Portão lado rodovia)' },
  { id: 'P02', pos: ['30%', '60%'], data: 'RIG1-0260-ARMB-PA02 (Portão lado rodovia)' },
  { id: 'P02', pos: ['30%', '53%'], data: 'RIG1-0260-ARMC-PA02 (Portão lado rodovia)' },
  { id: 'P01', pos: ['60%', '60%'], data: 'RIG1-0260-ARMB-PA01 (Portão lado píer)' },
  { id: 'P01', pos: ['60%', '53%'], data: 'RIG1-0260-ARMC-PA01 (Portão lado píer)' },
  { id: 'P06', pos: ['60%', '69%'], data: 'RIG1-0260-ARMA-PA06 (Portão lado Píer CR110)' },
  { id: 'P05', pos: ['40%', '75%'], data: 'RIG1-0260-ARMA-PA05 (Portão lado central CR120/Etel)' },
  { id: 'P04', pos: ['20%', '75%'], data: 'RIG1-0260-ARMA-PA04 (Portão lado rodovia CURA)' },
  { id: 'P02', pos: ['20%', '70%'], data: 'RIG1-0260-ARMA-PA02 (Portão lado rodovia CR185)' },
  { id: 'P03', pos: ['37%', '64%'], data: 'RIG1-0260-ARMA-PA03 (Portão lado central CR150)' },
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

  // Limpa os campos sempre que abrir
  statusSelect.value = '';
  observacoesInput.value = '';
  ordemSAPInput.value = '';
  indiceHistoricoEditando = null;

  // Busca dados atuais e mostra o histórico
  db.ref('portoes/' + idPortao).get().then(snapshot => {
    if (snapshot.exists()) {
      const dados = snapshot.val();
      montarHistorico(dados.historico || []);
    } else {
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

  // Inverter para manter mais recente no topo, mas manter índices originais
  const listaReversa = lista.slice().reverse();

  listaReversa.forEach((item, reverseIndex) => {
    const indexOriginal = lista.length - 1 - reverseIndex;

    const div = document.createElement('div');
    div.className = 'historico-item';
    div.textContent = `${item.data} - ${item.status} - ${item.observacoes || ''}` + 
    (item.ordemSAP1 ? ` (${item.ordemSAP1})` : '') + 
    (item.ordemSAP ? ` (SAP: ${item.ordemSAP})` : '');


    div.addEventListener('click', () => {
      statusSelect.value = item.status || '';
      observacoesInput.value = item.observacoes || '';
      ordemSAPInput.value = item.ordemSAP || '';
      indiceHistoricoEditando = indexOriginal; // Guardar índice para editar depois
    });

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

    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const novoRegistro = {
    status: status,
    observacoes: observacoes,
    ordemSAP: ordemSAP,
    ordemSAP1: ordemSAPInput1.value.trim(),
    data: dataFormatada
  };


    if (indiceHistoricoEditando !== null) {
      historico[indiceHistoricoEditando] = novoRegistro;
    } else {
      historico.push(novoRegistro);
    }

    refPortao.set({ status: status, historico: historico }).then(() => {
      atualizarVisualPortao(idPortao, status);
      fecharFormulario();
      indiceHistoricoEditando = null; // 🔁 Limpa o modo de edição
    });

  }).catch(error => {
    console.error('Erro ao salvar dados:', error);
    alert('Erro ao salvar. Tente novamente.');
  });
}


function atualizarVisualPortao(idPortao, status) {
  const botoes = document.querySelectorAll('.portao');
  botoes.forEach(botao => {
    if (botao.dataset.id === idPortao) {
      botao.classList.remove('fechar', 'manutencao');
      if (status === 'Inoperante') {
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
      // Protege contra erro de substring em IDs inválidos
      const partes = id.split('-');
      const armazem = partes.length >= 3 ? partes[2].substring(0, 4).toUpperCase() : 'OUTROS';

      if (!grupos[armazem]) grupos[armazem] = [];

      const status = item.status || 'desconhecido';
      const ultimo = Array.isArray(item.historico) ? item.historico.at(-1) : null;
      const obs = ultimo?.observacoes || '';

      const linha = `${status === 'Inoperante' ? '❌' : '✅'} ${id}`;
      grupos[armazem].push({ linha, obs });
    });

    Object.entries(grupos).forEach(([arma, arr]) => {
      texto += `\n${arma}\n\n`;
      arr.forEach(({ linha, obs }) => {
        texto += `${linha}\n`;
        if (obs) texto += `- ${obs}\n`;
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
  URL.revokeObjectURL(url);}
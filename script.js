// Firebase config
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

// DOM Elements
const overlay = document.getElementById("overlay");
const formulario = document.getElementById("formulario");
const idPortaoInput = document.getElementById("idPortao");
const statusSelect = document.getElementById("status");
const observacoesInput = document.getElementById("observacoes");
const historicoLista = document.getElementById("historicoLista");
const tituloPortao = document.getElementById("tituloPortao");
const toast = document.getElementById("toast");

// Abre formulário
function abrirFormulario(idPortao) {
  idPortaoInput.value = idPortao;
  tituloPortao.textContent = "Portão: " + idPortao;
  overlay.style.display = "block";
  formulario.style.display = "block";

  db.ref("portoes/" + idPortao).get().then((snapshot) => {
    if (snapshot.exists()) {
      const dados = snapshot.val();
      statusSelect.value = dados.status || "";
      observacoesInput.value = "";
      montarHistorico(dados.historico || []);
    } else {
      statusSelect.value = "";
      observacoesInput.value = "";
      montarHistorico([]);
    }
  });
}

function fecharFormulario() {
  overlay.style.display = "none";
  formulario.style.display = "none";
  historicoLista.innerHTML = "";
}

// Toast
function mostrarToast(msg) {
  const div = document.createElement("div");
  div.className = "toast";
  div.textContent = msg;
  toast.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// Histórico
function montarHistorico(lista) {
  historicoLista.innerHTML = "";
  if (lista.length === 0) {
    historicoLista.innerHTML = "<small>Nenhum histórico registrado.</small>";
    return;
  }
  lista
    .slice()
    .reverse()
    .forEach((item) => {
      const div = document.createElement("div");
      div.className = "historico-item";
      div.textContent = `${item.data} - ${item.status} - ${item.observacoes || ""}`;
      historicoLista.appendChild(div);
    });
}

// Salvar status
function salvarStatus(e) {
  e.preventDefault();
  const idPortao = idPortaoInput.value;
  const status = statusSelect.value;
  const observacoes = observacoesInput.value.trim();

  if (!idPortao || !status) {
    alert("Por favor, selecione um status.");
    return;
  }

  const ref = db.ref("portoes/" + idPortao);

  ref.get().then((snapshot) => {
    let historico = [];
    if (snapshot.exists()) {
      historico = snapshot.val().historico || [];
    }

    const data = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    historico.push({ status, observacoes, data });

    ref.set({ status, historico }).then(() => {
      mostrarToast("Status salvo com sucesso.");
      fecharFormulario();
    });
  });
}

// Atualizar visual
function atualizarVisualPortao(idPortao, status) {
  const botoes = document.querySelectorAll(".portao");
  botoes.forEach((btn) => {
    if (btn.dataset.id === idPortao) {
      btn.classList.remove("fechado", "manutencao");

      const icon = btn.querySelector("i");
      if (icon) icon.remove();

      const novoIcone = document.createElement("i");
      novoIcone.classList.add("lucide");

      if (status === "fechado") {
        btn.classList.add("fechado");
        novoIcone.setAttribute("data-lucide", "lock");
      } else if (status === "manutencao") {
        btn.classList.add("manutencao");
        novoIcone.setAttribute("data-lucide", "wrench");
      } else {
        novoIcone.setAttribute("data-lucide", "unlock");
      }

      btn.appendChild(novoIcone);
      lucide.createIcons();
    }
  });
}

// Escuta em tempo real (automação)
function escutarPortoesTempoReal() {
  db.ref("portoes").on("value", (snapshot) => {
    const portoes = snapshot.val();
    if (!portoes) return;
    Object.entries(portoes).forEach(([id, dados]) => {
      atualizarVisualPortao(id, dados.status);
    });
  });
}

window.onload = () => {
  lucide.createIcons();
  escutarPortoesTempoReal();
};

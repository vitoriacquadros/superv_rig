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
document.getElementById("logout-btn")?.addEventListener("click", () => firebase.auth().signOut());

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const conteudo = document.getElementById('conteudo');
const authContainer = document.getElementById('firebase-auth-container');

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
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("user-name").textContent = user.displayName || "Usuário";
    document.getElementById("user-email").textContent = user.email;
    document.getElementById('firebase-auth-container').style.display = 'none';
    document.getElementById('conteudo').style.display = 'block';
  }
});

function downloadXLSX() {
  const texto = document.getElementById("popup-conteudo").value;
  const linhas = texto.split('\n');
  const planilha = [];

  let armazemAtual = "";

  for (const linha of linhas) {
    if (linha.startsWith("✅") || linha.startsWith("❌")) {
      const [status, ...resto] = linha.split(' ');
      const portao = resto.join(' ');
      planilha.push({ Armazem: armazemAtual, Status: status, Portao: portao });
    } else if (linha.startsWith("- ")) {
      if (planilha.length) {
        planilha[planilha.length - 1].Observacao = linha.slice(2);
      }
    } else if (linha.trim() && !linha.startsWith("⚠")) {
      armazemAtual = linha.trim();
    }
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(planilha);
  XLSX.utils.book_append_sheet(wb, ws, "Portoes");

  XLSX.writeFile(wb, "portoes_status.xlsx");}

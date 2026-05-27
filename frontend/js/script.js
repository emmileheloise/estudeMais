// ===== STORAGE =====
function getData() {
    return JSON.parse(localStorage.getItem("estudeMais")) || {
        materias: [],
        tarefas: [],
        tempoHoje: 0,
        perfil: { meta: 0 }
    };
}

function saveData(data) {
    localStorage.setItem("estudeMais", JSON.stringify(data));
}

// ===== MATERIAS =====
function addMateria() {
    const input = document.getElementById("materiaInput");
    if (!input.value) return;

    const data = getData();
''
    data.materias.push({
        id: Date.now(),
        nome: input.value
    });

    saveData(data);
    input.value = "";
    renderMaterias();
}

function renderMaterias() {
    const lista = document.getElementById("listaMaterias");
    if (!lista) return;

    const data = getData();
    lista.innerHTML = "";

    data.materias.forEach(m => {
        lista.innerHTML += `
            <div class="card materia-card">
                <span onclick="verMateria(${m.id})">${m.nome}</span>
                <button onclick="deleteMateria(${m.id})">🗑</button>
            </div>
        `;
    });
}

function deleteMateria(id) {
    let data = getData();
    data.materias = data.materias.filter(m => m.id !== id);
    data.tarefas = data.tarefas.filter(t => t.materiaId !== id);
    saveData(data);
    renderMaterias();
}

function verMateria(id) {
    localStorage.setItem("materiaSelecionada", id);
    window.location.href = "tarefas-materia.html";
}

// ===== TAREFAS =====
function addTarefa() {
    const input = document.getElementById("tarefaInput");
    const select = document.getElementById("materiaSelect");

    if (!input.value || !select.value) return;

    const data = getData();

    data.tarefas.push({
        id: Date.now(),
        materiaId: Number(select.value),
        titulo: input.value,
        concluida: false
    });

    saveData(data);
    input.value = "";
    renderTarefasGeral();
}

function toggleTarefa(id) {
    const data = getData();
    const t = data.tarefas.find(t => t.id === id);
    t.concluida = !t.concluida;

    saveData(data);
    renderTarefasGeral();
    renderHome();
}

function deleteTarefa(id) {
    let data = getData();
    data.tarefas = data.tarefas.filter(t => t.id !== id);
    saveData(data);
    renderTarefasGeral();
}

// ===== TELA GERAL DE TAREFAS =====
function renderTarefasGeral() {
    const lista = document.getElementById("listaTarefas");
    const select = document.getElementById("materiaSelect");

    if (!lista) return;

    const data = getData();
    lista.innerHTML = "";

    if (select) {
        select.innerHTML = `<option value="">Escolha a matéria</option>`;
        data.materias.forEach(m => {
            select.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
        });
    }

    data.tarefas.forEach(t => {
        const materia = data.materias.find(m => m.id === t.materiaId);

        lista.innerHTML += `
            <div class="card tarefa-card">
                <div>
                    <input type="checkbox" ${t.concluida ? "checked" : ""} onclick="toggleTarefa(${t.id})">
                    ${t.titulo}
                    <small>(${materia?.nome || ""})</small>
                </div>
                <button onclick="deleteTarefa(${t.id})">🗑</button>
            </div>
        `;
    });
}

// ===== TAREFAS POR MATÉRIA =====
function renderTarefasMateria() {
    const lista = document.getElementById("listaTarefas");
    const titulo = document.getElementById("tituloMateria");

    if (!lista) return;

    const data = getData();
    const id = Number(localStorage.getItem("materiaSelecionada"));

    const materia = data.materias.find(m => m.id === id);
    if (titulo) titulo.innerText = materia?.nome || "";

    lista.innerHTML = "";

    data.tarefas
        .filter(t => t.materiaId === id)
        .forEach(t => {
            lista.innerHTML += `
                <div class="card tarefa-card">
                    <input type="checkbox" ${t.concluida ? "checked" : ""} onclick="toggleTarefa(${t.id})">
                    ${t.titulo}
                    <button onclick="deleteTarefa(${t.id})">🗑</button>
                </div>
            `;
        });
}

// ===== HOME =====
function renderHome() {
    const lista = document.getElementById("tarefasHoje");
    const progresso = document.getElementById("progresso");
    const tempo = document.getElementById("tempoHoje");

    if (!lista) return;

    const data = getData();

    const naoConcluidas = data.tarefas.filter(t => !t.concluida);

    lista.innerHTML = "";
    naoConcluidas.forEach(t => {
        lista.innerHTML += `<div class="card">${t.titulo}</div>`;
    });

    if (tempo) {
        tempo.innerText = formatTime(data.tempoHoje);
    }

    const meta = Number(data.perfil.meta || 0) * 3600;
    const porcentagem = meta ? (data.tempoHoje / meta) * 100 : 0;

    if (progresso) progresso.style.width = porcentagem + "%";
}

// ===== CRONÔMETRO =====
let seconds = 0;
let interval = null;

function startTimer() {
    if (interval) return;
    interval = setInterval(() => {
        seconds++;
        updateTimer();
    }, 1000);
}

function saveTempo() {
    const data = getData();
    data.tempoHoje += seconds;
    saveData(data);

    seconds = 0;
    clearInterval(interval);
    interval = null;

    updateTimer();
    renderHome();
}

function updateTimer() {
    const el = document.getElementById("timer");
    if (!el) return;
    el.innerText = formatTime(seconds);
}

function formatTime(s) {
    let h = String(Math.floor(s / 3600)).padStart(2, '0');
    let m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    let sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
}

// ===== PERFIL =====
function salvarPerfil() {
    const data = getData();

    data.perfil = {
        nome: document.getElementById("nome").value,
        curso: document.getElementById("curso").value,
        instituicao: document.getElementById("instituicao").value,
        meta: document.getElementById("meta").value
    };

    saveData(data);
}

function carregarPerfil() {
    const data = getData();
    if (!data.perfil) return;

    document.getElementById("nome").value = data.perfil.nome || "";
    document.getElementById("curso").value = data.perfil.curso || "";
    document.getElementById("instituicao").value = data.perfil.instituicao || "";
    document.getElementById("meta").value = data.perfil.meta || "";
}

// ===== MENU =====
function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("active");
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    renderMaterias();
    renderTarefasGeral();
    renderTarefasMateria();
    renderHome();
    carregarPerfil();
    updateTimer();
});

function resetTimer() {
    seconds = 0;
    clearInterval(interval);
    interval = null;
    updateTimer();
}
function resetTempoHoje() {
    const data = getData();
    data.tempoHoje = 0;
    saveData(data);

    renderHome();
}
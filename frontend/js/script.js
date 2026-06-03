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

    const nome =
        document.getElementById("materiaInput").value;

    const meta =
        document.getElementById("metaMateria").value;

    if (!nome) return;

    const data = getData();

    data.materias.push({
        id: Date.now(),
        nome: nome,
        meta: Number(meta) || 0,
        tempoEstudado: 0
    });

    saveData(data);

    document.getElementById("materiaInput").value = "";
    document.getElementById("metaMateria").value = "";

    renderMaterias();
}

function renderMaterias() {

    const lista =
        document.getElementById("listaMaterias");

    if (!lista) return;

    const data = getData();

    lista.innerHTML = "";

    data.materias.forEach(m => {

        m.meta = Number(m.meta) || 0;
        m.tempoEstudado = Number(m.tempoEstudado) || 0;

        const porcentagem =
            m.meta > 0
                ? Math.min(
                    (m.tempoEstudado /
                    (m.meta * 3600)) * 100,
                    100
                )
                : 0;

        lista.innerHTML += `

        <div class="card">

            <div class="materia-card">

                <span onclick="verMateria(${m.id})">
                    ${m.nome}
                </span>

                <button onclick="deleteMateria(${m.id})">
                    🗑
                </button>

            </div>

            <small>
                ${formatTime(m.tempoEstudado)}
                / ${m.meta}h
            </small>

            <div class="progress-bar">

                <div
                    class="progress"
                    style="width:${porcentagem}%">
                </div>

            </div>

        </div>

        `;
    });
}

function carregarMateriasCronometro() {

    const select =
        document.getElementById(
            "cronometroMateria"
        );

    if (!select) return;

    const data = getData();

    select.innerHTML =
        `<option value="">Escolha uma matéria</option>`;

    data.materias.forEach(m => {

        select.innerHTML += `
            <option value="${m.id}">
                ${m.nome}
            </option>
        `;

    });
}

function deleteMateria(id) {

    let data = getData();

    data.materias =
        data.materias.filter(
            m => m.id !== id
        );

    data.tarefas =
        data.tarefas.filter(
            t => t.materiaId !== id
        );

    saveData(data);

    renderMaterias();

    renderProgressoMaterias();
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
    concluida: false,
    status: "pendente"
});

    saveData(data);
    input.value = "";
    renderTarefasGeral();
}

function toggleTarefa(id) {

    const data = getData();

    const t =
        data.tarefas.find(
            t => t.id === id
        );

    t.concluida = !t.concluida;

    t.status =
        t.concluida
            ? "concluida"
            : "pendente";

    saveData(data);

    renderTarefasMateria();

    renderKanban();

    renderHome();
}

function deleteTarefa(id) {
    let data = getData();
    data.tarefas = data.tarefas.filter(t => t.id !== id);
    saveData(data);
    renderTarefasGeral();
}

// ===== TELA GERAL DE TAREFAS =====
function renderKanban() {

    const pendentes =
        document.getElementById("pendentes");

    const andamento =
        document.getElementById("andamento");

    const concluidas =
        document.getElementById("concluidas");

    if (!pendentes) return;

    const data = getData();
    const select =
    document.getElementById(
        "materiaSelect"
    );

if (select) {

    select.innerHTML =
        `<option value="">
            Escolha a matéria
        </option>`;

    data.materias.forEach(m => {

        select.innerHTML += `
            <option value="${m.id}">
                ${m.nome}
            </option>
        `;

    });
}
    pendentes.innerHTML = "";
    andamento.innerHTML = "";
    concluidas.innerHTML = "";

    data.tarefas.forEach(t => {

        const materia =
            data.materias.find(
                m => m.id === t.materiaId
            );

        const card = `
            <div class="card">

                <strong>${t.titulo}</strong>

                <div class="tag-materia">
                ${materia?.nome || ""}
                </div>
                <select
                    onchange="alterarStatus(${t.id}, this.value)">

                    <option value="pendente"
                        ${t.status === "pendente" ? "selected" : ""}>
                        Pendente
                    </option>

                    <option value="andamento"
                        ${t.status === "andamento" ? "selected" : ""}>
                        Em andamento
                    </option>

                    <option value="concluida"
                        ${t.status === "concluida" ? "selected" : ""}>
                        Concluída
                    </option>

                </select>

            </div>
        `;

        if (t.status === "pendente")
            pendentes.innerHTML += card;

        else if (t.status === "andamento")
            andamento.innerHTML += card;

        else
            concluidas.innerHTML += card;
    });
}
function alterarStatus(id, status) {

    const data = getData();

    const tarefa =
        data.tarefas.find(
            t => t.id === id
        );

    if (!tarefa) return;

    tarefa.status = status;

    tarefa.concluida =
        status === "concluida";

    saveData(data);

    renderKanban();
}

// ===== TAREFAS POR MATÉRIA =====
function renderTarefasMateria() {

    const lista =
        document.getElementById(
            "listaTarefas"
        );

    const titulo =
        document.getElementById(
            "tituloMateria"
        );

    if (!lista) return;

    const data = getData();

    const id =
        Number(
            localStorage.getItem(
                "materiaSelecionada"
            )
        );

    const materia =
        data.materias.find(
            m => m.id === id
        );

    if (titulo)
        titulo.innerText =
            materia?.nome || "";

    lista.innerHTML = "";

    data.tarefas
        .filter(
            t => t.materiaId === id
        )
        .forEach(t => {

            lista.innerHTML += `
                <div class="card">

                    <div class="tarefa-card">

                        <div>

                            <input
                                type="checkbox"
                                ${t.concluida ? "checked" : ""}
                                onclick="toggleTarefa(${t.id})">

                            ${t.titulo}

                            <br>

                            <small>
                                Status:
                                ${t.status || "pendente"}
                            </small>

                        </div>

                        <button onclick="deleteTarefa(${t.id})">
                            🗑
                        </button>

                    </div>

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

    data.tempoHoje = Number(data.tempoHoje) || 0;

    const naoConcluidas =
        data.tarefas.filter(t => !t.concluida);

    lista.innerHTML = "";

    naoConcluidas.forEach(t => {

        lista.innerHTML += `
            <div class="card">
                ${t.titulo}
            </div>
        `;

    });

    if (tempo) {
        tempo.innerText =
            formatTime(data.tempoHoje);
    }

    const meta =
        Number(data.perfil?.meta || 0) * 3600;

    const porcentagem =
        meta > 0
            ? Math.min(
                (data.tempoHoje / meta) * 100,
                100
            )
            : 0;

    if (progresso) {
        progresso.style.width =
            porcentagem + "%";
    }
}

// ===== CRONÔMETRO =====
let seconds = 0;
let interval = null;

function startTimer() {

    if (localStorage.getItem("cronometroAtivo"))
        return;

    localStorage.setItem(
        "cronometroAtivo",
        "true"
    );

    localStorage.setItem(
        "inicioCronometro",
        Date.now()
    );

    updateTimer();

    interval = setInterval(updateTimer, 1000);
}

function saveTempo() {

    const select =
        document.getElementById(
            "cronometroMateria"
        );

    if (!select.value) {

        alert("Escolha uma matéria.");

        return;
    }

    const materiaId =
        Number(select.value);

    const data = getData();

    const materia =
        data.materias.find(
            m => m.id === materiaId
        );

    const inicio =
        Number(
            localStorage.getItem(
                "inicioCronometro"
            )
        );

    const segundos =
        Math.floor(
            (Date.now() - inicio) / 1000
        );

    if (materia) {

        materia.tempoEstudado += segundos;

    }

    data.tempoHoje += segundos;

    saveData(data);

    localStorage.removeItem(
        "inicioCronometro"
    );

    localStorage.removeItem(
        "cronometroAtivo"
    );

    clearInterval(interval);

    interval = null;

    updateTimer();

    renderHome();

    renderMaterias();

    renderProgressoMaterias();
}

function updateTimer() {

    const el =
        document.getElementById("timer");

    if (!el) return;

    const inicio =
        Number(
            localStorage.getItem(
                "inicioCronometro"
            )
        );

    if (!inicio) {

        el.innerText = "00:00:00";

        return;
    }

    const segundos =
        Math.floor(
            (Date.now() - inicio) / 1000
        );

    el.innerText =
        formatTime(segundos);
}

function formatTime(s) {

    s = Number(s) || 0;

    let h = String(Math.floor(s / 3600)).padStart(2, '0');
    let m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    let sec = String(s % 60).padStart(2, '0');

    return `${h}:${m}:${sec}`;
}

function renderProgressoMaterias() {

    const container =
        document.getElementById("progressoMaterias");

    if (!container) return;

    const data = getData();

    container.innerHTML = "";

    data.materias.forEach(m => {

        m.meta = Number(m.meta) || 0;
        m.tempoEstudado = Number(m.tempoEstudado) || 0;

        const metaSegundos =
            m.meta * 3600;

        const porcentagem =
            metaSegundos > 0
                ? Math.min(
                    (m.tempoEstudado / metaSegundos) * 100,
                    100
                )
                : 0;

        container.innerHTML += `
            <div class="card">

                <strong>${m.nome}</strong>

                <div class="progress-bar">
                    <div
                        class="progress"
                        style="width:${porcentagem}%">
                    </div>
                </div>

                <small>
                    ${formatTime(m.tempoEstudado)}
                    / ${m.meta}h
                </small>

            </div>
        `;
    });
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

    const nome = document.getElementById("nome");

    if (!nome) return;

    const data = getData();

    nome.value = data.perfil?.nome || "";

    document.getElementById("curso").value =
        data.perfil?.curso || "";

    document.getElementById("instituicao").value =
        data.perfil?.instituicao || "";

    document.getElementById("meta").value =
        data.perfil?.meta || "";
}

// ===== MENU =====
function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("active");
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {

    renderMaterias();
    renderKanban();
    renderTarefasMateria();
    renderHome();
    renderProgressoMaterias();
    carregarPerfil();
    carregarMateriasCronometro();
    if (
        localStorage.getItem(
            "cronometroAtivo"
        ) === "true"
    ) {

        interval =
            setInterval(
                updateTimer,
                1000
            );
    }
    updateTimer();

});

function resetTimer() {

    localStorage.removeItem(
        "inicioCronometro"
    );

    localStorage.removeItem(
        "cronometroAtivo"
    );

    clearInterval(interval);

    interval = null;

    updateTimer();
}

function resetTempoHoje() {

    const data = getData();

    data.tempoHoje = 0;

    data.materias.forEach(m => {
        m.tempoEstudado = 0;
    });

    saveData(data);

    renderHome();

    renderMaterias();

    renderProgressoMaterias();
}
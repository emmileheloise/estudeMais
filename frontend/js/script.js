// ===== STORAGE =====
const API = "http://localhost:3000";


let dados = {
    materias: [],
    tarefas: []
};

async function atualizarDados(){

    await fetch(`${API}/dados`, {

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify(dados)

    });

}

async function carregarDados(){

    const materias =
        await fetch(`${API}/materias`)
        .then(res=>res.json());


    const tarefas =
        await fetch(`${API}/tarefas`)
        .then(res=>res.json());


    dados.materias = materias;
    dados.tarefas = tarefas;


    renderMaterias();

    renderKanban();

    renderTarefasMateria();

    renderHome();

    renderProgressoMaterias();

    carregarMateriasCronometro();

    carregarPerfil();

}


// ===== MATERIAS =====
async function addMateria(){

    const nome =
    document.getElementById("materiaInput").value;


    const meta =
    document.getElementById("metaMateria").value;



    await fetch(`${API}/materias`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            nome:nome,

            meta:Number(meta)

        })

    });


    document.getElementById("materiaInput").value="";

    document.getElementById("metaMateria").value="";


    carregarDados();

}

function renderMaterias() {

    const lista =
        document.getElementById("listaMaterias");

    if (!lista) return;

    const data = dados;

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

        <div>
            <strong>${m.nome}</strong>
        </div>

        <div>
            <button onclick="verMateria(${m.id})">
                Ver tarefas
            </button>

            <button onclick="deleteMateria(${m.id})">
                🗑
            </button>
        </div>

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

    const data = dados;

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

    let data = dados;

    data.materias =
        data.materias.filter(
            m => m.id !== id
        );

    data.tarefas =
        data.tarefas.filter(
            t => t.materiaId !== id
        );

    atualizarDados();

    renderMaterias();

    renderProgressoMaterias();
}

function verMateria(id) {
    localStorage.setItem("materiaSelecionada", id);
    window.location.href = "tarefas-materia.html";
}

// ===== TAREFAS =====
async function addTarefa(){

    const input =
    document.getElementById("tarefaInput");


    const select =
    document.getElementById("materiaSelect");


    if(!input.value || !select.value)
        return;



    await fetch(`${API}/tarefas`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },


        body:JSON.stringify({

            materiaId:Number(select.value),

            titulo:input.value

        })

    });



    input.value="";


    carregarDados();

}

function toggleTarefa(id) {
    const data = dados;

    const t =
        data.tarefas.find(
            t => t.id === id
        );

    t.concluida = !t.concluida;

    t.status =
        t.concluida
            ? "concluida"
            : "pendente";

    atualizarDados();

    renderTarefasMateria();

    renderKanban();

    renderHome();
}

function deleteTarefa(id) {
    let data = dados;
    data.tarefas = data.tarefas.filter(t => t.id !== id);
    atualizarDados();
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

    const data = dados;
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
    <div 
        class="card"
        draggable="true"
        ondragstart="arrastarTarefa(${t.id})"
    >

        <strong>${t.titulo}</strong>

        <div class="tag-materia">
            ${materia?.nome || ""}
        </div>

        <button
            class="btn-detalhes"
            onclick="abrirDetalhes(${t.id})">

            Ver detalhes

        </button>

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

    const data = dados;

    const tarefa =
        data.tarefas.find(
            t => t.id === id
        );

    if (!tarefa) return;


    tarefa.status = status;


    if(status === "concluida"){
        tarefa.concluida = true;
    } 
    else {
        tarefa.concluida = false;
    }


    atualizarDados();


    renderKanban();

    renderTarefasMateria();

    renderHome();
}

let tarefaArrastada = null;


function arrastarTarefa(id) {

    tarefaArrastada = id;

    console.log("Arrastando:", id);

}

function permitirSoltar(event) {

    event.preventDefault();

}


function soltarTarefa(status) {

    if(!tarefaArrastada) return;


    alterarStatus(
        tarefaArrastada,
        status
    );


    tarefaArrastada = null;

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

    const data = dados;

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

                        <div>

                            <button
                                onclick="abrirDetalhes(${t.id})">

                                Detalhes

                            </button>

                            <button
                                onclick="deleteTarefa(${t.id})">

                                🗑

                            </button>

                        </div>
                                            

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

    const data = dados;

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

    const data = dados;

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

    atualizarDados();

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

    const data = dados;

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
    const data = dados;

    data.perfil = {
        nome: document.getElementById("nome").value,
        curso: document.getElementById("curso").value,
        instituicao: document.getElementById("instituicao").value,
        meta: document.getElementById("meta").value
    };

    atualizarDados();
}

function carregarPerfil() {

    const nome = document.getElementById("nome");

    if (!nome) return;

    const data = dados;

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


    carregarDados();


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

    const data = dados;

    data.tempoHoje = 0;

    data.materias.forEach(m => {
        m.tempoEstudado = 0;
    });

    atualizarDados();

    renderHome();

    renderMaterias();

    renderProgressoMaterias();
}

let tarefaAtual = null;

function abrirDetalhes(id) {

    const data = dados;

    const tarefa =
        data.tarefas.find(
            t => t.id === id
        );

    if (!tarefa) return;

    tarefaAtual = id;

    document.getElementById(
        "linkTarefa"
    ).value = tarefa.link || "";

    const linkEl =
    document.getElementById(
        "abrirLink"
    );

if (tarefa.link) {

    linkEl.href = tarefa.link;

    linkEl.style.display =
        "inline-block";

} else {

    linkEl.style.display =
        "none";
}

    document.getElementById(
        "obsTarefa"
    ).value = tarefa.observacoes || "";

    document.getElementById(
        "modalTarefa"
    ).style.display = "flex";
}

function fecharModal() {

    document.getElementById(
        "modalTarefa"
    ).style.display = "none";
}

function salvarDetalhesTarefa() {

    const data = dados;

    const tarefa =
        data.tarefas.find(
            t => t.id === tarefaAtual
        );

    if (!tarefa) return;

    tarefa.link =
        document.getElementById(
            "linkTarefa"
        ).value;

    tarefa.observacoes =
        document.getElementById(
            "obsTarefa"
        ).value;

atualizarDados();

        const linkEl =
    document.getElementById(
        "abrirLink"
    );

if (tarefa.link) {

    linkEl.href = tarefa.link;

    linkEl.style.display =
        "inline-block";

} else {

    linkEl.style.display =
        "none";
}
    
    fecharModal();
}
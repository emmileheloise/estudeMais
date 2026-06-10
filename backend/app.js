const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const arquivo = "./dados.json";


// =================
// BANCO JSON
// =================

function lerDados(){

    if(!fs.existsSync(arquivo)){

        const inicial = {
            materias: [],
            tarefas: [],
            tempoHoje: 0,
            perfil:{
                meta:0
            }
        };

        fs.writeFileSync(
            arquivo,
            JSON.stringify(inicial,null,2)
        );
    }


    return JSON.parse(
        fs.readFileSync(arquivo)
    );

}


function salvarDados(dados){

    fs.writeFileSync(
        arquivo,
        JSON.stringify(dados,null,2)
    );

}



// =================
// TESTE
// =================

app.get("/", (req,res)=>{

    res.send(
        "API Estude+ funcionando 🚀"
    );

});




// =================
// MATÉRIAS
// =================


app.get("/materias",(req,res)=>{

    const dados = lerDados();

    res.json(
        dados.materias
    );

});



app.post("/materias",(req,res)=>{


    const dados = lerDados();


    const novaMateria = {

        id: Date.now(),

        nome:req.body.nome,

        meta:Number(req.body.meta) || 0,

        tempoEstudado:0

    };


    dados.materias.push(
        novaMateria
    );


    salvarDados(dados);


    res.json(
        novaMateria
    );


});





// =================
// TAREFAS
// =================


app.get("/tarefas",(req,res)=>{


    const dados = lerDados();


    res.json(
        dados.tarefas
    );


});




app.post("/tarefas",(req,res)=>{


    const dados = lerDados();



    const novaTarefa = {


        id:Date.now(),


        materiaId:Number(req.body.materiaId),


        titulo:req.body.titulo,


        concluida:false,


        status:"pendente",


        link:"",


        observacoes:""


    };



    dados.tarefas.push(
        novaTarefa
    );


    salvarDados(dados);


    res.json(
        novaTarefa
    );


});





// =================
// ATUALIZAR DADOS
// =================


app.put("/dados",(req,res)=>{


    salvarDados(
        req.body
    );


    res.json({

        mensagem:
        "Dados atualizados"

    });


});


app.get("/dados",(req,res)=>{

    const dados = lerDados();

    res.json(dados);

});


app.listen(3000,()=>{


    console.log(
        "Servidor Estude+ rodando na porta 3000"
    );


});
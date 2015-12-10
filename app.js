/**
 * Created by Caio on 09/12/2015.
 */

// VARIAVEIS -----------------------------------------------------------------
var CREATED = 0;
var alunos = [];
var first_boot = 1;
var aluno_selected;
var ebd = {
    ofertas: [],
    despesas: []
};
//-----------------------------------------------------------VARIAVEIS


// MODELS -------------------------------------------------------------------
var MATRICULADO = "MATRICULADO";
var VISITANTE = "VISITANTE";
var aluno_model = {
    id: 0, nome: "", idade: 0, sala: null, endereco: "",
    historico: {
        presenca: [],
        falta: []
    },
    status: MATRICULADO
};

var oferta_model = {
    valor: 0.00,
    data: moment()
};

var despesa_model = {
    valor: 0.00,
    data: moment()
};


//-------------------------------------------------------------MODELS

//DELEGATE----------------------------------------------------------
$(document).delegate("#index", "pageinit", function () {
    get_first_boot();
    if (parseInt(first_boot) == 1) {
        first_boot_init();
    } else {
        other_boot();
    }
    console.log(alunos);
    console.log(ebd);
    init_list();
    $('#presente').on('click', function () {
        presentear_aluno(aluno_selected.id);
    });
    $('#falta').on('click', function () {
        faltar_aluno(aluno_selected.id);
    });
    $('#add_oferta_btn').on('click', function () {
        $.mobile.changePage('oferta.html', {role: "dialog"});
    });
    $('#add_despesa_btn').on('click', function () {
        $.mobile.changePage('despesa.html', {role: "dialog"});
    });
    $('#finalizar_trimestre_btn').on('click', function () {
        var confirm = window.confirm("Deseja finalizar o trimestre ?");
        if (confirm == true) {
            clean_fim_trimestre();
            window.location.href = 'index.html';
        }
    });
    $('#limpar_caixa_btn').on('click', function () {
        var confirm = window.confirm("Deseja limpar o caixa ?");
        if (confirm == true) {
            clean_ofertas();
            window.location.href = 'index.html';
        }
    });
    $('#hard_reset_btn').on('click', function () {
        var confirm = window.confirm("Deseja limpar o Banco de Dados local?");
        if (confirm == true) {
            hard_reset();
            window.location.href = 'index.html';
        }
    });


});

$(document).delegate("#oferta_page", "pageinit", function () {
    $('#cadastrar_oferta').on('click', function () {
        var oferta = $('#valor_oferta').val();
        add_oferta(oferta);
    });
});

$(document).delegate("#despesa_page", "pageinit", function () {
    $('#cadastrar_despesa').on('click', function () {
        var despesa = $('#valor_despesa').val();
        add_despesa(despesa);
    });
});

$(document).delegate("#view_aluno", "pageinit", function () {
    $('#nome').val(aluno_selected.nome);
    $('#endereco').val(aluno_selected.endereco);
    $('#idade').val(aluno_selected.idade);
    $('#sala').val(aluno_selected.sala);
    $('#status').val(aluno_selected.status);

    var lista = $('#presencas');
    lista.promise().done(function () {
        $(this).listview("refresh");
        if (aluno_selected.historico.presenca.length > 0) {
            aluno_selected.historico.presenca.forEach(function (mom) {
                lista.append("<li><a href=''>" + get_tempo_real("dddd, D MMMM  YYYY, h:mm a", moment(mom)) + "</a></li>");
            });
        } else {
            lista.append("<li><a>Nenhuma Presenca!</a></li>");
        }
        lista.listview('refresh');
    });

    var lista2 = $('#faltas');
    lista2.promise().done(function () {
        $(this).listview("refresh");
        if (aluno_selected.historico.falta.length > 0) {
            aluno_selected.historico.falta.forEach(function (mome) {
                lista2.append("<li><a href=''>" + get_tempo_real("dddd, D MMMM  YYYY, h:mm a", moment(mome)) + "</a></li>");
            });
        } else {
            lista2.append("<li><a>Nenhuma Falta!</a></li>");
        }
        lista2.listview('refresh');
    });

});

$(document).delegate("#choose", "pageinit", function () {
    $('#presente').on('click', function () {
        presentear_aluno(aluno_selected.id);
    });
    $('#falta').on('click', function () {
        faltar_aluno(aluno_selected.id);
    });
});

$(document).delegate("#add_aluno", "pageinit", function () {
    $('#cadastrar').on('click', function () {
        var nome = $('#nome').val();
        var endereco = $('#endereco').val();
        var idade = $('#idade').val();
        var sala = $('#sala').val();
        create_aluno(nome, idade, sala, endereco, MATRICULADO);
        $.mobile.changePage('index.html');
    });

});

$(document).delegate("#add_visitante", "pageinit", function () {
    $('#cadastrar').on('click', function () {
        var nome = $('#nome').val();
        var endereco = $('#endereco').val();
        var idade = $('#idade').val();
        var sala = $('#sala').val();
        create_aluno(nome, idade, sala, endereco, VISITANTE);
        $.mobile.changePage('index.html');
    });

});

//FUNCTIONS--------------------------------------------------------------
//arrays de dias da semana e meses do ano em PT.
var dayName = new Array("Domingo", "Segunda", "Terca", "Quarta",
    "Quinta", "Sexta", "Sabado")
var daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monName = new Array("Janeiro", "Fevereiro", "Marco", "Abril",
    "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
var monthInYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


function get_tempo_real(format, tempo) {
    var temp = moment(tempo).format(format);
    return formata_data_string_to_pt(temp);
}

function formata_data_string_to_pt(str) {
    for (var i = 0; i < daysInWeek.length; i++) {
        if (str.search(daysInWeek[i]) != -1) {
            str = str.replace(daysInWeek[i], dayName[i]);
            return str;
        }
    }

    for (var i = 0; i < monthInYear.length; i++) {
        if (str.search(monthInYear[i]) != -1) {
            str = str.replace(monthInYear[i], monName[i]);
            return str;
        }
    }
}

function add_oferta(valor) {
    var oferta_nova = oferta_model;
    oferta_nova.valor = parseFloat(valor).toFixed(2);
    oferta_nova.data = moment();
    ebd.ofertas.push(oferta_nova);
    persist_database('ebd', ebd);
    window.location.href = 'index.html';
}

function add_despesa(valor) {
    var despesa_nova = despesa_model;
    despesa_nova.valor = parseFloat(valor).toFixed(2);
    despesa_nova.data = moment();
    ebd.despesas.push(despesa_nova);
    persist_database('ebd', ebd);
    window.location.href = 'index.html';
}

function get_caixa() {
    var total_ofertas = 0;
    var total_despesas = 0;
    ebd.ofertas.forEach(function (obj) {
        total_ofertas = parseFloat(total_ofertas) + parseFloat(obj.valor);
    });
    ebd.despesas.forEach(function (object) {
        total_despesas = parseFloat(total_despesas) + parseFloat(object.valor);
    });
    var t = (parseFloat(total_ofertas) - parseFloat(total_despesas));
    return parseFloat(t).toFixed(2);
}

function get_first_boot() {
    first_boot = get_item_database('first_boot');
    if (first_boot == null) {
        first_boot = 1;
    }
    persist_database('first_boot', first_boot);
}

function init_list() {
    $('#caixa').text(get_caixa());

    var lista = $('#lista');
    lista.promise().done(function () {
        $(this).listview("refresh");
        if (alunos.length > 0) {
            alunos.forEach(function (obj) {
                lista.append("<li id='" + obj.id + "' data-object='" + JSON.stringify(obj) + "'><a href=''>" + obj.nome + "</a></li>");
            });
        } else {
            lista.append("<li><a>Nenhum Aluno Cadastrado!</a></li>");
        }
        lista.listview('refresh');

    });

    lista.promise().done(function () {
        //refresh list here
        $(this).listview("refresh");
        //then add click event using delegation
        $(this).on("click", "li", function () {
            var temp = $(this).data();
            aluno_selected = temp.object;
            console.log(aluno_selected);
            if (aluno_selected != null &&
                aluno_selected != undefined) {
                $.mobile.changePage("choose.html", {role: "dialog"});
            }
        });
    });
}

function first_boot_init() {
    alunos = [];
    CREATED = 0;
    first_boot = 0;
    persist_database('alunos', alunos);
    persist_database('created', CREATED);
    persist_database('first_boot', first_boot);
    persist_database('ebd', ebd);
}

function other_boot() {
    alunos = diserialize_object_database('alunos');
    CREATED = parseInt(get_item_database('created'));
    first_boot = 0;
    ebd = diserialize_object_database('ebd');
    persist_database('alunos', alunos);
    persist_database('created', CREATED);
    persist_database('first_boot', first_boot);
    persist_database('ebd', ebd);
}

function presentear_aluno(id) {
    alunos.forEach(function (aluno) {
        if (aluno.id == id) {
            aluno.historico.presenca.push(moment());
        }
    });
    persist_database('alunos', alunos);
    window.location.href = 'index.html';
}


function faltar_aluno(id) {
    alunos.forEach(function (aluno) {
        if (aluno.id == id) {
            aluno.historico.falta.push(moment());
        }
    });
    persist_database('alunos', alunos);
    window.location.href = 'index.html';
}

function create_aluno(nome, idade, sala, endereco, status) {
    var al = aluno_model;
    CREATED = parseInt(get_item_database('created'));
    CREATED = CREATED + 1;
    persist_database('created', CREATED);
    al.id = CREATED;
    al.endereco = endereco;
    al.nome = nome;
    al.idade = idade;
    al.sala = sala;
    al.status = status;
    alunos.push(al);
    persist_database('alunos', alunos);
    window.location.href = 'index.html';
}

function remove_aluno(id) {
    CREATED = parseInt(get_item_database('created'));
    CREATED = CREATED + 1;
    persist_database('created', CREATED);
    alunos = removeFunction(alunos, 'id', id);
    persist_database('alunos', alunos);
    window.location.href = 'index.html';
}

function removeFunction(myObjects, prop, valu) {
    return myObjects.filter(function (val) {
        return val[prop] !== valu;
    });

}

//function para persistir dados
function persist_database(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
    return true;
}

//function for get item database
function get_item_database(key) {
    return localStorage.getItem(key);
}
//function to diserialize object
function diserialize_object_database(key) {
    var obj = get_item_database(key);
    return JSON.parse(obj);
}

//function to clean database
function hard_reset() {
    localStorage.clear();
}

function clean_fim_trimestre() {
    alunos.forEach(function (aluno) {
        aluno.historico.falta = [];
        aluno.historico.presenca = [];
    });
    persist_database('alunos', alunos);
}

function clean_ofertas() {
    ebd.ofertas = [];
    ebd.despesas = [];
    persist_database('ebd', ebd);
}

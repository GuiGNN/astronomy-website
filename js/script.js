// ============================================================
// script.js - usado em todas as páginas.
// Antes de registrar eventos, cada bloco confere se os elementos
// existem na página atual (evita erros no console).
// ============================================================

/* ---------- 1. MENU RESPONSIVO (todas as páginas) ---------- */
const botaoMenu = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');

// Abre ou fecha o menu e atualiza o texto e o atributo aria-expanded
function alternarMenu() {
  const aberto = menu.classList.toggle('aberto');
  botaoMenu.setAttribute('aria-expanded', aberto);
  botaoMenu.textContent = aberto ? 'Fechar' : 'Menu';
}

if (botaoMenu && menu) {
  // O botão (button) já responde a clique, Enter e Espaço
  botaoMenu.addEventListener('click', alternarMenu);

  // Esc fecha o menu e devolve o foco ao botão
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menu.classList.contains('aberto')) {
      alternarMenu();
      botaoMenu.focus();
    }
  });
}

/* ---------- 2. FILTRO DE CONTEÚDO (explore.html) ---------- */
const cartoes = document.querySelectorAll('.cartao');
const botoesFiltro = document.querySelectorAll('.filtro');
const campoBusca = document.querySelector('#busca');
const avisoVazio = document.querySelector('#sem-resultados');
const contador = document.querySelector('#contador');

let categoriaAtual = 'todos'; // categoria escolhida nos botões

// Remove acentos e maiúsculas para a busca ignorar "Galáxia" x "galaxia"
function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Mostra só os cartões que combinam com a categoria E com a palavra digitada
function aplicarFiltro() {
  const termo = normalizar(campoBusca.value.trim());
  let visiveis = 0;

  cartoes.forEach(function (cartao) {
    const daCategoria = categoriaAtual === 'todos' || cartao.dataset.categoria === categoriaAtual;
    const temPalavra = normalizar(cartao.textContent).includes(termo);

    if (daCategoria && temPalavra) {
      cartao.hidden = false;
      visiveis++;
    } else {
      cartao.hidden = true;
    }
  });

  avisoVazio.hidden = visiveis > 0; // mensagem quando não há resultados
  contador.textContent = visiveis + (visiveis === 1 ? ' objeto exibido' : ' objetos exibidos');
}

if (cartoes.length > 0 && campoBusca && avisoVazio && contador) {
  botoesFiltro.forEach(function (botao) {
    botao.addEventListener('click', function () {
      categoriaAtual = botao.dataset.categoria;
      botoesFiltro.forEach(function (b) {
        b.setAttribute('aria-pressed', b === botao);
      });
      aplicarFiltro();
    });
  });
  campoBusca.addEventListener('input', aplicarFiltro);
  aplicarFiltro(); // mostra o contador inicial
}

/* ---------- 2b. JANELA DE DETALHES (explore.html) ---------- */
const janela = document.querySelector('#detalhe');
const botoesAbrir = document.querySelectorAll('.abrir');

// Preenche a janela com os dados do cartão clicado e a abre
function abrirDetalhe(cartao) {
  const nome = cartao.querySelector('.abrir').textContent;
  const dados = cartao.querySelector('.dados'); // conteúdo escondido dentro do cartão
  const foto = document.querySelector('#detalhe-foto');

  document.querySelector('#detalhe-titulo').textContent = nome;
  document.querySelector('#detalhe-categoria').textContent = cartao.dataset.categoria;
  document.querySelector('#detalhe-tipo').textContent = cartao.dataset.tipo;
  document.querySelector('#detalhe-sobre').textContent = dados.querySelector('.sobre').textContent;
  document.querySelector('#detalhe-detalhes').innerHTML = dados.querySelector('.detalhes').innerHTML;
  document.querySelector('#detalhe-fatos').innerHTML = dados.querySelector('.fatos').innerHTML;

  foto.src = cartao.dataset.imagem; // troque o data-imagem do cartão por uma foto real, se quiser
  foto.alt = 'Ilustração representando ' + nome;

  janela.querySelector('.dialogo').scrollTop = 0;
  janela.showModal(); // showModal já fecha com Esc e prende o foco dentro da janela
}

if (janela && botoesAbrir.length > 0) {
  // O botão do cartão responde a clique, Enter e Espaço
  botoesAbrir.forEach(function (botao) {
    botao.addEventListener('click', function () {
      abrirDetalhe(botao.closest('.cartao'));
    });
  });

  // Botão X
  document.querySelector('#fechar').addEventListener('click', function () {
    janela.close();
  });

  // Clique fora da janela (no fundo escuro) também fecha
  janela.addEventListener('click', function (evento) {
    if (evento.target === janela) {
      janela.close();
    }
  });
}

/* ---------- 3. VALIDAÇÃO DO FORMULÁRIO (contato.html) ---------- */
const formulario = document.querySelector('#form-contato');
const statusForm = document.querySelector('#status');

// Escreve (ou limpa) a mensagem de erro de um campo
function mostrarErro(campo, mensagem) {
  document.querySelector('#erro-' + campo.id).textContent = mensagem;
  campo.setAttribute('aria-invalid', mensagem !== '');
}

// Valida um campo e retorna true se estiver correto
function validarCampo(campo) {
  const valor = campo.value.trim(); // trim() remove espaços das pontas
  let mensagem = '';

  if (valor === '') {
    // Diferencia campo vazio de campo só com espaços
    mensagem = campo.value.length > 0
      ? 'Este campo não pode conter apenas espaços.'
      : 'Preencha este campo.';
  } else if (campo.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
    mensagem = 'Digite um e-mail válido, como nome@exemplo.com.';
  } else if (campo.id === 'mensagem' && valor.length < 10) {
    mensagem = 'A mensagem precisa ter pelo menos 10 caracteres.';
  }

  mostrarErro(campo, mensagem);
  return mensagem === '';
}

if (formulario && statusForm) {
  const campos = formulario.querySelectorAll('input, textarea');

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault(); // formulário demonstrativo: nada é enviado
    let primeiroInvalido = null;

    campos.forEach(function (campo) {
      if (!validarCampo(campo) && primeiroInvalido === null) {
        primeiroInvalido = campo;
      }
    });

    if (primeiroInvalido) {
      statusForm.textContent = '';
      primeiroInvalido.focus();
    } else {
      statusForm.textContent = 'Dados validados com sucesso, mas não enviados: este formulário é apenas uma demonstração.';
      formulario.reset();
    }
  });

  // Corrige o aviso assim que a pessoa sai do campo
  campos.forEach(function (campo) {
    campo.addEventListener('blur', function () { validarCampo(campo); });
  });
}

/* ---------- 4. PERGUNTAS FREQUENTES (contato.html) ---------- */
const perguntas = document.querySelectorAll('.faq-pergunta');

// Abre ou fecha a resposta ligada ao botão clicado
function alternarResposta(botao) {
  const estavaAberta = botao.getAttribute('aria-expanded') === 'true';
  const resposta = document.getElementById(botao.getAttribute('aria-controls'));

  botao.setAttribute('aria-expanded', !estavaAberta);
  resposta.hidden = estavaAberta;
}

perguntas.forEach(function (botao) {
  botao.addEventListener('click', function () { alternarResposta(botao); });
});
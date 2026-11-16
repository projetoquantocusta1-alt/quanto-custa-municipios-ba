/* Projeto Quanto Custa — módulo da Bahia (dados do SICONFI / Tesouro Nacional).
   Roda dentro da página única dos municípios (quanto-custa-municipios/?uf=ba): troca o conteúdo principal
   pelo da Bahia e lê os dados publicados por este repositório (quanto-custa-municipios-ba/dados/). */
(() => {
"use strict";
const AQUI = new URL(".", document.currentScript.src).href;
const DADOS = AQUI + "dados/";
const MAIN_BA = "<main>\n    <section class=\"pagina\" data-pag=\"inicio\">\n      <div class=\"hero\">\n        <div>\n          <div class=\"visitas-linha\" data-visitas hidden><span class=\"visitas\"><span class=\"vis-ponto\" aria-hidden=\"true\"></span><b>\u2014</b> visitas ao Projeto Quanto Custa</span></div>\n          <p class=\"selo\">Projeto Quanto Custa \u00b7 Bahia</p>\n          <h1>Quanto custam as c\u00e2maras e as prefeituras da Bahia?</h1>\n          <p class=\"hero-sub\">Os 417 munic\u00edpios da Bahia, desde 2017: o custo de cada c\u00e2mara municipal, por vereador e por habitante, e para onde vai o dinheiro de cada prefeitura. Dados oficiais do Tesouro Nacional, <strong>corrigidos pela infla\u00e7\u00e3o (IPCA)</strong>.</p>\n          <p class=\"limite\" id=\"i-limite\"></p>\n          <p><button class=\"btn\" data-ir=\"municipio\" type=\"button\">Ver o meu munic\u00edpio</button></p>\n        </div>\n        <div class=\"kpis\" id=\"i-kpis\"></div>\n      </div>\n      <div class=\"grade\">\n        <article class=\"visual span-6\"><header><h2>C\u00e2maras mais caras por habitante</h2><span class=\"dica\">top 5 \u00b7 clique para abrir</span></header><ol class=\"top5\" id=\"i-top-hab\"></ol></article>\n        <article class=\"visual span-6\"><header><h2>C\u00e2maras mais caras por vereador</h2><span class=\"dica\">top 5 \u00b7 clique para abrir</span></header><ol class=\"top5\" id=\"i-top-ver\"></ol></article>\n      </div>\n    </section>\n\n    <section class=\"pagina\" data-pag=\"camaras\">\n      <div class=\"divergencias\" id=\"c-diverg\" hidden></div>\n      <div class=\"kpis\" id=\"c-kpis\"></div>\n      <article class=\"visual\"><header><h2>C\u00e2maras municipais</h2>\n        <span class=\"filtros-tabela\"><input id=\"c-busca\" class=\"mini-busca\" type=\"search\" placeholder=\"Filtrar por cidade\"></span>\n        <span class=\"dica\">custo por vereador = gasto da c\u00e2mara \u00f7 vereadores eleitos \u00b7 clique no t\u00edtulo da coluna para ordenar</span></header>\n        <div class=\"tabela-rolagem\"><table class=\"ranking\" id=\"c-tab\"></table></div>\n        <button class=\"btn-sec mais\" id=\"c-mais\" type=\"button\" hidden>Mostrar mais</button></article>\n    </section>\n\n    <section class=\"pagina\" data-pag=\"municipio\">\n      <div id=\"m-vazio\" class=\"vazio\">Escolha um munic\u00edpio no campo <strong>Munic\u00edpio</strong> acima.</div>\n      <div id=\"m-conteudo\" hidden>\n        <h2 class=\"titulo-mun\" id=\"m-titulo\"></h2>\n        <p class=\"sub\" id=\"m-sub\"></p>\n        <div class=\"divergencias\" id=\"m-diverg\" hidden></div>\n        <div class=\"kpis\" id=\"m-kpis\"></div>\n        <article class=\"visual ep\" id=\"m-empenho\"></article>\n        <div class=\"grade\">\n          <article class=\"visual span-6\"><header><h2>Prefeito e vice</h2><span class=\"dica\" id=\"m-mandato\"></span></header><div id=\"m-pref\"></div></article>\n          <article class=\"visual span-6\"><header><h2>A c\u00e2mara ao longo dos anos</h2><span class=\"dica\">empenhado, por ano \u00b7 * ano ainda parcial</span></header>\n            <div class=\"canvas-box\"><canvas id=\"g-hist\"></canvas></div></article>\n          <article class=\"visual span-6\"><header><h2>Para onde vai o dinheiro da prefeitura</h2><span class=\"dica\">empenhado por \u00e1rea (fun\u00e7\u00e3o) \u00b7 em escuro, a c\u00e2mara (Legislativa)</span></header>\n            <div class=\"canvas-box muito-alto\"><canvas id=\"g-funcao\"></canvas></div></article>\n          <article class=\"visual span-6\"><header><h2>Vereadores eleitos</h2><span class=\"dica\" id=\"m-ver-dica\"></span></header>\n            <div class=\"tabela-rolagem\"><table class=\"ranking\" id=\"m-ver\"></table></div></article>\n        </div>\n        <p class=\"limite\">Nota a nota (notas de empenho, fornecedores, notas fiscais) e os gabinetes do prefeito e do vice <b>ainda n\u00e3o est\u00e3o dispon\u00edveis para a Bahia</b>: veja o porqu\u00ea em <a href=\"#metodo\" data-ir=\"metodo\">Como calculamos</a>.</p>\n      </div>\n    </section>\n\n    <section class=\"pagina texto\" data-pag=\"metodo\">\n      <article class=\"visual\">\n        <h2>De onde v\u00eam os dados</h2>\n        <ul>\n          <li><strong>Tesouro Nacional \u2014 SICONFI</strong>: o Relat\u00f3rio Resumido da Execu\u00e7\u00e3o Or\u00e7ament\u00e1ria (RREO), Anexo 2, que toda prefeitura do pa\u00eds entrega a cada dois meses, com a despesa por \u00e1rea (fun\u00e7\u00e3o). A c\u00e2mara municipal \u00e9 a fun\u00e7\u00e3o <strong>\"Legislativa\"</strong>.</li>\n          <li><strong>TSE</strong>: prefeitos, vices e vereadores eleitos em 2016, 2020 e 2024, partido e bens declarados.</li>\n          <li><strong>IBGE</strong>: popula\u00e7\u00e3o estimada de cada ano (e o Censo 2022).</li>\n          <li><strong>Banco Central</strong>: IPCA, para trazer valores antigos para pre\u00e7os de hoje.</li>\n        </ul>\n        <h2>Por que n\u00e3o o Tribunal de Contas dos Munic\u00edpios da Bahia (TCM-BA)?</h2>\n        <p>O TCM-BA tem os dados nota a nota das prefeituras baianas, mas o site dele <strong>n\u00e3o responde aos computadores do GitHub</strong>, onde o rob\u00f4 deste projeto roda (testamos v\u00e1rias vezes, em hor\u00e1rios diferentes). Por isso usamos o SICONFI, do Tesouro Nacional, que recebe os relat\u00f3rios de todas as prefeituras do pa\u00eds.</p>\n        <p><strong>Conferimos antes de usar:</strong> nos munic\u00edpios do Cear\u00e1, onde temos os dois, a fun\u00e7\u00e3o Legislativa do SICONFI (somando a parte intraor\u00e7ament\u00e1ria) \u00e9 <strong>igual, centavo por centavo,</strong> ao gasto da c\u00e2mara no Tribunal de Contas do Cear\u00e1, e o total do SICONFI (sem a parte intraor\u00e7ament\u00e1ria) \u00e9 igual ao gasto total da prefeitura (Fortaleza e Sobral, 2025).</p>\n        <h2>Como medimos o gasto</h2>\n        <p><strong>Empenhado</strong>: o dinheiro j\u00e1 reservado no or\u00e7amento para uma despesa (a despesa realizada pela Lei 4.320/64). \u00c9 o mesmo crit\u00e9rio usado no Cear\u00e1. Com o ano fechado, \u00e9 o gasto do ano.</p>\n        <p><strong>Liquidado em vez de pago</strong>: o relat\u00f3rio do Tesouro <strong>n\u00e3o informa o valor pago</strong> por \u00e1rea, s\u00f3 o <strong>liquidado</strong> (o servi\u00e7o foi entregue e conferido; falta s\u00f3 pagar). Por isso, na Bahia, mostramos empenhado, liquidado e \"a liquidar\", e n\u00e3o \"pago\". No Cear\u00e1, o Tribunal de Contas informa o pago.</p>\n        <p><strong>Gasto total da prefeitura</strong>: a despesa de todos os \u00f3rg\u00e3os do munic\u00edpio, sem a parte intraor\u00e7ament\u00e1ria (pagamentos de um \u00f3rg\u00e3o do munic\u00edpio a outro, como a contribui\u00e7\u00e3o \u00e0 previd\u00eancia pr\u00f3pria), para n\u00e3o contar o mesmo dinheiro duas vezes.</p>\n        <p><strong>C\u00e2mara</strong>: inclui a parte intraor\u00e7ament\u00e1ria da fun\u00e7\u00e3o Legislativa (por exemplo, a contribui\u00e7\u00e3o da c\u00e2mara \u00e0 previd\u00eancia dos seus servidores), como no Tribunal de Contas do Cear\u00e1.</p>\n        <h2>O ano em andamento</h2>\n        <p>As prefeituras entregam o relat\u00f3rio a cada dois meses, com prazo de 30 dias depois do fim do bimestre. Por isso o ano em andamento vai at\u00e9 o \u00faltimo bimestre entregue por cada prefeitura (aparece na p\u00e1gina do munic\u00edpio e na lista das c\u00e2maras). O rob\u00f4 procura relat\u00f3rios novos todos os dias.</p>\n        <h2>O que ainda n\u00e3o d\u00e1 para saber na Bahia, e por qu\u00ea</h2>\n        <ul>\n          <li><strong>Notas de empenho, fornecedores, notas fiscais e itens</strong>: s\u00f3 o TCM-BA tem, e o site dele n\u00e3o responde ao rob\u00f4. O relat\u00f3rio do Tesouro traz s\u00f3 os totais por \u00e1rea.</li>\n          <li><strong>Gabinetes do prefeito e do vice</strong>: o relat\u00f3rio do Tesouro agrupa a despesa por \u00e1rea (fun\u00e7\u00e3o), e os gabinetes ficam misturados na fun\u00e7\u00e3o \"Administra\u00e7\u00e3o\" com outras secretarias.</li>\n          <li><strong>O valor pago</strong> por \u00e1rea: o relat\u00f3rio traz s\u00f3 o liquidado (veja acima).</li>\n          <li><strong>Receitas</strong> (de onde vem o dinheiro): ainda n\u00e3o coletadas; entram numa pr\u00f3xima etapa.</li>\n          <li><strong>O sal\u00e1rio exato de cada prefeito e vereador</strong>: n\u00e3o est\u00e1 em nenhuma das fontes. Mostramos o <strong>teto constitucional</strong> do sal\u00e1rio do vereador (art. 29, VI: de 20% a 75% do sal\u00e1rio do deputado estadual, conforme a popula\u00e7\u00e3o).</li>\n          <li><strong>Prefeituras que n\u00e3o entregaram o relat\u00f3rio</strong> ao Tesouro aparecem listadas, ano a ano, na p\u00e1gina das c\u00e2maras. A obriga\u00e7\u00e3o de entregar \u00e9 de cada prefeitura.</li>\n          <li>Suplentes que assumiram no meio do mandato e elei\u00e7\u00f5es suplementares ainda n\u00e3o entram na contagem de vereadores.</li>\n        </ul>\n        <h2>Valores de hoje</h2>\n        <p>Com a chave ligada, cada ano \u00e9 multiplicado pela infla\u00e7\u00e3o acumulada (IPCA) at\u00e9 o \u00faltimo m\u00eas divulgado.</p>\n        <div id=\"m-faltas\"></div>\n      </article>\n    </section>\n  </main>";
(function montarCasca() {
  const velho = document.querySelector("main");
  if (velho) velho.outerHTML = MAIN_BA;
  const css = document.createElement("link"); css.rel = "stylesheet"; css.href = AQUI + "bahia.css?v=2"; document.head.appendChild(css);
  document.title = "Projeto Quanto Custa — Prefeituras e câmaras da Bahia";
  document.querySelectorAll(".marca-sub, .topo-marca small").forEach(e => (e.textContent = "Prefeitos e vereadores · BA"));
  document.querySelectorAll('.menu nav button[data-pag="prefeitos"]').forEach(b => (b.hidden = true));
  const rod = document.querySelector(".rodape");
  if (rod) rod.innerHTML = 'Projeto Quanto Custa · projeto independente, sem vínculo com o Tesouro Nacional, o TCM-BA nem as prefeituras · dados públicos · <a href="https://quantocustaum.com/sobre/">Sobre</a> · <a href="#" data-boas-vindas>Boas-vindas</a> · <a href="https://quantocustaum.com/privacidade/">Privacidade</a> · <a href="https://github.com/projetoquantocusta1-alt/projetoquantocusta1-alt.github.io/issues">Pedir correção</a> · <a href="https://github.com/projetoquantocusta1-alt/quanto-custa-municipios-ba">Código aberto</a>';
})();
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const E = { ano: null, ipca: true, pag: "inicio", ibge: null, meta: null, res: null, det: {}, graf: {}, limC: 25, ordC: ["porVer", -1] };
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const brl = (v, c = 0) => v == null || isNaN(v) ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: c, maximumFractionDigits: c });
const curto = v => {
  if (v == null || isNaN(v)) return "—";
  const a = Math.abs(v);
  if (a >= 1e9) return "R$ " + (v / 1e9).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " bi";
  if (a >= 1e6) return "R$ " + (v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mi";
  if (a >= 1e3) return "R$ " + (v / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " mil";
  return brl(v);
};
const num = v => v == null ? "—" : v.toLocaleString("pt-BR");
const pct = v => v == null || !isFinite(v) ? "—" : (v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const semAcento = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const fator = ano => E.ipca ? ((E.meta.ipca?.fatores || {})[ano] || 1) : 1;
const x = (v, ano) => v == null ? null : v * fator(ano ?? E.ano);
const ateMes = p => p === 6 ? "ano inteiro" : p ? `até ${MESES[p * 2 - 1]}` : "—";
async function json(url) { const r = await fetch(url, { cache: "no-cache" }); if (!r.ok) throw new Error(url + " " + r.status); return r.json(); }

function linha(m, ano = E.ano) {
  const l = m.anos[ano]; if (!l) return null;
  const o = {}; E.meta._campos.forEach((c, i) => (o[c] = l[i]));
  for (const k of ["gasto_total", "camara", "camara_liquidado"]) o[k] = x(o[k], ano);
  o.aLiq = o.camara != null && o.camara_liquidado != null ? Math.max(0, o.camara - o.camara_liquidado) : null;
  o.porVer = o.n_vereadores ? o.camara / o.n_vereadores : null;
  o.camHab = o.populacao ? o.camara / o.populacao : null;
  o.camPct = o.gasto_total ? o.camara / o.gasto_total : null;
  return o;
}
const linhas = () => E.res.map(m => [m, linha(m)]).filter(([, l]) => l);
function kpis(el, itens) { $(el).innerHTML = itens.map(([r, v, o]) => `<div class="kpi"><div class="rot">${r}</div><div class="val num">${v}</div>${o ? `<div class="obs">${o}</div>` : ""}</div>`).join(""); }
function top5(el, lista, fmt, sub) {
  $(el).innerHTML = lista.slice(0, 5).map(([m, val, l]) => `<li><span><button class="link-dep" data-ibge="${m.ibge}">${esc(m.nome)}</button><span class="s">${sub(m, l)}</span></span><span class="v">${fmt(val)}</span></li>`).join("")
    || `<li class="vazio">Sem dados para ${E.ano} ainda.</li>`;
}
function tabela(el, cols, ls, ord, setOrd, lim, maisEl, total) {
  const [k, d] = ord;
  ls.sort((a, b) => ((a[k] ?? -Infinity) > (b[k] ?? -Infinity) ? 1 : -1) * d);
  const head = `<thead><tr>${cols.map(c => `<th class="${c.num ? "num" : ""}" data-k="${c.k}" style="cursor:pointer">${c.t}${c.k === k ? (d < 0 ? " ▼" : " ▲") : ""}</th>`).join("")}</tr></thead>`;
  const body = ls.slice(0, lim).map(l => `<tr>${cols.map(c => `<td class="${c.num ? "num" : ""}">${c.f(l)}</td>`).join("")}</tr>`).join("");
  const foot = total ? `<tfoot><tr>${cols.map(c => `<td class="${c.num ? "num" : ""}">${total(c, ls) ?? ""}</td>`).join("")}</tr></tfoot>` : "";
  $(el).innerHTML = head + `<tbody>${body || `<tr><td colspan="${cols.length}" class="vazio">Nada encontrado.</td></tr>`}</tbody>` + foot;
  $$("th", $(el)).forEach(th => (th.onclick = () => setOrd([th.dataset.k, th.dataset.k === k ? -d : -1])));
  if (maisEl) $(maisEl).hidden = ls.length <= lim;
}
const linkMun = l => `<button class="link-dep" data-ibge="${l.m.ibge}">${esc(l.m.nome)}</button>`;
function grafico(id, cfg) { E.graf[id]?.destroy(); E.graf[id] = new Chart($("#" + id), cfg); }

/* ------------------------------------------------ avisos do ano (limitações) */
function avisosDoAno() {
  const a = String(E.ano), M = E.meta, out = [];
  const falta = M.faltas?.[a] || [], parc = M.parciais?.[a] || [];
  if (falta.length) out.push(`<li class="sem_balancete"><b>${falta.length} prefeitura(s) não entregaram ao Tesouro o relatório de ${a}</b> (RREO): ${esc(falta.join(", "))}. Elas ficam fora dos totais e das listas deste ano. A entrega é obrigação de cada prefeitura (Lei de Responsabilidade Fiscal).</li>`);
  if (parc.length) out.push(`<li class="diferenca"><b>${parc.length} prefeitura(s) entregaram só parte de ${a}</b> (falta o último bimestre): ${esc(parc.map(([n, p]) => `${n} (${ateMes(p)})`).join(", "))}. Os valores delas são parciais.</li>`);
  if (+a === Math.max(...M.anos)) out.push(`<li>${a} é o ano em andamento: cada prefeitura aparece até o último bimestre que entregou (a maioria, ${ateMes(M.periodo_mais_comum?.[a])}).</li>`);
  return out;
}

/* ------------------------------------------------ início */
function rInicio() {
  const L = linhas(), soma = k => L.reduce((s, [, l]) => s + (l[k] || 0), 0), nVer = L.reduce((s, [, l]) => s + (l.n_vereadores || 0), 0);
  const comVer = L.filter(([, l]) => l.n_vereadores), camComVer = comVer.reduce((s, [, l]) => s + l.camara, 0);
  const pm = E.meta.periodo_mais_comum?.[E.ano];
  kpis("#i-kpis", [
    ["Gasto das câmaras", curto(soma("camara")), `${L.length} de ${E.meta.total_municipios} municípios em ${E.ano}${pm && pm < 6 ? ` · ${ateMes(pm)}` : ""}`],
    ["Custo médio por vereador", curto(nVer ? camComVer / nVer : null), `${num(nVer)} vereadores eleitos`],
    ["Gasto das prefeituras", curto(soma("gasto_total")), "todos os órgãos, sem a parte intraorçamentária"],
    ["Sem relatório no Tesouro", num((E.meta.faltas?.[E.ano] || []).length), `prefeituras que não entregaram ${E.ano}`],
  ]);
  $("#i-limite").innerHTML = `Na Bahia, os números vêm do <b>Tesouro Nacional (SICONFI)</b>, porque o site do Tribunal de Contas dos Municípios da Bahia não responde ao nosso robô. Por isso ainda <b>não há nota a nota, fornecedores nem os gabinetes do prefeito e do vice</b>, como no Ceará. <a href="#metodo" data-ir="metodo">Entenda por quê</a>.`;
  const ord = k => L.filter(([, l]) => l[k] != null).map(([m, l]) => [m, l[k], l]).sort((a, b) => b[1] - a[1]);
  top5("#i-top-hab", ord("camHab"), v => brl(v, 2) + "/hab", (m, l) => `${curto(l.camara)} · ${num(l.populacao)} hab.`);
  top5("#i-top-ver", ord("porVer"), curto, (m, l) => `${l.n_vereadores} vereadores · ${curto(l.camara)}`);
}

/* ------------------------------------------------ câmaras */
function rCamaras() {
  const q = semAcento($("#c-busca").value);
  const L = linhas().map(([m, l]) => ({ ...l, m, nome: m.nome })).filter(l => !q || semAcento(l.nome).includes(q));
  const soma = k => L.reduce((s, l) => s + (l[k] || 0), 0);
  const av = avisosDoAno();
  $("#c-diverg").hidden = !av.length;
  $("#c-diverg").innerHTML = `<strong>Atenção: o que falta nos dados de ${E.ano} e por quê</strong><ul>${av.join("")}</ul>`;
  kpis("#c-kpis", [["Gasto das câmaras (empenhado)", curto(soma("camara")), `${L.length} câmaras`],
    ["Liquidado", curto(soma("camara_liquidado")), `a liquidar: <b>${curto(soma("aLiq"))}</b>`],
    ["Vereadores eleitos", num(soma("n_vereadores"))],
    ["Custo médio por vereador", curto(L.filter(l => l.n_vereadores).reduce((s, l) => s + l.camara, 0) / (soma("n_vereadores") || NaN))]]);
  tabela("#c-tab", [
    { k: "nome", t: "Município", f: linkMun },
    { k: "camara", t: "Gasto da câmara", num: 1, f: l => curto(l.camara) },
    { k: "camara_liquidado", t: "Liquidado", num: 1, f: l => curto(l.camara_liquidado) },
    { k: "aLiq", t: "A liquidar", num: 1, f: l => l.aLiq > 0.5 ? `<span class="a-pagar">${curto(l.aLiq)}</span>` : "0" },
    { k: "periodo", t: "Período", num: 1, f: l => ateMes(l.periodo) },
    { k: "n_vereadores", t: "Vereadores", num: 1, f: l => num(l.n_vereadores) },
    { k: "porVer", t: "Por vereador", num: 1, f: l => curto(l.porVer) },
    { k: "camHab", t: "Por habitante", num: 1, f: l => brl(l.camHab, 2) },
    { k: "camPct", t: "% da prefeitura", num: 1, f: l => pct(l.camPct) },
    { k: "teto_subsidio_vereador", t: "Teto do salário", num: 1, f: l => brl(l.teto_subsidio_vereador) },
  ], L, E.ordC, o => { E.ordC = o; rCamaras(); }, E.limC, "#c-mais",
  (c, ls) => c.k === "nome" ? "Total" : ["camara", "camara_liquidado", "aLiq"].includes(c.k) ? curto(ls.reduce((s, l) => s + (l[c.k] || 0), 0)) : c.k === "n_vereadores" ? num(ls.reduce((s, l) => s + (l.n_vereadores || 0), 0)) : "");
}

/* ------------------------------------------------ município */
const eleicaoDoAno = a => (a <= 2020 ? 2016 : a <= 2024 ? 2020 : 2024);
async function rMunicipio() {
  if (!E.ibge) { $("#m-vazio").hidden = false; $("#m-conteudo").hidden = true; return; }
  $("#m-vazio").hidden = true; $("#m-conteudo").hidden = false;
  const D = E.det[E.ibge] = E.det[E.ibge] || await json(`${DADOS}m/${E.ibge}.json`).catch(() => null);
  if (!D) { $("#m-titulo").textContent = "Município não encontrado"; return; }
  $("#m-titulo").textContent = D.nome;
  const a = D.anos[E.ano], el = eleicaoDoAno(+E.ano), ele = D.eleitos?.[el];
  const falta = (E.meta.faltas?.[E.ano] || []).includes(D.nome);
  $("#m-diverg").hidden = !(falta || (a && !a.fechado && +E.ano < Math.max(...E.meta.anos)));
  $("#m-diverg").innerHTML = falta ? `<strong>Atenção: a prefeitura de ${esc(D.nome)} não entregou ao Tesouro Nacional o relatório de ${E.ano}</strong> (RREO). Sem ele não há os gastos deste ano. A entrega é obrigação da prefeitura (Lei de Responsabilidade Fiscal).`
    : a && !a.fechado ? `<strong>Atenção: dados parciais.</strong> A prefeitura entregou o relatório de ${E.ano} só ${ateMes(a.periodo)}; falta o último bimestre.` : "";
  if (!a) { $("#m-sub").textContent = `Sem dados de ${E.ano}.`; $("#m-kpis").innerHTML = ""; $("#m-empenho").innerHTML = ""; }
  else {
    $("#m-sub").textContent = `${num(a.populacao)} habitantes · ${a.fechado ? "ano inteiro" : `${ateMes(a.periodo)} de ${E.ano} (último relatório entregue)`}`;
    kpis("#m-kpis", [
      ["Câmara municipal", curto(x(a.camara)), a.n_vereadores ? `${a.n_vereadores} vereadores · ${curto(x(a.camara) / a.n_vereadores)} por vereador` : "vereadores não identificados no TSE"],
      ["Câmara por habitante", brl(a.populacao ? x(a.camara) / a.populacao : null, 2), pct(a.gasto_total ? a.camara / a.gasto_total : null) + " do gasto da prefeitura"],
      ["Gasto total da prefeitura", curto(x(a.gasto_total)), a.populacao ? brl(x(a.gasto_total) / a.populacao) + " por habitante" : ""],
      ["Teto do salário do vereador", brl(a.teto_subsidio_vereador), "por mês, pela Constituição"],
    ]);
    const lin = [["Câmara municipal", a.camara, a.camara_liquidado], ["Prefeitura inteira (todos os órgãos)", a.gasto_total, a.gasto_total_liquidado]];
    $("#m-empenho").innerHTML = `<header><h2>Empenhado, liquidado e a liquidar em ${E.ano}</h2><span class="dica">${a.fechado ? "ano fechado" : ateMes(a.periodo)}</span></header>
      <div class="ep-lista">${lin.map(([r, emp, liq]) => { const al = Math.max(0, emp - liq), w = emp > 0 ? Math.min(100, 100 * liq / emp) : 0;
        return `<div class="ep-linha"><div class="ep-rot">${r}</div><div class="ep-nums"><div><span>Empenhado</span><b>${brl(x(emp))}</b></div><div><span>Liquidado</span><b>${brl(x(liq))}</b></div>
          <div class="ep-falta"><span>${a.fechado ? "Ficou a liquidar" : "Falta liquidar"}</span><b>${brl(x(al))}</b></div></div>
          <div class="ep-barra" role="img" aria-label="${pct(liq / (emp || 1))} liquidado"><i style="width:${w}%"></i></div><p class="sub">${pct(liq / (emp || 1))} do empenhado já foi liquidado</p></div>`; }).join("")}</div>
      <p class="sub"><b>Empenhado</b> é o dinheiro já reservado no orçamento para uma despesa; é o valor usado no resto do site. <b>Liquidado</b> é quando o serviço foi entregue e conferido e só falta pagar. <b>Por que não "pago"?</b> O relatório do Tesouro Nacional, de onde vêm os dados da Bahia, não informa o valor pago por área, só o liquidado.</p>`;
  }
  // prefeito, vice e vereadores (TSE)
  $("#m-mandato").textContent = ele ? `eleitos em ${el}` : "";
  const pessoa = (p, cargo) => p ? `<p><b>${esc(p.urna || p.nome)}</b> <span class="sub">${esc(p.partido)} · ${cargo}${p.bens != null ? ` · bens declarados: ${brl(p.bens)}` : ""}</span></p>` : "";
  $("#m-pref").innerHTML = ele ? pessoa(ele.prefeito, "prefeito(a)") + pessoa(ele.vice, "vice") || `<p class="sub">Prefeito eleito na eleição ordinária não encontrado no TSE (pode ter havido eleição suplementar, que ainda não entra).</p>`
    : `<p class="sub">Eleitos de ${el} não encontrados no TSE para este município. O nome do município no TSE pode estar escrito de outro jeito; avisamos na Metodologia.</p>`;
  const ver = ele?.vereadores || [];
  $("#m-ver-dica").textContent = ver.length ? `${ver.length} eleitos em ${el} · bens declarados ao TSE` : "";
  $("#m-ver").innerHTML = ver.length ? `<thead><tr><th>Vereador(a)</th><th>Partido</th><th class="num">Bens declarados</th></tr></thead><tbody>${ver.map(p => `<tr><td>${esc(p.urna || p.nome)}</td><td>${esc(p.partido)}</td><td class="num">${brl(p.bens)}</td></tr>`).join("")}</tbody>`
    : `<tbody><tr><td class="vazio">Sem a lista do TSE para este município.</td></tr></tbody>`;
  // gráficos
  const anos = Object.keys(D.anos).sort();
  grafico("g-hist", { type: "bar", data: { labels: anos.map(y => D.anos[y].fechado ? y : `${y}*`), datasets: [{ data: anos.map(y => x(D.anos[y].camara, y)), backgroundColor: "#2463A6" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => brl(c.raw), afterLabel: c => D.anos[anos[c.dataIndex]].fechado ? "" : `parcial: ${ateMes(D.anos[anos[c.dataIndex]].periodo)}` } } }, scales: { y: { ticks: { callback: v => curto(v) } } } } });
  const fs = a ? Object.entries(a.funcoes).filter(([, v]) => v[0] > 0).sort((p, q) => q[1][0] - p[1][0]) : [];
  grafico("g-funcao", { type: "bar", data: { labels: fs.map(f => f[0]), datasets: [{ data: fs.map(f => x(f[1][0])), backgroundColor: fs.map(f => f[0] === "Legislativa" ? "#10243A" : "#2463A6") }] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => brl(c.raw) } } }, scales: { x: { ticks: { callback: v => curto(v) } } } } });
}

/* ------------------------------------------------ método */
function rMetodo() {
  const F = E.meta.faltas || {}, sem = E.meta.tse_sem_ligacao || [];
  $("#m-faltas").innerHTML = `<h2>Prefeituras que não entregaram o relatório ao Tesouro</h2>${Object.keys(F).length ? `<ul>${Object.entries(F).sort().reverse().map(([a, l]) => `<li><b>${a}</b> (${l.length}): ${esc(l.join(", "))}</li>`).join("")}</ul>` : "<p>Nenhuma até agora.</p>"}
    ${sem.length ? `<p><b>Municípios cujo nome no TSE não conseguimos ligar ao IBGE</b> (sem vereadores e prefeito nesta página): ${esc(sem.join(", "))}.</p>` : ""}`;
}

/* ------------------------------------------------ navegação */
function render() { try { ({ inicio: rInicio, camaras: rCamaras, municipio: rMunicipio, metodo: rMetodo })[E.pag](); } catch (e) { console.error(e); } }
function irPara(p) {
  E.pag = p; $$(".pagina").forEach(s => s.classList.toggle("ativa", s.dataset.pag === p));
  $$(".menu nav button").forEach(b => (b.dataset.pag === p ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
  $("#menu").classList.remove("aberto"); $("#veu").hidden = true;
  const u = new URL(location); u.searchParams.set("uf", "ba"); u.searchParams.set("ano", E.ano); u.hash = p + (p === "municipio" && E.ibge ? "/" + E.ibge : ""); history.replaceState(null, "", u);
  render(); window.scrollTo(0, 0);
}
function abrirMunicipio(ibge) { E.ibge = ibge; const m = E.res.find(r => r.ibge === ibge); $("#f-mun").value = m ? m.nome : ""; irPara("municipio"); }
async function iniciar() {
  try { [E.meta, E.res] = await Promise.all([json(DADOS + "meta.json"), json(DADOS + "resumo.json")]); }
  catch { $("#aviso").hidden = false; $("#aviso").textContent = "Os dados ainda estão sendo coletados pelo robô. Volte em algumas horas."; return; }
  E.meta._campos = E.res.campos; E.res = E.res.municipios.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const anos = E.meta.anos.slice().reverse(), pedido = +new URL(location).searchParams.get("ano");
  E.ano = anos.includes(pedido) ? pedido : anos[0];
  $("#f-ano").innerHTML = anos.map(a => `<option value="${a}">${a}</option>`).join(""); $("#f-ano").value = E.ano;
  $("#lista-mun").innerHTML = E.res.map(m => `<option value="${esc(m.nome)}">`).join("");
  $("#atualizado").textContent = `Atualizado em ${new Date(E.meta.gerado_em).toLocaleString("pt-BR")}`;
  if (E.meta.ipca?.referencia) $("#ipca-ref").textContent = `corrigidos pelo IPCA até ${E.meta.ipca.referencia}`;
  const [pag, ibge] = location.hash.slice(1).split("/");
  if (ibge) E.ibge = ibge;
  irPara(["inicio", "camaras", "municipio", "metodo"].includes(pag) ? pag : "inicio");
}
document.addEventListener("click", e => {
  const s = e.target.closest("[data-ibge]"); if (s) return abrirMunicipio(s.dataset.ibge);
  const b = e.target.closest(".menu nav button, [data-ir]"); if (b) { e.preventDefault(); irPara(b.dataset.pag || b.dataset.ir); }
});
window.addEventListener("hashchange", () => { const [pag, ibge] = location.hash.slice(1).split("/");
  if (ibge && ibge !== E.ibge) E.ibge = ibge; if (["inicio", "camaras", "municipio", "metodo"].includes(pag) && (pag !== E.pag || ibge)) irPara(pag); });
$("#f-ano").onchange = e => { E.ano = +e.target.value; E.limC = 25; irPara(E.pag); };
$("#f-ipca").onchange = e => { E.ipca = e.target.checked; render(); };
$("#f-mun").onchange = e => { const m = E.res.find(r => semAcento(r.nome) === semAcento(e.target.value)); if (m) abrirMunicipio(m.ibge); };
$("#c-busca").oninput = () => rCamaras();
$("#c-mais").onclick = () => { E.limC += 50; rCamaras(); };
$("#abrir-menu").onclick = () => { $("#menu").classList.add("aberto"); $("#veu").hidden = false; };
$("#veu").onclick = () => { $("#menu").classList.remove("aberto"); $("#veu").hidden = true; };
iniciar();
})();

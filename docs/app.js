/* Projeto Quanto Custa — Prefeituras e câmaras da Bahia (dados do SICONFI / Tesouro Nacional) */
(() => {
"use strict";
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
  const D = E.det[E.ibge] = E.det[E.ibge] || await json(`dados/m/${E.ibge}.json`).catch(() => null);
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
  const u = new URL(location); u.searchParams.set("ano", E.ano); u.hash = p + (p === "municipio" && E.ibge ? "/" + E.ibge : ""); history.replaceState(null, "", u);
  render(); window.scrollTo(0, 0);
}
function abrirMunicipio(ibge) { E.ibge = ibge; const m = E.res.find(r => r.ibge === ibge); $("#f-mun").value = m ? m.nome : ""; irPara("municipio"); }
async function iniciar() {
  try { [E.meta, E.res] = await Promise.all([json("dados/meta.json"), json("dados/resumo.json")]); }
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

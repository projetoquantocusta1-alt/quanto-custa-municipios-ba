# Projeto Quanto Custa — Prefeituras e câmaras da Bahia

Quanto custam as câmaras municipais e as prefeituras dos 417 municípios da Bahia, desde 2017, corrigido pela
inflação. Endereço: https://quantocustaum.com/quanto-custa-municipios-ba/

## Fontes
- **SICONFI (Tesouro Nacional)**: RREO, Anexo 2 (despesa por função), de cada prefeitura, a cada bimestre.
  A câmara é a função "Legislativa". Usamos o SICONFI porque o site do TCM-BA não responde aos computadores do
  GitHub. Conferido com o TCE-CE (Fortaleza e Sobral, 2025): a Legislativa (com a parte intraorçamentária) é
  igual ao gasto da câmara, e o total sem a parte intraorçamentária é igual ao gasto total da prefeitura.
- **TSE**: eleitos de 2016, 2020 e 2024 (ligados ao IBGE pelo nome do município).
- **IBGE**: população. **Banco Central**: IPCA.

## Limitações (explicadas também no site, em "Como calculamos")
- Sem nota a nota, fornecedores e gabinetes do prefeito e do vice (só o TCM-BA tem).
- O RREO traz o empenhado e o liquidado por função, não o pago.
- Prefeituras que não entregam o relatório ao Tesouro ficam fora do ano e são listadas no site.

## Robô
`python atualizar.py` (todo dia, GitHub Actions). `--semanal` também baixa TSE, IBGE e IPCA. `--so-montar` só refaz o site.
Uma consulta por segundo ao SICONFI.

# Tempo de Contrato — Extensão Chrome

Extensão para Google Chrome que calcula e exibe o tempo decorrido desde a vigência inicial de contratos no ERP Infor.

## O que ela faz

- Lê automaticamente a data de **Vigência inicial** ao abrir o modal de um contrato
- Injeta um **badge visual** diretamente na página com o tempo desde a ativação (anos e meses)
- Exibe no popup o **número do contrato**, **tipo** e **tempo desde a ativação** ao clicar no botão

## Como instalar (modo desenvolvedor)

1. Clone o repositório:
   ```bash
   git clone https://github.com/LucasKeley/plugin-erp-infor-client.git
   ```
2. Abra o Chrome e acesse `chrome://extensions/`
3. Ative o **Modo do desenvolvedor** (canto superior direito)
4. Clique em **Carregar sem compactação** e selecione a pasta do projeto

## Como usar

1. Acesse o ERP Infor e abra o modal de um contrato
2. Clique no ícone da extensão na barra do Chrome
3. Clique em **Coletar dados da página**

O popup exibirá o número do contrato, tipo e o tempo desde a ativação. Um badge também é injetado automaticamente na página, ao lado da data de vigência.

## Compatibilidade

- Google Chrome (Manifest V3)
- Funciona em todos os frames da página (`all_frames: true`)

## Versão

`v1.0.0`

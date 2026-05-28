# Tempo de Contrato — Extensão Chrome

Extensão para Google Chrome que lê dados de contratos no ERP Infor e gera checklists de encaminhamento para equipes de campo (moto e carro).

## O que ela faz

### Badge automático na página
Ao abrir o modal de um contrato no ERP Infor, a extensão injeta automaticamente um badge visual azul ao lado da data de Vigência inicial exibindo o número do contrato e o tempo desde a ativação (anos e meses).

### Coleta de dados do contrato
Ao clicar em **Coletar dados da página**, a extensão varre todos os frames da página e extrai:

- Número do contrato
- Tipo (Residencial / Empresarial)
- Data de vigência inicial e tempo desde a ativação
- Usuário PPPoE
- Plano (MB) — lido de "Descrição Etiqueta:", "Plano:", "Velocidade:" ou "Banda:"
- Splitter e Porta Splitter

### Geração de checklist de campo
Com os dados coletados, gera um checklist pronto para copiar e enviar, em dois formatos:

- **Campo Moto** — inclui dBm cliente/CTO, extrato de autenticação, roteador em comodato, agendamento de visita
- **Campo Carro** — inclui dBm cliente/CTO/OLT, verificação de GPON, coordenadas do cliente e da CTO, confirmação de splitter e porta

Ambos são pré-preenchidos com os dados do contrato (número, PPPoE, plano, tempo de ativação e tipo de cliente).

### Copiar para área de transferência
Botão **Copiar texto** copia o checklist gerado com um clique.

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
4. Escolha **Campo Moto** ou **Campo Carro** para gerar o checklist
5. Clique em **Copiar texto** e cole onde precisar

## Compatibilidade

- Google Chrome (Manifest V3)
- Funciona em todos os frames da página (`all_frames: true`)

## Versão

`v1.5`

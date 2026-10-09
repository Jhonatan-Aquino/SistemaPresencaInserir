// ==UserScript==
// @name         Sistema Presença - Inserção de Frequência
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Insere frequências dos alunos através da interface
// @author       You
// @match        https://presenca.mec.gov.br/seb/registra-frequencia-escola
// @match        http://presenca.mec.gov.br/seb/registra-frequencia-escola
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Adiciona estilos para o container
    GM_addStyle(`
        /* Estilos base do container principal */
        .presenca-container {
            background: rgba(220, 220, 220, 0.58);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(214, 214, 214, 0.27);
            border-radius: 20px;
            color: #474e68;
            width: auto;
            text-align: center;
            font-weight: bold;
            position: fixed;
            z-index: 2002;
            padding: 15px;
            bottom: 33px;
            right: 30px;
            height: auto;
            min-width: 350px;
        }

        /* Efeito de brilho nas bordas */
        .presenca-container::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(0, 0, 0, 0.1),
                transparent
            );
        }

        /* Estilos gerais dentro do container */
        .presenca-container * {
            font-family: "SF Pro Text","SF Pro Icons","Helvetica Neue","Helvetica","Arial",sans-serif !important;
        }

        /* Estilo base dos botões */
        .presenca-btn {
            background: #ebebeb;
            backdrop-filter: blur(6px);
            border-radius: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.25);
            color: #087eff;
            font-size: 13px;
            font-weight: normal;
            padding: 9px 20px;
            min-width: 124.5px;
            margin: 5px;
            text-decoration: none;
            transition: all 0.15s ease-in-out;
            cursor: pointer;
        }

        /* Botão de ação principal */
        .presenca-btn.primary {
            background: #3982f7;
            color: #fff;
            border: none;
        }

        .presenca-btn.primary:hover {
            background: #3982f7;
            opacity: 0.9;
            transform: scale(1.02);
        }

        .presenca-btn.primary:disabled {
            background: #cccccc;
            cursor: not-allowed;
            transform: none;
        }

        /* Botão secundário */
        .presenca-btn.secondary {
            background-color: rgba(255, 255, 255, 0.2);
            color: #474e68;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .presenca-btn.secondary:hover {
            background-color: #f5f5f5;
            transform: scale(1.02);
        }

        /* Estilo para o input de arquivo */
        .presenca-file-input {
            display: none;
        }

        .presenca-file-label {
            background-color: transparent;
            color: #3982f7;
            border: 1px solid #3982f7;
            border-radius: 20px;
            padding: 9px 20px;
            cursor: pointer;
            display: inline-block;
            transition: all 0.15s ease-in-out;
        }

        .presenca-file-label:hover {
            background: #3982f7;
            transform: scale(1.02);
            color: #fff;
        }

        /* Estilo para botões de controle */
        .presenca-btn.control {
            background: none;
            color: #666;
            border: none;
            padding: 5px 10px;
            min-width: auto;
            margin: 0;
        }

        .presenca-btn.control:hover {
            color: #087dff;
        }

        /* Estilo para botões de ajuda */
        .presenca-btn.help {
            background: none;
            color: #a5a5a5;
            border: none;
            padding: 5px 10px;
            min-width: auto;
            margin: 0;
        }

        .presenca-btn.help:hover {
            color: #087dff;
        }

        /* Estilo para botões de download */
        .presenca-btn.download {
            background: #4BB543;
            color: #fff;
            border: none;
        }

        .presenca-btn.download:hover {
            background: #3a9a33;
            transform: scale(1.02);
        }

        /* Estilo para botões de erro */
        .presenca-btn.error {
            background: #FF4B40;
            color: #fff;
            border: none;
        }

        .presenca-btn.error:hover {
            background: #e63c32;
            transform: scale(1.02);
        }

        /* Estilo para botões de aviso */
        .presenca-btn.warning {
            background: #FFA500;
            color: #fff;
            border: none;
        }

        .presenca-btn.warning:hover {
            background: #e69500;
            transform: scale(1.02);
        }

        /* Estilos da área de arquivo */
        .presenca-file-list {
            max-height: 200px;
            overflow-y: auto;
            margin: 20px 0;
            border: 1px dashed #ccc;
            padding: 10px;
            border-radius: 10px;
            scrollbar-width: none;
        }

        .presenca-file-item {
            margin: 3px 0;
            padding: 7px;
            background: rgba(255,255,255,0.5);
            border-radius: 5px;
            font-weight: normal;
            text-align: left;
            transition: all 0.3s ease;
        }

        .presenca-file-item.processing {
            background: rgba(255, 255, 255, 0.7);
            border-left: 3px solid #087dff;
        }

        .presenca-file-item.success {
            background: rgb(126, 213, 126) !important;
            border-left: 3px solid #4BB543;
        }

        .presenca-file-item.error {
            background: rgba(255, 200, 200, 0.7);
            border-left: 3px solid #FF4B40;
        }

        .presenca-file-item .aluno-info {
            font-size: 12px;
            line-height: 1.4;
            color: #474e68;
        }

        .presenca-file-item .aluno-info strong {
            color: #1d1d1f;
            font-weight: 500;
        }

        .presenca-file-item .status-message {
            margin-top: 5px;
            font-size: 11px;
            font-weight: 500;
        }

        .presenca-file-item.success .status-message {
            color: #2e7d32;
        }

        .presenca-file-item.error .status-message {
            color: #c62828;
        }

        .presenca-file-item.processing .status-message {
            color: #087dff;
        }

        /* Status area */
        .presenca-status {
            margin-top: 10px;
            max-height: 400px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 10px;
            background: rgba(255,255,255,0.5);
        }

        .error-message {
            color: #FF4B40;
            font-weight: bold;
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 75, 64, 0.1);
            border-radius: 8px;
            text-align: left;
        }

        /* Botão de minimizar/abrir */
        #exibirPresenca {
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(20px);
            font-weight: 500;
            letter-spacing: 0.3px;
            padding: 5px 15px;
            color: #ffffff;
            font-size: 12px;
            border: none;
            width: auto;
            height: 30px;
            position: fixed;
            z-index: 2002;
            bottom: 1px;
            right: 30px;
            cursor: pointer;
            transition: background-color 0.1s ease-in-out;
            border-radius: 15px;
        }

        #exibirPresenca:hover {
            background: rgba(0, 0, 0, 0.9);
        }

        /* Estilos da div de log */
        .divlog {
            background: rgba(244, 244, 244, 0.8);
            border-radius: 16px;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0);
            backdrop-filter: blur(6.6px);
            -webkit-backdrop-filter: blur(6.6px);
            border: 1px solid rgba(214, 214, 214, 0.27);
            color: #087eff;
            width: auto;
            text-align: center;
            position: absolute;
            z-index: 2002;
            padding: 5px 15px;
            bottom: 103%;
            min-height: 25px;
            min-width: 340px;
            font-size: 14px;
            font-weight: normal;
            line-height: 25px;
            display: none;
            margin-left: -10px;
        }

        /* Estilos do botão de loading */
        .presenca-loading {
            position: relative;
            padding: 15px 20px;
            font-size: 14px;
            background: none;
            color: #087dff;
            cursor: pointer;
            border-radius: 5px;
            overflow: hidden;
            border: none;
            width: 100%;
            margin-top: 10px;
            display: none;
        }

        .presenca-loading.loading::after {
            content: "";
            position: absolute;
            width: 56px;
            height: 56px;
            border: 3px solid #087dff;
            border-top-color: transparent;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: spin 1.8s linear infinite;
        }

        /* Estilos da área de progresso */
        .presenca-progress-area {
            width: 100%;
            margin: 10px 0;
            display: none;
        }

        .presenca-progress-container {
            width: 100%;
            margin: 10px 0;
            display: none;
        }

        .presenca-progress-bar-wrapper {
            width: 100%;
            background-color: #f0f0f0;
            border-radius: 10px;
            padding: 3px;
            margin-bottom: 8px;
            overflow: hidden;
        }

        .presenca-progress-bar {
            height: 5px;
            background-color: #4BB543;
            border-radius: 8px;
            width: 0%;
            transition: width 0.5s ease-in-out;
            position: relative;
            overflow: hidden;
        }

        .presenca-progress-bar::after {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            animation: glowingEffect 2s infinite linear;
        }

        .presenca-progress-text {
            text-align: center;
            color: #474e68;
            font-size: 12px;
            font-family: "SF Pro Text","SF Pro Icons","Helvetica Neue","Helvetica","Arial",sans-serif;
            padding: 5px 0;
            font-weight: normal;
        }

        /* Animações */
        @keyframes spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes glowingEffect {
            0% { left: -100%; }
            100% { left: 100%; }
        }
    `);

    // Cria o container flutuante
    const createFloatingContainer = () => {
        // Primeiro, remover quaisquer instâncias existentes
        const elementosExistentes = document.querySelectorAll('.presenca-container, #exibirPresenca');
        elementosExistentes.forEach(el => el.remove());

        // Criar o botão de minimizar/abrir
        const btnExibir = document.createElement('input');
        btnExibir.type = 'button';
        btnExibir.id = 'exibirPresenca';
        btnExibir.className = 'menuSCT';
        btnExibir.value = "MINIMIZAR";

        // Criar div principal
        const container = document.createElement('div');
        container.className = 'presenca-container';

        const title = document.createElement('h3');
        title.textContent = 'Inserção de Frequência';
        title.style.margin = '0 0 10px 0';
        title.style.fontSize = '28px';
        title.style.fontWeight = '500';
        title.style.color = '#1d1d1f';
        title.style.letterSpacing = '-0.5px';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.className = 'presenca-file-input';
        fileInput.id = 'presenca-file-input';

        const fileLabel = document.createElement('label');
        fileLabel.htmlFor = 'presenca-file-input';
        fileLabel.className = 'presenca-file-label';
        fileLabel.textContent = 'Selecionar Arquivo CSV';

        const startButton = document.createElement('button');
        startButton.textContent = 'Iniciar Inserção';
        startButton.className = 'presenca-btn primary';
        startButton.disabled = true;

        // Criar div para lista de alunos
        const fileList = document.createElement('div');
        fileList.className = 'presenca-file-list';
        fileList.id = 'presenca-file-list';

        container.appendChild(title);
        container.appendChild(fileLabel);
        container.appendChild(fileInput);
        container.appendChild(fileList);
        container.appendChild(startButton);

        // Adicionar elementos ao documento
        document.body.appendChild(btnExibir);
        document.body.appendChild(container);

        // Configurar eventos
        btnExibir.onmouseover = () => btnExibir.style.backgroundColor = "#3982F7";
        btnExibir.onmouseout = () => btnExibir.style.backgroundColor = "#474e68";
        btnExibir.onclick = function() {
            const novoEstado = this.value === "MINIMIZAR" ? "fechado" : "aberto";
            $(".presenca-container").slideToggle();
            this.value = novoEstado === "fechado" ? "ABRIR | Sistema Presença" : "MINIMIZAR";
            setCookie('estadoMenuPresenca', novoEstado, 30);
        };

        // Configurar visibilidade inicial
        if (getCookie('estadoMenuPresenca') === 'fechado') {
            $(".presenca-container").hide();
        }

                // Exemplo de uso:
        adicionarEfeitoBrilhoFlexivel('.presenca-container', {
            delay: 1000,
            duration: 2000,
            colors: {
                before: [
                    'rgba(235, 20, 20, 0.3)',
                    'transparent',
                    'rgba(64, 255, 166, 0.3)',
                    'rgba(214, 114, 114, 0.5)',
                    'transparent',
                    'rgba(255, 40, 40, 0.6)'
                ],
                after: [
                    'rgba(57, 130, 247, 0.5)',
                    'rgba(52, 165, 104, 0.7)',
                    'transparent',
                    'rgba(255, 255, 255, 0.91)',
                    'rgba(57, 130, 247, 0.5)'
                ]
            },
            blur: {
                before: 15,
                after: 20
            }
        });

        return { fileInput, startButton, fileList };
    };

    // Função para gerenciar cookies
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Função para validar os dados do aluno
    const validarDadosAluno = (aluno) => {
        const problemas = [];

        // Verifica frequência do mês um (colunas 2 e 3)
        const freqMesUm = parseInt(aluno.frequenciaMesUm);
        if (!isNaN(freqMesUm)) { // Só valida se tiver um valor numérico
            if (freqMesUm < 75) {
                if (!aluno.justificativaMesUm || aluno.justificativaMesUm.trim() === '') {
                    problemas.push(`Mês 1: Frequência ${freqMesUm}% requer código de motivo`);
                }
            }
        }

        // Verifica frequência do mês dois (colunas 4 e 5) independentemente do mês um
        const freqMesDois = parseInt(aluno.frequenciaMesDois);
        if (!isNaN(freqMesDois)) { // Só valida se tiver um valor numérico
            if (freqMesDois < 75) {
                if (!aluno.justificativaMesDois || aluno.justificativaMesDois.trim() === '') {
                    problemas.push(`Mês 2: Frequência ${freqMesDois}% requer código de motivo`);
                }
            }
        }

        return problemas;
    };

    // Processa o CSV
    const processCSV = (csvText) => {
        const lines = csvText.split('\n');
        const data = [];
        const alunosComProblemas = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;

            const values = lines[i].split(';');
            const entry = {
                nome: values[0],
                frequenciaMesUm: values[1],
                justificativaMesUm: values[2],
                frequenciaMesDois: values[3],
                justificativaMesDois: values[4]
            };

            // Valida os dados do aluno
            const problemas = validarDadosAluno(entry);
            if (problemas.length > 0) {
                alunosComProblemas.push({
                    nome: entry.nome,
                    problemas: problemas
                });
            } else {
                data.push(entry);
            }
        }

        return { data, alunosComProblemas };
    };

    // Função para encontrar elementos na página
    const findElements = () => {
        // Campo de busca
        const searchInput = document.getElementById('mat-input-1');

        // Botão de busca
        const searchButton = document.querySelector('div.content.p-24 button:nth-child(2)');

        // Tabela de resultados
        const resultsTable = document.querySelector('table.mat-elevation-z8.mat-table tbody');

        return { searchInput, searchButton, resultsTable };
    };

    // Função para aguardar elemento aparecer
    const waitForElement = (selector, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime >= timeout) {
                    reject(new Error(`Elemento ${selector} não encontrado após ${timeout}ms`));
                } else {
                    setTimeout(checkElement, 100);
                }
            };

            checkElement();
        });
    };

    // Função para verificar se a página está carregando
    const waitForLoadingComplete = async () => {
        return new Promise((resolve) => {
            const checkLoading = () => {
                const loadingElements = document.querySelectorAll('.loading-foreground, .foreground-closing');
                if (loadingElements.length === 0) {
                    // Aguarda mais 1 segundo para garantir que o carregamento realmente terminou
                    setTimeout(resolve, 1000);
                } else {
                    setTimeout(checkLoading, 100);
                }
            };
            checkLoading();
        });
    };

    // Função para simular digitação humana em um campo
    const simulateHumanInput = async (inputElement, value) => {
        // Foca no campo
        inputElement.focus();

        // Limpa o valor atual
        inputElement.value = '';
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));

        // Define o novo valor
        inputElement.value = value;

        // Dispara os eventos necessários para o Angular detectar a mudança
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });

        inputElement.dispatchEvent(inputEvent);
        inputElement.dispatchEvent(changeEvent);

        // Aguarda um momento para o Angular processar
        await new Promise(resolve => setTimeout(resolve, 100));

        // Remove o foco
        inputElement.blur();

        // Aguarda mais um momento após remover o foco
        await new Promise(resolve => setTimeout(resolve, 100));
    };

    // Função para encontrar o modal mais recente
    const findLatestModal = () => {
        // Busca todos os mat-card que estão dentro de um mat-dialog-container (modais abertos)
        const dialogContainers = Array.from(document.querySelectorAll('mat-dialog-container'));

        if (dialogContainers.length > 0) {
            // Se houver containers de diálogo, pega o último (mais recente)
            const latestContainer = dialogContainers[dialogContainers.length - 1];
            const modal = latestContainer.querySelector('mat-card.mat-card');
            if (modal) return modal;
        }

        // Fallback: busca todos os mat-card e retorna o último no DOM
        // Filtra apenas os que estão visíveis e contêm o formulário esperado
        const modals = Array.from(document.querySelectorAll('mat-card.mat-card'));
        if (!modals.length) return null;

        // Filtra modais que contêm o formulário de frequência
        const modalsComFormulario = modals.filter(modal => {
            const form = modal.querySelector('form');
            const hasFrequenciaInput = form && form.querySelector('input[formcontrolname="frequenciaMesUm"]');
            return hasFrequenciaInput && modal.offsetParent !== null; // Verifica se está visível
        });

        if (modalsComFormulario.length > 0) {
            // Retorna o último modal com formulário (geralmente o mais recente)
            return modalsComFormulario[modalsComFormulario.length - 1];
        }

        // Se não encontrou com formulário, retorna o último modal visível
        const modalsVisiveis = modals.filter(modal => modal.offsetParent !== null);
        return modalsVisiveis.length > 0 ? modalsVisiveis[modalsVisiveis.length - 1] : null;
    };

    // Função para verificar o alerta de resposta
    const verificarAlertaResposta = async () => {
        // Aguarda o diálogo aparecer
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Procura o diálogo de alerta
        const alertDialog = document.querySelector('app-dialog-alert');
        if (!alertDialog) {
            throw new Error('Diálogo de resposta não encontrado');
        }

        // Pega o conteúdo do alerta
        const titulo = alertDialog.querySelector('.mat-dialog-title')?.textContent?.trim() || '';
        const conteudo = alertDialog.querySelector('.mat-dialog-content')?.textContent?.trim() || '';
        const mensagemCompleta = `${titulo} - ${conteudo}`;

        // Verifica se contém a palavra "sucesso" (case insensitive)
        if (!mensagemCompleta.toLowerCase().includes('sucesso')) {
            throw new Error(`Erro na operação: ${mensagemCompleta}`);
        }

        // Se chegou aqui, é sucesso. Clica no OK
        const okButton = alertDialog.querySelector('.mat-dialog-actions button.btn-cadastrar');
        if (okButton) {
            okButton.click();
            // Aguarda o diálogo fechar
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    // Função para verificar alerta de busca
    const verificarAlertaBusca = async () => {
        // Aguarda o diálogo aparecer
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Procura o diálogo de alerta
        const alertDialog = document.querySelector('app-dialog-alert');
        if (!alertDialog) {
            return null; // Não há alerta
        }

        // Pega o conteúdo do alerta
        const titulo = alertDialog.querySelector('.mat-dialog-title')?.textContent?.trim() || '';
        const conteudo = alertDialog.querySelector('.mat-dialog-content')?.textContent?.trim() || '';
        const mensagemCompleta = `${titulo} - ${conteudo}`;

        // Verifica se é o alerta de "Nenhum registro encontrado"
        if (mensagemCompleta.toLowerCase().includes('nenhum registro encontrado')) {
            // Clica no OK
            const okButton = alertDialog.querySelector('.mat-dialog-actions button.btn-cadastrar');
            if (okButton) {
                okButton.click();
                // Aguarda o diálogo fechar
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            return 'Nenhum registro encontrado';
        }

        // Se não for o alerta esperado, retorna null
        return null;
    };

    // Atualiza o status da operação
    const updateStatus = (statusDiv, message, isError = false) => {
        const statusItem = document.createElement('div');
        statusItem.className = `status-item ${isError ? 'error' : 'success'}`;

        const timestamp = new Date().toLocaleTimeString();
        const statusText = document.createElement('span');
        statusText.className = 'status-text';
        statusText.textContent = `[${timestamp}] ${message}`;

        statusItem.appendChild(statusText);

        // Adiciona com animação
        statusItem.style.opacity = '0';
        statusItem.style.transform = 'translateY(-10px)';
        statusDiv.insertBefore(statusItem, statusDiv.firstChild);

        // Trigger animation
        requestAnimationFrame(() => {
            statusItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            statusItem.style.opacity = '1';
            statusItem.style.transform = 'translateY(0)';
        });

        // Limita o número de mensagens
        const maxMessages = 50;
        while (statusDiv.children.length > maxMessages) {
            statusDiv.removeChild(statusDiv.lastChild);
        }

        // Auto-scroll para a última mensagem
        statusDiv.scrollTop = 0;
    };

    // Função para inserir dados do aluno
    const inserirDadosAluno = async (aluno) => {
        const { searchInput, searchButton } = findElements();

        if (!searchInput || !searchButton) {
            throw new Error('Elementos da página não encontrados');
        }

        try {
            // Preenche o campo de busca
            searchInput.value = aluno.nome;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Clica no botão de busca
            searchButton.click();

            // Aguarda o carregamento da página após a busca
            await waitForLoadingComplete();

            // Verifica se há alerta de busca
            const alertaBusca = await verificarAlertaBusca();
            if (alertaBusca) {
                return alertaBusca; // Retorna a mensagem do alerta
            }

            // Aguarda a tabela carregar
            const resultsTable = await waitForElement('table.mat-table');

            // Aguarda a primeira linha da tabela
            const firstRow = await waitForElement('table.mat-table tbody tr');

            // Encontra o botão de edição na primeira linha
            const editButton = firstRow.querySelector('span.nome-clicavel');
            if (!editButton) {
                throw new Error('Botão de edição não encontrado');
            }

            // Clica no botão de edição
            editButton.click();

            // Aguarda um tempo para o modal começar a abrir
            await new Promise(resolve => setTimeout(resolve, 500));

            // Aguarda o modal abrir e pega o mais recente
            let modal = null;
            let attempts = 0;
            const maxAttempts = 10;

            while (!modal && attempts < maxAttempts) {
                modal = findLatestModal();
                if (!modal) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    attempts++;
                }
            }

            if (!modal) {
                throw new Error('Modal não encontrado após várias tentativas');
            }

            // Aguarda o carregamento completo do modal
            await waitForLoadingComplete();

            // Aguarda um tempo para o formulário processar
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Preenche os campos de frequência
            const frequenciaMesUmInput = modal.querySelector('input[formcontrolname="frequenciaMesUm"]');
            const frequenciaMesDoisInput = modal.querySelector('input[formcontrolname="frequenciaMesDois"]');
            const codigoMotivoUmInput = modal.querySelector('input[formcontrolname="codigoMotivoUm"]');
            const codigoMotivoDoisInput = modal.querySelector('input[formcontrolname="codigoMotivoDois"]');

            // Preenche frequência do mês um
            if (frequenciaMesUmInput) {
                await simulateHumanInput(frequenciaMesUmInput, aluno.frequenciaMesUm);
            }

            // Se houver código de motivo, preenche
            if (aluno.justificativaMesUm && codigoMotivoUmInput) {
                await simulateHumanInput(codigoMotivoUmInput, aluno.justificativaMesUm);
            }

            // Preenche frequência do mês dois
            if (frequenciaMesDoisInput) {
                await simulateHumanInput(frequenciaMesDoisInput, aluno.frequenciaMesDois);
            }

            // Se houver código de motivo, preenche
            if (aluno.justificativaMesDois && codigoMotivoDoisInput) {
                await simulateHumanInput(codigoMotivoDoisInput, aluno.justificativaMesDois);
            }

            // Aguarda um tempo para o formulário processar
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verifica se o botão de salvar está desabilitado
            const saveButton = modal.querySelector('button.mat-raised-button.mat-primary.ng-star-inserted');
            if (saveButton && saveButton.disabled) {
                console.error(`Erro ao preencher dados para o aluno ${aluno.nome}: Dados inválidos`);
                const buttons = Array.from(modal.querySelectorAll('button'));
                const closeButton = buttons.find(b => b.textContent.includes('Fechar'));
                if (closeButton) {
                    closeButton.click();
                    await waitForLoadingComplete();
                }
            } else if (saveButton && !saveButton.disabled) {
                // Se o botão estiver habilitado, clica nele
                saveButton.click();
                await waitForLoadingComplete();

                // Verifica a resposta do servidor
                await verificarAlertaResposta();
            }

            return true;
        } catch (error) {
            throw new Error(`Erro durante a inserção: ${error.message}`);
        }
    };

    // Função para atualizar a lista de alunos
    const updateAlunosList = (alunos, fileList) => {
        fileList.innerHTML = '';

        alunos.forEach((aluno, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'presenca-file-item';
            fileItem.id = `aluno-${index}`;

            const alunoInfo = document.createElement('div');
            alunoInfo.className = 'aluno-info';
            alunoInfo.innerHTML = `<strong>${aluno.nome}</strong>`;

            fileItem.appendChild(alunoInfo);
            fileList.appendChild(fileItem);
        });
    };

    // Função para atualizar o status de um aluno
    const updateAlunoStatus = (index, status, message) => {
        const fileItem = document.getElementById(`aluno-${index}`);
        if (fileItem) {
            fileItem.classList.remove('success', 'failure', 'error', 'processing');
            fileItem.classList.add(status);
            fileItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

            // Remove a mensagem de status anterior se existir
            const existingMessage = fileItem.querySelector('.status-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Adiciona a nova mensagem apenas se for um erro
            if (status === 'error') {
                const statusMessage = document.createElement('div');
                statusMessage.className = 'status-message';
                statusMessage.textContent = message;
                fileItem.appendChild(statusMessage);
            }
        }
    };

    // Sistema de Log melhorado
    class LogManager {
        constructor() {
            this.queue = [];
            this.isDisplaying = false;
            this.lastMessage = '';
            this.lastMessageTime = 0;
        }

        init() {
            this.divLog = document.getElementById('divlog');
            if (!this.divLog) {
                console.warn('Elemento divlog não encontrado, criando...');
                this.divLog = document.createElement('div');
                this.divLog.id = 'divlog';
                this.divLog.className = 'divlog';
                // Adiciona a div de log dentro do container
                const container = document.querySelector('.presenca-container');
                if (container) {
                    container.insertBefore(this.divLog, container.firstChild);
                } else {
                    console.error('Container principal não encontrado');
                }
            }
        }

        async addLog(mensagem, tempo = 3000, cor = '#087eff') {
            if (!this.divLog) {
                this.init();
            }

            const now = Date.now();
            if (this.lastMessage === mensagem && (now - this.lastMessageTime) < 2000) {
                return;
            }

            this.lastMessage = mensagem;
            this.lastMessageTime = now;
            this.queue.push({ mensagem, tempo, cor });

            if (!this.isDisplaying) {
                this.processQueue();
            }
        }

        async processQueue() {
            if (!this.divLog) {
                this.init();
            }

            if (this.queue.length === 0) {
                this.isDisplaying = false;
                return;
            }

            this.isDisplaying = true;
            const { mensagem, tempo, cor } = this.queue.shift();

            this.divLog.style.display = 'block';
            this.divLog.style.color = cor;
            this.divLog.innerHTML = mensagem;

            await new Promise(resolve => setTimeout(resolve, tempo));
            this.divLog.style.display = 'none';

            await new Promise(resolve => setTimeout(resolve, 300));
            this.processQueue();
        }
    }

    // Criar instância do LogManager
    const logManager = new LogManager();

    // Função auxiliar de exibição de log
    function exibirLog(mensagem, tempo = 3000, cor = '#087eff') {
        if (logManager) {
            logManager.addLog(mensagem, tempo, cor);
        } else {
            console.warn('LogManager não está disponível');
        }
    }

    // Função principal
    const main = () => {
        try {
            const { fileInput, startButton, fileList } = createFloatingContainer();
            let csvData = null;
            let alunosComProblemas = null;

            // Inicializa o LogManager após criar o container
            logManager.init();

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const resultado = processCSV(e.target.result);
                        csvData = resultado.data;
                        alunosComProblemas = resultado.alunosComProblemas;

                        if (alunosComProblemas.length > 0) {
                            startButton.disabled = true;

                            let mensagemErro = 'ATENÇÃO: Corrija os seguintes problemas antes de continuar:\n\n';
                            alunosComProblemas.forEach(aluno => {
                                mensagemErro += `${aluno.nome}:\n`;
                                aluno.problemas.forEach(problema => {
                                    mensagemErro += `- ${problema}\n`;
                                });
                                mensagemErro += '\n';
                            });

                            exibirLog(mensagemErro, 15000, '#FF4B40');
                        } else {
                            startButton.disabled = false;
                            updateAlunosList(csvData, fileList);
                            exibirLog(`CSV validado com sucesso! ${csvData.length} registros prontos para processamento.`, 3000, '#34A568');
                        }
                    };
                    reader.readAsText(file);
                }
            });

            startButton.addEventListener('click', async () => {
                if (!csvData) return;

                startButton.disabled = true;
                let successCount = 0;
                let errorCount = 0;
                let stopScript = false;

                for (let i = 0; i < csvData.length; i++) {
                    const aluno = csvData[i];
                    if (stopScript) break;

                    updateAlunoStatus(i, 'processing', 'Processando...');

                    try {
                        const resultado = await inserirDadosAluno(aluno);
                        if (resultado === 'Nenhum registro encontrado') {
                            updateAlunoStatus(i, 'error', '❌ Aluno não encontrado');
                            errorCount++;
                        } else {
                            updateAlunoStatus(i, 'success', '✅ Frequência inserida com sucesso');
                            successCount++;
                        }
                    } catch (error) {
                        updateAlunoStatus(i, 'error', `❌ Erro: ${error.message}`);
                        errorCount++;

                        if (error.message.includes('Erro na operação:')) {
                            stopScript = true;
                            exibirLog('SCRIPT INTERROMPIDO:\nO sistema retornou uma mensagem de erro inesperada.\nPor favor, verifique o erro acima e corrija o problema antes de continuar.', 5000, '#FF4B40');
                        }
                    }

                    if (!stopScript) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }

                const mensagemFinal = stopScript
                    ? `Processo interrompido: ${successCount} sucessos, ${errorCount} falhas`
                    : `Processo finalizado: ${successCount} sucessos, ${errorCount} falhas`;

                exibirLog(mensagemFinal, 3000, stopScript ? '#FF4B40' : '#34A568');

                if (!stopScript) {
                    startButton.disabled = false;
                }
            });
        } catch (error) {
            console.error('Erro no script:', error);
        }
    };

    // Aguarda a página carregar completamente
    window.addEventListener('load', main);



function adicionarEfeitoBrilhoFlexivel(containerSelector, options = {}) {
    // Verifica se o efeito já foi executado
    const efeitoExecutado = GM_getValue('efeitoBrilhoExecutado', false);
    if (efeitoExecutado) {
        return; // Se já foi executado, retorna sem fazer nada
    }

    // Configurações padrão
    const config = {
        delay: options.delay || 1000,
        duration: options.duration || 2000,
        colors: {
            before: options.colors?.before || [
                'rgba(235, 20, 20, 0.3)',
                'rgba(64, 255, 166, 0.3)',
                'transparent',
                'rgba(255, 40, 40, 0.6)'
            ],
            after: options.colors?.after || [
                'rgba(57, 130, 247, 0.5)',
                'rgba(52, 165, 104, 0.7)',
                'rgba(57, 130, 247, 0.5)'
            ]
        },
        blur: {
            before: options.blur?.before || 30,
            after: options.blur?.after || 50
        }
    };

    // Obtém o container
    const container = document.querySelector(containerSelector);
    if (!container) return;


    // Cria os elementos de brilho
    const glowBefore = document.createElement('div');
    const glowAfter = document.createElement('div');

    // Configura os elementos de brilho
    glowBefore.className = 'glow-layer before';
    glowAfter.className = 'glow-layer after';

    // Adiciona os estilos necessários
    const styleId = 'glow-effect-flexible-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.innerHTML = `
            .glow-layer {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: -1;
                border-radius: inherit;
                opacity: 0;
            }

            .glow-layer.before {
                animation: glow-reverse-flexible ${config.duration}ms linear;
            }

            .glow-layer.after {
                animation: glow-flexible ${config.duration}ms linear;
            }

            @keyframes glow-flexible {
                0% {
                    opacity: 0;
                    transform: scale(1);
                    background-position: 0% 0%;
                    background-size: 100% 100%;
                }
                5% {
                    opacity: 1;
                    transform: scale(1.1);
                    background-position: 100% 0%;
                    background-size: 150% 150%;
                }
                15% {
                    opacity: 0.8;
                    transform: scale(1.05);
                    background-position: 50% 100%;
                    background-size: 180% 180%;
                }
                35% {
                    opacity: 0.9;
                    transform: scale(1.03);
                    background-position: 25% 75%;
                    background-size: 200% 200%;
                }
                65% {
                    opacity: 0.7;
                    transform: scale(1.04);
                    background-position: 85% 15%;
                    background-size: 220% 220%;
                }
                85% {
                    opacity: 0.5;
                    transform: scale(1.02);
                    background-position: 35% 65%;
                    background-size: 180% 180%;
                }
                100% {
                    opacity: 0;
                    transform: scale(1);
                    background-position: 0% 0%;
                    background-size: 100% 100%;
                }
            }

            @keyframes glow-reverse-flexible {
                0% {
                    opacity: 0;
                    transform: scale(1);
                    background-position: 0% 0%;
                    background-size: 100% 100%;
                }
                5% {
                    opacity: 0.9;
                    transform: scale(1.08);
                    background-position: 0% 100%;
                    background-size: 160% 160%;
                }
                20% {
                    opacity: 1;
                    transform: scale(1.06);
                    background-position: 100% 50%;
                    background-size: 190% 190%;
                }
                45% {
                    opacity: 0.8;
                    transform: scale(1.04);
                    background-position: 75% 25%;
                    background-size: 220% 220%;
                }
                75% {
                    opacity: 0.6;
                    transform: scale(1.03);
                    background-position: 15% 85%;
                    background-size: 250% 250%;
                }
                90% {
                    opacity: 0.3;
                    transform: scale(1.01);
                    background-position: 65% 35%;
                    background-size: 280% 280%;
                }
                100% {
                    opacity: 0;
                    transform: scale(1);
                    background-position: 200% 200%;
                    background-size: 300% 300%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Configura os estilos específicos para este container
    glowBefore.style.background = `conic-gradient(from 0deg, ${config.colors.before.join(',')})`;
    glowBefore.style.filter = `blur(${config.blur.before}px)`;
    glowAfter.style.background = `conic-gradient(from 0deg, ${config.colors.after.join(',')})`;
    glowAfter.style.filter = `blur(${config.blur.after}px)`;

   // Adiciona os elementos de brilho ao container
    setTimeout(() => {
    container.appendChild(glowBefore);
    container.appendChild(glowAfter);
    }, config.delay);

    // Após a animação terminar, marca o efeito como executado
    setTimeout(() => {
        glowBefore.remove();
        glowAfter.remove();
        GM_setValue('efeitoBrilhoExecutado', true);
    }, config.duration+config.delay);
}

})();
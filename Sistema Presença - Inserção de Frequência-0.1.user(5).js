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
        // Remove BOM e normaliza quebras de linha (CRLF deixava "\r" colado na última coluna)
        const lines = csvText.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/);
        const data = [];
        const alunosComProblemas = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;

            const values = lines[i].split(';').map(v => (v || '').replace(/[\u200B\uFEFF]/g, '').replace('%', '').trim());
            const entry = {
                nome: values[0],
                frequenciaMesUm: values[1] || '',
                justificativaMesUm: values[2] || '',
                frequenciaMesDois: values[3] || '',
                justificativaMesDois: values[4] || ''
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
                    setTimeout(resolve, 400);
                } else {
                    setTimeout(checkLoading, 100);
                }
            };
            checkLoading();
        });
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Espera uma condição ficar verdadeira (polling), retorna o resultado ou null no timeout
    const waitUntil = async (fn, timeout = 8000, interval = 100) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const result = fn();
            if (result) return result;
            await sleep(interval);
        }
        return null;
    };

    // Seta o valor pelo setter nativo (o Angular/zone.js enxerga como digitação real)
    const setNativeValue = (el, value) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(el, value);
    };

    // Função para simular digitação humana em um campo
    const simulateHumanInput = async (inputElement, value) => {
        value = String(value ?? '');
        inputElement.focus();
        inputElement.dispatchEvent(new Event('focus', { bubbles: false }));
        await sleep(50);

        // Limpa e digita caractere a caractere
        setNativeValue(inputElement, '');
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));

        let atual = '';
        for (const ch of value) {
            const keyInit = { key: ch, bubbles: true, cancelable: true };
            inputElement.dispatchEvent(new KeyboardEvent('keydown', keyInit));
            atual += ch;
            setNativeValue(inputElement, atual);
            inputElement.dispatchEvent(new InputEvent('input', { bubbles: true, data: ch, inputType: 'insertText' }));
            inputElement.dispatchEvent(new KeyboardEvent('keyup', keyInit));
            await sleep(30);
        }

        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(150);
        inputElement.blur();
        inputElement.dispatchEvent(new Event('blur', { bubbles: false }));
        await sleep(200);

        return inputElement.value === value;
    };

    // Texto normalizado para comparar nomes
    const normalizar = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();

    // Localiza o botão Salvar do modal pelo texto
    const getSaveButton = (modal) =>
        Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim().toUpperCase() === 'SALVAR');

    // Coleta mensagens de erro de validação visíveis no modal
    const getModalErrors = (modal) => {
        const erros = [];
        modal.querySelectorAll('mat-form-field.mat-form-field-invalid').forEach(ff => {
            const campo = ff.querySelector('input')?.getAttribute('formcontrolname') || 'campo';
            const msg = ff.querySelector('mat-error')?.textContent?.trim() || 'inválido';
            erros.push(`${campo}: ${msg}`);
        });
        return erros;
    };

    // Força o Angular a revalidar: reaplica frequências e passa foco pelos campos de motivo
    const forcarRevalidacao = async (modal, aluno) => {
        const q = (n) => modal.querySelector(`input[formcontrolname="${n}"]`);
        const pares = [
            ['frequenciaMesUm', aluno.frequenciaMesUm],
            ['frequenciaMesDois', aluno.frequenciaMesDois]
        ];
        for (const [nome, valor] of pares) {
            const el = q(nome);
            if (el && valor !== '') await simulateHumanInput(el, valor);
        }
        for (const nome of ['codigoMotivoUm', 'codigoMotivoDois']) {
            const el = q(nome);
            if (el) {
                el.focus();
                await sleep(80);
                el.blur();
                await sleep(80);
            }
        }
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

    // Lê título/conteúdo de um app-dialog-alert
    const lerAlerta = (dialog) => {
        const titulo = dialog.querySelector('.mat-dialog-title')?.textContent?.trim() || '';
        const conteudo = dialog.querySelector('.mat-dialog-content')?.textContent?.trim() || '';
        return titulo || conteudo ? `${titulo} - ${conteudo}` : '';
    };

    // Arma um observador ANTES de salvar: captura a mensagem do alerta no instante em que ela
    // aparece, mesmo que a plataforma a feche sozinha logo em seguida.
    const armarObservadorAlerta = () => {
        const jaExistentes = new Set(document.querySelectorAll('app-dialog-alert'));
        let mensagem = null;
        let notificar = () => {};

        const checar = () => {
            if (mensagem) return;
            for (const dialog of document.querySelectorAll('app-dialog-alert')) {
                if (jaExistentes.has(dialog)) continue;
                const texto = lerAlerta(dialog);
                if (texto) {
                    mensagem = texto;
                    // Sucesso: se a plataforma não fechar sozinha, fecha no OK (erros ficam abertos para leitura)
                    if (texto.toLowerCase().includes('sucesso')) {
                        dialog.querySelector('.mat-dialog-actions button.btn-cadastrar')?.click();
                    }
                    notificar();
                    return;
                }
            }
        };

        const observer = new MutationObserver(checar);
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        return {
            obter: () => mensagem,
            aguardar: (timeout) => new Promise(resolve => {
                if (mensagem) return resolve(mensagem);
                const timer = setTimeout(() => resolve(null), timeout);
                notificar = () => { clearTimeout(timer); resolve(mensagem); };
            }),
            parar: () => observer.disconnect()
        };
    };

    // Função para verificar o alerta de resposta (usa o observador armado antes do clique em Salvar)
    const verificarAlertaResposta = async (watcher, modal) => {
        try {
            // Espera o alerta (resolve na hora em que ele aparece). Se o modal fechar sem alerta
            // visível, dá uma curta tolerância antes de acusar falta de confirmação.
            let mensagem = watcher.obter();
            const inicio = Date.now();
            let modalFechouEm = null;
            while (!mensagem && Date.now() - inicio < 15000) {
                mensagem = await watcher.aguardar(150);
                if (!mensagem && !modal.isConnected) {
                    modalFechouEm = modalFechouEm || Date.now();
                    if (Date.now() - modalFechouEm > 2500) break;
                }
            }

            if (!mensagem) {
                throw new Error('Diálogo de resposta não encontrado');
            }
            if (!mensagem.toLowerCase().includes('sucesso')) {
                throw new Error(`Erro na operação: ${mensagem}`);
            }

            // Garante que o diálogo (se ainda aberto) tenha fechado antes do próximo aluno
            await waitUntil(() => !document.querySelector('app-dialog-alert'), 3000, 50);
        } finally {
            watcher.parar();
        }
    };

    // Função para verificar alerta de busca
    const verificarAlertaBusca = async () => {
        // Aguarda o diálogo aparecer (retorna assim que surgir; sem alerta, segue em ~700ms)
        const alertDialog = await waitUntil(() => document.querySelector('app-dialog-alert'), 700, 50);
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

    // Fecha o modal de frequência (usado quando a inserção falha)
    const fecharModal = async (modal) => {
        const closeButton = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('Fechar'));
        if (closeButton) {
            closeButton.click();
            await waitForLoadingComplete();
        }
    };

    // Função para inserir dados do aluno
    const inserirDadosAluno = async (aluno) => {
        const { searchInput, searchButton } = findElements();

        if (!searchInput || !searchButton) {
            throw new Error('Elementos da página não encontrados');
        }

        try {
            // Preenche o campo de busca como se fosse digitado
            await simulateHumanInput(searchInput, aluno.nome);

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
            await waitForElement('table.mat-table tbody tr');

            // Localiza a linha cujo nome bate exatamente com o aluno do CSV
            const alvo = normalizar(aluno.nome);
            const nomeSpan = await waitUntil(() => {
                const spans = Array.from(document.querySelectorAll('table.mat-table tbody tr span.nome-clicavel'));
                return spans.find(sp => normalizar(sp.textContent) === alvo);
            }, 5000, 200);
            if (!nomeSpan) {
                throw new Error('Aluno não localizado na tabela de resultados (nome diferente do CSV)');
            }

            nomeSpan.click();

            // Aguarda o modal com o formulário do aluno correto
            const modal = await waitUntil(() => {
                const m = findLatestModal();
                if (!m) return null;
                const form = m.querySelector('form');
                const freq = m.querySelector('input[formcontrolname="frequenciaMesUm"]');
                if (!form || !freq) return null;
                const dentro = normalizar(form.textContent);
                return dentro.includes(alvo) ? m : null;
            }, 15000, 250);

            if (!modal) {
                throw new Error('Modal do aluno não abriu / não corresponde ao aluno');
            }

            await waitForLoadingComplete();
            await sleep(500);

            const q = (n) => modal.querySelector(`input[formcontrolname="${n}"]`);
            const frequenciaMesUmInput = q('frequenciaMesUm');
            const frequenciaMesDoisInput = q('frequenciaMesDois');
            const codigoMotivoUmInput = q('codigoMotivoUm');
            const codigoMotivoDoisInput = q('codigoMotivoDois');

            // Preenche frequências primeiro e motivos depois, para a validação condicional já enxergar a frequência
            if (frequenciaMesUmInput && aluno.frequenciaMesUm !== '') {
                await simulateHumanInput(frequenciaMesUmInput, aluno.frequenciaMesUm);
            }
            if (frequenciaMesDoisInput && aluno.frequenciaMesDois !== '') {
                await simulateHumanInput(frequenciaMesDoisInput, aluno.frequenciaMesDois);
            }
            if (aluno.justificativaMesUm && codigoMotivoUmInput) {
                await simulateHumanInput(codigoMotivoUmInput, aluno.justificativaMesUm);
            }
            if (aluno.justificativaMesDois && codigoMotivoDoisInput) {
                await simulateHumanInput(codigoMotivoDoisInput, aluno.justificativaMesDois);
            }

            // Espera o botão Salvar habilitar; se não habilitar, força revalidação e tenta de novo
            let saveButton = getSaveButton(modal);
            let habilitado = await waitUntil(() => (saveButton = getSaveButton(modal)) && !saveButton.disabled, 3000);

            for (let tentativa = 1; !habilitado && tentativa <= 3; tentativa++) {
                await forcarRevalidacao(modal, aluno);
                habilitado = await waitUntil(() => (saveButton = getSaveButton(modal)) && !saveButton.disabled, 3000);
            }

            if (!habilitado) {
                const erros = getModalErrors(modal);
                await fecharModal(modal);
                throw new Error(`Botão Salvar não habilitou${erros.length ? ' (' + erros.join('; ') + ')' : ''}`);
            }

            // Arma o observador antes do clique para não perder um alerta que se fecha sozinho
            const watcher = armarObservadorAlerta();
            saveButton.click();

            // Verifica a resposta do servidor
            await verificarAlertaResposta(watcher, modal);
            await waitForLoadingComplete();

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
                        await new Promise(resolve => setTimeout(resolve, 500));
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
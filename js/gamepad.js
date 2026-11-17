// ============================================================================
// GERENCIADOR UNIFICADO DE CONTROLES (XBOX COM FIO, OUTROS CONTROLES E TECLADO)
// Suporte completo à Gamepad API + Teclado/Mouse + Escolha de Layout na UI
// ============================================================================

class InputController {
    constructor() {
        this.keys = {};
        this.controlScheme = 'auto'; // 'xbox', 'generic', 'keyboard', 'auto'
        this.activeDevice = 'keyboard'; // 'xbox', 'generic', 'keyboard'
        this.connectedGamepadName = null;

        this.state = {
            moveX: 0,
            moveY: 0,
            camX: 0,
            sprint: false,
            btnA: false,      // Confirmar / Interagir
            btnB: false,      // Voltar / Correr
            btnX: false,      // Mochila & Loja de Itens
            btnY: false,      // Guia Psicológico / Mentoria
            btnLB: false,     // Opção 1 no diálogo
            btnRB: false,     // Opção 3 no diálogo
            btnStart: false,  // Compêndio / Menu PDSA
            dpadUp: false,
            dpadDown: false,
            dpadLeft: false,
            dpadRight: false
        };

        this.prevButtons = {};
        this.justPressedCallbacks = [];

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.controlScheme === 'auto') {
                this.setActiveDevice('keyboard');
            }
            this.handleKeyTrigger(e.code, e);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('gamepadconnected', (e) => {
            const id = (e.gamepad.id || '').toLowerCase();
            this.connectedGamepadName = e.gamepad.id;
            const isXbox = id.includes('xbox') || id.includes('xinput') || id.includes('microsoft');
            if (this.controlScheme === 'auto') {
                this.setActiveDevice(isXbox ? 'xbox' : 'generic');
            }
            if (window.onGamepadStatusChange) {
                window.onGamepadStatusChange(true, e.gamepad.id);
            }
        });

        window.addEventListener('gamepaddisconnected', () => {
            this.connectedGamepadName = null;
            if (this.controlScheme === 'auto') {
                this.setActiveDevice('keyboard');
            }
            if (window.onGamepadStatusChange) {
                window.onGamepadStatusChange(false, null);
            }
        });
    }

    setControlScheme(scheme) {
        this.controlScheme = scheme;
        if (scheme !== 'auto') {
            this.setActiveDevice(scheme);
        } else if (this.connectedGamepadName) {
            const isXbox = this.connectedGamepadName.toLowerCase().includes('xbox') ||
                           this.connectedGamepadName.toLowerCase().includes('xinput');
            this.setActiveDevice(isXbox ? 'xbox' : 'generic');
        } else {
            this.setActiveDevice('keyboard');
        }
    }

    setActiveDevice(dev) {
        if (this.activeDevice !== dev) {
            this.activeDevice = dev;
            this.updateButtonPromptsDOM();
        }
    }

    getPromptLabels() {
        if (this.activeDevice === 'xbox') {
            return {
                confirm: 'A',
                cancel: 'B',
                items: 'X',
                psych: 'Y',
                menu: 'START',
                move: 'Analógico Esq.',
                cam: 'Analógico Dir.',
                opt1: 'X / ↑',
                opt2: 'A / →',
                opt3: 'B / ↓'
            };
        } else if (this.activeDevice === 'generic') {
            return {
                confirm: ' Botão 1 (Sul)',
                cancel: 'Botão 2 (Leste)',
                items: 'Botão 3 (Oeste)',
                psych: 'Botão 4 (Norte)',
                menu: 'Options/Start',
                move: 'Analógico / D-Pad',
                cam: 'Analógico Dir.',
                opt1: '↑ / Botão 3',
                opt2: '→ / Botão 1',
                opt3: '↓ / Botão 2'
            };
        } else {
            return {
                confirm: 'E / Espaço',
                cancel: 'Shift / Esc',
                items: 'Tecla I',
                psych: 'Tecla P',
                menu: 'Tecla H',
                move: 'WASD / Setas',
                cam: 'Q / R',
                opt1: 'Tecla 1',
                opt2: 'Tecla 2',
                opt3: 'Tecla 3'
            };
        }
    }

    updateButtonPromptsDOM() {
        const labels = this.getPromptLabels();
        document.querySelectorAll('[data-prompt]').forEach(el => {
            const key = el.getAttribute('data-prompt');
            if (labels[key]) {
                el.textContent = labels[key];
            }
        });
        const badge = document.getElementById('hud-device-badge');
        if (badge) {
            const names = {
                xbox: '🎮 Controle Xbox Ativo',
                generic: '🕹️ Controle USB/Gamepad Ativo',
                keyboard: '⌨️ Teclado & Mouse Ativo'
            };
            badge.textContent = names[this.activeDevice] || names.keyboard;
        }
    }

    onAction(callback) {
        this.justPressedCallbacks.push(callback);
    }

    emitAction(actionName) {
        this.justPressedCallbacks.forEach(cb => cb(actionName));
    }

    handleKeyTrigger(code, event) {
        if (code === 'KeyE' || code === 'Space' || code === 'Enter') {
            this.emitAction('confirm');
        } else if (code === 'Escape' || code === 'Backspace') {
            this.emitAction('cancel');
        } else if (code === 'KeyI') {
            this.emitAction('items');
        } else if (code === 'KeyP') {
            this.emitAction('psych');
        } else if (code === 'KeyH') {
            this.emitAction('menu');
        } else if (code === 'Digit1' || code === 'Numpad1') {
            this.emitAction('choice_0');
        } else if (code === 'Digit2' || code === 'Numpad2') {
            this.emitAction('choice_1');
        } else if (code === 'Digit3' || code === 'Numpad3') {
            this.emitAction('choice_2');
        } else if (code === 'ArrowUp' || code === 'KeyW') {
            this.emitAction('nav_up');
        } else if (code === 'ArrowDown' || code === 'KeyS') {
            this.emitAction('nav_down');
        }
    }

    poll() {
        // 1. Ler Teclado
        let kx = 0, ky = 0, kcam = 0;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) kx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) kx += 1;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) ky -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) ky += 1;
        if (this.keys['KeyQ']) kcam -= 1;
        if (this.keys['KeyR']) kcam += 1;

        let sprint = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight']);
        let holdConfirm = !!(this.keys['Space'] || this.keys['KeyE'] || this.keys['Enter']);

        // 2. Ler Gamepads (Xbox com fio / sem fio ou qualquer outro controle)
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        let gp = null;
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] && gamepads[i].connected) {
                gp = gamepads[i];
                break;
            }
        }

        if (gp) {
            const deadzone = 0.18;
            const ax0 = Math.abs(gp.axes[0] || 0) > deadzone ? gp.axes[0] : 0;
            const ax1 = Math.abs(gp.axes[1] || 0) > deadzone ? gp.axes[1] : 0;
            const ax2 = Math.abs(gp.axes[2] || 0) > deadzone ? gp.axes[2] : 0;

            // D-Pad (botões 12, 13, 14, 15 no mapeamento padrão XInput/Standard)
            const dUp = gp.buttons[12] && gp.buttons[12].pressed;
            const dDown = gp.buttons[13] && gp.buttons[13].pressed;
            const dLeft = gp.buttons[14] && gp.buttons[14].pressed;
            const dRight = gp.buttons[15] && gp.buttons[15].pressed;

            if (ax0 !== 0 || ax1 !== 0 || dUp || dDown || dLeft || dRight) {
                kx = ax0 || (dLeft ? -1 : (dRight ? 1 : 0));
                ky = ax1 || (dUp ? -1 : (dDown ? 1 : 0));
                if (this.controlScheme === 'auto') {
                    const isXbox = (gp.id || '').toLowerCase().includes('xbox') || (gp.id || '').toLowerCase().includes('xinput');
                    this.setActiveDevice(isXbox ? 'xbox' : 'generic');
                }
            }
            if (ax2 !== 0) kcam = ax2;

            const bA = gp.buttons[0] && gp.buttons[0].pressed; // Xbox A
            const bB = gp.buttons[1] && gp.buttons[1].pressed; // Xbox B
            const bX = gp.buttons[2] && gp.buttons[2].pressed; // Xbox X
            const bY = gp.buttons[3] && gp.buttons[3].pressed; // Xbox Y
            const bLB = gp.buttons[4] && gp.buttons[4].pressed;
            const bRB = gp.buttons[5] && gp.buttons[5].pressed;
            const bStart = gp.buttons[9] && gp.buttons[9].pressed;

            if (bB) sprint = true;
            if (bA) holdConfirm = true;

            // Detectar cliques únicos de botões do controle
            this.checkGamepadEdge('A', bA, () => this.emitAction('confirm'));
            this.checkGamepadEdge('B', bB, () => this.emitAction('cancel'));
            this.checkGamepadEdge('X', bX, () => this.emitAction('items'));
            this.checkGamepadEdge('Y', bY, () => this.emitAction('psych'));
            this.checkGamepadEdge('START', bStart, () => this.emitAction('menu'));
            this.checkGamepadEdge('UP', dUp, () => this.emitAction('nav_up'));
            this.checkGamepadEdge('DOWN', dDown, () => this.emitAction('nav_down'));
            this.checkGamepadEdge('LB', bLB, () => this.emitAction('choice_0'));
            this.checkGamepadEdge('RB', bRB, () => this.emitAction('choice_2'));
        }

        this.state.moveX = kx;
        this.state.moveY = ky;
        this.state.camX = kcam;
        this.state.sprint = sprint;
        this.state.btnA = holdConfirm;

        return this.state;
    }

    checkGamepadEdge(name, isPressed, callback) {
        if (isPressed && !this.prevButtons[name]) {
            if (this.controlScheme === 'auto') {
                const isXbox = (this.connectedGamepadName || '').toLowerCase().includes('xbox') ||
                               (this.connectedGamepadName || '').toLowerCase().includes('xinput');
                this.setActiveDevice(isXbox ? 'xbox' : 'generic');
            }
            callback();
        }
        this.prevButtons[name] = isPressed;
    }
}

window.InputController = InputController;

// ============================================================================
// MOTOR PRINCIPAL DO JOGO: CORAÇÕES EM ÓRBITA (TEMPO REAL + PSICOLOGIA + 3D)
// ============================================================================

class ConquistaGame {
    constructor() {
        this.mode = 'title'; // 'title', 'tutorial', 'explore', 'dialogue', 'minigame', 'modal', 'victory'
        this.previousMode = 'explore';

        // Estado e Progresso do Jogador
        this.stats = {
            level: 1,
            xp: 0,
            coins: 90,
            crystalsCollected: 0,
            itemsUsedCount: 0,
            empatia: 12,
            carisma: 10,
            intelecto: 14,
            sensibilidade: 11
        };

        this.inventory = {
            cha_camomila: 1,
            fita_esportiva: 1
        };

        this.conqueredStages = [];
        this.stageAttempts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        this.unlockedAchievements = [];
        this.mentorGuidedStages = {};

        // Estado do Encontro Atual
        this.activeStage = null;
        this.activeStepIdx = 0;
        this.currentAffinity = 25;
        this.stepTimer = 18;
        this.stepMaxTime = 18;
        this.selectedOptionIdx = 0;
        this.activeBuffs = {
            shieldMistake: false,
            instantHint: false,
            slowMinigame: 1.0
        };
        this.awaitingNextStep = false;

        // Estado do Tutorial
        this.tutorialIdx = 0;

        // Estado do Minigame em Tempo Real ("Sintonia do Coração")
        this.minigame = {
            active: false,
            playerPos: 50,      // 0 a 100
            targetPos: 50,      // 0 a 100
            targetVel: 22,
            zoneWidth: 30,
            harmonyProgress: 35, // 0 a 100 (vence em 100)
            timeLeft: 14,
            obstacles: []
        };

        this.lastFrameTime = performance.now();
        this.loadSave();
        this.initSystems();
    }

    initSystems() {
        this.input = new InputController();
        this.portrait = new AnimePortraitRenderer('anime-portrait-canvas');
        this.world3d = new CampusWorld3D('viewport-3d');

        this.input.onAction((action) => this.handleInputAction(action));

        window.onGamepadStatusChange = (connected, name) => {
            if (connected) {
                this.showSwitchToast("🎮 Controle Conectado!", `Pronto para jogar: ${name}`);
            } else {
                this.showSwitchToast("⌨️ Teclado Ativo", "Controle desconectado; usando Teclado/Mouse.");
            }
        };

        this.bindUIEvents();
        this.updateHUD();
        this.input.updateButtonPromptsDOM();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    bindUIEvents() {
        // Tela Inicial
        document.getElementById('btn-start-game').addEventListener('click', () => {
            window.soundSystem.playSwitchSnap();
            window.soundSystem.startBGM('campus');
            this.startGameFlow();
        });

        document.getElementById('btn-continue-game').addEventListener('click', () => {
            window.soundSystem.playConfirm();
            window.soundSystem.startBGM('campus');
            this.enterExploreMode();
        });

        // Seletor de Controles na Tela Inicial e Topo
        document.querySelectorAll('.ctrl-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ctrl-choice-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const scheme = btn.getAttribute('data-scheme');
                this.input.setControlScheme(scheme);
                window.soundSystem.playClick();
                this.showSwitchToast("Esquema de Controle Atualizado", `Modo selecionado: ${btn.textContent.trim()}`);
            });
        });

        // Seletor de Qualidade Gráfica (PC sem Placa de Vídeo vs Switch HD)
        document.getElementById('btn-toggle-quality').addEventListener('click', () => {
            const nextQ = this.world3d.quality === 'high' ? 'performance' : 'high';
            this.world3d.setQuality(nextQ);
            const label = nextQ === 'high' ? '✨ Gráfico: Switch HD' : '⚡ Gráfico: Modo PC Leve';
            document.getElementById('btn-toggle-quality').textContent = label;
            window.soundSystem.playClick();
            this.showSwitchToast("Modo Gráfico Ajustado", nextQ === 'high'
                ? "Resolução máxima + Pétalas 3D ativadas."
                : "Modo Ultra Leve para PCs sem placa de vídeo ativado (60 FPS).");
        });

        // Botão de Clima / Horário 3D
        document.getElementById('btn-cycle-time').addEventListener('click', () => {
            const tod = this.world3d.cycleTimeOfDay();
            const names = ['☀️ Manhã Radiante', '🌇 Pôr do Sol Sakura', '🌙 Noite Estelar'];
            document.getElementById('btn-cycle-time').textContent = names[tod];
            window.soundSystem.playClick();
        });

        // Botão de Áudio
        document.getElementById('btn-toggle-audio').addEventListener('click', () => {
            const muted = window.soundSystem.toggleMute();
            document.getElementById('btn-toggle-audio').textContent = muted ? '🔇 Som: Off' : '🔊 Som: On';
        });

        // Botões da Barra Inferior Estilo Switch
        document.getElementById('hud-btn-interact').addEventListener('click', () => this.handleInputAction('confirm'));
        document.getElementById('hud-btn-items').addEventListener('click', () => this.openItemsModal());
        document.getElementById('hud-btn-psych').addEventListener('click', () => this.openPsychologyMentorModal(false));
        document.getElementById('hud-btn-compendium').addEventListener('click', () => this.openCompendiumModal());
        document.getElementById('hud-btn-tutorial').addEventListener('click', () => this.startTutorial());

        // Tutorial
        document.getElementById('btn-tutorial-next').addEventListener('click', () => this.advanceTutorial());
        document.getElementById('btn-tutorial-skip').addEventListener('click', () => {
            window.soundSystem.playConfirm();
            this.unlockAchievement('first_step');
            this.enterExploreMode();
        });

        // Usar Item durante o Diálogo
        document.getElementById('btn-dialogue-use-item').addEventListener('click', () => this.openItemsModal());
        document.getElementById('btn-dialogue-psych-tip').addEventListener('click', () => this.openPsychologyMentorModal(false));
        document.getElementById('btn-dialogue-leave').addEventListener('click', () => this.enterExploreMode());

        // Fechar Modais
        document.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
    }

    startGameFlow() {
        document.getElementById('title-screen').classList.add('hidden');
        if (!this.unlockedAchievements.includes('first_step')) {
            this.startTutorial();
        } else {
            this.enterExploreMode();
        }
    }

    startTutorial() {
        this.mode = 'tutorial';
        this.tutorialIdx = 0;
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('tutorial-overlay').classList.remove('hidden');
        this.renderTutorialStep();
    }

    renderTutorialStep() {
        const steps = window.GAME_DATA.tutorialSteps;
        const step = steps[this.tutorialIdx];
        if (!step) {
            this.unlockAchievement('first_step');
            this.enterExploreMode();
            return;
        }
        this.portrait.setCharacter(step.speaker, step.expression);
        document.getElementById('dialogue-panel').classList.remove('hidden');
        document.getElementById('dialogue-options-container').classList.add('hidden');
        document.getElementById('dialogue-timer-wrap').classList.add('hidden');

        document.getElementById('tutorial-step-title').textContent = step.title;
        document.getElementById('tutorial-step-text').textContent = step.text;

        const charStyle = window.CHARACTER_STYLES[step.speaker];
        document.getElementById('speaker-name-badge').textContent = charStyle ? charStyle.name : "Lumi";
        document.getElementById('speaker-role-badge').textContent = charStyle ? charStyle.title : "";
        document.getElementById('dialogue-text-content').textContent = step.text;
        document.getElementById('body-language-cue').textContent = "💡 Tutorial Interativo • Você pode usar Controle Xbox, Gamepad ou Teclado.";
    }

    advanceTutorial() {
        window.soundSystem.playClick();
        this.tutorialIdx++;
        if (this.tutorialIdx >= window.GAME_DATA.tutorialSteps.length) {
            document.getElementById('tutorial-overlay').classList.add('hidden');
            this.unlockAchievement('first_step');
            this.enterExploreMode();
        } else {
            this.renderTutorialStep();
        }
    }

    enterExploreMode() {
        this.closeAllModals();
        this.mode = 'explore';
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('tutorial-overlay').classList.add('hidden');
        document.getElementById('dialogue-panel').classList.add('hidden');
        document.getElementById('minigame-overlay').classList.add('hidden');
        document.getElementById('stage-quickbar').classList.remove('hidden');
        window.soundSystem.startBGM('campus');
        this.renderStageQuickbar();
        this.updateHUD();
        this.saveGame();
    }

    renderStageQuickbar() {
        const bar = document.getElementById('stage-quickbar-list');
        if (!bar) return;
        bar.innerHTML = '';

        window.GAME_DATA.stages.forEach(st => {
            const isCleared = this.conqueredStages.includes(st.id);
            const attempts = this.stageAttempts[st.id] || 0;
            const btn = document.createElement('button');
            btn.className = `stage-pill-btn ${isCleared ? 'cleared' : ''}`;
            btn.innerHTML = `
                <span class="pill-lvl">Fase ${st.id}</span>
                <span class="pill-name">${st.name.split(' ')[0]}</span>
                <span class="pill-status">${isCleared ? '★ Conquistada' : (attempts >= 3 ? '💡 Mentoria Ativa' : 'Ir até lá')}</span>
            `;
            btn.addEventListener('click', () => {
                // Teleporta Kael para perto da personagem no mapa 3D e inicia ou explora
                this.world3d.player.x = st.position3D.x;
                this.world3d.player.z = st.position3D.z + 2.4;
                this.world3d.player.rotY = Math.PI;
                window.soundSystem.playClick();
                this.showSwitchToast(`📍 ${st.locationName}`, `Você caminhou até ${st.name} (${st.difficultyLabel}). Pressione [A] / [E] para conversar!`);
            });
            bar.appendChild(btn);
        });
    }

    getRecommendedStageId() {
        for (let i = 1; i <= 5; i++) {
            if (!this.conqueredStages.includes(i)) return i;
        }
        return 5;
    }

    // Inicia um encontro em tempo real com uma das 5 heroínas
    startStageEncounter(stageId) {
        const stage = window.GAME_DATA.stages.find(s => s.id === stageId);
        if (!stage) return;

        this.activeStage = stage;
        this.activeStepIdx = 0;
        this.currentAffinity = this.conqueredStages.includes(stageId) ? 55 : 30;
        this.activeBuffs = {
            shieldMistake: false,
            instantHint: false,
            slowMinigame: 1.0
        };
        this.mode = 'dialogue';
        this.awaitingNextStep = false;

        document.getElementById('stage-quickbar').classList.add('hidden');
        document.getElementById('dialogue-panel').classList.remove('hidden');
        document.getElementById('dialogue-options-container').classList.remove('hidden');
        document.getElementById('dialogue-timer-wrap').classList.remove('hidden');

        window.soundSystem.startBGM('romance');
        window.soundSystem.playSwitchSnap();

        // Se o jogador já falhou 3 vezes nesta fase, avisa que a Mentoria Psicológica está ativa!
        const attempts = this.stageAttempts[stage.id] || 0;
        if (attempts >= 3) {
            this.showSwitchToast(
                "🧠 Mentoria Psicológica Ativada!",
                `Como você já tentou ${attempts} vezes, a Lumi destacou a aplicação psicológica ideal para você!`
            );
        }

        this.loadDialogueStep(0);
    }

    loadDialogueStep(stepIdx) {
        if (!this.activeStage) return;
        const step = this.activeStage.steps[stepIdx];
        if (!step) {
            // Concluiu as 3 etapas de diálogo -> Inicia o Minigame em Tempo Real de Sintonia do Coração!
            this.startHeartHarmonyMinigame();
            return;
        }

        this.activeStepIdx = stepIdx;
        this.awaitingNextStep = false;
        this.selectedOptionIdx = 0;

        // Tempo real ajustado pela Sensibilidade do jogador
        const bonusSec = Math.floor((this.stats.sensibilidade - 10) * 0.3);
        this.stepMaxTime = step.timeLimit + Math.max(0, bonusSec);
        this.stepTimer = this.stepMaxTime;

        this.portrait.setCharacter(this.activeStage.charId, step.expression);

        document.getElementById('speaker-name-badge').textContent = this.activeStage.name;
        document.getElementById('speaker-role-badge').textContent = `${this.activeStage.difficultyLabel} • Etapa ${step.stepNum}/3`;
        document.getElementById('body-language-cue').textContent = `👁️ ${step.bodyCue}`;
        document.getElementById('dialogue-text-content').textContent = `"${step.dialogue}"`;
        document.getElementById('psych-ref-banner').textContent = `📚 Referência: ${this.activeStage.psychBook}`;

        this.updateAffinityBarUI();
        this.renderDialogueOptions(step);
    }

    renderDialogueOptions(step) {
        const container = document.getElementById('dialogue-options-container');
        container.innerHTML = '';

        const attempts = this.stageAttempts[this.activeStage.id] || 0;
        const showPsychGuide = (attempts >= 3) || this.activeBuffs.instantHint;

        step.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = `dialogue-opt-btn ${idx === this.selectedOptionIdx ? 'focused' : ''}`;
            if (showPsychGuide && opt.quality === 'best') {
                btn.classList.add('psych-recommended');
            }

            const keyBadges = ['[1 / X]', '[2 / A]', '[3 / B]'];
            const hintTag = (showPsychGuide && opt.quality === 'best')
                ? `<span class="psych-hint-pill">✨ Aplicação Psicológica Recomendada</span>`
                : '';

            btn.innerHTML = `
                <span class="opt-key-badge">${keyBadges[idx] || `[${idx + 1}]`}</span>
                <span class="opt-text">${opt.text} ${hintTag}</span>
            `;

            btn.addEventListener('click', () => this.selectDialogueOption(idx));
            container.appendChild(btn);
        });
    }

    selectDialogueOption(idx) {
        if (this.mode !== 'dialogue' || this.awaitingNextStep || !this.activeStage) return;
        const step = this.activeStage.steps[this.activeStepIdx];
        if (!step || !step.options[idx]) return;

        const chosen = step.options[idx];
        this.awaitingNextStep = true;

        let delta = chosen.affinityDelta;
        // Se tiver Escudo de Gentileza (Macarons) e escolheu errado, protege!
        if (delta < 0 && this.activeBuffs.shieldMistake) {
            this.activeBuffs.shieldMistake = false;
            delta = 10;
            this.showSwitchToast("🧁 Escudo de Gentileza Ativado!", "Os Macarons Sakura suavizaram o clima e evitaram a perda de afinidade!");
        }

        // Bônus de Carisma/Empatia do jogador
        if (delta > 0) {
            delta += Math.floor((this.stats.empatia - 10) * 0.5);
            window.soundSystem.playHeartUp();
        } else {
            window.soundSystem.playHeartBreak();
        }

        this.currentAffinity = Math.max(0, Math.min(100, this.currentAffinity + delta));
        this.updateAffinityBarUI();

        // Expressão da personagem reage imediatamente em tempo real
        if (chosen.quality === 'best') {
            this.portrait.setCharacter(this.activeStage.charId, 'happy');
        } else if (chosen.quality === 'wrong') {
            this.portrait.setCharacter(this.activeStage.charId, 'sad');
        } else {
            this.portrait.setCharacter(this.activeStage.charId, 'shy');
        }

        document.getElementById('body-language-cue').textContent = `🧠 Análise Psicológica: ${chosen.feedback}`;
        document.getElementById('dialogue-text-content').textContent = `"${chosen.reply}"`;

        const container = document.getElementById('dialogue-options-container');
        container.innerHTML = '';

        // Verificar se a afinidade caiu demais ou se foi uma escolha ruim no final
        const nextBtn = document.createElement('button');
        nextBtn.className = 'dialogue-opt-btn focused continue-btn';

        if (this.currentAffinity < 20) {
            nextBtn.innerHTML = `<span class="opt-key-badge">[A / E]</span> <span class="opt-text">💔 A sintonia emocional se fechou... Tentar novamente</span>`;
            nextBtn.addEventListener('click', () => this.handleStageAttemptFailure("A afinidade emocional caiu abaixo do mínimo necessário."));
        } else if (this.activeStepIdx === 2 && this.currentAffinity < 70) {
            nextBtn.innerHTML = `<span class="opt-key-badge">[A / E]</span> <span class="opt-text">⚠️ Afinidade insuficiente (${this.currentAffinity}% / 70% necessários)... Recomeçar tentativa</span>`;
            nextBtn.addEventListener('click', () => this.handleStageAttemptFailure("Para abrir a Lacuna do Coração, alcance pelo menos 70% de Afinidade nas 3 etapas."));
        } else {
            const label = this.activeStepIdx < 2
                ? "Continuar para a próxima etapa em tempo real ➔"
                : "💖 Iniciar Sintonia do Coração em Tempo Real! ➔";
            nextBtn.innerHTML = `<span class="opt-key-badge">[A / E]</span> <span class="opt-text">${label}</span>`;
            nextBtn.addEventListener('click', () => {
                window.soundSystem.playConfirm();
                this.loadDialogueStep(this.activeStepIdx + 1);
            });
        }
        container.appendChild(nextBtn);
    }

    handleStageAttemptFailure(reasonMsg) {
        if (!this.activeStage) return;
        const stId = this.activeStage.id;
        this.stageAttempts[stId] = (this.stageAttempts[stId] || 0) + 1;
        const count = this.stageAttempts[stId];
        this.saveGame();

        window.soundSystem.playCancel();

        // REQUISITO 8: "Caso o jogador não consiga nas três primeiras tentativas o game vai orientando sobre o conceito e como pode ser aplicado."
        if (count >= 3) {
            this.mentorGuidedStages[stId] = true;
            this.unlockAchievement('mentor_student');
            this.openPsychologyMentorModal(true, reasonMsg, count);
        } else {
            this.showSwitchToast(
                `Tentativa ${count}/3 na Fase ${stId}`,
                `${reasonMsg} (Dica: Se não conseguir em 3 tentativas, a Mentoria Psicológica completa será ativada!)`
            );
            this.startStageEncounter(stId);
        }
    }

    // ========================================================================
    // MINIGAME EM TEMPO REAL: SINTONIA DO CORAÇÃO (RHYTHM / EMPATHY RADAR)
    // ========================================================================
    startHeartHarmonyMinigame() {
        if (!this.activeStage) return;
        this.mode = 'minigame';
        const cfg = this.activeStage.minigameConfig;
        const attempts = this.stageAttempts[this.activeStage.id] || 0;

        // Se o jogador já passou de 3 tentativas ou usou o Reloginho de Fluxo, facilita o minigame!
        const mentorEase = attempts >= 3 ? 0.72 : 1.0;
        const speedMult = this.activeBuffs.slowMinigame * mentorEase;

        this.minigame = {
            active: true,
            playerPos: 50,
            targetPos: 50,
            targetVel: 26 * cfg.speed * speedMult,
            zoneWidth: cfg.targetZoneWidth + (attempts >= 3 ? 8 : 0),
            harmonyProgress: 38,
            timeLeft: cfg.durationSec + (attempts >= 3 ? 4 : 0),
            maxTime: cfg.durationSec + (attempts >= 3 ? 4 : 0)
        };

        document.getElementById('dialogue-panel').classList.add('hidden');
        document.getElementById('minigame-overlay').classList.remove('hidden');
        document.getElementById('minigame-stage-title').textContent =
            `💖 Sintonia em Tempo Real: ${this.activeStage.name} (${this.activeStage.heartGapTitle})`;
        document.getElementById('minigame-psych-tip').textContent =
            attempts >= 3
                ? `💡 Mentoria Ativa: Zona de Empatia ampliada! Mantenha o Pulso Azul dentro da Frequência Rosa usando Analógico/Setas ou Segurando [A]/[Espaço]!`
                : `Mantenha seu Pulso de Empatia sincronizado com o coração de ${this.activeStage.name.split(' ')[0]} antes do tempo acabar!`;

        window.soundSystem.startBGM('challenge');
    }

    updateMinigame(dt, inputState) {
        if (this.mode !== 'minigame' || !this.minigame.active) return;
        const mg = this.minigame;

        mg.timeLeft -= dt;

        // Movimento do Alvo (Frequência Emocional da Heroína)
        mg.targetPos += mg.targetVel * dt;
        if (mg.targetPos > 88) {
            mg.targetPos = 88;
            mg.targetVel = -Math.abs(mg.targetVel) * (0.85 + Math.random() * 0.35);
        } else if (mg.targetPos < 12) {
            mg.targetPos = 12;
            mg.targetVel = Math.abs(mg.targetVel) * (0.85 + Math.random() * 0.35);
        }
        if (Math.random() < 0.025) {
            mg.targetVel = -mg.targetVel;
        }

        // Controle do Jogador em Tempo Real (Analógico Esquerdo / Setas Esquerda-Direita OU Segurar A/Espaço)
        let moveDir = inputState.moveX;
        if (Math.abs(moveDir) < 0.1) {
            // Se não estiver usando analógico horizontal, segurar A/Espaço sobe e soltar desce (estilo pesca/sintonia clássica!)
            if (inputState.btnA) {
                moveDir = 0.85;
            } else if (mg.playerPos > mg.targetPos + 2) {
                moveDir = -0.35;
            }
        }
        mg.playerPos = Math.max(5, Math.min(95, mg.playerPos + moveDir * 68 * dt));

        // Verificar se o Pulso do Jogador está dentro da Zona de Empatia
        const dist = Math.abs(mg.playerPos - mg.targetPos);
        const insideZone = dist <= (mg.zoneWidth * 0.55);

        if (insideZone) {
            mg.harmonyProgress = Math.min(100, mg.harmonyProgress + 21 * dt);
        } else {
            mg.harmonyProgress = Math.max(0, mg.harmonyProgress - 11 * dt);
        }

        // Atualizar DOM do Minigame
        const targetEl = document.getElementById('mg-target-zone');
        const playerEl = document.getElementById('mg-player-cursor');
        const fillEl = document.getElementById('mg-harmony-fill');
        const pctEl = document.getElementById('mg-harmony-pct');
        const timeEl = document.getElementById('mg-time-left');

        if (targetEl && playerEl) {
            targetEl.style.width = `${mg.zoneWidth}%`;
            targetEl.style.left = `${mg.targetPos - mg.zoneWidth / 2}%`;
            targetEl.classList.toggle('synced', insideZone);
            playerEl.style.left = `${mg.playerPos}%`;
        }
        if (fillEl) fillEl.style.width = `${mg.harmonyProgress}%`;
        if (pctEl) pctEl.textContent = `${Math.round(mg.harmonyProgress)}%`;
        if (timeEl) timeEl.textContent = `${Math.max(0, mg.timeLeft).toFixed(1)}s`;

        // Checar Vitória ou Fim do Tempo
        if (mg.harmonyProgress >= 100) {
            mg.active = false;
            if (mg.timeLeft > mg.maxTime * 0.35) {
                this.unlockAchievement('harmony_ace');
            }
            this.completeStageConquest();
        } else if (mg.timeLeft <= 0) {
            mg.active = false;
            if (mg.harmonyProgress >= 80) {
                this.completeStageConquest();
            } else {
                document.getElementById('minigame-overlay').classList.add('hidden');
                this.handleStageAttemptFailure("A Sintonia do Coração em tempo real não atingiu 80% antes do tempo esgotar.");
            }
        }
    }

    completeStageConquest() {
        document.getElementById('minigame-overlay').classList.add('hidden');
        const stage = this.activeStage;
        if (!stage) return;

        window.soundSystem.playStageClear();

        if (!this.conqueredStages.includes(stage.id)) {
            this.conqueredStages.push(stage.id);
        }

        // Recompensas de progressão
        this.stats.level = Math.max(this.stats.level, this.conqueredStages.length + 1);
        this.stats.xp += 150 * stage.id;
        this.stats.coins += 65 + stage.id * 15;
        this.stats.empatia += 4;
        this.stats.carisma += 3;
        this.stats.intelecto += 3;
        this.stats.sensibilidade += 3;

        // Troféus por Fase
        const stageAchMap = {
            1: 'clear_ayumi',
            2: 'clear_mio',
            3: 'clear_shiori',
            4: 'clear_karin',
            5: 'clear_reina'
        };
        if (stageAchMap[stage.id]) {
            this.unlockAchievement(stageAchMap[stage.id]);
        }
        if ((this.stageAttempts[stage.id] || 0) === 0) {
            this.unlockAchievement('first_try_pro');
        }
        if (this.conqueredStages.length >= 5) {
            this.unlockAchievement('true_master');
        }

        this.saveGame();
        this.updateHUD();
        this.showVictoryCelebrationModal(stage);
    }

    showVictoryCelebrationModal(stage) {
        this.mode = 'modal';
        const modal = document.getElementById('victory-modal');
        modal.classList.remove('hidden');

        const allDone = this.conqueredStages.length >= 5;
        document.getElementById('victory-title').textContent = allDone
            ? `🏆 FINAL VERDADEIRO: Todas as 5 Lacunas do Coração Curadas!`
            : `💖 Conquista Concluída: ${stage.name}!`;

        document.getElementById('victory-subtitle').textContent =
            `Fase ${stage.id} (${stage.heartGapTitle}) • Lição Dominada: ${stage.psychSummary}`;

        document.getElementById('victory-psych-lesson').textContent =
            `Fundamento Psicológico Aplicado: ${stage.mentorGuide.conceptTitle}.\n\n` +
            (allDone
                ? `Parabéns, Kael! Com a ajuda de Lumi e dos livros de Psicologia e Empatia, você trouxe harmonia para Ayumi, Mio, Shiori, Karin e Reina na Academia Nova Aurora! Você pode continuar explorando o campus 3D em Modo Livre, coletando Cristais e revisitando os encontros quando quiser!`
                : `Você recebeu +${65 + stage.id * 15} Moedas Estelares e evoluiu seus atributos de Empatia, Carisma e Sensibilidade para o próximo nível de dificuldade!`);

        document.getElementById('btn-victory-continue').onclick = () => {
            modal.classList.add('hidden');
            this.enterExploreMode();
        };
    }

    // ========================================================================
    // SISTEMA DE MENTORIA PSICOLÓGICA (ACIONADO APÓS 3 TENTATIVAS OU BOTÃO Y/P)
    // ========================================================================
    openPsychologyMentorModal(autoTriggered = false, failReason = "", attemptCount = 0) {
        window.soundSystem.playMentorChime();
        this.previousMode = this.mode;
        this.mode = 'modal';

        const stage = this.activeStage || window.GAME_DATA.stages.find(s => s.id === this.getRecommendedStageId()) || window.GAME_DATA.stages[0];
        const guide = stage.mentorGuide;

        const modal = document.getElementById('mentor-modal');
        modal.classList.remove('hidden');

        const banner = document.getElementById('mentor-trigger-banner');
        if (autoTriggered) {
            banner.className = 'mentor-alert-banner auto-triggered';
            banner.innerHTML = `✨ <strong>Mentoria Automática da 3ª Tentativa (${attemptCount} tentativas):</strong> ${failReason}<br>Não desanime! Veja abaixo o fundamento psicológico exato e como aplicá-lo agora com destaque visual nas opções!`;
        } else {
            banner.className = 'mentor-alert-banner manual';
            banner.innerHTML = `🧠 <strong>Consultoria Psicológica do PDSA • Fase ${stage.id}: ${stage.name}</strong>`;
        }

        document.getElementById('mentor-book-ref').textContent = `📚 Obra de Referência: ${stage.psychBook}`;
        document.getElementById('mentor-concept-title').textContent = guide.conceptTitle;
        document.getElementById('mentor-why-failed').textContent = guide.whyFailed;
        document.getElementById('mentor-how-apply').textContent = guide.howToApply;

        const resumeBtn = document.getElementById('btn-mentor-apply-now');
        resumeBtn.onclick = () => {
            modal.classList.add('hidden');
            if (autoTriggered) {
                this.startStageEncounter(stage.id);
            } else {
                this.mode = this.previousMode === 'modal' ? 'explore' : this.previousMode;
                if (this.mode === 'dialogue') {
                    this.renderDialogueOptions(this.activeStage.steps[this.activeStepIdx]);
                }
            }
        };
    }

    // ========================================================================
    // MOCHILA & LOJA DE ITENS FACILITADORES [X / Tecla I]
    // ========================================================================
    openItemsModal() {
        window.soundSystem.playClick();
        if (this.mode !== 'modal') this.previousMode = this.mode;
        this.mode = 'modal';

        const modal = document.getElementById('items-modal');
        modal.classList.remove('hidden');
        document.getElementById('shop-coins-display').textContent = `🪙 ${this.stats.coins} Moedas Estelares`;

        const list = document.getElementById('items-grid-container');
        list.innerHTML = '';

        window.GAME_DATA.items.forEach(item => {
            const owned = this.inventory[item.id] || 0;
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-card-header">
                    <span class="item-icon">${item.icon}</span>
                    <div>
                        <h4>${item.name}</h4>
                        <span class="item-owned-badge">Na Mochila: ${owned}</span>
                    </div>
                </div>
                <p class="item-desc">${item.desc}</p>
                <p class="item-psych">🧠 ${item.psychNote}</p>
                <div class="item-actions">
                    <button class="btn-buy-item" ${this.stats.coins < item.cost ? 'disabled' : ''}>
                        Comprar (🪙 ${item.cost})
                    </button>
                    <button class="btn-use-item" ${owned <= 0 || this.previousMode !== 'dialogue' ? 'disabled' : ''}>
                        ${this.previousMode === 'dialogue' ? 'Usar Agora no Encontro!' : 'Use em um Encontro'}
                    </button>
                </div>
            `;

            card.querySelector('.btn-buy-item').addEventListener('click', () => {
                if (this.stats.coins >= item.cost) {
                    this.stats.coins -= item.cost;
                    this.inventory[item.id] = (this.inventory[item.id] || 0) + 1;
                    window.soundSystem.playPickup();
                    this.updateHUD();
                    this.saveGame();
                    this.openItemsModal();
                    this.showSwitchToast(`🛍️ Item Adquirido: ${item.name}`, "Guardado na sua Mochila [X / I]!");
                }
            });

            card.querySelector('.btn-use-item').addEventListener('click', () => {
                if ((this.inventory[item.id] || 0) > 0 && this.previousMode === 'dialogue') {
                    this.useFacilitatingItem(item);
                }
            });

            list.appendChild(card);
        });
    }

    useFacilitatingItem(item) {
        this.inventory[item.id]--;
        this.stats.itemsUsedCount++;
        if (this.stats.itemsUsedCount >= 3) {
            this.unlockAchievement('gift_master');
        }

        window.soundSystem.playHeartUp();

        if (item.effectType === 'timer_boost') {
            this.stepTimer = Math.min(this.stepMaxTime + 12, this.stepTimer + item.effectValue);
            this.activeBuffs.slowMinigame = 0.8;
            this.showSwitchToast(`${item.icon} ${item.name} Usado!`, "+8 segundos no relógio e ritmo suavizado!");
        } else if (item.effectType === 'affinity_boost') {
            const isFav = this.activeStage && this.activeStage.id === item.targetStage;
            const boost = isFav ? item.effectValue : 15;
            this.currentAffinity = Math.min(100, this.currentAffinity + boost);
            this.updateAffinityBarUI();
            if (this.activeStage) {
                this.portrait.setCharacter(this.activeStage.charId, 'happy');
            }
            this.showSwitchToast(`${item.icon} Presente Entregue!`, `+${boost}% de Afinidade imediata!`);
        } else if (item.effectType === 'shield_mistake') {
            this.activeBuffs.shieldMistake = true;
            this.currentAffinity = Math.min(100, this.currentAffinity + 20);
            this.updateAffinityBarUI();
            this.showSwitchToast(`${item.icon} Escudo de Gentileza!`, "+20% Afinidade e proteção contra 1 gafe!");
        } else if (item.effectType === 'instant_hint') {
            this.activeBuffs.instantHint = true;
            this.showSwitchToast(`${item.icon} Lente de Gottman Ativa!`, "A melhor resposta psicológica foi destacada na tela!");
        } else if (item.effectType === 'slow_minigame') {
            this.activeBuffs.slowMinigame = item.effectValue;
            this.showSwitchToast(`${item.icon} Fluxo Temporal Ativo!`, "O desafio de Sintonia ficará 35% mais calmo!");
        }

        this.closeAllModals();
        if (this.mode === 'dialogue' && this.activeStage) {
            this.renderDialogueOptions(this.activeStage.steps[this.activeStepIdx]);
        }
        this.saveGame();
    }

    // ========================================================================
    // COMPÊNDIO DE LIVROS DE PSICOLOGIA, GAME DESIGN E TROFÉUS [START / H]
    // ========================================================================
    openCompendiumModal() {
        window.soundSystem.playClick();
        if (this.mode !== 'modal') this.previousMode = this.mode;
        this.mode = 'modal';

        const modal = document.getElementById('compendium-modal');
        modal.classList.remove('hidden');

        // Renderizar Livros
        const booksContainer = document.getElementById('compendium-books-list');
        booksContainer.innerHTML = '';
        window.GAME_DATA.booksLibrary.forEach(b => {
            const div = document.createElement('div');
            div.className = 'book-entry-card';
            div.innerHTML = `
                <span class="book-cat-badge">${b.category}</span>
                <h4>📖 ${b.title}</h4>
                <div class="book-principle">Princípio-Chave: ${b.principle}</div>
                <p>${b.summary}</p>
            `;
            booksContainer.appendChild(div);
        });

        // Renderizar Troféus
        const achContainer = document.getElementById('compendium-achievements-list');
        achContainer.innerHTML = '';
        window.GAME_DATA.achievements.forEach(ach => {
            const unlocked = this.unlockedAchievements.includes(ach.id);
            const div = document.createElement('div');
            div.className = `ach-card ${unlocked ? 'unlocked' : 'locked'}`;
            div.innerHTML = `
                <span class="ach-icon">${unlocked ? ach.icon : '🔒'}</span>
                <div>
                    <h5>${ach.name}</h5>
                    <p>${ach.desc}</p>
                </div>
            `;
            achContainer.appendChild(div);
        });
    }

    closeAllModals() {
        document.querySelectorAll('.switch-modal-backdrop').forEach(el => el.classList.add('hidden'));
        if (this.mode === 'modal') {
            this.mode = this.previousMode || 'explore';
        }
    }

    handleInputAction(action) {
        if (this.mode === 'title') {
            if (action === 'confirm') {
                window.soundSystem.playSwitchSnap();
                window.soundSystem.startBGM('campus');
                this.startGameFlow();
            }
            return;
        }

        if (this.mode === 'tutorial') {
            if (action === 'confirm') this.advanceTutorial();
            else if (action === 'cancel') {
                document.getElementById('tutorial-overlay').classList.add('hidden');
                this.unlockAchievement('first_step');
                this.enterExploreMode();
            }
            return;
        }

        if (this.mode === 'modal') {
            if (action === 'cancel' || action === 'confirm') {
                this.closeAllModals();
            }
            return;
        }

        if (this.mode === 'explore') {
            if (action === 'confirm') {
                const target = this.world3d.nearbyTarget;
                if (target && target.type === 'npc') {
                    this.startStageEncounter(target.data.stageId);
                } else if (target && target.type === 'shop') {
                    this.openItemsModal();
                } else {
                    // Se apertar confirmar longe de alguém, abre o encontro da fase recomendada ou guia o jogador
                    const recId = this.getRecommendedStageId();
                    const st = window.GAME_DATA.stages.find(s => s.id === recId);
                    if (st) {
                        this.showSwitchToast(
                            `🧭 Radar PDSA: ${st.name}`,
                            `Aproxime-se de ${st.name} (${st.locationName}) ou clique no botão dela na barra inferior!`
                        );
                    }
                }
            } else if (action === 'items') {
                this.openItemsModal();
            } else if (action === 'psych') {
                this.openPsychologyMentorModal(false);
            } else if (action === 'menu') {
                this.openCompendiumModal();
            }
            return;
        }

        if (this.mode === 'dialogue') {
            if (this.awaitingNextStep) {
                if (action === 'confirm') {
                    const contBtn = document.querySelector('#dialogue-options-container .continue-btn');
                    if (contBtn) contBtn.click();
                }
                return;
            }

            if (action === 'nav_up') {
                this.selectedOptionIdx = (this.selectedOptionIdx + 2) % 3;
                this.highlightSelectedDialogueOption();
                window.soundSystem.playClick();
            } else if (action === 'nav_down') {
                this.selectedOptionIdx = (this.selectedOptionIdx + 1) % 3;
                this.highlightSelectedDialogueOption();
                window.soundSystem.playClick();
            } else if (action === 'confirm') {
                this.selectDialogueOption(this.selectedOptionIdx);
            } else if (action === 'choice_0') {
                this.selectDialogueOption(0);
            } else if (action === 'choice_1') {
                this.selectDialogueOption(1);
            } else if (action === 'choice_2') {
                this.selectDialogueOption(2);
            } else if (action === 'items') {
                this.openItemsModal();
            } else if (action === 'psych') {
                this.openPsychologyMentorModal(false);
            } else if (action === 'cancel') {
                this.enterExploreMode();
            }
        }
    }

    highlightSelectedDialogueOption() {
        const btns = document.querySelectorAll('#dialogue-options-container .dialogue-opt-btn');
        btns.forEach((b, idx) => {
            b.classList.toggle('focused', idx === this.selectedOptionIdx);
        });
    }

    updateAffinityBarUI() {
        const fill = document.getElementById('dialogue-affinity-fill');
        const label = document.getElementById('dialogue-affinity-pct');
        if (fill) fill.style.width = `${this.currentAffinity}%`;
        if (label) label.textContent = `${this.currentAffinity}%`;
    }

    updateHUD() {
        document.getElementById('hud-level').textContent = `Nv. ${this.stats.level}`;
        document.getElementById('hud-coins').textContent = `🪙 ${this.stats.coins}`;
        document.getElementById('hud-empatia').textContent = `❤️ Empatia ${this.stats.empatia}`;
        document.getElementById('hud-carisma').textContent = `✨ Carisma ${this.stats.carisma}`;
        document.getElementById('hud-progress').textContent = `🌸 Conquistas: ${this.conqueredStages.length}/5`;
    }

    unlockAchievement(achId) {
        if (this.unlockedAchievements.includes(achId)) return;
        this.unlockedAchievements.push(achId);
        const ach = window.GAME_DATA.achievements.find(a => a.id === achId);
        if (ach) {
            this.showSwitchToast(`🏆 Troféu Desbloqueado: ${ach.name}`, ach.desc);
        }
        this.saveGame();
    }

    showSwitchToast(title, body) {
        const container = document.getElementById('switch-toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'switch-toast';
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-body">${body}</div>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 4200);
    }

    saveGame() {
        try {
            const payload = {
                stats: this.stats,
                inventory: this.inventory,
                conqueredStages: this.conqueredStages,
                stageAttempts: this.stageAttempts,
                unlockedAchievements: this.unlockedAchievements
            };
            localStorage.setItem('coracoes_em_orbita_save_v1', JSON.stringify(payload));
        } catch (e) {
            // Ignora erros de modo privado do navegador
        }
    }

    loadSave() {
        try {
            const raw = localStorage.getItem('coracoes_em_orbita_save_v1');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.stats) Object.assign(this.stats, data.stats);
                if (data.inventory) Object.assign(this.inventory, data.inventory);
                if (Array.isArray(data.conqueredStages)) this.conqueredStages = data.conqueredStages;
                if (data.stageAttempts) Object.assign(this.stageAttempts, data.stageAttempts);
                if (Array.isArray(data.unlockedAchievements)) this.unlockedAchievements = data.unlockedAchievements;

                const contBtn = document.getElementById('btn-continue-game');
                if (contBtn && this.conqueredStages.length > 0) {
                    contBtn.classList.remove('hidden');
                    contBtn.textContent = `Continuar Jogo Salvo (${this.conqueredStages.length}/5 Fases)`;
                }
            }
        } catch (e) {}
    }

    // Loop Principal em Tempo Real (60 FPS)
    gameLoop(now) {
        const dt = Math.min(0.1, (now - this.lastFrameTime) / 1000);
        this.lastFrameTime = now;

        const inputState = this.input.poll();

        // 1. Atualizar Mundo 3D em Tempo Real
        this.world3d.update(dt, inputState, {
            mode: this.mode,
            conqueredStages: this.conqueredStages,
            currentRecommendedStage: this.getRecommendedStageId(),
            onCrystalCollected: () => {
                this.stats.coins += 12;
                this.stats.crystalsCollected++;
                this.stats.xp += 25;
                window.soundSystem.playPickup();
                this.updateHUD();
                this.showSwitchToast("💎 Cristal Estelar Coletado!", "+12 Moedas Estelares para comprar Itens Facilitadores!");
                if (this.stats.crystalsCollected >= 15) {
                    this.unlockAchievement('collector_stars');
                }
                this.saveGame();
            }
        });

        // 2. Atualizar Etiquetas 3D Flutuantes e Prompt de Proximidade no Modo Exploração
        this.renderFloating3DLabels();

        // 3. Atualizar Retrato Anime HD e Cronômetro de Diálogo em Tempo Real
        if (this.mode === 'dialogue' || this.mode === 'tutorial') {
            this.portrait.updateAndDraw(dt);
        }

        if (this.mode === 'dialogue' && !this.awaitingNextStep) {
            this.stepTimer -= dt;
            const pct = Math.max(0, (this.stepTimer / this.stepMaxTime) * 100);
            const timerFill = document.getElementById('dialogue-timer-fill');
            const timerText = document.getElementById('dialogue-timer-sec');
            if (timerFill) timerFill.style.width = `${pct}%`;
            if (timerText) timerText.textContent = `${Math.max(0, this.stepTimer).toFixed(1)}s`;

            if (this.stepTimer <= 0) {
                // Tempo esgotou no diálogo em tempo real!
                this.awaitingNextStep = true;
                this.handleStageAttemptFailure("O tempo de resposta em tempo real esgotou e o momento de sintonia passou!");
            }
        }

        // 4. Atualizar Minigame em Tempo Real
        if (this.mode === 'minigame') {
            this.updateMinigame(dt, inputState);
        }

        // Atualizar indicador de FPS
        const fpsEl = document.getElementById('hud-fps');
        if (fpsEl) fpsEl.textContent = `${this.world3d.currentFps} FPS`;

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    renderFloating3DLabels() {
        const layer = document.getElementById('floating-labels-3d');
        const promptBanner = document.getElementById('proximity-prompt-banner');
        if (!layer) return;

        if (this.mode !== 'explore') {
            layer.innerHTML = '';
            if (promptBanner) promptBanner.classList.add('hidden');
            return;
        }

        const projections = this.world3d.getScreenProjections();
        layer.innerHTML = '';

        projections.forEach(p => {
            const isCleared = this.conqueredStages.includes(p.stageId);
            const tag = document.createElement('div');
            tag.className = `floating-npc-tag ${isCleared ? 'cleared' : ''}`;
            tag.style.left = `${p.x}px`;
            tag.style.top = `${p.y}px`;
            tag.style.borderColor = p.color;
            tag.innerHTML = `
                <div class="tag-badge" style="background:${p.color}">${isCleared ? '★ Conquistada' : p.badge}</div>
                <div class="tag-name">${p.name}</div>
            `;
            tag.addEventListener('click', () => {
                if (p.id === 'shop') {
                    this.openItemsModal();
                } else {
                    this.startStageEncounter(p.stageId);
                }
            });
            layer.appendChild(tag);
        });

        // Banner de Proximidade estilo Nintendo Switch quando perto de uma personagem ou da loja
        const near = this.world3d.nearbyTarget;
        if (near && promptBanner) {
            promptBanner.classList.remove('hidden');
            const btnLabel = this.input.getPromptLabels().confirm;
            if (near.type === 'npc') {
                const attempts = this.stageAttempts[near.data.stageId] || 0;
                const mentorBadge = attempts >= 3 ? ' • 💡 Mentoria Pronta!' : '';
                promptBanner.innerHTML = `
                    <span class="switch-btn-icon">${btnLabel}</span>
                    <span>Conversar em Tempo Real com <strong>${near.data.name}</strong> (${near.data.difficultyLabel}${mentorBadge})</span>
                `;
            } else {
                promptBanner.innerHTML = `
                    <span class="switch-btn-icon">${btnLabel}</span>
                    <span>Abrir <strong>${near.data.name}</strong> (Comprar Itens Facilitadores)</span>
                `;
            }
        } else if (promptBanner) {
            promptBanner.classList.add('hidden');
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new ConquistaGame();
});

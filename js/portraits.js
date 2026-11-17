// ============================================================================
// RENDERIZADOR DE RETRATOS ANIME HD (ESTILO KAMI NOMI ZO SHIRU SEKAI / SWITCH)
// Desenho vetorial em Canvas com alta definição, expressões e animação ao vivo
// ============================================================================

const CHARACTER_STYLES = {
    lumi: {
        name: "Lumi",
        title: "Mensageira Estelar & Mentora",
        hairColor: "#5c6bc0",
        hairDark: "#3949ab",
        hairHighlight: "#9fa8da",
        eyeColor: "#ffca28",
        skinColor: "#fff0e6",
        outfitMain: "#283593",
        outfitAccent: "#ffd54f",
        ribbonColor: "#ff4081",
        hairStyle: "twin_tails_long",
        accessory: "floating_scarf"
    },
    kael: {
        name: "Kael Takagi",
        title: "O Estrategista das Rotas",
        hairColor: "#263238",
        hairDark: "#11171a",
        hairHighlight: "#546e7a",
        eyeColor: "#29b6f6",
        skinColor: "#fce4d6",
        outfitMain: "#1e293b",
        outfitAccent: "#00c3e3",
        ribbonColor: "#00c3e3",
        hairStyle: "spiky_glasses",
        accessory: "glasses_pdsa"
    },
    ayumi: {
        name: "Ayumi Hoshino",
        title: "Fase 1 • Estrela do Atletismo",
        hairColor: "#ff7043",
        hairDark: "#d84315",
        hairHighlight: "#ffab91",
        eyeColor: "#26a69a",
        skinColor: "#ffe8d6",
        outfitMain: "#e53935",
        outfitAccent: "#ffffff",
        ribbonColor: "#ffca28",
        hairStyle: "sporty_ponytail",
        accessory: "headband"
    },
    mio: {
        name: "Mio Sakuragi",
        title: "Fase 2 • Herdeira Orgulhosa",
        hairColor: "#f48fb1",
        hairDark: "#c2185b",
        hairHighlight: "#fce4ec",
        eyeColor: "#ab47bc",
        skinColor: "#fff3eb",
        outfitMain: "#880e4f",
        outfitAccent: "#ffd54f",
        ribbonColor: "#e91e63",
        hairStyle: "noble_twintails",
        accessory: "royal_ribbons"
    },
    shiori: {
        name: "Shiori Kazama",
        title: "Fase 3 • Guardiã da Biblioteca",
        hairColor: "#4fc3f7",
        hairDark: "#0277bd",
        hairHighlight: "#b3e5fc",
        eyeColor: "#5c6bc0",
        skinColor: "#fff5f0",
        outfitMain: "#1565c0",
        outfitAccent: "#e3f2fd",
        ribbonColor: "#81d4fa",
        hairStyle: "shy_bob",
        accessory: "book_hairclip"
    },
    karin: {
        name: "Karin Minase",
        title: "Fase 4 • Idol do Clube de Música",
        hairColor: "#ffd54f",
        hairDark: "#f57f17",
        hairHighlight: "#fff9c4",
        eyeColor: "#ec407a",
        skinColor: "#fff0e5",
        outfitMain: "#ad1457",
        outfitAccent: "#00e5ff",
        ribbonColor: "#ff4081",
        hairStyle: "idol_waves",
        accessory: "star_clip"
    },
    reina: {
        name: "Reina Tsukishiro",
        title: "Fase 5 • Presidente do Conselho",
        hairColor: "#b39ddb",
        hairDark: "#4527a0",
        hairHighlight: "#ede7f6",
        eyeColor: "#ef5350",
        skinColor: "#fff6f2",
        outfitMain: "#1a237e",
        outfitAccent: "#ffd700",
        ribbonColor: "#d50000",
        hairStyle: "long_hime",
        accessory: "council_badge"
    }
};

class AnimePortraitRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.currentChar = 'lumi';
        this.expression = 'happy'; // 'normal', 'happy', 'shy', 'sad', 'surprised', 'focused'
        this.animTime = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
    }

    setCharacter(charId, expression = 'normal') {
        if (CHARACTER_STYLES[charId]) {
            this.currentChar = charId;
        }
        this.expression = expression || 'normal';
    }

    updateAndDraw(dt = 0.016) {
        if (!this.canvas || !this.ctx) return;
        this.animTime += dt;
        this.blinkTimer += dt;
        if (this.blinkTimer > 3.6) {
            this.isBlinking = true;
            if (this.blinkTimer > 3.76) {
                this.isBlinking = false;
                this.blinkTimer = Math.random() * 0.8;
            }
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = 360;
        const h = 440;
        if (this.canvas.width !== w * dpr || this.canvas.height !== h * dpr) {
            this.canvas.width = w * dpr;
            this.canvas.height = h * dpr;
        }

        const ctx = this.ctx;
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        const style = CHARACTER_STYLES[this.currentChar] || CHARACTER_STYLES.lumi;
        const breatheY = Math.sin(this.animTime * 2.4) * 3.5;

        // Aura de fundo estilo Switch / Anime
        const auraGrad = ctx.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h * 0.45, 175);
        auraGrad.addColorStop(0, style.hairHighlight + "55");
        auraGrad.addColorStop(0.6, style.ribbonColor + "22");
        auraGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.45, 175, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(w / 2, h * 0.52 + breatheY);

        // 1. Cabelo Traseiro
        this.drawBackHair(ctx, style);

        // 2. Cachecol flutuante da Lumi (inspirado em Kami Nomi)
        if (style.accessory === 'floating_scarf') {
            this.drawFloatingScarf(ctx, style);
        }

        // 3. Pescoço e Uniforme Escolar Estilo Japonês
        this.drawBodyAndOutfit(ctx, style);

        // 4. Rosto Anime
        this.drawHeadBase(ctx, style);

        // 5. Olhos Anime Expressivos + Sobrancelhas + Boca + Rubor
        this.drawFacialFeatures(ctx, style);

        // 6. Franja e Cabelo Frontal + Brilhos de Anime (Angel Ring)
        this.drawFrontHair(ctx, style);

        // 7. Acessórios Especiais (Óculos de Kael, Faixa de Ayumi, Laços de Mio, etc.)
        this.drawAccessories(ctx, style);

        // 8. Efeitos Emocionais Flutuantes (Corações, Estrelas, Gotinha)
        this.drawEmotionParticles(ctx, style);

        ctx.restore();
    }

    drawBackHair(ctx, style) {
        ctx.save();
        const hairGrad = ctx.createLinearGradient(0, -140, 0, 160);
        hairGrad.addColorStop(0, style.hairColor);
        hairGrad.addColorStop(1, style.hairDark);
        ctx.fillStyle = hairGrad;

        if (style.hairStyle === 'twin_tails_long' || style.hairStyle === 'noble_twintails') {
            // Maria-chiquinhas longas esvoaçantes
            const sway = Math.sin(this.animTime * 2) * 5;
            [-1, 1].forEach(dir => {
                ctx.beginPath();
                ctx.moveTo(dir * 55, -75);
                ctx.bezierCurveTo(dir * 130, -60, dir * (145 + sway), 60, dir * (105 + sway), 175);
                ctx.bezierCurveTo(dir * 75, 145, dir * 75, 30, dir * 50, -35);
                ctx.closePath();
                ctx.fill();
            });
        } else if (style.hairStyle === 'sporty_ponytail') {
            const sway = Math.sin(this.animTime * 3) * 6;
            ctx.beginPath();
            ctx.moveTo(25, -105);
            ctx.bezierCurveTo(115, -120, 135 + sway, -10, 95 + sway, 85);
            ctx.bezierCurveTo(65, 50, 55, -30, 15, -75);
            ctx.closePath();
            ctx.fill();
        } else if (style.hairStyle === 'long_hime' || style.hairStyle === 'idol_waves') {
            ctx.beginPath();
            ctx.moveTo(-78, -80);
            ctx.bezierCurveTo(-110, 20, -105, 130, -68, 185);
            ctx.lineTo(68, 185);
            ctx.bezierCurveTo(105, 130, 110, 20, 78, -80);
            ctx.closePath();
            ctx.fill();
        }

        // Base da nuca
        ctx.beginPath();
        ctx.arc(0, -55, 76, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawFloatingScarf(ctx, style) {
        ctx.save();
        const wave = Math.sin(this.animTime * 3.2) * 8;
        ctx.strokeStyle = "#f8bbd0";
        ctx.lineWidth = 18;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-45, 35);
        ctx.bezierCurveTo(-125, 10 + wave, -145, -55 - wave, -110, -110 + wave);
        ctx.moveTo(45, 35);
        ctx.bezierCurveTo(125, 10 - wave, 145, -55 + wave, 110, -110 - wave);
        ctx.stroke();

        ctx.strokeStyle = "#ffd54f";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }

    drawBodyAndOutfit(ctx, style) {
        ctx.save();
        // Pescoço e sombra
        ctx.fillStyle = style.skinColor;
        ctx.fillRect(-18, 12, 36, 42);
        ctx.fillStyle = "rgba(180, 110, 90, 0.22)";
        ctx.beginPath();
        ctx.ellipse(0, 20, 18, 10, 0, 0, Math.PI);
        ctx.fill();

        // Ombros / Blazer Escolar Japonês (Academia Nova Aurora)
        const bodyGrad = ctx.createLinearGradient(0, 42, 0, 210);
        bodyGrad.addColorStop(0, style.outfitMain);
        bodyGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = bodyGrad;

        ctx.beginPath();
        ctx.moveTo(-30, 40);
        ctx.quadraticCurveTo(-95, 52, -108, 195);
        ctx.lineTo(108, 195);
        ctx.quadraticCurveTo(95, 52, 30, 40);
        ctx.closePath();
        ctx.fill();

        // Gola Marinheiro / Camisa Branca Central
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-28, 40);
        ctx.lineTo(0, 105);
        ctx.lineTo(28, 40);
        ctx.closePath();
        ctx.fill();

        // Detalhe da Gola (Bordas Coloridas)
        ctx.strokeStyle = style.outfitAccent;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-48, 46);
        ctx.lineTo(0, 112);
        ctx.lineTo(48, 46);
        ctx.stroke();

        // Laço ou Gravata no peito
        ctx.fillStyle = style.ribbonColor;
        ctx.beginPath();
        ctx.moveTo(0, 74);
        ctx.lineTo(-24, 62);
        ctx.lineTo(-20, 88);
        ctx.closePath();
        ctx.moveTo(0, 74);
        ctx.lineTo(24, 62);
        ctx.lineTo(20, 88);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 75, 7, 0, Math.PI * 2);
        ctx.fillStyle = style.outfitAccent;
        ctx.fill();
        ctx.restore();
    }

    drawHeadBase(ctx, style) {
        ctx.save();
        ctx.fillStyle = style.skinColor;
        ctx.beginPath();
        ctx.moveTo(-64, -65);
        ctx.bezierCurveTo(-66, -10, -48, 20, 0, 32);
        ctx.bezierCurveTo(48, 20, 66, -10, 64, -65);
        ctx.bezierCurveTo(62, -125, -62, -125, -64, -65);
        ctx.closePath();
        ctx.fill();

        // Contorno sutil do queixo estilo anime
        ctx.strokeStyle = "rgba(140, 85, 70, 0.35)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
    }

    drawFacialFeatures(ctx, style) {
        ctx.save();

        // Rubor nas bochechas (mais forte quando tímida ou feliz)
        const blushAlpha = (this.expression === 'shy' || this.expression === 'happy') ? 0.45 : 0.18;
        ctx.fillStyle = `rgba(255, 105, 135, ${blushAlpha})`;
        [-34, 34].forEach(x => {
            ctx.beginPath();
            ctx.ellipse(x, -16, 14, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        if (this.expression === 'shy') {
            // Tracinhos de rubor estilo anime
            ctx.strokeStyle = "rgba(233, 30, 99, 0.5)";
            ctx.lineWidth = 1.5;
            [-38, -32, -26, 26, 32, 38].forEach(x => {
                ctx.beginPath();
                ctx.moveTo(x, -19);
                ctx.lineTo(x - 3, -12);
                ctx.stroke();
            });
        }

        // Olhos Anime
        [-28, 28].forEach(x => {
            ctx.save();
            ctx.translate(x, -34);

            if (this.isBlinking || (this.expression === 'happy' && Math.sin(this.animTime * 2) > 0.6)) {
                // Olho sorrindo/fechado
                ctx.strokeStyle = "#2d1e18";
                ctx.lineWidth = 3.2;
                ctx.beginPath();
                ctx.arc(0, 2, 13, Math.PI * 1.1, Math.PI * 1.9);
                ctx.stroke();
            } else {
                // Esclera branca
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(0, 0, 15, 17, 0, 0, Math.PI * 2);
                ctx.fill();

                // Íris rica com gradiente
                const eyeGrad = ctx.createLinearGradient(0, -14, 0, 14);
                eyeGrad.addColorStop(0, "#1a1a2e");
                eyeGrad.addColorStop(0.45, style.eyeColor);
                eyeGrad.addColorStop(1, "#ffffff");
                ctx.fillStyle = eyeGrad;
                ctx.beginPath();
                ctx.ellipse(0, 1, 11.5, 13.5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Pupila
                ctx.fillStyle = "#1a1a2e";
                ctx.beginPath();
                ctx.arc(0, 1, 5, 0, Math.PI * 2);
                ctx.fill();

                // Brilhos grandes de anime nos olhos
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(-4.5, -5, 4.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(4.5, 5.5, 2.2, 0, Math.PI * 2);
                ctx.fill();

                // Cílios superiores grossos
                ctx.strokeStyle = "#1e1410";
                ctx.lineWidth = 3.8;
                ctx.beginPath();
                ctx.arc(0, -1, 15, Math.PI * 1.08, Math.PI * 1.92);
                ctx.stroke();
            }

            // Sobrancelhas expressivas
            ctx.strokeStyle = style.hairDark;
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            if (this.expression === 'sad' || this.expression === 'shy') {
                const dir = x < 0 ? -1 : 1;
                ctx.moveTo(-12, -22 + dir * 3);
                ctx.quadraticCurveTo(0, -25, 12, -26 - dir * 2);
            } else if (this.expression === 'focused') {
                const dir = x < 0 ? 1 : -1;
                ctx.moveTo(-12, -25 - dir * 3);
                ctx.lineTo(12, -21 + dir * 3);
            } else {
                ctx.moveTo(-13, -22);
                ctx.quadraticCurveTo(0, -27, 13, -22);
            }
            ctx.stroke();
            ctx.restore();
        });

        // Nariz delicado de anime
        ctx.fillStyle = "rgba(160, 95, 80, 0.45)";
        ctx.beginPath();
        ctx.arc(0, -14, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Boca de acordo com a expressão
        ctx.strokeStyle = "#8d493a";
        ctx.lineWidth = 2.2;
        ctx.fillStyle = "#f06292";
        ctx.beginPath();
        if (this.expression === 'happy') {
            ctx.arc(0, 4, 9, 0, Math.PI);
            ctx.fill();
            ctx.stroke();
        } else if (this.expression === 'surprised') {
            ctx.ellipse(0, 6, 6, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (this.expression === 'sad') {
            ctx.arc(0, 12, 8, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
        } else if (this.expression === 'shy') {
            ctx.moveTo(-7, 7);
            ctx.quadraticCurveTo(-3, 4, 0, 7);
            ctx.quadraticCurveTo(3, 4, 7, 7);
            ctx.stroke();
        } else {
            ctx.arc(0, 3, 7, Math.PI * 0.15, Math.PI * 0.85);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawFrontHair(ctx, style) {
        ctx.save();
        const frontGrad = ctx.createLinearGradient(0, -135, 0, -20);
        frontGrad.addColorStop(0, style.hairHighlight);
        frontGrad.addColorStop(0.35, style.hairColor);
        frontGrad.addColorStop(1, style.hairDark);
        ctx.fillStyle = frontGrad;

        // Topo e Franja em mechas de anime
        ctx.beginPath();
        ctx.moveTo(-72, -45);
        ctx.bezierCurveTo(-76, -120, 76, -120, 72, -45);
        // Mechas da franja
        ctx.lineTo(56, -22);
        ctx.lineTo(42, -52);
        ctx.lineTo(22, -26);
        ctx.lineTo(6, -54);
        ctx.lineTo(-8, -24);
        ctx.lineTo(-26, -52);
        ctx.lineTo(-44, -26);
        ctx.lineTo(-58, -50);
        ctx.closePath();
        ctx.fill();

        // Mechas laterais (Sidelocks) que emolduram o rosto
        [-1, 1].forEach(dir => {
            ctx.beginPath();
            ctx.moveTo(dir * 58, -60);
            ctx.bezierCurveTo(dir * 75, -10, dir * 68, 45, dir * 48, 72);
            ctx.bezierCurveTo(dir * 48, 30, dir * 52, -15, dir * 46, -45);
            ctx.closePath();
            ctx.fill();
        });

        // "Angel Ring" (reflexo luminoso horizontal clássico de anime moderno)
        ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
        [-32, -10, 14, 34].forEach(x => {
            ctx.beginPath();
            ctx.ellipse(x, -76 + Math.abs(x) * 0.12, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    drawAccessories(ctx, style) {
        ctx.save();
        if (style.accessory === 'glasses_pdsa') {
            // Óculos elegantes de Kael (inspiração Keima Katsuragi)
            ctx.strokeStyle = "#b0bec5";
            ctx.lineWidth = 2.5;
            ctx.fillStyle = "rgba(129, 212, 250, 0.18)";
            [-28, 28].forEach(x => {
                ctx.beginPath();
                ctx.roundRect(x - 19, -46, 38, 22, 4);
                ctx.fill();
                ctx.stroke();
            });
            ctx.beginPath();
            ctx.moveTo(-9, -35);
            ctx.lineTo(9, -35);
            ctx.stroke();
        } else if (style.accessory === 'headband') {
            // Faixa esportiva de Ayumi
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.roundRect(-62, -92, 124, 14, 7);
            ctx.fill();
            ctx.fillStyle = "#e53935";
            ctx.fillRect(-62, -87, 124, 4);
        } else if (style.accessory === 'royal_ribbons') {
            // Laços nobres de Mio
            ctx.fillStyle = style.ribbonColor;
            [-62, 62].forEach(x => {
                ctx.beginPath();
                ctx.arc(x, -78, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffd54f";
                ctx.beginPath();
                ctx.arc(x, -78, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = style.ribbonColor;
            });
        } else if (style.accessory === 'book_hairclip') {
            // Presilha delicada de Shiori
            ctx.fillStyle = "#fff59d";
            ctx.fillRect(-52, -64, 18, 6);
            ctx.fillRect(-49, -56, 15, 5);
        } else if (style.accessory === 'star_clip') {
            // Presilha de Estrela de Idol de Karin
            ctx.fillStyle = "#ff4081";
            ctx.beginPath();
            ctx.arc(-50, -68, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffff00";
            ctx.beginPath();
            ctx.arc(-50, -68, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (style.accessory === 'council_badge') {
            // Braçadeira / Insígnia Dourada da Presidente Reina
            ctx.fillStyle = "#ffd700";
            ctx.beginPath();
            ctx.arc(42, 85, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }

    drawEmotionParticles(ctx, style) {
        ctx.save();
        const floatY = Math.sin(this.animTime * 4) * 6;
        if (this.expression === 'happy' || this.expression === 'shy') {
            // Corações flutuantes
            ctx.fillStyle = "#ff4081";
            ctx.font = "bold 24px sans-serif";
            ctx.fillText("♥", 78, -95 + floatY);
            ctx.font = "bold 16px sans-serif";
            ctx.fillStyle = "#ff80ab";
            ctx.fillText("♥", -88, -75 - floatY);
        } else if (this.expression === 'surprised') {
            ctx.fillStyle = "#ffd54f";
            ctx.font = "bold 28px sans-serif";
            ctx.fillText("!", 82, -92 + floatY);
        } else if (this.expression === 'focused') {
            ctx.fillStyle = "#00e5ff";
            ctx.font = "bold 22px sans-serif";
            ctx.fillText("✦", 80, -90 + floatY);
        }
        ctx.restore();
    }
}

window.CHARACTER_STYLES = CHARACTER_STYLES;
window.AnimePortraitRenderer = AnimePortraitRenderer;

// ============================================================================
// MOTOR 3D EM TEMPO REAL (THREE.JS OTIMIZADO + FALLBACK CANVAS 3D)
// Alta resolução e 60 FPS até em PCs sem placa de vídeo dedicada
// ============================================================================

class CampusWorld3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.quality = 'high'; // 'high' (Switch HD) ou 'performance' (PC sem GPU)
        this.player = {
            x: 0,
            z: 8,
            rotY: Math.PI,
            speed: 11.5,
            sprintMultiplier: 1.55,
            isMoving: false,
            walkCycle: 0
        };
        this.cameraAngle = 0;
        this.cameraPitch = 0.48;
        this.cameraDist = 14.5;
        this.timeOfDay = 0; // 0: Manhã, 1: Entardecer Sakura, 2: Noite Estrelada
        this.npcs = [];
        this.crystals = [];
        this.sakuraPetals = [];
        this.shopPos = { x: 8, z: 6, radius: 3.2 };
        this.nearbyTarget = null;
        this.fpsSamples = [];
        this.currentFps = 60;

        this.initEngine();
    }

    initEngine() {
        if (window.THREE) {
            this.useThree = true;
            this.initThreeJS();
        } else {
            this.useThree = false;
            this.initFallbackCanvas3D();
        }
        this.spawnCollectibleCrystals();
    }

    setQuality(mode) {
        this.quality = mode;
        if (this.useThree && this.renderer) {
            const dpr = mode === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
            this.renderer.setPixelRatio(dpr);
            if (this.petalPoints) {
                this.petalPoints.visible = (mode === 'high');
            }
        }
    }

    cycleTimeOfDay() {
        this.timeOfDay = (this.timeOfDay + 1) % 3;
        if (!this.useThree) return this.timeOfDay;

        const themes = [
            { sky: 0x87ceeb, fog: 0xb3e5fc, amb: 0xffffff, ambInt: 0.72, dir: 0xfff8e1, dirInt: 0.85 }, // Dia Radiante
            { sky: 0xff9e80, fog: 0xffccbc, amb: 0xffccbc, ambInt: 0.68, dir: 0xffab40, dirInt: 0.90 }, // Pôr do Sol Anime
            { sky: 0x1a237e, fog: 0x283593, amb: 0x9fa8da, ambInt: 0.58, dir: 0x82b1ff, dirInt: 0.75 }  // Noite Estelar
        ];
        const t = themes[this.timeOfDay];
        this.scene.background = new THREE.Color(t.sky);
        this.scene.fog.color.setHex(t.fog);
        this.ambientLight.color.setHex(t.amb);
        this.ambientLight.intensity = t.ambInt;
        this.dirLight.color.setHex(t.dir);
        this.dirLight.intensity = t.dirInt;
        return this.timeOfDay;
    }

    initThreeJS() {
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.FogExp2(0xb3e5fc, 0.011);

        this.camera = new THREE.PerspectiveCamera(52, w / h, 0.5, 160);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // Iluminação leve e vibrante estilo Nintendo Switch
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.74);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xfff8e1, 0.85);
        this.dirLight.position.set(25, 42, 20);
        this.scene.add(this.dirLight);

        this.buildCampusGeometry();
        this.buildPlayerAndLumi3D();
        this.buildHeroines3D();
        this.buildSakuraParticles();

        window.addEventListener('resize', () => this.onResize());
    }

    buildCampusGeometry() {
        // Gramado principal do Campus
        const groundGeo = new THREE.CircleGeometry(65, 48);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x66bb6a });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);

        // Caminhos de pedra clara em cruz + praça central
        const pathMat = new THREE.MeshLambertMaterial({ color: 0xeceff1 });
        const plaza = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 0.08, 32), pathMat);
        plaza.position.set(0, 0.04, 0);
        this.scene.add(plaza);

        const pathNS = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.06, 62), pathMat);
        pathNS.position.set(0, 0.03, 0);
        this.scene.add(pathNS);

        const pathEW = new THREE.Mesh(new THREE.BoxGeometry(62, 0.06, 5.5), pathMat);
        pathEW.position.set(0, 0.03, 0);
        this.scene.add(pathEW);

        // Fonte Estelar Central
        const fountainBase = new THREE.Mesh(
            new THREE.CylinderGeometry(3.2, 3.6, 0.9, 24),
            new THREE.MeshLambertMaterial({ color: 0xb0bec5 })
        );
        fountainBase.position.set(0, 0.45, 0);
        this.scene.add(fountainBase);

        const waterPool = new THREE.Mesh(
            new THREE.CylinderGeometry(2.8, 2.8, 0.95, 24),
            new THREE.MeshBasicMaterial({ color: 0x29b6f6 })
        );
        waterPool.position.set(0, 0.45, 0);
        this.scene.add(waterPool);

        this.fountainStar = new THREE.Mesh(
            new THREE.OctahedronGeometry(1.1, 0),
            new THREE.MeshLambertMaterial({ color: 0xffd54f, emissive: 0xffa000, emissiveIntensity: 0.4 })
        );
        this.fountainStar.position.set(0, 2.4, 0);
        this.scene.add(this.fountainStar);

        // 1. Prédio Principal da Academia + Terraço do Pôr do Sol (Sudeste: x:22, z:18)
        const schoolGroup = new THREE.Group();
        const mainBldg = new THREE.Mesh(
            new THREE.BoxGeometry(16, 10, 10),
            new THREE.MeshLambertMaterial({ color: 0xfff8e1 })
        );
        mainBldg.position.set(24, 5, 23);
        schoolGroup.add(mainBldg);

        const roofRailing = new THREE.Mesh(
            new THREE.BoxGeometry(16.6, 1.2, 10.6),
            new THREE.MeshLambertMaterial({ color: 0x3949ab })
        );
        roofRailing.position.set(24, 10.4, 23);
        schoolGroup.add(roofRailing);

        // Tapete de acesso ao Terraço (onde Reina fica acessível)
        const terracePad = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 3.5, 0.15, 24),
            new THREE.MeshLambertMaterial({ color: 0x7e57c2 })
        );
        terracePad.position.set(22, 0.08, 18);
        schoolGroup.add(terracePad);
        this.scene.add(schoolGroup);

        // 2. Pista de Atletismo (Leste: x:24, z:-12 - Ayumi)
        const trackOuter = new THREE.Mesh(
            new THREE.RingGeometry(6, 10.5, 32),
            new THREE.MeshBasicMaterial({ color: 0xd84315, side: THREE.DoubleSide })
        );
        trackOuter.rotation.x = -Math.PI / 2;
        trackOuter.position.set(24, 0.05, -12);
        this.scene.add(trackOuter);

        // 3. Jardim das Cerejeiras (Oeste-Centro: x:-18, z:-8 - Mio)
        const gardenPad = new THREE.Mesh(
            new THREE.CircleGeometry(7.5, 24),
            new THREE.MeshBasicMaterial({ color: 0xf8bbd0, side: THREE.DoubleSide })
        );
        gardenPad.rotation.x = -Math.PI / 2;
        gardenPad.position.set(-18, 0.05, -8);
        this.scene.add(gardenPad);

        // 4. Pavilhão da Biblioteca (Sudoeste: x:-24, z:16 - Shiori)
        const libBldg = new THREE.Mesh(
            new THREE.BoxGeometry(11, 7.5, 9),
            new THREE.MeshLambertMaterial({ color: 0xe3f2fd })
        );
        libBldg.position.set(-28, 3.75, 21);
        this.scene.add(libBldg);

        const libRoof = new THREE.Mesh(
            new THREE.ConeGeometry(8.5, 4, 4),
            new THREE.MeshLambertMaterial({ color: 0x1565c0 })
        );
        libRoof.position.set(-28, 9.5, 21);
        libRoof.rotation.y = Math.PI / 4;
        this.scene.add(libRoof);

        // 5. Palco Cultural de Música (Norte: x:0, z:-26 - Karin)
        const stageBase = new THREE.Mesh(
            new THREE.CylinderGeometry(7, 7.5, 0.8, 24),
            new THREE.MeshLambertMaterial({ color: 0x311b92 })
        );
        stageBase.position.set(0, 0.4, -27);
        this.scene.add(stageBase);

        const stageArch = new THREE.Mesh(
            new THREE.TorusGeometry(5.5, 0.35, 12, 32, Math.PI),
            new THREE.MeshBasicMaterial({ color: 0xff4081 })
        );
        stageArch.position.set(0, 0.8, -28.5);
        this.scene.add(stageArch);

        // 6. Quiosque Cafeteria & Loja Estelar (x:8, z:6)
        const shopGroup = new THREE.Group();
        const shopBooth = new THREE.Mesh(
            new THREE.BoxGeometry(3.4, 2.8, 3.4),
            new THREE.MeshLambertMaterial({ color: 0xfff3e0 })
        );
        shopBooth.position.y = 1.4;
        shopGroup.add(shopBooth);

        const shopAwning = new THREE.Mesh(
            new THREE.ConeGeometry(3.2, 1.8, 8),
            new THREE.MeshLambertMaterial({ color: 0xff4554 })
        );
        shopAwning.position.y = 3.5;
        shopGroup.add(shopAwning);
        shopGroup.position.set(this.shopPos.x, 0, this.shopPos.z);
        this.scene.add(shopGroup);

        // Árvores de Sakura (Cerejeiras em Flor) espalhadas pelo Campus
        const treeCoords = [
            [-10, -12], [-22, -14], [-14, -2], [-20, 2],
            [11, -10], [14, 12], [-10, 12], [10, -20], [-10, -20],
            [18, -2], [-16, 22], [12, 24]
        ];
        treeCoords.forEach(([tx, tz]) => this.createSakuraTree(tx, tz));
    }

    createSakuraTree(x, z) {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.55, 3.2, 8),
            new THREE.MeshLambertMaterial({ color: 0x5d4037 })
        );
        trunk.position.y = 1.6;
        group.add(trunk);

        const foliageColors = [0xff80ab, 0xf8bbd0, 0xf48fb1];
        for (let i = 0; i < 3; i++) {
            const crown = new THREE.Mesh(
                new THREE.SphereGeometry(2.1 - i * 0.3, 12, 10),
                new THREE.MeshLambertMaterial({ color: foliageColors[i % 3] })
            );
            crown.position.set((i - 1) * 0.7, 3.6 + i * 0.5, (i % 2) * 0.5);
            group.add(crown);
        }
        group.position.set(x, 0, z);
        this.scene.add(group);
    }

    createAnimeChibiMesh(mainColor, hairColor, isFemale = true) {
        const group = new THREE.Group();

        // Corpo (Uniforme)
        const bodyGeo = isFemale
            ? new THREE.ConeGeometry(0.68, 1.45, 12)
            : new THREE.CylinderGeometry(0.45, 0.52, 1.45, 12);
        const bodyMat = new THREE.MeshLambertMaterial({ color: mainColor });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.95;
        group.add(body);

        // Cabeça
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.56, 16, 14),
            new THREE.MeshLambertMaterial({ color: 0xffe4d4 })
        );
        head.position.y = 2.05;
        group.add(head);

        // Cabelo estilizado
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.61, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.68),
            new THREE.MeshLambertMaterial({ color: hairColor })
        );
        hair.position.y = 2.1;
        group.add(hair);

        // Sombra suave no chão
        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(0.75, 16),
            new THREE.MeshBasicMaterial({ color: 0x263238, transparent: true, opacity: 0.32 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.03;
        group.add(shadow);

        return group;
    }

    buildPlayerAndLumi3D() {
        this.playerMesh = this.createAnimeChibiMesh(0x1e293b, 0x263238, false);
        // Console PDSA luminoso nas mãos de Kael
        const pdsaMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.25, 0.08),
            new THREE.MeshBasicMaterial({ color: 0x00e5ff })
        );
        pdsaMesh.position.set(0, 1.25, 0.55);
        this.playerMesh.add(pdsaMesh);
        this.scene.add(this.playerMesh);

        // Lumi (Espírito Mensageira flutuando ao lado de Kael)
        this.lumiMesh = new THREE.Group();
        const lumiCore = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xff80ab })
        );
        const lumiHalo = new THREE.Mesh(
            new THREE.RingGeometry(0.42, 0.55, 16),
            new THREE.MeshBasicMaterial({ color: 0xffd54f, side: THREE.DoubleSide })
        );
        lumiHalo.rotation.x = Math.PI / 2;
        this.lumiMesh.add(lumiCore);
        this.lumiMesh.add(lumiHalo);
        this.scene.add(this.lumiMesh);
    }

    buildHeroines3D() {
        this.npcs = [];
        const stages = window.GAME_DATA ? window.GAME_DATA.stages : [];
        stages.forEach(st => {
            const style = window.CHARACTER_STYLES[st.charId];
            const hairHex = style ? parseInt(style.hairColor.replace('#', '0x')) : 0xff4081;
            const outfitHex = style ? parseInt(style.outfitMain.replace('#', '0x')) : 0x3949ab;

            let mesh = null;
            let ringMesh = null;
            if (this.useThree) {
                mesh = this.createAnimeChibiMesh(outfitHex, hairHex, true);
                mesh.position.set(st.position3D.x, 0, st.position3D.z);

                ringMesh = new THREE.Mesh(
                    new THREE.RingGeometry(1.4, 1.85, 24),
                    new THREE.MeshBasicMaterial({ color: 0x00e676, side: THREE.DoubleSide })
                );
                ringMesh.rotation.x = -Math.PI / 2;
                ringMesh.position.set(st.position3D.x, 0.07, st.position3D.z);

                this.scene.add(mesh);
                this.scene.add(ringMesh);
            }

            this.npcs.push({
                stageId: st.id,
                charId: st.charId,
                name: st.name,
                role: st.role,
                difficultyLabel: st.difficultyLabel,
                x: st.position3D.x,
                z: st.position3D.z,
                baseX: st.position3D.x,
                baseZ: st.position3D.z,
                color: st.color,
                mesh,
                ringMesh
            });
        });
    }

    spawnCollectibleCrystals() {
        const coords = [
            { x: 6, z: -5 }, { x: -8, z: 4 }, { x: 15, z: -4 },
            { x: -14, z: -15 }, { x: -15, z: 10 }, { x: 8, z: -18 },
            { x: 14, z: 10 }, { x: -5, z: -18 }
        ];
        this.crystals = coords.map((c, idx) => {
            let mesh = null;
            if (this.useThree) {
                mesh = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.55, 0),
                    new THREE.MeshLambertMaterial({ color: 0x00e5ff, emissive: 0x00b0ff, emissiveIntensity: 0.5 })
                );
                mesh.position.set(c.x, 1.2, c.z);
                this.scene.add(mesh);
            }
            return { id: idx, x: c.x, z: c.z, active: true, respawnTimer: 0, mesh };
        });
    }

    buildSakuraParticles() {
        if (!this.useThree) return;
        const count = 160;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 65;
            positions[i * 3 + 1] = Math.random() * 18 + 1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 65;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xffb2dd,
            size: 0.42,
            transparent: true,
            opacity: 0.85
        });
        this.petalPoints = new THREE.Points(geo, mat);
        this.scene.add(this.petalPoints);
    }

    initFallbackCanvas3D() {
        this.canvas2d = document.createElement('canvas');
        this.canvas2d.style.width = '100%';
        this.canvas2d.style.height = '100%';
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas2d);
        this.ctx2d = this.canvas2d.getContext('2d');
        this.buildHeroines3D();
    }

    onResize() {
        if (!this.container) return;
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;
        if (this.useThree && this.renderer && this.camera) {
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        }
    }

    update(dt, inputState, gameState) {
        // Monitoramento de FPS para PCs sem placa de vídeo
        if (dt > 0) {
            const instantFps = 1 / dt;
            this.fpsSamples.push(instantFps);
            if (this.fpsSamples.length > 30) this.fpsSamples.shift();
            const avg = this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length;
            this.currentFps = Math.min(60, Math.round(avg));
        }

        const time = performance.now() * 0.001;

        // Movimentação em Tempo Real quando o jogador está no modo exploração
        if (gameState.mode === 'explore') {
            let moveX = inputState.moveX || 0;
            let moveZ = inputState.moveY || 0;

            // Rotação da câmera pelo analógico direito ou teclas Q/R
            if (Math.abs(inputState.camX) > 0.1) {
                this.cameraAngle -= inputState.camX * 2.2 * dt;
            }

            const mag = Math.hypot(moveX, moveZ);
            if (mag > 0.1) {
                const normX = moveX / Math.max(1, mag);
                const normZ = moveZ / Math.max(1, mag);

                // Movimento relativo ao ângulo da câmera
                const sinC = Math.sin(this.cameraAngle);
                const cosC = Math.cos(this.cameraAngle);
                const worldDX = normX * cosC + normZ * sinC;
                const worldDZ = normZ * cosC - normX * sinC;

                const spd = this.player.speed * (inputState.sprint ? this.player.sprintMultiplier : 1);
                this.player.x += worldDX * spd * dt;
                this.player.z += worldDZ * spd * dt;

                // Limite circular do Campus
                const distFromCenter = Math.hypot(this.player.x, this.player.z);
                if (distFromCenter > 42) {
                    this.player.x = (this.player.x / distFromCenter) * 42;
                    this.player.z = (this.player.z / distFromCenter) * 42;
                }

                this.player.rotY = Math.atan2(worldDX, worldDZ);
                this.player.isMoving = true;
                this.player.walkCycle += dt * (inputState.sprint ? 14 : 9);
            } else {
                this.player.isMoving = false;
            }
        }

        // Checar coleta de Cristais Estelares em Tempo Real
        this.crystals.forEach(c => {
            if (!c.active) {
                c.respawnTimer -= dt;
                if (c.respawnTimer <= 0) {
                    c.active = true;
                    if (c.mesh) c.mesh.visible = true;
                }
                return;
            }
            if (c.mesh) {
                c.mesh.rotation.y += dt * 2.5;
                c.mesh.position.y = 1.15 + Math.sin(time * 3 + c.id) * 0.25;
            }
            const dist = Math.hypot(this.player.x - c.x, this.player.z - c.z);
            if (dist < 1.85 && gameState.onCrystalCollected) {
                c.active = false;
                c.respawnTimer = 25; // Renasce após 25 segundos para manter exploração viva!
                if (c.mesh) c.mesh.visible = false;
                gameState.onCrystalCollected();
            }
        });

        // Verificar proximidade com Heroínas ou Loja
        this.nearbyTarget = null;
        let minDist = 3.6;

        this.npcs.forEach((npc, idx) => {
            // Movimento suave das personagens em tempo real
            const patrolOffset = Math.sin(time * 1.2 + idx) * 0.65;
            npc.x = npc.baseX + patrolOffset;
            if (npc.mesh) {
                npc.mesh.position.x = npc.x;
                npc.mesh.position.y = Math.abs(Math.sin(time * 2.4 + idx)) * 0.12;
                // Olhar na direção do jogador quando próximo
                const dx = this.player.x - npc.x;
                const dz = this.player.z - npc.z;
                if (Math.hypot(dx, dz) < 6) {
                    npc.mesh.rotation.y = Math.atan2(dx, dz);
                }
            }
            if (npc.ringMesh) {
                npc.ringMesh.position.x = npc.x;
                const isConquered = gameState.conqueredStages && gameState.conqueredStages.includes(npc.stageId);
                const isRecommended = npc.stageId === gameState.currentRecommendedStage;
                npc.ringMesh.material.color.setHex(isConquered ? 0xffd54f : (isRecommended ? 0x00e676 : 0x00c3e3));
                const pulse = 1 + Math.sin(time * 4) * 0.08;
                npc.ringMesh.scale.set(pulse, pulse, 1);
            }

            const d = Math.hypot(this.player.x - npc.x, this.player.z - npc.z);
            if (d < minDist) {
                minDist = d;
                this.nearbyTarget = { type: 'npc', data: npc };
            }
        });

        const shopDist = Math.hypot(this.player.x - this.shopPos.x, this.player.z - this.shopPos.z);
        if (shopDist < this.shopPos.radius && shopDist < minDist) {
            this.nearbyTarget = {
                type: 'shop',
                data: { name: "Cafeteria & Papelaria Estelar", role: "Loja de Itens Facilitadores" }
            };
        }

        if (this.useThree) {
            this.renderThree(dt, time);
        } else {
            this.renderFallback2D(time);
        }
    }

    renderThree(dt, time) {
        // Atualizar posição de Kael
        const bounce = this.player.isMoving ? Math.abs(Math.sin(this.player.walkCycle)) * 0.22 : 0;
        this.playerMesh.position.set(this.player.x, bounce, this.player.z);
        this.playerMesh.rotation.y = this.player.rotY;

        // Atualizar órbita da espírito Lumi
        const lumiX = this.player.x + Math.cos(time * 2.2) * 1.35;
        const lumiZ = this.player.z + Math.sin(time * 2.2) * 1.35;
        this.lumiMesh.position.set(lumiX, 2.3 + Math.sin(time * 4) * 0.2, lumiZ);

        // Girar estrela da fonte
        if (this.fountainStar) {
            this.fountainStar.rotation.y += dt * 1.4;
            this.fountainStar.position.y = 2.4 + Math.sin(time * 2.5) * 0.2;
        }

        // Animar pétalas de Sakura caindo em 3D
        if (this.petalPoints && this.petalPoints.visible) {
            const posAttr = this.petalPoints.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                let y = posAttr.getY(i) - dt * 1.6;
                let x = posAttr.getX(i) + Math.sin(time + i) * dt * 0.8;
                if (y < 0.2) y = 18;
                posAttr.setY(i, y);
                posAttr.setX(i, x);
            }
            posAttr.needsUpdate = true;
        }

        // Câmera suave em 3ª pessoa seguindo Kael
        const camX = this.player.x + Math.sin(this.cameraAngle) * this.cameraDist;
        const camZ = this.player.z + Math.cos(this.cameraAngle) * this.cameraDist;
        const camY = 7.2;
        this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
        this.camera.lookAt(this.player.x, 1.5, this.player.z);

        this.renderer.render(this.scene, this.camera);
    }

    renderFallback2D(time) {
        const w = this.container.clientWidth || 800;
        const h = this.container.clientHeight || 600;
        if (this.canvas2d.width !== w || this.canvas2d.height !== h) {
            this.canvas2d.width = w;
            this.canvas2d.height = h;
        }
        const ctx = this.ctx2d;
        ctx.fillStyle = "#87ceeb";
        ctx.fillRect(0, 0, w, h * 0.45);
        ctx.fillStyle = "#66bb6a";
        ctx.fillRect(0, h * 0.45, w, h * 0.55);

        const cx = w / 2;
        const cy = h * 0.65;
        const scale = 12;

        // Desenhar NPCs relativos ao jogador
        this.npcs.forEach(npc => {
            const sx = cx + (npc.x - this.player.x) * scale;
            const sy = cy + (npc.z - this.player.z) * scale * 0.6;
            ctx.fillStyle = npc.color;
            ctx.beginPath();
            ctx.arc(sx, sy, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(npc.name, sx, sy - 20);
        });

        // Jogador no centro
        ctx.fillStyle = "#00c3e3";
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    // Projeta coordenadas 3D para etiquetas flutuantes estilo Switch na tela
    getScreenProjections() {
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;
        const results = [];

        if (!this.useThree || !this.camera) return results;

        this.npcs.forEach(npc => {
            const vec = new THREE.Vector3(npc.x, 3.1, npc.z);
            vec.project(this.camera);
            if (vec.z < 1) {
                const sx = (vec.x * 0.5 + 0.5) * w;
                const sy = (-(vec.y * 0.5) + 0.5) * h;
                const dist = Math.hypot(this.player.x - npc.x, this.player.z - npc.z);
                if (dist < 28) {
                    results.push({
                        id: npc.charId,
                        stageId: npc.stageId,
                        name: npc.name,
                        badge: npc.difficultyLabel,
                        color: npc.color,
                        x: sx,
                        y: sy,
                        dist
                    });
                }
            }
        });

        // Projetar Loja
        const shopVec = new THREE.Vector3(this.shopPos.x, 3.9, this.shopPos.z);
        shopVec.project(this.camera);
        if (shopVec.z < 1) {
            const dist = Math.hypot(this.player.x - this.shopPos.x, this.player.z - this.shopPos.z);
            if (dist < 26) {
                results.push({
                    id: 'shop',
                    stageId: 0,
                    name: "Cafeteria & Itens",
                    badge: "Loja Facilidades [X]",
                    color: "#ff4554",
                    x: (shopVec.x * 0.5 + 0.5) * w,
                    y: (-(shopVec.y * 0.5) + 0.5) * h,
                    dist
                });
            }
        }

        return results;
    }
}

window.CampusWorld3D = CampusWorld3D;

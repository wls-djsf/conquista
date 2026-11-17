// ============================================================================
// BASE DE DADOS DO JOGO: HISTÓRIA, FASES PROGRESSIVAS, PSICOLOGIA E ITENS
// Inspirado em Kami Nomi zo Shiru Sekai • 100% Original e Livre para Todos
// ============================================================================

const GAME_DATA = {
    title: "Corações em Órbita: O Mestre da Conquista",
    subtitle: "Simulador 3D em Tempo Real de Empatia, Psicologia e Romance",

    tutorialSteps: [
        {
            speaker: "lumi",
            expression: "happy",
            title: "1/5 • Bem-vindo à Academia Nova Aurora!",
            text: "Olá, Kael! Eu sou a Lumi, Mensageira da Constelação de Eros! Você é conhecido na internet como o lendário 'Mestre das Rotas Impossíveis', mas agora precisamos da sua ajuda no mundo 3D em tempo real!"
        },
        {
            speaker: "kael",
            expression: "focused",
            title: "2/5 • O Console Portátil PDSA e as Lacunas do Coração",
            text: "Espere aí... meu console portátil PDSA está detectando anomalias reais pelo campus? Cinco garotas estão com 'Lacunas no Coração' causadas por inseguranças, pressões e bloqueios emocionais."
        },
        {
            speaker: "lumi",
            expression: "normal",
            title: "3/5 • Exploração 3D em Tempo Real e Controles",
            text: "Isso mesmo! Você pode caminhar livremente pelo campus 3D em tempo real usando o Controle Xbox (Analógico Esquerdo + Botão A), qualquer outro Controle USB/Bluetooth ou o Teclado (WASD / Setas + Tecla E). Colete Cristais Estelares pelo mapa!"
        },
        {
            speaker: "lumi",
            expression: "happy",
            title: "4/5 • Psicologia Real e a Regra das 3 Tentativas",
            text: "Cada conquista usa princípios reais de livros de Psicologia (Carnegie, Gottman, Rosenberg, Brené Brown). Preste atenção ao tempo real! E não se preocupe: se você não conseguir nas 3 primeiras tentativas de qualquer etapa, eu ativo o Modo Mentoria e te ensino o conceito psicológico passo a passo!"
        },
        {
            speaker: "kael",
            expression: "happy",
            title: "5/5 • Itens Facilitadores e Sintonia do Coração",
            text: "Entendido! Posso coletar ou comprar itens na Mochila [X / Tecla I] para desacelerar o tempo, revelar dicas emocionais ou aumentar a afinidade. Vamos começar pela Fase 1 na Pista de Atletismo com a Ayumi Hoshino!"
        }
    ],

    items: [
        {
            id: "cha_camomila",
            name: "Chá de Camomila Artesanal",
            icon: "🍵",
            cost: 30,
            effectType: "timer_boost",
            effectValue: 8,
            desc: "Acalma o ritmo da conversa em tempo real (+8 segundos no cronômetro de decisão e reduz velocidade do minigame em 20%).",
            psychNote: "Reduz a ativação fisiológica (Gottman), facilitando o diálogo calmo."
        },
        {
            id: "fita_esportiva",
            name: "Fita de Pulso Estelar",
            icon: "🎽",
            cost: 40,
            effectType: "affinity_boost",
            targetStage: 1,
            effectValue: 25,
            desc: "Item favorito de atletas (+25% de Afinidade imediata com Ayumi ou +15% com qualquer personagem).",
            psychNote: "Demonstra atenção genuína aos interesses da pessoa (Dale Carnegie)."
        },
        {
            id: "macarons_reais",
            name: "Caixa de Macarons Sakura",
            icon: "🧁",
            cost: 50,
            effectType: "shield_mistake",
            targetStage: 2,
            effectValue: 1,
            desc: "Cria um Escudo de Gentileza que perdoa 1 escolha equivocada sem contar como falha e concede +20% de Afinidade.",
            psychNote: "Ativa o princípio da Reciprocidade Afetiva (Robert Cialdini)."
        },
        {
            id: "marcador_sakura",
            name: "Marcador de Livro de Cristal",
            icon: "🔖",
            cost: 55,
            effectType: "affinity_boost",
            targetStage: 3,
            effectValue: 25,
            desc: "Presente delicado para amantes da leitura (+25% de Afinidade com Shiori e revela o sentimento oculto da rodada).",
            psychNote: "Valida o mundo interno de pessoas introvertidas (Carl Rogers)."
        },
        {
            id: "partitura_rara",
            name: "Partitura Acústica Iluminada",
            icon: "🎼",
            cost: 65,
            effectType: "affinity_boost",
            targetStage: 4,
            effectValue: 25,
            desc: "Inspira musicistas (+25% de Afinidade com Karin e amplia a zona de acerto no minigame de Sintonia).",
            psychNote: "Conecta-se com a motivação intrínseca da artista (Csikszentmihalyi)."
        },
        {
            id: "lente_gottman",
            name: "Lente de Empatia do PDSA",
            icon: "🔍",
            cost: 75,
            effectType: "instant_hint",
            effectValue: 1,
            desc: "Ativa imediatamente a análise psicológica profunda da personagem sem precisar esperar 3 tentativas!",
            psychNote: "Baseado no 'Mapa do Amor' e leitura de 'Bids for Connection' de John Gottman."
        },
        {
            id: "relogio_fluxo",
            name: "Reloginho de Fluxo Temporal",
            icon: "⏳",
            cost: 80,
            effectType: "slow_minigame",
            effectValue: 0.65,
            desc: "Desacelera os Ecos de Insegurança em 35% durante o desafio em tempo real de Sintonia do Coração.",
            psychNote: "Mantém o jogador no canal ideal do Estado de Flow."
        },
        {
            id: "pluma_conselho",
            name: "Caneta Tinteiro Lua Prateada",
            icon: "✒️",
            cost: 95,
            effectType: "affinity_boost",
            targetStage: 5,
            effectValue: 30,
            desc: "Presente de alto prestígio (+30% de Afinidade com a Presidente Reina e bônus de Carisma + Intelecto).",
            psychNote: "Reconhece a dedicação e responsabilidade silenciosa do líder."
        }
    ],

    stages: [
        // ====================================================================
        // FASE 1: AYUMI HOSHINO (Nível 1 - Iniciante)
        // ====================================================================
        {
            id: 1,
            charId: "ayumi",
            name: "Ayumi Hoshino",
            role: "Velocista do Clube de Atletismo",
            locationName: "Pista de Atletismo • Leste do Campus",
            difficultyLabel: "Nível 1 • Iniciante",
            position3D: { x: 24, z: -12 },
            color: "#ff7043",
            heartGapTitle: "O Peso do Primeiro Lugar",
            psychBook: "Como Fazer Amigos e Influenciar Pessoas (Dale Carnegie) & A Coragem de Ser Imperfeito (Brené Brown)",
            psychSummary: "Validação Intrínseca vs. Elogio Superficial por Desempenho",
            introText: "Ayumi bateu todos os recordes juvenis, mas continua treinando sozinha até o anoitecer com um olhar exausto.",
            minigameConfig: {
                speed: 1.0,
                targetZoneWidth: 32,
                durationSec: 12,
                obstacleRate: 0.6
            },
            mentorGuide: {
                conceptTitle: "Validação Intrínseca e Acolhimento da Vulnerabilidade (Dale Carnegie & Brené Brown)",
                whyFailed: "Quando alguém sofre com excesso de cobrança por resultados, elogiar apenas os troféus ('Você é imbatível!') ou dar conselhos técnicos frios aumenta a pressão de que ela só tem valor se vencer.",
                howToApply: "1. Demonstre interesse genuíno pela pessoa, não apenas pelo pódio (Dale Carnegie).\n2. Acolha o cansaço e a vulnerabilidade sem julgamento (Brené Brown).\n3. Nas escolhas, priorize perguntar como ELA se sente e valorizar sua paixão por correr livremente!"
            },
            steps: [
                {
                    stepNum: 1,
                    timeLimit: 18,
                    expression: "sad",
                    bodyCue: "Linguagem Corporal: Respiração ofegante, olhando fixamente para o cronômetro com os ombros tensos.",
                    dialogue: "Ah, Kael... Não chegue perto agora, ainda preciso diminuir meio segundo no meu tempo! Se eu não vencer o torneio de domingo, todo mundo na escola vai se decepcionar comigo...",
                    options: [
                        {
                            text: "Você é a campeã invicta da escola, é impossível você perder domingo!",
                            quality: "wrong",
                            affinityDelta: -10,
                            feedback: "Ayumi forçou um sorriso tenso. Dizer que 'é impossível perder' aumentou o peso das expectativas sobre ela.",
                            reply: "É... todo mundo sempre repete isso. 'A Ayumi nunca perde'... Mas e se um dia eu tropeçar?"
                        },
                        {
                            text: "Percebi que você está treinando até tarde. Mais do que o troféu, como você está se sentindo hoje?",
                            quality: "best",
                            affinityDelta: 35,
                            feedback: "Excelente! Você aplicou o princípio de Dale Carnegie e Brené Brown: interessou-se genuinamente pela pessoa por trás do resultado!",
                            reply: "Hã?! Ninguém... ninguém me perguntou como eu estava me sentindo a semana inteira. Só perguntam do meu tempo no cronômetro..."
                        },
                        {
                            text: "Você deveria ir para casa dormir, treinar cansada é estatisticamente ineficiente.",
                            quality: "neutral",
                            affinityDelta: 5,
                            feedback: "Conselho lógico, mas faltou conexão emocional para tocar a Lacuna do Coração.",
                            reply: "Eu sei da parte técnica, Kael... mas minha cabeça não consegue descansar."
                        }
                    ]
                },
                {
                    stepNum: 2,
                    timeLimit: 17,
                    expression: "shy",
                    bodyCue: "Linguagem Corporal: Sentou-se no banco da pista, abraçando os joelhos e olhando para os próprios tênis.",
                    dialogue: "Sabe, quando eu era criança, eu corria porque adorava sentir o vento no rosto. Agora parece que cada passo na pista é uma prova onde não posso errar.",
                    options: [
                        {
                            text: "Que tal corrermos uma volta devagar agora, sem cronômetro, só para sentir o vento como antigamente?",
                            quality: "best",
                            affinityDelta: 40,
                            feedback: "Perfeito! Você reconectou Ayumi com sua Motivação Intrínseca e proporcionou uma experiência segura sem julgamento.",
                            reply: "Sem... sem cronômetro? Haha, faz tanto tempo que não faço isso! Vamos lá, Kael!"
                        },
                        {
                            text: "A pressão faz parte do esporte de alto nível, você precisa ser mentalmente forte.",
                            quality: "wrong",
                            affinityDelta: -15,
                            feedback: "Invalidar o sentimento dela faz com que ela feche a guarda emocional (Simpatia fria vs. Empatia).",
                            reply: "Eu já tento ser forte o tempo todo... Achei que você fosse entender."
                        },
                        {
                            text: "Se quiser, você pode largar o clube de atletismo para não sofrer mais pressão.",
                            quality: "neutral",
                            affinityDelta: 0,
                            feedback: "Fugir do esporte não é o que ela deseja; ela ama correr, só precisa se libertar do perfeccionismo.",
                            reply: "Não! Eu amo correr... só queria não sentir tanto medo de decepcionar os outros."
                        }
                    ]
                },
                {
                    stepNum: 3,
                    timeLimit: 16,
                    expression: "happy",
                    bodyCue: "Linguagem Corporal: Olhos brilhando, respiração leve e um sorriso sincero olhando diretamente para você.",
                    dialogue: "Kael... correr ao seu lado sem olhar para o relógio me fez lembrar por que comecei tudo isso. Mas amanhã na corrida, se eu ficar nervosa de novo... o que eu lembro?",
                    options: [
                        {
                            text: "Lembre que o seu valor não depende de uma medalha, e que estarei na arquibancada torcendo pela sua alegria!",
                            quality: "best",
                            affinityDelta: 45,
                            feedback: "Conquista Psicológica Completa! Consideração Positiva Incondicional aplicada com maestria!",
                            reply: "Obrigada, Kael! Sinto que meu coração ficou leve de repente... Como se eu pudesse voar na pista!"
                        },
                        {
                            text: "Lembre das técnicas de respiração e mantenha o foco total na linha de chegada.",
                            quality: "neutral",
                            affinityDelta: 10,
                            feedback: "Bom conselho prático, mas a resposta empática toca muito mais fundo.",
                            reply: "Certo, vou tentar manter a calma!"
                        },
                        {
                            text: "Finja que os outros competidores são NPCs lentos de videogame!",
                            quality: "wrong",
                            affinityDelta: -10,
                            feedback: "Engraçado, mas quebrou o clima emocional do momento decisivo!",
                            reply: "Kael!! Não transforme meu momento emocionante num jogo de videogame!"
                        }
                    ]
                }
            ]
        },

        // ====================================================================
        // FASE 2: MIO SAKURAGI (Nível 2 - Fácil/Médio)
        // ====================================================================
        {
            id: 2,
            charId: "mio",
            name: "Mio Sakuragi",
            role: "Herdeira da Família Sakuragi",
            locationName: "Jardim das Cerejeiras • Centro do Campus",
            difficultyLabel: "Nível 2 • Intermediário",
            position3D: { x: -18, z: -8 },
            color: "#ec407a",
            heartGapTitle: "A Armadura do Orgulho",
            psychBook: "Comunicação Não-Violenta - CNV (Marshall Rosenberg)",
            psychSummary: "Escutar a Necessidade Oculta por trás de Palavras Defensivas",
            introText: "Mio está sempre cercada de luxo, mas afasta os colegas com comentários orgulhosos quando fica nervosa.",
            minigameConfig: {
                speed: 1.25,
                targetZoneWidth: 28,
                durationSec: 13,
                obstacleRate: 0.85
            },
            mentorGuide: {
                conceptTitle: "Comunicação Não-Violenta: Ouvindo Necessidades Ocultas (Marshall Rosenberg)",
                whyFailed: "Pessoas com comportamento defensivo ('tsundere' ou orgulhosas) usam a ironia como escudo contra o medo de rejeição. Se você rebater com críticas ou se afastar, confirma o medo dela de que ninguém gosta dela de verdade.",
                howToApply: "1. Segundo Marshall Rosenberg (CNV), toda expressão defensiva é um pedido trágico de conexão.\n2. Não reaja ao tom orgulhoso; traduza a necessidade por trás dele (necessidade de companhia, inclusão e aceitação).\n3. Convide-a com naturalidade e gentileza, permitindo que ela baixe a guarda sem perder a dignidade."
            },
            steps: [
                {
                    stepNum: 1,
                    timeLimit: 16,
                    expression: "focused",
                    bodyCue: "Linguagem Corporal: Braços cruzados, mas olhando de canto de olho para a roda de estudantes lanchando juntos.",
                    dialogue: "Hmph! Não pense que estou parada aqui porque queria lanchar com alguém, Kael! É que o meu chá importado demorou para esfriar, só isso!",
                    options: [
                        {
                            text: "Se você continuar falando com esse nariz empinado, ninguém vai te chamar para sentar junto mesmo.",
                            quality: "wrong",
                            affinityDelta: -15,
                            feedback: "Confrontar a defesa diretamente ativa ainda mais o escudo emocional dela.",
                            reply: "O-o quê?! Eu não preciso da companhia de ninguém! Pode ir embora!"
                        },
                        {
                            text: "Esse chá parece ótimo! Estava procurando um lugar tranquilo no jardim, posso me sentar aqui com você enquanto ele esfria?",
                            quality: "best",
                            affinityDelta: 35,
                            feedback: "Brilhante uso da CNV! Você ignorou a armadura verbal e atendeu à necessidade real dela: companhia sem julgamento.",
                            reply: "Hã?! B-bom... já que o banco é grande e você pediu com educação, eu permito que se sente aí!"
                        },
                        {
                            text: "Tudo bem, vou deixar você tomar seu chá sozinha então.",
                            quality: "wrong",
                            affinityDelta: -10,
                            feedback: "Levar a fala defensiva ao pé da letra deixou Mio ainda mais solitária.",
                            reply: "Ah... já vai? É... claro, era exatamente o que eu queria..."
                        }
                    ]
                },
                {
                    stepNum: 2,
                    timeLimit: 15,
                    expression: "shy",
                    bodyCue: "Linguagem Corporal: Mexendo nas fitas do cabelo e empurrando discretamente uma caixinha de doces na sua direção.",
                    dialogue: "O chef da minha casa preparou biscoitos demais hoje. Sobraram esses aqui... Não é como se eu tivesse trazido para dividir, mas seria desperdício jogar fora!",
                    options: [
                        {
                            text: "Sei, você acordou mais cedo só para preparar isso para a gente, não foi?",
                            quality: "neutral",
                            affinityDelta: 5,
                            feedback: "Provocação leve, mas deixou Mio constrangida demais para admitir o gesto de carinho.",
                            reply: "N-claro que não! Pare de inventar coisas, seu convencido!"
                        },
                        {
                            text: "Obrigado, Mio! Estão deliciosos. Foi muita gentileza sua lembrar de dividir comigo.",
                            quality: "best",
                            affinityDelta: 40,
                            feedback: "Perfeito! Você validou o gesto de afeto com gratidão sincera, tornando seguro para ela ser gentil.",
                            reply: "S-sério que gostou? Na verdade... eu mesma ajudei a confeitar esses de morango hoje cedo..."
                        },
                        {
                            text: "Não precisa, já comi na cantina agora há pouco.",
                            quality: "wrong",
                            affinityDelta: -20,
                            feedback: "Recusar um gesto vulnerável de aproximação ('Bid for Connection' de Gottman) machuca profundamente pessoas orgulhosas.",
                            reply: "Ah... Entendi. Esqueça que eu ofereci."
                        }
                    ]
                },
                {
                    stepNum: 3,
                    timeLimit: 14,
                    expression: "sad",
                    bodyCue: "Linguagem Corporal: Voz mais baixa e sincera, olhando para as pétalas de cerejeira caindo.",
                    dialogue: "Kael... Por que você continua conversando comigo? Na minha família sempre me ensinaram que demonstrar fraqueza é perigoso, então eu acabo afastando todo mundo sem querer...",
                    options: [
                        {
                            text: "Porque eu consigo ver a pessoa carinhosa e leal que existe por trás dessa pose. Comigo você não precisa usar armadura.",
                            quality: "best",
                            affinityDelta: 45,
                            feedback: "Maestria em Comunicação Não-Violenta e Empatia! A Lacuna do Coração de Mio está pronta para ser curada!",
                            reply: "Kael... Você é a primeira pessoa que enxerga quem eu realmente sou. Promete que vamos lanchar juntos amanhã também?"
                        },
                        {
                            text: "É só você pedir desculpas para a turma toda e mudar seu jeito de falar amanhã.",
                            quality: "neutral",
                            affinityDelta: 5,
                            feedback: "Focou na correção rápida em vez de oferecer segurança emocional primeiro.",
                            reply: "Não é tão simples assim mudar da noite para o dia..."
                        },
                        {
                            text: "Eu gosto de desafios difíceis, quanto mais brava mais divertido!",
                            quality: "wrong",
                            affinityDelta: -15,
                            feedback: "Fez parecer que os sentimentos dela são apenas um passatempo.",
                            reply: "Eu estou falando sério, Kael! Meus sentimentos não são uma brincadeira!"
                        }
                    ]
                }
            ]
        },

        // ====================================================================
        // FASE 3: SHIORI KAZAMA (Nível 3 - Médio)
        // ====================================================================
        {
            id: 3,
            charId: "shiori",
            name: "Shiori Kazama",
            role: "Guardiã da Biblioteca & Escritora",
            locationName: "Pavilhão da Biblioteca • Oeste do Campus",
            difficultyLabel: "Nível 3 • Médio",
            position3D: { x: -24, z: 16 },
            color: "#29b6f6",
            heartGapTitle: "A Voz Entre as Páginas",
            psychBook: "Tornar-se Pessoa (Carl Rogers) & O Poder dos Quietos (Susan Cain)",
            psychSummary: "Escuta Ativa Profunda e Respeito ao Tempo do Introvertido",
            introText: "Shiori escreve contos incríveis em segredo, mas fala tão baixinho que sente que o mundo nunca tem paciência para ouvi-la.",
            minigameConfig: {
                speed: 1.45,
                targetZoneWidth: 25,
                durationSec: 14,
                obstacleRate: 1.05
            },
            mentorGuide: {
                conceptTitle: "Escuta Ativa de Carl Rogers e Psicologia da Introversão (Susan Cain)",
                whyFailed: "Pessoas altamente introvertidas e sensíveis se fecham quando são pressionadas a falar alto, interrompidas ou forçadas a ir para ambientes barulhentos. Tentar 'consertar' a timidez dela à força gera ansiedade.",
                howToApply: "1. Pratique a Escuta Ativa (Carl Rogers): crie um espaço silencioso, paciente e acolhedor.\n2. Conecte-se através do canal em que ela se sente segura (os livros e histórias que ela escreve).\n3. Demonstre que mesmo as palavras ditas em voz baixa têm imenso valor para você."
            },
            steps: [
                {
                    stepNum: 1,
                    timeLimit: 15,
                    expression: "surprised",
                    bodyCue: "Linguagem Corporal: Escondeu rapidamente um caderno de anotações atrás de um livro grosso ao te ver chegar.",
                    dialogue: "A-ah... Olá, Kael. Desculpe, eu estava ocupando a mesa de leitura... Se você veio procurar um livro, eu já vou sair para não atrapalhar...",
                    options: [
                        {
                            text: "Não precisa sair, Shiori. Na verdade, gosto da paz da biblioteca e queria saber o que você estava escrevendo com tanta dedicação.",
                            quality: "best",
                            affinityDelta: 35,
                            feedback: "Excelente! Você respeitou o espaço tranquilo dela e demonstrou curiosidade gentil sem invadir.",
                            reply: "Você... reparou que eu estava escrevendo? É só um conto sobre um viajante das estrelas... Achei que ninguém se interessaria."
                        },
                        {
                            text: "Fale mais alto, Shiori! Você precisa perder essa vergonha e ir conversar no pátio cheio!",
                            quality: "wrong",
                            affinityDelta: -20,
                            feedback: "Forçar um introvertido a agir como extrovertido invalida sua personalidade (Susan Cain).",
                            reply: "M-me desculpe... lugares barulhentos me deixam tonta..."
                        },
                        {
                            text: "Me empresta esse caderno aí para eu ler em voz alta!",
                            quality: "wrong",
                            affinityDelta: -15,
                            feedback: "Invadir a privacidade criativa antes de construir confiança assusta pessoas tímidas.",
                            reply: "N-não, por favor! Ainda não está pronto!"
                        }
                    ]
                },
                {
                    stepNum: 2,
                    timeLimit: 14,
                    expression: "sad",
                    bodyCue: "Linguagem Corporal: Dedos entrelaçados sobre a capa do caderno, voz suave mas carregada de emoção.",
                    dialogue: "Sempre que tento falar numa conversa em grupo, alguém fala mais alto por cima de mim... Aí eu penso que minhas ideias não fazem diferença nenhuma. Nos livros, pelo menos, ninguém interrompe.",
                    options: [
                        {
                            text: "As pessoas não fazem por mal, você é que precisa se impor na conversa.",
                            quality: "neutral",
                            affinityDelta: -5,
                            feedback: "Minimizar a dor dela transfere toda a culpa para ela mesma.",
                            reply: "Eu sei que a culpa é minha por ser tão quieta..."
                        },
                        {
                            text: "Aqui ninguém vai te interromper. Eu estou ouvindo cada palavra sua no seu tempo, e quero muito conhecer a história que você criou.",
                            quality: "best",
                            affinityDelta: 40,
                            feedback: "Escuta Empática pura de Carl Rogers! Você criou segurança psicológica total.",
                            reply: "No meu tempo...? Kael, quando você me escuta assim, sinto que minhas palavras finalmente ganham vida."
                        },
                        {
                            text: "Deixe de bobagem, fale qualquer coisa que todo mundo vai achar bonitinho!",
                            quality: "wrong",
                            affinityDelta: -15,
                            feedback: "Tratar os pensamentos profundos dela como algo infantil diminui sua autoestima intelectual.",
                            reply: "Eu não quero que achem 'bonitinho'... queria ser compreendida de verdade."
                        }
                    ]
                },
                {
                    stepNum: 3,
                    timeLimit: 13,
                    expression: "shy",
                    bodyCue: "Linguagem Corporal: Estendeu o caderno com as duas mãos para você, com as bochechas coradas.",
                    dialogue: "No final do meu conto, o viajante solitário encontra alguém que entende o idioma das estrelas silenciosas... Kael, você aceitaria ser o primeiro leitor da minha história?",
                    options: [
                        {
                            text: "Será uma honra, Shiori. E depois de ler cada página, quero conversar com você sobre tudo o que senti!",
                            quality: "best",
                            affinityDelta: 45,
                            feedback: "Conexão Completa! Você valorizou a essência criativa e emocional de Shiori!",
                            reply: "Obrigada, Kael! Pela primeira vez, o mundo fora dos livros parece tão bonito quanto os meus sonhos!"
                        },
                        {
                            text: "Claro, deixa comigo que depois eu faço um resumo rápido.",
                            quality: "neutral",
                            affinityDelta: 10,
                            feedback: "Aceitou, mas 'resumo rápido' soou um pouco apressado para algo tão precioso.",
                            reply: "Ah, tudo bem... leia quando tiver um tempinho."
                        },
                        {
                            text: "Só se tiver bastante ação e batalhas espaciais!",
                            quality: "wrong",
                            affinityDelta: -10,
                            feedback: "Faltou sensibilidade ao tema poético que ela acabou de compartilhar.",
                            reply: "Ah... não é bem esse tipo de história..."
                        }
                    ]
                }
            ]
        },

        // ====================================================================
        // FASE 4: KARIN MINASE (Nível 4 - Difícil)
        // ====================================================================
        {
            id: 4,
            charId: "karin",
            name: "Karin Minase",
            role: "Vocalista & Idol Estudantil",
            locationName: "Palco Cultural • Norte do Campus",
            difficultyLabel: "Nível 4 • Difícil",
            position3D: { x: 0, z: -26 },
            color: "#ffd54f",
            heartGapTitle: "O Sorriso Atrás dos Holofotes",
            psychBook: "A Ciência da Confiança (John Gottman) & A Psicologia da Proximidade (Arthur Aron)",
            psychSummary: "Responder aos Pedidos de Conexão ('Bids') e Autorrevelação Autêntica",
            introText: "Karin é adorada por toda a escola como uma estrela radiante, mas sente uma profunda solidão porque todos amam sua personagem de palco, não a garota real.",
            minigameConfig: {
                speed: 1.7,
                targetZoneWidth: 22,
                durationSec: 15,
                obstacleRate: 1.3
            },
            mentorGuide: {
                conceptTitle: "Pedidos de Conexão (John Gottman) e Vulnerabilidade Recíproca (Arthur Aron)",
                whyFailed: "Quando alguém vive preso a uma 'persona perfeita' (como uma idol ou pessoa sempre alegre), agir apenas como um fã deslumbrado reforça a parede entre a máscara e a pessoa real. Por outro lado, dizer que o sorriso dela é 'falso' soa como um ataque.",
                howToApply: "1. Identifique os pequenos 'Bids for Connection' (Gottman): quando Karin deixa escapar um suspiro ou fala de coisas simples do dia a dia.\n2. Use a Autorrevelação Recíproca (estudos de Arthur Aron sobre intimidade): compartilhe também uma verdade sua para mostrar que é seguro ser real ao seu lado."
            },
            steps: [
                {
                    stepNum: 1,
                    timeLimit: 14,
                    expression: "happy",
                    bodyCue: "Linguagem Corporal: Fazendo pose brilhante de idol, mas seus ombros caem levemente quando os outros fãs vão embora.",
                    dialogue: "Tcharam~! Olá, fã número um! A Karin-chan está sempre com 1000% de energia para alegrar o seu dia! Quer um autógrafo especial hoje, Kael? ☆",
                    options: [
                        {
                            text: "Sim!! Você é uma deusa perfeita, Karin-chan, nunca fique triste!",
                            quality: "wrong",
                            affinityDelta: -15,
                            feedback: "Você agiu como mais um fã que exige que ela mantenha a máscara 100% do tempo.",
                            reply: "Hehe... claro! A Karin-chan nunca fica triste... nunca mesmo."
                        },
                        {
                            text: "O show foi incrível, Karin. Mas agora que a multidão saiu, você pode descansar o sorriso de palco se quiser. Trouxe água fresca para você.",
                            quality: "best",
                            affinityDelta: 35,
                            feedback: "Perfeito! Você reconheceu o talento dela, mas ofereceu espaço seguro para a pessoa real descansar.",
                            reply: "Hã...? Você percebeu que eu estava exausta? Ufa... minhas bochechas estavam até doendo de tanto sorrir para as fotos."
                        },
                        {
                            text: "Pare de fingir essa voz de personagem, é muito artificial.",
                            quality: "wrong",
                            affinityDelta: -20,
                            feedback: "Crítica dura! Atacar a persona pública gera vergonha em vez de acolhimento.",
                            reply: "N-não é artificial! Eu me esforço tanto para deixar as pessoas felizes..."
                        }
                    ]
                },
                {
                    stepNum: 2,
                    timeLimit: 13,
                    expression: "sad",
                    bodyCue: "Linguagem Corporal: Olhando para o microfone desligado, falando com sua voz natural e suave.",
                    dialogue: "Às vezes tenho medo de que, se eu mostrar que também tenho dias cinzentos, que gosto de ficar de óculos ouvindo chuva em silêncio... todo mundo vá se decepcionar e ir embora.",
                    options: [
                        {
                            text: "Eu também sinto isso às vezes: todo mundo me vê apenas como 'o cara dos jogos', mas poucos conhecem quem eu sou. Eu adoraria conhecer essa Karin que gosta de ouvir a chuva.",
                            quality: "best",
                            affinityDelta: 40,
                            feedback: "Autorrevelação Recíproca (Arthur Aron)! Compartilhar sua própria vulnerabilidade criou uma ponte imediata de confiança!",
                            reply: "Kael... você também passa por isso?! Saber que você me entende me dá um alívio tão grande no peito..."
                        },
                        {
                            text: "Uma estrela de verdade precisa manter o mistério para não perder seguidores.",
                            quality: "wrong",
                            affinityDelta: -20,
                            feedback: "Confirmou exatamente o maior medo dela: que ela só é amada enquanto usa uma máscara.",
                            reply: "Então é verdade... as pessoas só gostam da ilusão."
                        },
                        {
                            text: "Não ligue para os outros, poste uma foto de óculos nas redes sociais!",
                            quality: "neutral",
                            affinityDelta: 5,
                            feedback: "Sugestão superficial; ela busca conexão íntima e real, não aprovação em redes sociais.",
                            reply: "Não é sobre postar fotos, Kael... é sobre ter alguém real ao meu lado."
                        }
                    ]
                },
                {
                    stepNum: 3,
                    timeLimit: 12,
                    expression: "shy",
                    bodyCue: "Linguagem Corporal: Cantarolando uma melodia baixinho só para você, sem microfone e sem pose.",
                    dialogue: "Escuta essa melodia... Eu compus ontem à noite, sem pensar no que faria sucesso. É uma música simples sobre querer caminhar para casa de mãos dadas com alguém que conheça meus defeitos.",
                    options: [
                        {
                            text: "É a música mais bonita que você já cantou, porque tem a sua alma verdadeira. Posso te acompanhar no caminho para casa hoje?",
                            quality: "best",
                            affinityDelta: 45,
                            feedback: "Acolhimento pleno do 'Pedido de Conexão' (Gottman)! O coração de Karin está em total sintonia!",
                            reply: "Sim! Sem holofotes, sem autógrafos... hoje sou apenas a Karin caminhando ao lado do Kael ♥"
                        },
                        {
                            text: "Ficou ótima! Se colocarmos uma batida eletrônica vai viralizar na escola!",
                            quality: "wrong",
                            affinityDelta: -15,
                            feedback: "Transformou o momento íntimo e autêntico dela em um produto comercial de novo!",
                            reply: "Ah... você estava pensando em viralizar... Não era para isso que eu cantei para você."
                        },
                        {
                            text: "A afinação está muito boa, parabéns pela composição.",
                            quality: "neutral",
                            affinityDelta: 5,
                            feedback: "Elogio técnico quando ela estava abrindo o coração emocionalmente.",
                            reply: "Obrigada pelo elogio técnico, Kael..."
                        }
                    ]
                }
            ]
        },

        // ====================================================================
        // FASE 5: REINA TSUKISHIRO (Nível 5 - Mestre Final)
        // ====================================================================
        {
            id: 5,
            charId: "reina",
            name: "Reina Tsukishiro",
            role: "Presidente do Conselho Estudantil",
            locationName: "Terraço do Pôr do Sol • Prédio Principal",
            difficultyLabel: "Nível 5 • Mestre Final",
            position3D: { x: 22, z: 18 },
            color: "#b39ddb",
            heartGapTitle: "A Fortaleza da Razão",
            psychBook: "Inteligência Emocional (Daniel Goleman) & Os 7 Princípios das Relações Duradouras (John Gottman)",
            psychSummary: "Integração entre Razão e Emoção, Confiança Mútua e Parceria Horizontal",
            introText: "Reina administra toda a Academia com precisão impecável, mas acredita que depender emocionalmente de alguém leva inevitavelmente à decepção.",
            minigameConfig: {
                speed: 2.0,
                targetZoneWidth: 19,
                durationSec: 16,
                obstacleRate: 1.55
            },
            mentorGuide: {
                conceptTitle: "Inteligência Emocional (Daniel Goleman) e Construção de Confiança (John Gottman)",
                whyFailed: "Pessoas hiper-racionais e sobrecarregadas usam o controle e a lógica como defesa porque já foram decepcionadas ao confiar nos outros. Tentar vencê-la no debate lógico ou tratá-la como 'fria e sem coração' só fortalece o muro.",
                howToApply: "1. Reconheça e respeite a competência e a inteligência dela (nunca diminua suas conquistas).\n2. Demonstre Confiabilidade através de ações concretas (dividir o fardo de trabalho em parceria de igual para igual).\n3. Mostre que razão e emoção não são inimigas (Daniel Goleman): confiar em um parceiro leal multiplica a força, não a reduz."
            },
            steps: [
                {
                    stepNum: 1,
                    timeLimit: 13,
                    expression: "focused",
                    bodyCue: "Linguagem Corporal: Segurando uma pilha enorme de relatórios do Festival Escolar sob o vento do pôr do sol.",
                    dialogue: "Kael Takagi. Se subiu ao terraço para conversar amenidades, receio que meu cronograma esteja lotado. Prefiro revisar todos os 40 orçamentos do Festival sozinha a correr o risco de que alguém cometa erros.",
                    options: [
                        {
                            text: "Você é muito fria e mandona, Reina! Precisa aprender a relaxar e deixar o trabalho de lado!",
                            quality: "wrong",
                            affinityDelta: -20,
                            feedback: "Julgar e desvalorizar o senso de responsabilidade dela cria resistência imediata.",
                            reply: "Se eu 'deixar o trabalho de lado', o Festival inteiro dos alunos será cancelado. Com licença."
                        },
                        {
                            text: "Eu admiro sua dedicação para que o Festival seja perfeito para todos. Já separei as planilhas por setor aqui no meu PDSA; deixe-me revisar metade com você agora.",
                            quality: "best",
                            affinityDelta: 35,
                            feedback: "Magistral! Você validou o propósito nobre dela e ofereceu ajuda prática e competente (Ação Confiável de Gottman).",
                            reply: "Espere... Você já estruturou os dados por setor com essa precisão?! Confesso que... sua eficiência é impressionante, Kael."
                        },
                        {
                            text: "Eu sou o Mestre das Rotas, consigo resolver esse orçamento melhor que você de olhos fechados!",
                            quality: "wrong",
                            affinityDelta: -15,
                            feedback: "Competir por ego faz parecer uma disputa de vaidade em vez de parceria.",
                            reply: "Arrogância sem conhecimento das regras do conselho não me impressiona."
                        }
                    ]
                },
                {
                    stepNum: 2,
                    timeLimit: 12,
                    expression: "sad",
                    bodyCue: "Linguagem Corporal: Apoiou as mãos no parapeito do terraço, olhando o horizonte dourado do entardecer.",
                    dialogue: "Fazia muito tempo que alguém não cumpria o que prometia ao meu lado... No ano passado, confiei em pessoas que me deixaram sozinha no momento mais difícil. Desde então, concluí que sentimentos são variáveis instáveis demais.",
                    options: [
                        {
                            text: "Sentimentos não são falhas de cálculo, Reina. Quando há respeito e compromisso mútuo, ter alguém ao seu lado é o que nos permite ir mais longe sem quebrar.",
                            quality: "best",
                            affinityDelta: 40,
                            feedback: "Inteligência Emocional de alto nível (Daniel Goleman)! Você conectou a linguagem analítica dela com a verdade emocional.",
                            reply: "Ir mais longe sem quebrar... Nunca pensei na confiança como uma força compartilhada. Quando você diz isso, parece quase lógico acreditar de novo."
                        },
                        {
                            text: "Esqueça a lógica! O amor vence tudo sem precisar pensar em nada!",
                            quality: "wrong",
                            affinityDelta: -15,
                            feedback: "Discurso clichê e impulsivo soa pouco confiável para uma mente analítica.",
                            reply: "Frases impulsivas são exatamente o que as pessoas dizem antes de desaparecerem quando surgem responsabilidades."
                        },
                        {
                            text: "Aquelas pessoas do ano passado eram incompetentes, não pense mais nisso.",
                            quality: "neutral",
                            affinityDelta: 5,
                            feedback: "Focou nos outros em vez de acolher a ferida de confiança dela.",
                            reply: "Não é tão simples apagar uma lição aprendida com dor."
                        }
                    ]
                },
                {
                    stepNum: 3,
                    timeLimit: 11,
                    expression: "shy",
                    bodyCue: "Linguagem Corporal: O vento move os cabelos prateados/lilases de Reina; ela segura sua mão levemente sobre a mesa.",
                    dialogue: "Kael... Você ajudou cada estudante desta academia a superar suas inseguranças, e agora desarmou todas as minhas defesas. Diga-me com sinceridade: por que se dedicou tanto para chegar até o meu coração?",
                    options: [
                        {
                            text: "Porque por trás da Presidente perfeita, vi alguém extraordinária que cuidava de todos, mas precisava de alguém que cuidasse dela também. Quero caminhar ao seu lado de verdade.",
                            quality: "best",
                            affinityDelta: 50,
                            feedback: "CONQUISTA SUPREMA! Empatia, Respeito, Reciprocidade e Autenticidade unidos no clímax!",
                            reply: "Kael... Pela primeira vez na vida, não tenho nenhuma resposta lógica na ponta da língua. Só sei que meu coração escolheu confiar em você!"
                        },
                        {
                            text: "Porque você era a fase nível 5 mais difícil e eu nunca deixo um jogo em 99%!",
                            quality: "wrong",
                            affinityDelta: -25,
                            feedback: "Transformar uma pessoa real em apenas um troféu destrói toda a confiança construída!",
                            reply: "Então eu era apenas uma meta de pontuação para você?! Que decepção..."
                        },
                        {
                            text: "Porque a Lumi me pediu para ajudar o Conselho Estudantil.",
                            quality: "neutral",
                            affinityDelta: 0,
                            feedback: "Terceirizar sua motivação tirou o brilho da sua própria escolha sincera.",
                            reply: "Então foi apenas por obrigação de uma tarefa...?"
                        }
                    ]
                }
            ]
        }
    ],

    // Fundamentos de Psicologia e Game Design para deixar o jogador engajado por dias/horas (Requisito 8 e 13)
    booksLibrary: [
        {
            category: "Psicologia da Conquista & Relações Humanas",
            title: "Como Fazer Amigos e Influenciar Pessoas — Dale Carnegie",
            principle: "Interesse Genuíno e Valorização Sincera",
            summary: "Carnegie demonstra que você conquista mais pessoas em duas horas se interessando genuinamente por elas do que em dois anos tentando fazer com que elas se interessem por você. Ouvir com atenção, lembrar o que é importante para a outra pessoa e reconhecer seu valor real são a base de toda atração saudável."
        },
        {
            category: "Psicologia da Conquista & Relações Humanas",
            title: "Comunicação Não-Violenta (CNV) — Marshall Rosenberg",
            principle: "Observação sem Julgamento e Leitura de Necessidades",
            summary: "Por trás de toda armadura, timidez ou orgulho existe uma necessidade humana universal (segurança, pertencimento, compreensão). Quem aprende a ouvir a necessidade em vez de reagir à defesa transforma conflitos em intimidade profunda."
        },
        {
            category: "Psicologia da Conquista & Relações Humanas",
            title: "A Ciência da Confiança & Os 7 Princípios — John Gottman",
            principle: "Bids for Connection (Pedidos de Conexão) e Mapa do Amor",
            summary: "Nos relacionamentos bem-sucedidos, as pessoas respondem positivamente aos pequenos 'pedidos de conexão' (um olhar, um comentário sutil, um desabafo) em mais de 86% das vezes, construindo um 'Mapa do Amor' detalhado sobre os sonhos e receios do parceiro."
        },
        {
            category: "Psicologia da Conquista & Relações Humanas",
            title: "A Coragem de Ser Imperfeito — Brené Brown",
            principle: "Empatia vs. Simpatia e Força da Vulnerabilidade",
            summary: "Empatia é sentir COM a pessoa, não dar respostas prontas ('pelo menos...'). A conexão verdadeira só acontece quando ambos têm a coragem de deixar o perfeccionismo de lado e se mostrarem autênticos."
        },
        {
            category: "Ciência do Game Design & Engajamento Duradouro",
            title: "Flow: A Psicologia do Alto Desempenho — Mihaly Csikszentmihalyi",
            principle: "O Canal de Flow (Equilíbrio entre Desafio Progressivo e Habilidade)",
            summary: "Aplicado neste jogo: As Fases 1 a 5 aumentam gradualmente a velocidade em tempo real e a sutileza psicológica ao mesmo tempo em que seus atributos e itens evoluem, evitando o tédio e a ansiedade (com suporte da Mentoria na 3ª tentativa)."
        },
        {
            category: "Ciência do Game Design & Engajamento Duradouro",
            title: "Actionable Gamification (Octalysis) — Yu-kai Chou",
            principle: "Os 8 Motores Motivacionais (Significado Épico, Progresso e Descoberta)",
            summary: "Aplicado neste jogo: Combina Significado Épico (curar as Lacunas do Coração), Realização (Níveis, Troféus e Atributos), Empoderamento Criativo (escolhas + uso estratégico de itens) e Recompensas no Mapa 3D para manter a vontade de jogar por horas e dias."
        },
        {
            category: "Ciência do Game Design & Engajamento Duradouro",
            title: "A Theory of Fun for Game Design — Raph Koster",
            principle: "Diversão como Domínio de Padrões Reais para a Vida",
            summary: "O cérebro humano sente prazer duradouro quando um jogo ensina habilidades reais. Ao dominar este simulador, você treina percepção emocional, escuta ativa e empatia aplicáveis na vida real."
        }
    ],

    achievements: [
        { id: "first_step", icon: "🌟", name: "Início da Jornada", desc: "Concluiu o tutorial e iniciou a exploração 3D da Academia." },
        { id: "clear_ayumi", icon: "🏃‍♀️", name: "Vento da Liberdade", desc: "Curou a Lacuna do Coração de Ayumi Hoshino (Fase 1)." },
        { id: "clear_mio", icon: "🌸", name: "Além do Orgulho", desc: "Curou a Lacuna do Coração de Mio Sakuragi (Fase 2)." },
        { id: "clear_shiori", icon: "📖", name: "A Voz das Estrelas", desc: "Curou a Lacuna do Coração de Shiori Kazama (Fase 3)." },
        { id: "clear_karin", icon: "🎤", name: "Melodia Autêntica", desc: "Curou a Lacuna do Coração de Karin Minase (Fase 4)." },
        { id: "clear_reina", icon: "👑", name: "Lógica do Coração", desc: "Curou a Lacuna do Coração de Reina Tsukishiro (Fase 5)." },
        { id: "first_try_pro", icon: "🎯", name: "Psicólogo Nato", desc: "Concluiu uma fase inteira na primeira tentativa sem errar." },
        { id: "mentor_student", icon: "🧠", name: "Aprendiz da Empatia", desc: "Consultou o Guia Psicológico e aplicou o aprendizado com sucesso." },
        { id: "collector_stars", icon: "💎", name: "Caçador de Estrelas 3D", desc: "Coletou 15 Cristais Estelares explorando o campus 3D em tempo real." },
        { id: "gift_master", icon: "🎁", name: "Mestre da Reciprocidade", desc: "Utilizou 3 itens facilitadores para criar momentos especiais." },
        { id: "harmony_ace", icon: "🎵", name: "Sintonia Perfeita", desc: "Venceu o minigame de Sintonia do Coração em Tempo Real com mais de 90%." },
        { id: "true_master", icon: "🏆", name: "Deus da Conquista Empática", desc: "Conquistou todas as 5 fases e desbloqueou o Final Verdadeiro!" }
    ]
};

window.GAME_DATA = GAME_DATA;

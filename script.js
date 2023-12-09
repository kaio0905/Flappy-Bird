let frames = 0;
const som_HIT = new Audio();
som_HIT.src = './efeitos/hit.wav'

const sprites = new Image();
sprites.src = './sprites.png';

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');

//
//Plano de fundo
//

const planoDeFundo = {
    spriteX: 390,
    spriteY: 0,
    largura: 275,
    altura: 240,
    x: 0,
    y: canvas.height - 204,
    desenha() {
        contexto.fillStyle = '#70c5ce';
        contexto.fillRect(0, 0, canvas.width, canvas.height);

        contexto.drawImage(
            sprites,
            planoDeFundo.spriteX, planoDeFundo.spriteY,
            planoDeFundo.largura, planoDeFundo.altura,
            planoDeFundo.x, planoDeFundo.y,
            planoDeFundo.largura, planoDeFundo.altura,
        );

        contexto.drawImage(
            sprites,
            planoDeFundo.spriteX, planoDeFundo.spriteY,
            planoDeFundo.largura, planoDeFundo.altura,
            (planoDeFundo.x + planoDeFundo.largura), planoDeFundo.y,
            planoDeFundo.largura, planoDeFundo.altura,
        );
    },
};


//
//Chão
//

function criaChao() {
    const chao = {
        spriteX: 0,
        spriteY: 610,
        largura: 224,
        altura: 112,
        x: 0,
        y: canvas.height - 112,

        atualiza() {
            const movimentoDoChao = 1;
            const repeteEm = chao.largura / 2;
            const movimentacao = chao.x - movimentoDoChao;

            chao.x = movimentacao % repeteEm;
        },

        desenha() {
            contexto.drawImage(
                sprites,
                chao.spriteX, chao.spriteY,
                chao.largura, chao.altura,
                chao.x, chao.y,
                chao.largura, chao.altura,
            );

            contexto.drawImage(
                sprites,
                chao.spriteX, chao.spriteY,
                chao.largura, chao.altura,
                (chao.x + chao.largura), chao.y,
                chao.largura, chao.altura,
            );
        },
    };
    return chao;
};


//
//Flappy Bird
//

function criaFlappyBird() {
    const flappyBird = {
        spriteX: 0,
        spriteY: 0,
        largura: 33,
        altura: 24,
        x: 10,
        y: 50,
        pulo: 4.6,
        gravidade: 0.25,
        velocidade: 0,

        pula() {
            flappyBird.velocidade = - flappyBird.pulo
        },

        atualiza() {

            if (colisaoChao(flappyBird, globais.chao)) {
                som_HIT.play();

                mudaParaTela(tela.Game_Over);
                return;
            }

            flappyBird.velocidade = flappyBird.velocidade + flappyBird.gravidade,
                flappyBird.y = flappyBird.y + flappyBird.velocidade
        },

        movimentos: [
            { spriteX: 0, spriteY: 0, },  //asa cima
            { spriteX: 0, spriteY: 26, },  //asa meio
            { spriteX: 0, spriteY: 52, },  //asa baixo
        ],

        frameAtual: 0,
        atualizaFrameAtual() {
            const intervaloDeFrames = 10;
            const passouIntervalo = frames % intervaloDeFrames === 0;


            if (passouIntervalo) {
                const BaseDoIncremento = 1;
                const incremento = BaseDoIncremento + flappyBird.frameAtual;
                const baseRepeticao = flappyBird.movimentos.length;
                flappyBird.frameAtual = incremento % baseRepeticao

            }
        },

        desenha() {
            flappyBird.atualizaFrameAtual();
            const { spriteX, spriteY } = flappyBird.movimentos[flappyBird.frameAtual];

            contexto.drawImage(
                sprites,
                spriteX, spriteY,
                flappyBird.largura, flappyBird.altura,
                flappyBird.x, flappyBird.y,
                flappyBird.largura, flappyBird.altura,
            );
        },
    };
    return flappyBird;
};

//
//Canos
//

function criaCanos() {
    const canos = {
        largura: 52,
        altura: 400,
        chao: {
            spriteX: 0,
            spriteY: 169,
        },
        ceu: {
            spriteX: 52,
            spriteY: 169,
        },
        espaco: 80,

        desenha() {

            canos.pares.forEach(function (par) {
                const yRandom = par.y;

                const espacoCanos = 80;

                const canoCeuX = par.x;
                const canoCeuY = yRandom;

                //Cano Céu
                contexto.drawImage(
                    sprites,
                    canos.ceu.spriteX, canos.ceu.spriteY,
                    canos.largura, canos.altura,
                    canoCeuX, canoCeuY,
                    canos.largura, canos.altura,
                )

                //Cano Chão
                const canoChaoX = par.x;
                const canoChaoY = canos.altura + espacoCanos + yRandom;
                contexto.drawImage(
                    sprites,
                    canos.chao.spriteX, canos.chao.spriteY,
                    canos.largura, canos.altura,
                    canoChaoX, canoChaoY,
                    canos.largura, canos.altura,
                )

                par.canoCeu = {
                    x: canoCeuX,
                    y: canos.altura + canoCeuY,
                }

                par.canoChao = {
                    x: canoChaoX,
                    y: canoChaoY,
                }
            })
        },

        //Colisão dos canos

        colisaoFlappyBird(par) {
            const cabecaFlappyBird = globais.flappyBird.y;
            const peFlappyBird = globais.flappyBird.y + globais.flappyBird.altura


            if (globais.flappyBird.x + globais.flappyBird.largura - 5 >= par.x) {

                if (cabecaFlappyBird <= par.canoCeu.y) {
                    return true;
                }

                if (peFlappyBird >= par.canoChao.y) {
                    return true;
                }
            }

            return false;
        },

        pares: [],
        atualiza() {
            const passou100Frames = frames % 100 === 0;
            if (passou100Frames) {
                canos.pares.push({
                    x: canvas.width,
                    y: -150 * (Math.random() + 1),
                });
            };

            canos.pares.forEach(function (par) {
                par.x = par.x - 2;

                if (canos.colisaoFlappyBird(par)) {
                    som_HIT.play();
                    mudaParaTela(tela.Game_Over)
                }

                if (par.x + canos.largura <= 0) {
                    canos.pares.shift();
                }
            })
        },
    };

    return canos;
};

//
//Placar
//

function criaPlacar() {
    const placar = {
        pontuacao: 0,

        desenha() {
            contexto.font = '35px "VT323"';
            contexto.textAlign = 'right';
            contexto.fillStyle = 'white';
            contexto.fillText(`${placar.pontuacao}`, canvas.width - 10, 35);
        },

        atualiza() {
            const intervaloDeFrames = 21;
            const passouIntervalo = frames % intervaloDeFrames === 0;

            if (passouIntervalo) {
                placar.pontuacao = placar.pontuacao + 1;
                //console.log("você fez: " + placar.pontuacao + " pontos")
            }
        }
    }

    return placar;
}

//
//Colisão
//

function colisaoChao(flappyBird, chao) {
    const flappyBirdY = flappyBird.y + flappyBird.altura;
    const chaoY = chao.y;
    if (flappyBirdY >= chaoY) {
        return true;
    }

    return false;
};

//
//Mensagem da tela inicial
//

const telaDeInicio = {
    sX: 134,
    sY: 0,
    w: 174,
    h: 152,
    x: (canvas.width / 2) - 174 / 2,
    y: 50,

    desenha() {

        contexto.drawImage(
            sprites,
            telaDeInicio.sX, telaDeInicio.sY,
            telaDeInicio.w, telaDeInicio.h,
            telaDeInicio.x, telaDeInicio.y,
            telaDeInicio.w, telaDeInicio.h
        );
    },
};

//
//Tela de Game Over
//

const mensagemDeGameOver = {
    sX: 134,
    sY: 153,
    w: 226,
    h: 200,
    x: (canvas.width / 2) - 226 / 2,
    y: 50,

    desenha() {

        contexto.drawImage(
            sprites,
            mensagemDeGameOver.sX, mensagemDeGameOver.sY,
            mensagemDeGameOver.w, mensagemDeGameOver.h,
            mensagemDeGameOver.x, mensagemDeGameOver.y,
            mensagemDeGameOver.w, mensagemDeGameOver.h
        );
    },
};

//
//Tela
//

const globais = {};

let telaAtiva = {};
function mudaParaTela(novaTela) {
    telaAtiva = novaTela;

    if (telaAtiva.inicializa) {
        telaAtiva.inicializa();
    };
};

//
//Tela de inicio
//

const tela = {

    inicio: {

        inicializa() {
            globais.flappyBird = criaFlappyBird();
            globais.canos = criaCanos();
            globais.chao = criaChao();
        },

        desenha() {

            planoDeFundo.desenha();
            globais.flappyBird.desenha();
            globais.chao.desenha();
            telaDeInicio.desenha();

        },

        click() {
            mudaParaTela(tela.jogo)
        },

        atualiza() {
            globais.chao.atualiza();
        },
    },
};

//
//Tela jogo rodando
//

tela.jogo = {

    inicializa() {
        globais.placar = criaPlacar();
    },

    desenha() {
        planoDeFundo.desenha();
        globais.canos.desenha();
        globais.chao.desenha();
        globais.flappyBird.desenha();
        globais.placar.desenha();
    },

    click() {
        globais.flappyBird.pula();
    },

    atualiza() {
        globais.canos.atualiza();
        globais.chao.atualiza();
        globais.flappyBird.atualiza();
        globais.placar.atualiza();
    },
}



tela.Game_Over = {
    desenha() {
        mensagemDeGameOver.desenha();
    },

    atualiza() {

    },

    click() {
        mudaParaTela(tela.inicio);
    },
}

function loop() {

    telaAtiva.desenha();
    telaAtiva.atualiza();

    frames = frames + 1;
    requestAnimationFrame(loop);
};

window.addEventListener('click', function () {
    if (telaAtiva.click) {
        telaAtiva.click();
    }
});

mudaParaTela(tela.inicio);

loop();
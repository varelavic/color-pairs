import './styles/main.scss';

const cajas = document.querySelectorAll('div.totalCajas div');

// Crear el temporizador
const timerDiv = document.createElement('div');
timerDiv.style.position = 'fixed';
timerDiv.style.top = '20px';
timerDiv.style.right = '40px';
timerDiv.style.background = 'rgba(0,0,0,0.7)';
timerDiv.style.color = 'white';
timerDiv.style.padding = '10px 20px';
timerDiv.style.fontSize = '22px';
timerDiv.style.borderRadius = '10px';
timerDiv.style.zIndex = '1000';
timerDiv.textContent = 'Tiempo: 00:00';
document.body.appendChild(timerDiv);

// Variables del temporizador
let segundosTranscurridos = 0;
let temporizadorActivo = false;
let intervalo = null;

// Función para actualizar el temporizador visual
function mostrarTiempo() {
    const minutos = String(Math.floor(segundosTranscurridos / 60)).padStart(2, '0');
    const segundos = String(segundosTranscurridos % 60).padStart(2, '0');
    timerDiv.textContent = `Tiempo: ${minutos}:${segundos}`;
}

// Generar 15 colores aleatorios
function generarColoresAleatorios(num) {
    const colores = [];
    for (let i = 0; i < num; i++) {
        const red = Math.floor(Math.random() * 256);
        const blue = Math.floor(Math.random() * 256);
        const green = Math.floor(Math.random() * 256);
        colores.push(`rgb(${red}, ${blue}, ${green})`);
    }
    return colores;
}

// Asignar colores a las cajas
function asignarColoresCajas(cajas, colores) {
    for (let i = 0; i < cajas.length; i++) {
        cajas[i].dataset.color = colores[i];
        cajas[i].style.backgroundColor = 'black';
    }
}

// Mezclar colores y duplicarlos para generar parejas
function prepararColores(numCajas, numColores) {
    let colores = generarColoresAleatorios(numColores);
    colores = [...colores, ...colores];
    colores = colores.sort(() => Math.random() - 0.5);
    return colores;
}

// Lógica principal del juego
function manejadorClicks() {
    let seleccionadas = [];
    let parejasEncontradas = [];
    let bloqueo = false;
    const totalParejas = cajas.length / 2;
    let primerClickHecho = false;

    function finalizarJuego() {
        temporizadorActivo = false;
        clearInterval(intervalo);
        timerDiv.textContent += ' ¡Enhorabuena! Puzzle completado.';
    }

    return function(event) {
        if (bloqueo) return;

        // Iniciar temporizador en el primer click 
        if (!primerClickHecho) {
            primerClickHecho = true;
            temporizadorActivo = true;
            intervalo = setInterval(() => {
                if (temporizadorActivo) {
                    segundosTranscurridos += 1;
                    mostrarTiempo();
                }
            }, 1000);
        }

        const caja = event.target;
        if (seleccionadas.length < 2 && !parejasEncontradas.includes(caja)) {
            caja.style.backgroundColor = caja.dataset.color;
            seleccionadas.push(caja);

            if (seleccionadas.length === 2) {
                const [caja1, caja2] = seleccionadas;
                if (caja1.dataset.color === caja2.dataset.color) {
                    parejasEncontradas.push(caja1, caja2);
                    seleccionadas = [];

                    if (parejasEncontradas.length === totalParejas * 2) {
                        finalizarJuego();
                    }
                } else {
                    bloqueo = true;
                    setTimeout(() => {
                        caja1.style.backgroundColor = 'black';
                        caja2.style.backgroundColor = 'black';
                        seleccionadas = [];
                        bloqueo = false;
                    }, 500);
                }
            }
        }
    };
}

function inicializarJuego() {
    segundosTranscurridos = 0;
    mostrarTiempo(); // Mostrar 00:00 antes de empezar
    const numColores = 15;
    const numCajas = 30;
    const colores = prepararColores(numCajas, numColores);
    asignarColoresCajas(cajas, colores);
    const manejadorClick = manejadorClicks();
    for (const caja of cajas) {
        caja.addEventListener('click', manejadorClick);
    }
}

inicializarJuego();


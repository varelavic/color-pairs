import './styles/main.scss';

const NOMBRE_JUEGO = "memoria-juego"; // Nombre único para la clave en localStorage
const cajas = document.querySelectorAll('div.totalCajas div');

// Temporizador
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
document.body.appendChild(timerDiv);

let segundosTranscurridos = 0;
let temporizadorActivo = false;
let intervalo = null;

// Leer o inicializar datos del juego
function leerEstadoJuego() {
    const datos = localStorage.getItem(NOMBRE_JUEGO);
    return datos ? JSON.parse(datos) : null;
}

function guardarEstadoJuego(estado) {
    localStorage.setItem(NOMBRE_JUEGO, JSON.stringify(estado));
}

function mostrarTiempo() {
    const minutos = String(Math.floor(segundosTranscurridos / 60)).padStart(2, '0');
    const segundos = String(segundosTranscurridos % 60).padStart(2, '0');
    timerDiv.textContent = `Tiempo: ${minutos}:${segundos}`;
}

// Generar colores aleatorios si no existen en la carga previa
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

function prepararColores(numCajas, numColores, coloresPrevios) {
    if (coloresPrevios && coloresPrevios.length === numCajas) {
        return coloresPrevios;
    }
    let colores = generarColoresAleatorios(numColores);
    colores = [...colores, ...colores];
    colores = colores.sort(() => Math.random() - 0.5);
    return colores;
}

function asignarColoresCajas(cajas, colores, parejasEncontradas = []) {
    for (let i = 0; i < cajas.length; i++) {
        cajas[i].dataset.color = colores[i];
        cajas[i].style.backgroundColor = 'black';
    }
    // Mostrar pares encontrados
    for (let idx of parejasEncontradas) {
        cajas[idx].style.backgroundColor = cajas[idx].dataset.color;
    }
}

// Lógica con persistencia
function manejadorClickFactory(cajas, colores, estado, totalParejas) {
    let seleccionadas = [];
    let parejasEncontradas = estado ? estado.parejasEncontradas : [];
    let bloqueo = false;
    let primerClickHecho = estado ? estado.primerClickHecho : false;

    function finalizarJuego() {
        temporizadorActivo = false;
        clearInterval(intervalo);
        timerDiv.textContent += '   ¡Enhorabuena! Puzzle completado.';
        // Limpia el estado para próxima partida si lo deseas:
        // localStorage.removeItem(NOMBRE_JUEGO);
    }

    function actualizarEstadoLocalStorage(extra = {}) {
        guardarEstadoJuego({
            colores,
            parejasEncontradas,
            segundosTranscurridos,
            primerClickHecho,
            ...extra
        });
    }

    return function(event) {
        if (bloqueo) return;

        // Iniciar el temporizador en el primer click
        if (!primerClickHecho) {
            primerClickHecho = true;
            temporizadorActivo = true;
            intervalo = setInterval(() => {
                if (temporizadorActivo) {
                    segundosTranscurridos += 1;
                    mostrarTiempo();
                    actualizarEstadoLocalStorage();
                }
            }, 1000);
            actualizarEstadoLocalStorage();
        }

        const caja = event.target;
        const idx = Array.from(cajas).indexOf(caja);

        // No permitir volver a seleccionar pareja encontrada ni triple clic
        if (seleccionadas.length < 2 && !parejasEncontradas.includes(idx)) {
            caja.style.backgroundColor = caja.dataset.color;
            seleccionadas.push({element: caja, idx});

            if (seleccionadas.length === 2) {
                const [obj1, obj2] = seleccionadas;
                if (obj1.element.dataset.color === obj2.element.dataset.color) {
                    parejasEncontradas.push(obj1.idx, obj2.idx);
                    seleccionadas = [];
                    actualizarEstadoLocalStorage();

                    if (parejasEncontradas.length === totalParejas * 2) {
                        finalizarJuego();
                        actualizarEstadoLocalStorage({completado: true});
                    }
                } else {
                    bloqueo = true;
                    setTimeout(() => {
                        obj1.element.style.backgroundColor = 'black';
                        obj2.element.style.backgroundColor = 'black';
                        seleccionadas = [];
                        bloqueo = false;
                        actualizarEstadoLocalStorage();
                    }, 800);
                }
            }
        }
    };
}

function inicializarJuego() {
    // Leer estado previo si existe
    const estado = leerEstadoJuego();
    segundosTranscurridos = estado ? estado.segundosTranscurridos : 0;
    mostrarTiempo();
    const numColores = 15;
    const numCajas = 30;
    const colores = prepararColores(numCajas, numColores, estado ? estado.colores : null);

    asignarColoresCajas(cajas, colores, estado ? estado.parejasEncontradas : []);
    const manejadorClick = manejadorClickFactory(cajas, colores, estado, numCajas / 2);
    for (const caja of cajas) {
        // Limpiar listeners previos si los hay
        caja.onclick = null;
        caja.addEventListener('click', manejadorClick);
    }
    // Si el temporizador estaba activo antes, lo retomamos
    if (estado && estado.primerClickHecho && !estado.completado) {
        temporizadorActivo = true;
        intervalo = setInterval(() => {
            if (temporizadorActivo) {
                segundosTranscurridos += 1;
                mostrarTiempo();
                guardarEstadoJuego({
                    colores,
                    parejasEncontradas: estado.parejasEncontradas || [],
                    segundosTranscurridos,
                    primerClickHecho: true
                });
            }
        }, 1000);
    }
}

inicializarJuego();

// Obtener referencias a los elementos del DOM
const botonConectar = document.getElementById('boton-conectar');
const botonDetener = document.getElementById('boton-detener');
const botonContinuar = document.getElementById('boton-continuar');
const valorBinarioSpan = document.getElementById('valor-binario');
const valorDecimalSpan = document.getElementById('valor-decimal');
const voltajeCasSpan = document.getElementById('voltaje-cas');
const voltajeLm335Span = document.getElementById('voltaje-lm335');
const valorTemperaturaSpan = document.getElementById('valor-temperatura');
const ledsContainer = document.getElementById('leds');

// Declarar variables globales
let puerto;
let lector;
let leerDatos = true;

// Crear y agregar elementos LED al contenedor
for (let i = 0; i < 8; i++) {
  const led = document.createElement('div');
  led.classList.add('led', 'led-off');
  ledsContainer.appendChild(led);
}

// Manejar evento de clic para el botón Conectar
botonConectar.addEventListener('click', async () => {
  if ('serial' in navigator) { // Verificar si la Web Serial API está disponible
    try {
      puerto = await navigator.serial.requestPort(); // Solicitar puerto serial
      await puerto.open({ baudRate: 9600 }); // Abrir puerto con baud rate de 9600

      const textDecoder = new TextDecoderStream(); // Crear decodificador de texto
      const readableStreamClosed = puerto.readable.pipeTo(textDecoder.writable); // Conectar el puerto al decodificador
      lector = textDecoder.readable.getReader(); // Obtener lector de flujo de texto

      // Habilitar y deshabilitar botones según corresponda
      botonDetener.disabled = false;
      botonContinuar.disabled = true;

      // Leer datos del puerto en un bucle infinito hasta que se detenga
      while (true) {
        if (!leerDatos) { // Pausar la lectura si se ha solicitado
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        const { value, done } = await lector.read(); // Leer datos del puerto
        if (done) { // Si se ha terminado la lectura, liberar el lector
          lector.releaseLock();
          break;
        }
        if (value) { // Si hay datos, procesarlos
          procesarDatosSerial(value);
        }
      }
    } catch (error) { // Manejar errores de conexión
      console.error('Error al conectar al puerto serial:', error);
    }
  } else { // Si la Web Serial API no está soportada, mostrar alerta
    alert('Web Serial API no soportada.');
  }
});

// Manejar evento de clic para el botón Detener
botonDetener.addEventListener('click', () => {
  leerDatos = false; // Pausar la lectura de datos
  botonDetener.disabled = true; // Deshabilitar botón Detener
  botonContinuar.disabled = false; // Habilitar botón Continuar
});

// Manejar evento de clic para el botón Continuar
botonContinuar.addEventListener('click', () => {
  leerDatos = true; // Reanudar la lectura de datos
  botonDetener.disabled = false; // Habilitar botón Detener
  botonContinuar.disabled = true; // Deshabilitar botón Continuar
});

// Función para procesar los datos seriales recibidos
function procesarDatosSerial(data) {
  const lineas = data.split('\n'); // Dividir los datos en líneas
  lineas.forEach(linea => {
    if (linea.includes('Valor Binario:')) { // Buscar línea con el valor binario
      const valorBinario = linea.split('Valor Binario: ')[1].trim(); // Extraer el valor binario
      valorBinarioSpan.textContent = valorBinario; // Actualizar el DOM con el valor binario
      const valorDecimal = parseInt(valorBinario, 2); // Convertir el valor binario a decimal
      valorDecimalSpan.textContent = valorDecimal; // Actualizar el DOM con el valor decimal

      // Calcular y actualizar el voltaje del CAS
      const voltajeCas = (valorDecimal / 255) * 5;
      voltajeCasSpan.textContent = voltajeCas.toFixed(2);

      // Calcular y actualizar el voltaje del LM335
      const voltajeLm335 = (voltajeCas + 27.3) / 10;
      voltajeLm335Span.textContent = voltajeLm335.toFixed(2);

      // Calcular y actualizar la temperatura
      const temperatura = (voltajeLm335 - 2.73) / 0.01;
      valorTemperaturaSpan.textContent = temperatura.toFixed(2);
      
      // Actualizar los LEDs según el valor binario
      actualizarLeds(valorBinario);

      // Aplicar cambios en el fondo y las imágenes según la temperatura
      actualizarFondoYElementos(temperatura);
    }
  });
}

// Función para actualizar el estado de los LEDs
function actualizarLeds(valorBinario) {
  const leds = ledsContainer.children; // Obtener los elementos LED
  for (let i = 0; i < 8; i++) { // Iterar sobre cada bit del valor binario
    if (valorBinario[i] === '1') { // Si el bit es 1, encender el LED
      leds[i].classList.add('led-on');
      leds[i].classList.remove('led-off');
    } else { // Si el bit es 0, apagar el LED
      leds[i].classList.add('led-off');
      leds[i].classList.remove('led-on');
    }
  }
}

// Función para actualizar el fondo y las imágenes según la temperatura
function actualizarFondoYElementos(temperatura) {
  if (temperatura < 20) {
    document.body.classList.add('cold-temperature');
    document.getElementById('pag').classList.add('cold-temperature');
  } else {
    document.body.classList.remove('cold-temperature');
    document.getElementById('pag').classList.remove('cold-temperature');
  }

  if (temperatura > 30) {
    document.getElementById('sol').style.opacity = 1;
    document.getElementById('nube1').style.opacity = 0;
    document.getElementById('nube2').style.opacity = 0;
    document.getElementById('nube3').style.opacity = 0;
    document.getElementById('nube4').style.opacity = 0;
    document.getElementById('nube5').style.opacity = 0;
    document.getElementById('nube6').style.opacity = 0;
  } else if (temperatura >= 20 && temperatura <= 30) {
    document.getElementById('sol').style.opacity = 1;
    document.getElementById('nube1').style.opacity = 1;
    document.getElementById('nube2').style.opacity = 1;
    document.getElementById('nube3').style.opacity = 1;
    document.getElementById('nube4').style.opacity = 1;
    document.getElementById('nube5').style.opacity = 1;
    document.getElementById('nube6').style.opacity = 1;
    document.getElementById('nube1').style.filter = "grayscale(0%)";
    document.getElementById('nube2').style.filter = "grayscale(0%)";
    document.getElementById('nube3').style.filter = "grayscale(0%)";
    document.getElementById('nube4').style.filter = "grayscale(0%)";
    document.getElementById('nube5').style.filter = "grayscale(0%)";
    document.getElementById('nube6').style.filter = "grayscale(0%)";
  } else {
    document.getElementById('sol').style.opacity = 0;
    document.getElementById('nube1').style.opacity = 1;
    document.getElementById('nube2').style.opacity = 1;
    document.getElementById('nube3').style.opacity = 1;
    document.getElementById('nube4').style.opacity = 1;
    document.getElementById('nube5').style.opacity = 1;
    document.getElementById('nube6').style.opacity = 1;
    document.getElementById('nube1').style.filter = "grayscale(100%)";
    document.getElementById('nube2').style.filter = "grayscale(100%)";
    document.getElementById('nube3').style.filter = "grayscale(100%)";
    document.getElementById('nube4').style.filter = "grayscale(100%)";
    document.getElementById('nube5').style.filter = "grayscale(100%)";
    document.getElementById('nube6').style.filter = "grayscale(100%)";
  }
}

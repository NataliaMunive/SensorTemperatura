    const botonConectar = document.getElementById('boton-conectar');
    const botonDetener = document.getElementById('boton-detener');
    const botonContinuar = document.getElementById('boton-continuar');
    const valorBinarioSpan = document.getElementById('valor-binario');
    const valorDecimalSpan = document.getElementById('valor-decimal');
    const voltajeCasSpan = document.getElementById('voltaje-cas');
    const voltajeLm335Span = document.getElementById('voltaje-lm335');
    const valorTemperaturaSpan = document.getElementById('valor-temperatura');
    const ledsContainer = document.getElementById('leds');

    let puerto;
    let lector;
    let leerDatos = true;

    // Crear los elementos LED
    for (let i = 0; i < 8; i++) {
      const led = document.createElement('div');
      led.classList.add('led', 'led-off');
      ledsContainer.appendChild(led);
    }

    botonConectar.addEventListener('click', async () => {
      if ('serial' in navigator) {
        try {
          puerto = await navigator.serial.requestPort();
          await puerto.open({ baudRate: 9600 });

          const textDecoder = new TextDecoderStream();
          const readableStreamClosed = puerto.readable.pipeTo(textDecoder.writable);
          lector = textDecoder.readable.getReader();

          botonDetener.disabled = false;
          botonContinuar.disabled = true;

          while (true) {
            if (!leerDatos) {
              await new Promise(resolve => setTimeout(resolve, 100));
              continue;
            }

            const { value, done } = await lector.read();
            if (done) {
              lector.releaseLock();
              break;
            }
            if (value) {
              procesarDatosSerial(value);
            }
          }
        } catch (error) {
          console.error('Error al conectar al puerto serial:', error);
        }
      } else {
        alert('Web Serial API no soportada.');
      }
    });

    botonDetener.addEventListener('click', () => {
      leerDatos = false;
      botonDetener.disabled = true;
      botonContinuar.disabled = false;
    });

    botonContinuar.addEventListener('click', () => {
      leerDatos = true;
      botonDetener.disabled = false;
      botonContinuar.disabled = true;
    });

    function procesarDatosSerial(data) {
      const lineas = data.split('\n');
      lineas.forEach(linea => {
        if (linea.includes('Valor Binario:')) {
          const valorBinario = linea.split('Valor Binario: ')[1].trim();
          valorBinarioSpan.textContent = valorBinario;
          const valorDecimal = parseInt(valorBinario, 2);
          valorDecimalSpan.textContent = valorDecimal;

          // Calcular el voltaje del CAS
          const voltajeCas = (valorDecimal / 255) * 5;
          voltajeCasSpan.textContent = voltajeCas.toFixed(2);

          // Calcular el voltaje del LM335
          const voltajeLm335 = (voltajeCas + 27.3) / 10;
          voltajeLm335Span.textContent = voltajeLm335.toFixed(2);

          // Calcular la temperatura
          const temperatura = (voltajeLm335 - 2.73) / 0.01;
          valorTemperaturaSpan.textContent = temperatura.toFixed(2);
          
          actualizarLeds(valorBinario);
        }
      });
    }

    function actualizarLeds(valorBinario) {
      const leds = ledsContainer.children;
      for (let i = 0; i < 8; i++) {
        if (valorBinario[i] === '1') {
          leds[i].classList.add('led-on');
          leds[i].classList.remove('led-off');
        } else {
          leds[i].classList.add('led-off');
          leds[i].classList.remove('led-on');
        }
      }
    }
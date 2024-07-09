#define PIN_SENSOR A0

void setup() {
  Serial.begin(9600);  // Iniciar la comunicación serial a 9600 bps
}

void loop() {
  int valorAnalogico = analogRead(PIN_SENSOR);  // Leer el valor analógico del pin A0
  int valorBinario = map(valorAnalogico, 0, 1023, 0, 255);  // Convertir a valor de 8 bits (0-255)

  // Convertir el valor binario a una cadena de 8 bits
  char cadenaBinaria[9];
  for (int i = 7; i >= 0; i--) {
    if (valorBinario & (1 << i)) {
      cadenaBinaria[7 - i] = '1';
    } else {
      cadenaBinaria[7 - i] = '0';
    }
  }
  cadenaBinaria[8] = '\0'; // Agregar el carácter nulo al final de la cadena

  // Enviar los datos por el puerto serie
  Serial.print("Valor Binario: ");
  Serial.println(cadenaBinaria);

  delay(2000);  // Esperar 1 segundo antes de la siguiente lectura
}

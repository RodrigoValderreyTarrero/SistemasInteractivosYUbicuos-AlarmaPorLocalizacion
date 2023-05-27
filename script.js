//Definimos vafriables globales
let LAT_GLOBAL; //latitud global
let LONG_GLOBAL; //longitud global
let MARCADOR_GLOBAL = undefined; //El único marcador que se puede poner en el mapa
let ALARMAS = []; //Una lista de alarmas que el usuario crea, activa o destruye
let intervalos = []; //Se registran los intervalos para borrarlos cuando sea necesario

//Se define también la clase Alarma.
//Instancias de esta clase componen la lista de ALARMAS
class Alarma{
  constructor(marker, nombre){
    this.marker = marker;
    this.nombre = nombre;
    this.activa = false;
    this.sonando = false;
    this.tipo=4;
    
  }
}

//Funciones para mostrar/ocultar en el HTML.
function ocultar_pop(){//En un inicio se ocultan los pop up
  $(".pop").hide();
}
function mostrarMenosAlarma(){
  $("#eliminar-alarmas").show();
}
function quitarMenosAlarma(){
  $("#eliminar-alarmas").hide();
}
function mostrarActivarAlarma(){
  $("#activar-alarmas").show();
}
function quitarActivarAlarma(){
  $("#activar-alarmas").hide();
}
function ocultarBotones(){
  //Cuando se pulsa un botón que despliegue un menú, el resto se oculta para evitar confusiones
  $(".botones-bajo-mapa").hide();
}
function ocultarApagarAlarma(){
  $("#boton-detener-vibracion").hide();
}
function mostrarApagarAlarma(){
  $("#boton-detener-vibracion").show();
}
function mostrarBotones(){
  //Se vuelven a mostrar los botones
  $(".botones-bajo-mapa").show();
}
function ocultarTodoAlarma(){
  $("#sample_map").hide();
  ocultarBotones();
}
function mostrarTodoAlarma(){
  $("#sample_map").show();
  mostrarBotones();
}
function mostrarError(m){
  //Esta función muestra el 'error'
  div = document.getElementById('notificacion-error');
  h2 = document.createElement('h2');
  h2.setAttribute('class','error-temporal');
  h2.innerHTML = m;
  div.insertBefore(h2, div.firstChild);
  $("#notificacion-error").show();
  $("#boton-error").show();
}
function ocultarError(){
  //Esta función muestra el 'error'
  div = document.getElementById('notificacion-error');
  deleteButtonAlarms('error-temporal');
  $("#notificacion-error").hide();
  $("#boton-error").hide();
}
//Fin de las funciones para ocultar/mostrar


//Con estas funciones se coloca el mapa donde esté el usuario
function getLocationAndCreateMap() {
  //Se saca la posición actual y se modifica el mapa o salta un error si tiene lugar
  (navigator.geolocation.getCurrentPosition(successMapa, errorCB));
}
function errorCB(error){
  throw("Error al extraer la ubicación");  
}
function successMapa(position){
  //Con esta función se genera el mapa desde donde se encuentre el usuario
  //Además las variables globales quedan actualizadas
  let lat = position.coords.latitude;
  let long = position.coords.longitude;
  LONG_GLOBAL = long;
  LAT_GLOBAL = lat;
  // Muevo el mapa a las coordenadas del usuario
  mymap.setView([lat, long], 15);
}

//Para poner el puntero al tocar el mapa se define esta función
function onMapClick(e) {
  //Esta función coloca el puntero en la posición seleccionada y elimina los anteriores
  try {
    if (MARCADOR_GLOBAL) {
      MARCADOR_GLOBAL.remove();
    }
  MARCADOR_GLOBAL = L.marker(e.latlng, { draggable: true }).addTo(mymap);
  } catch (error) {
    console.error("Error en la función onMapClick:", error);
  }
}
//Función para vibrar
function vibrar(time=1500){
  // Se comrpueba que el navegador es compatible
  // Solo se puede invocar si se interactua con algo. La API no permite invocarla en otro caso
  try{
      // Hacemos que el dispositivo vibre durante 1 segundo
      navigator.vibrate(time);
    }
  catch{
      throw("La API de vibración no es compatible con este navegador");
  }
}

//Con esta función se crean nuevas alarmas
function setAlarm(){
  //Permite crear una nueva alarma
  //Si hay un marcador global
  if(MARCADOR_GLOBAL != undefined){
    let nombre = leerEntrada();
    ocultarEntrada('formulario');
    //Si no hay alarma con ese nombre se crea, en otro caso se notifica de error
    if(existeAlarma(nombre)){
      mostrarError("Existe una alarma con ese nombre... Busca otro nombre");
      ocultarEntrada('formulario');
      return;}
    if(nombre == null){
      return;
    }
    if(nombre.length < 2){
      mostrarError("El nombre debe tener al menos dos caracteres");
      ocultarEntrada('formulario');
      return;
    }
    let alarm = new Alarma(MARCADOR_GLOBAL, nombre);
    ALARMAS.push(alarm);
  }
  else{
    //Es necesario que haya un punto seleccionado.
    mostrarError("No hay ningún punto seleccionado en el mapa");
    ocultarEntrada('formulario');
  }
}

//Esta función devuelve la existencia/falta de una alarma
function existeAlarma(nombre) {
  //Comprobamos si existe una alarma con ese nombre
  return ALARMAS.some((alarma) => alarma.nombre === nombre);
}

//Con esta función escribimos en el HTML los botones para las alarmas
function showAlarms(id, borrar = false, inicio_i = 0) {
  //Muestra las alarmas como corresponde dependiendo de si hemos entrado en -ALARMA
  //O de si hemos entrado en ACTIVAR ALARMA (Eso significa borrar)
  const div = document.getElementById(id);
  let numAlarmas = ALARMAS.length;
  //Con el id que se proporcione (depende del div que se deba rellenar)
  //Completamos con botones (que borramos luego)
  //Gracias a esto, se limita a 4 las alarmas mostradas
  if(numAlarmas > 4){numAlarmas = 4+inicio_i};
  crearFlechas(borrar, id, inicio_i);
  deleteButtonAlarms("alarma_temporal");
  for (let i = inicio_i; i < numAlarmas; ++i){
    if(i<ALARMAS.length){
      //Escribimos los botones
      const alarma = ALARMAS[i];
      const dentro = document.createElement("button");
      dentro.setAttribute("class", "alarma_temporal");
      dentro.innerHTML = alarma.nombre;
      dentro.setAttribute("data-index", i);
      //Los botones creados pueden eliminar la alarma al pulsarlos 
      if (borrar) {
        dentro.onclick = function () {
          const index = this.getAttribute("data-index");
          ALARMAS.splice(index, 1);
          quitarMenosAlarma();
          mostrarBotones();
          deleteButtonAlarms("eliminar");
          this.remove();
        };
      //O bien pueden activar a desactivar la alarma
      } else {
        dentro.onclick = function () {
          this.activa = !this.activa;
          ALARMAS[i].activa = this.activa;
          this.style.color = this.activa ? 'green' : 'red';
        };
      }
      if (!borrar && ALARMAS[i].activa === false) {
        dentro.style.color = 'red';}
      else if (!borrar && ALARMAS[i].activa) {
        dentro.style.color = 'green';}
      //Se añade el botón
      div.appendChild(dentro);
    }
  }
  //Se tapan los botones de las otras funcionalidades mientras se opera en este menú
  ocultarBotones();
}

function crearFlechas(borrar, id, inicio_i){
  //Se crean las flechas con sus funciones asociadas
  deleteButtonAlarms("eliminar");
  cd = "\"";
  let contenedores = document.getElementsByClassName("contenedor-flechas");
  ini = inicio_i -4;
  ini2 = inicio_i +4;
  etiqueta1 = document.createElement("div");
  etiqueta1.setAttribute("class","eliminar");
  etiqueta2 = document.createElement("div");
  etiqueta2.setAttribute("class","eliminar");
  //Las dotamos de sus funciones y se agregan
  texto = "<button onclick="+cd+"usarFlecha('izquierda',"+ borrar+",'"+id+"',"+ini+")"+cd+">&larr;</button>"
  etiqueta1.innerHTML = texto + "<button onclick="+cd+"usarFlecha('derecha',"+ borrar+",'"+id+"',"+ini2+")"+cd+">&rarr;</button>"
  etiqueta2.innerHTML = texto + "<button onclick="+cd+"usarFlecha('derecha',"+ borrar+",'"+id+"',"+ini2+")"+cd+">&rarr;</button>"
  let contenedor = contenedores[0];
  contenedor.appendChild(etiqueta1);
  let contenedor2 = contenedores[1];
  contenedor2.appendChild(etiqueta2);
}

function usarFlecha(direccion="derecha", borrar=false, id, indice=0){
  //Esta función permite deslizar el menú de un lado a otro
  if(direccion == "derecha" && (indice< ALARMAS.length)){
    deleteButtonAlarms("eliminar");
    showAlarms(id, borrar, indice);
  }
  else if(direccion =="izquierda" && (indice>= 0)){
    deleteButtonAlarms("eliminar");
    showAlarms(id, borrar, indice);
  }
}

//Con estas funciones se eliminan los botones escritos en el HTML
function deleteButtonAlarms(clas){
  //Con esta función se eliminan los botones que tengan la clase 'clas'
  const clases = document.querySelectorAll(`.${clas}`);
  clases.forEach((elem) => elem.remove());
}

//Lleva el seguimiento del usuario
function followlocation(){
  //Con esta función se obtiene la localización del usuario
  var watchID = navigator.geolocation.watchPosition(successCB, errorCB, { enableHighAccuracy: true });
}

function successCB(position) {
  //Se extraen las posiciones y se actualizan los valores globales
  var lat = position.coords.latitude;
  var long = position.coords.longitude;
  LONG_GLOBAL = long;
  LAT_GLOBAL = lat;
  comprobarDestino();
}

//Permite centrar al usuario
function centrar(){
  try{
    //Esta función coloca al usuario donde se encuentra en el mapa
    mymap.setView([LAT_GLOBAL, LONG_GLOBAL], 17);
    var marker = L.marker([LAT_GLOBAL, LONG_GLOBAL]).addTo(mymap);
    // Añadir un popup al marcador con información sobre la ubicación del usuario
    marker.bindPopup("Estás aquí").openPopup();
    //Lo borramos a los 2 segundos. Suficiente para que el usuario se situe.
    borrar_marker(marker, 2000);  
  }
  catch{
    throw("Error al centrar al usuario");
  }
}

//Para borrar un marker cuando sea necesario
function borrar_marker(marker, time){
  //Esta función borra el marcador que se le pasa a los 'time' segundos
  setTimeout(function() {
    mymap.removeLayer(marker);
  }, time);
}

//Se busca un lugar dadas una latitud y longitud concretas
function searchPlace(){
  //Esta función se dispara cuando se pulsa en buscar
  //Permite buscar un lugar específico si se conocen latitudes y longitudes
  let latitud = leerEntrada("entrada2");
  let longitud = leerEntrada("entrada3");
  ocultarEntrada('formulario2');
  if(latitud == null){return;}
  if(longitud == null){return;}
  if(Math.abs(latitud)>180 || Math.abs(longitud) >90){
    alert("Valores imposibles... Prueba con otros");
    return;
  }
  mymap.setView([latitud, longitud], 15);
  var marker = L.marker([latitud, longitud]).addTo(mymap);
  // Añadir un popup al marcador con información sobre la ubicación del usuario
  marker.bindPopup("Este es el sitio que seleccionado").openPopup();
  //Lo borramos a los 2 segundos. Suficiente para que el usuario se situe.
  borrar_marker(marker, 2000);
}

//Se comprueba si el destino está establecido como alarma y por tanto debe vibrar el móvil
function comprobarDestino(intervalId=""){  
  //Con esta función se quiere comprobar si alguna alarma concuerda con la posición 
  for (let i = 0; i<ALARMAS.length; ++i){
    distancia = L.latLng(LAT_GLOBAL, LONG_GLOBAL).distanceTo(L.latLng(ALARMAS[i].marker._latlng.lat, ALARMAS[i].marker._latlng.lng));
    //Se establece la alarma según nos acercamos al destino
    if((300 > distancia  )&&(distancia > 100) && ALARMAS[i].activa && ALARMAS[i].tipo != 1){
        startAlarm(1, ALARMAS[i],intervalId);
        ALARMAS[i].sonando = true;
    }
    if((100 > distancia  )&&(distancia > 50) && ALARMAS[i].activa && ALARMAS[i].tipo != 2){
      startAlarm(2, ALARMAS[i],intervalId);
      ALARMAS[i].sonando = true;
    }
    if(50>distancia && ALARMAS[i].activa && ALARMAS[i].tipo != 3){
      startAlarm(3, ALARMAS[i],intervalId);
      ALARMAS[i].sonando = true;
    }
  }
}

function decidirCambio(alarma, tipo){
  //Decidimos si se va a cambiar de tipo o no
  cambio = true;
  if(alarma.tipo == 3){
    //Hemos estado por algún motivo al lado de la parada. No se puede reducir la vibración
    cambio = false;
  }
  else if(alarma.tipo == 2 && tipo ==1){
    cambio = false;
  }
  return cambio;
}

function startAlarm(tipo, alarma, intervalId=""){
  //Con esta función se gestiona el 'despertador'
  const botonDetener = document.getElementById("boton-detener-vibracion");
  //Permite detener la alrama poniendo a false activa y limpiando el intervalo.
  //Además se oculta todo
  const detenerAlarma = (intervalId) => {
    //Se elimina el intervalo y se oculta el botón.
    //Todo lo demás se deja como estaba antes de sonar la alarma
    clearInterval(intervalId);
    ocultarApagarAlarma();
    mostrarTodoAlarma();
    alarma.activa = false;
    alarma.sonando = false;
    alarma.tipo = 4;
  };
  //Está sonando ya ese tipo de alarma y crear otro intervalo y borrar los demás causaría problemas
  if(alarma.sonando && alarma.tipo==tipo){
    return;
  }
  cambio = decidirCambio(alarma, tipo);

  if(alarma.sonando && cambio){
    //Si está sonando primero se quita el intervalo
    clearInterval(intervalId);
    for (let i = 0; i < intervalos.length; i++) {
      clearInterval(intervalos[i]);
    }
    // Vacia la lista de intervalos
    intervalos = [];
    botonDetener.removeEventListener("click", detenerAlarma);
  }
  if(tipo == 1 && cambio){
    //Se pone que tipo sea distinto de 2 y de 3 porque si está en uno de esos tipos, quiere decir que se 
    //Está alejando y ya debe quedarse sonando como estuviese
    //El tipo más debil de alarma, quedan 500 metros. Vibra cada 7 segundos
    alarma.tipo= 1;
    intervalId = setInterval(vibrar, 7000);
    intervalos.push(intervalId);
  }
  if(tipo == 2 && cambio){
    //Tipo intermedio. Vibra cada 4 segundos
    alarma.tipo= 2;
    intervalId = setInterval(vibrar, 4000);
    intervalos.push(intervalId);
  }
  if(tipo==3 && cambio){
    //Queda muy poco, 100 metros. Vibra de una forma más intensa
    alarma.tipo= 3;
    intervalId = setInterval(vibrar, 1500);
    intervalos.push(intervalId);
  }
  //Se gestionan los eventos de visualización
  mostrarApagarAlarma();
  ocultarTodoAlarma();
  //Se añade el evento detener alarma para que el botón funcione
  botonDetener.addEventListener("click", () => detenerAlarma(intervalId));
}

function leerEntrada(id="entrada") {
  //Se lee el dato del formulario
  const entrada = document.getElementById(id).value;
  deleteButtonAlarms("texto-entrada");
  return entrada;
}

function mostrarEntrada(mensaje, id){
  //Se muestra el formulario
  h2 = document.createElement("h2");
  form = document.getElementById(id);
  h2.setAttribute("class","texto-entrada");
  h2.innerHTML = mensaje;
  form.insertBefore(h2, form.firstChild);
  $("#"+id).show();
}

function ocultarEntrada(id) {
  //Solo se quiere ocultar el cuadro
  $("#"+id).hide();
  deleteButtonAlarms("texto-entrada");
  return;
}

//El programa principal
//Se quitan elementos HTML que deben quedar ocultos

//Se crea el mapa, inicialmente en 0,0 pero más adelante se recoloca donde se encuentre el usuario.
const mymap = L.map('sample_map').setView([0, 0], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
  maxZoom: 18
}).addTo(mymap);

quitarMenosAlarma();

quitarActivarAlarma();
$(document).ready(function(){
  ocultarApagarAlarma();
  ocultarEntrada('formulario');
  ocultarEntrada('formulario2');
  ocultarError();
});

//Creamos el mapa y seguimos al usuario
getLocationAndCreateMap();
mymap.on('click', onMapClick);
followlocation();

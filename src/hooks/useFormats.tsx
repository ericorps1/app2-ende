import React from "react";
import { Text } from 'react-native';
import { diasSemana, Meses, ShortMonthsUpper } from "./useGlobal";

interface PropsFormatAmt{
    amount: string
}

const formatDate = (date:string, separator='-') => {
  // date = '2025-02-28';
  const [year, month, day] = date.split('-').map(Number);

  let formatDate = new Date(year, month - 1, day); // Ajustamos mes restando 1
  let formattedDay = formatDate.getDate().toString().padStart(2, '0');
  let formattedMonth = ShortMonthsUpper[formatDate.getMonth()];
  let formattedYear = formatDate.getFullYear();
  return `${formattedDay}${separator}${formattedMonth}${separator}${formattedYear}`;
}

/**
 * 
 * @param date Fecha a formatear la fecha debe estar en formato (Y-m-d H:i:s) ejemplo para el 23 de noviembre del 2022 a las 11:12:14 am ==>> 2022-11-23 11:12:14
 * @param separatorDate Separador utilizado en el formato de fecha
 * @param separatorHour Seoaradir utilizado en el formato de hora
 * @returns fecha en el siguiente formato (d-m-Y h:i AM/PM)
 */
const formatDateHour = (date:string, separatorDate='-', separatorHour=':') => {
  // date = "2025-02-28 23:12";
    // Extraemos partes de la fecha y hora
  const [datePart, timePart] = date.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  // Creamos el objeto Date asegurando la zona horaria local
  let formatDate = new Date(year, month - 1, day, hour, minute);

  // Formateamos día, mes y año
  let formattedDay = formatDate.getDate().toString().padStart(2, '0');
  let formattedMonth = ShortMonthsUpper[formatDate.getMonth()];
  let formattedYear = formatDate.getFullYear();

  // Convertimos la hora a formato 12 horas
  let hours = formatDate.getHours();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convierte 0 a 12 para el formato 12 horas
  let formattedTime = `${hours}${separatorHour}${minute.toString().padStart(2, '0')} ${ampm}`;

  return `${formattedDay}${separatorDate}${formattedMonth}${separatorDate}${formattedYear} ${formattedTime}`;
}

const FormatAmount = ({ amount }: PropsFormatAmt) => {
  const numericAmount = Number(amount) || 0;

  const formatted = numericAmount
    .toFixed(0) // redondea sin decimales
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // puntos cada 3 dígitos

  return <Text>$ {formatted}</Text>;
};


const FormatNameAvatar = (name: string | null | undefined) => {
    if(!name){
        return 'AE';
    }
    let nameAvatar = '';
    name.split(' ').map((frag:string) => {
        if(frag.trim()!=='' && nameAvatar.length<2){
            nameAvatar+=frag.charAt(0);
        }
    });
    return nameAvatar;
}

const formatDateActividades = (date:string) => {
    const obDate = new Date(date);
    const numeroDia = obDate.getDay();
    const numeroMes = obDate.getMonth();
    const dia = obDate.getDate();
    const diaSemana = diasSemana[numeroDia];
    const mes = Meses[numeroMes];
    const anio = obDate.getFullYear();
    return `${diaSemana} ${dia} de ${mes} del ${anio}`
}

const formatDateComentarios = (date:string) => {
    const obDate = new Date(date);
    const numeroMes = obDate.getMonth();
    const dia = obDate.getDate();
    const mes = Meses[numeroMes];
    const anio = obDate.getFullYear();
    let hours = obDate.getHours();
    let minutes = obDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours %= 12;
    hours = hours || 12;    
    let hour = hours < 10 ? `0${hours}` : hours;
    let min = minutes < 10 ? `0${minutes}` : minutes;
    return `${dia} de ${mes} del ${anio} ${hour}:${min} ${ampm}`
}

/**
 * Funcion para limpiar el html que se va a renderizar, la idea es limpiar/modificar cualquier
 * texto o fragmento que el render no reconozca para evitar mensajes de errores y mala visualización
 * @param html HTML que se desea limpiar previo a su renderizado
 * @returns HTML limpio de cualquier fragmento/texto que el renderHTML no reconozca
 */
const cleanHtmlRenderHtml = (html:string) => {
    if(!html){
        return '';
    }else if(html.length<=0){
        return html;
    }
    const strToClean = [
        { strClean: /text-decoration-color/g, replace: 'textDecoration' },
        { strClean: /<font/g, replace: '<div' },
        { strClean: /&quot;/g, replace: '-' },
        // { strClean: /<table/g, replace: '<table style="max-width: '+ width +' !important"' },
        // { strClean: /<img/g, replace: '<img style="style="object-fit: contain; width: 50%;"' },
        // { strClean: /<td/g, replace: '<td style="width: 100% !important; height: 100% !important"' },
    ];
    strToClean.forEach((el)=>{
        html=html.replace(el.strClean,el.replace);
    });
    return html;
}

/**
 * Funcion para formatear el nombre de un usuario, todo en minuscula y separado por guiones
 * @param name nombre que se va a formatear ej: Juanito Perez Londoño
 * @returns string con el nombre formateado ej: juanito-perez-londono
 */
const nombreGuionesMinus = (name:string|null|undefined) => {
    if(name){
        return name
            .toLowerCase()
            .replace(/ /g,'-')
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }else{
        return name;
    }
}

export {
    formatDate,
    formatDateHour,
    FormatAmount,
    FormatNameAvatar,
    formatDateActividades,
    formatDateComentarios,
    cleanHtmlRenderHtml,
    nombreGuionesMinus
}

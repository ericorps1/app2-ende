const isEmptyObject = (obj:Object) => {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            return false;
        }
    }
 
    return true;
}

const valFormInput = (value:any, name:string, min_length:number, max_length:number, is_numeric:boolean=false, val_min:boolean|number=false, val_max:boolean|number=false) => {
    if(value.length<min_length || value.length>max_length){
        return 'El campo "'+name+'" debe contener entre '+min_length+' y '+max_length+' caracteres.';
    }
    if(is_numeric){
        if(isNaN(value)){
            return 'El campo "'+name+'" debe contener sólo caracteres numéricos.';
        }
    }
    if(val_min){
        if(value<val_min){
            return 'El campo "'+name+'" debe de ser un valor mayor a  '+val_min;
        }
    }
    if(val_max){
        if(value<val_max){
            return 'El campo "'+name+'" debe de ser un valor menor a  '+val_max;
        }
    }
    return true;
}

const isImage = (fileName:string|null) => {
    if(!fileName){
        return false;
    }
    const fileArr = fileName.split('.');
    const extImgs = ['png','jpg','jpeg'];
    const ext = extImgs.filter((ext:string)=>ext===fileArr[fileArr.length-1]);
    return ext.length>0;
}

const isEmail = (value:string, name: string) => {
    const re = /\S+@\S+\.\S+/;
    if(!re.test(value)){
        return `El campo ${name} debe contener un formato de correo electrónico válido.`;
    }
    return true;
}

export {
    isEmptyObject,
    valFormInput,
    isImage,
    isEmail
}

import { Platform } from 'react-native';
import { Asset } from "react-native-image-picker";
import cafeApi from '../api/estudianteAPI';

const useUploads = async (endPoint:string, objImg:Asset, postData:any=false) => {
    if(!objImg) return false;
    if(!objImg.uri) return false;
        const fileToUpload = {
            uri: objImg.uri, //Your Image File Path
            type: objImg.type, 
            name: objImg.fileName
        };
    const formData = new FormData();
    formData.append('file', fileToUpload);
    if(postData){//si existen parametros para enviar vía post, se debe de enviar un objeto de tipo {property1: value1, property2: value2}
        for (const property in postData) {
            formData.append(property, postData[property]);
          }
    }
    const config = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          }
    };
    const {data} = await cafeApi.post(endPoint, formData, config);
    return data;
}


export {
    useUploads
}
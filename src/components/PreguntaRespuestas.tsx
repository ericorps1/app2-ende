import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { obPregunta, obRespuesta } from '../interfaces/appInterfaces';
import { LoadingScreen } from '../screens/LoadingScreen';
import { colors, platformTheme } from '../theme/platformTheme';
import RenderHtml from 'react-native-render-html';
import { Snackbar } from 'react-native-paper';
import { HtmlToJsx } from './HtmlToJsx';

interface PropsPreguntaRespuestas {
    pregunta: obPregunta;
    respuestasPreg: [obRespuesta];
    onPressResp: (id_pre:number,id_res:number) => void;
    loadingResp: boolean;
    numPre: number;
    readonly: boolean;
}


export const PreguntaRespuestas = ({pregunta,respuestasPreg,onPressResp,loadingResp,numPre,readonly}:PropsPreguntaRespuestas) => {
    const { width } = useWindowDimensions();
    return (
        <View>
            <View key={pregunta.id_pre} style={{...styles.containerPregunta, ...platformTheme.shadowBox, opacity: loadingResp ? 0.5 : 1}}>
                <Text style={styles.txtNumPre}>Pregunta # {numPre}</Text>
                <Text style={styles.txtPregunta}><HtmlToJsx strHtml={pregunta.pre_pre} styles={`text-align: center`}/></Text>
                {
                    (respuestasPreg.length>0) &&
                        respuestasPreg.map((respuesta:obRespuesta) => {
                            let colorResp = respuesta.id_pre2 === respuesta.id_pre && respuesta.id_res === respuesta.id_res1 ? colors.darkBlue : colors.softSilver;
                            //si estamos viendo el resultado de las respuestas y estamos en la respuesta seleccionada
                            let textColorResp = colorResp===colors.darkBlue ? 'white' : 'black';
                            if(readonly===true && respuesta.id_pre2 === respuesta.id_pre && respuesta.id_res === respuesta.id_res1){
                                colorResp = respuesta.val_res === "Verdadero" ? colors.success : colors.danger;
                                textColorResp = 'white';
                            }
                            return <TouchableOpacity
                                key={respuesta.id_res}
                                style={{
                                    ...styles.btnRespuesta,
                                    ...platformTheme.shadowBox,
                                    backgroundColor: colorResp,
                                }}
                                onPress={()=>{if(readonly===false)onPressResp(respuesta.id_pre,respuesta.id_res)}}
                            >
                                <HtmlToJsx strHtml={respuesta.res_res} styles={`color:${textColorResp};`}/>
                                {/* <RenderHtml
                                    contentWidth={width-10}
                                    source={{html: `<div style="color: ${textColorResp}; font-size: 15px;">${respuesta.res_res}</div>`}}
                                /> */}
                                {/* <Text style={styles.txtRespuesta}>{respuesta.id_pre2}---{respuesta.id_pre}</Text>
                                <Text style={styles.txtRespuesta}>{respuesta.id_res}--{respuesta.id_res1}</Text> */}
                            </TouchableOpacity>
                        })
                }
            </View>
            {loadingResp && <Snackbar visible={loadingResp} onDismiss={()=>false}>
                Guardando respuesta...
            </Snackbar>}
        </View>            
    )
}

const styles = StyleSheet.create({
    containerPregunta: {
        margin: 10,
        backgroundColor: colors.softBlue,
        borderRadius: 10,
        padding: 10,
    },
    txtNumPre: {
        color: colors.darkSilver,
        fontWeight: 'bold',
        fontSize: 30,
        textAlign: 'center',
    },
    txtPregunta: {
        fontSize: 20,
        color: colors.darkBlue,
        // fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        alignSelf: 'center',
    },
    btnRespuesta: {
        ...platformTheme.btn,
        marginVertical: 10,
        borderRadius: 5,
        padding: 10,

    },
    txtRespuesta: {
        fontSize: 16,
        color: 'white',
    }
});
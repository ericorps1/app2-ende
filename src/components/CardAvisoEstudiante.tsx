import React, { useEffect, useState } from 'react'
import { AvisoEstudiante, ImgDimension } from '../interfaces/appInterfaces';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { colors, platformTheme } from '../theme/platformTheme';

interface PropsCardAvisoEstudiante {
    avisoEstudiante: AvisoEstudiante;
}


export const CardAvisoEstudiante = ({avisoEstudiante}:PropsCardAvisoEstudiante) => {
    const [image, setImage] = useState(<></>)
    let img = '';
    const winDimension = useWindowDimensions();
    const maxWidth = winDimension.width-35;
    if(avisoEstudiante.tipo_imagen.trim().length>0 && avisoEstudiante.imagen.trim().length>0){
        img = `data:image/${avisoEstudiante.tipo_imagen};base64,${avisoEstudiante.imagen}`;
        const redimensionar = async () => {
            Image.getSize(
                img,
                (width, height) => {
                    if(width>maxWidth){
                        const porcHeight = (maxWidth / width) * 100;
                        width = maxWidth;
                        height = (height/100) * porcHeight;
                    }
                    setImage(
                        <>
                            <View style={styles.containerImgAviso}>
                                <Image 
                                    style={{ 
                                        height: height,
                                        width: width,
                                        resizeMode: 'cover',
                                    }} 
                                    source={{uri: img}}
                                />
                            </View>
                        </>
                    );
                },
                (error) => {
                  console.log('Error fetching image size:', error);
                }
            )
        };
        useEffect(() => {
            redimensionar();
          return () => {
            setImage(<></>);
          }
        }, [img,winDimension])
        
    }

    return (
        <View 
            key={avisoEstudiante.id}
            style={styles.container}
        >
            <Text style={styles.titleAviso}>{avisoEstudiante.responsable === 'Adminge' ? '¡Aviso coordinación escolar!' : '¡Aviso importante de dirección!'}</Text>
            <Text style={styles.descAviso}>{avisoEstudiante.mensaje}</Text>
            {img!=='' && image}
        </View>
  )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 5,
        marginBottom: 20,
        marginLeft: 5,
        justifyContent: 'center',
    },
    titleAviso: {
        fontSize: 16,
        color: colors.darkBlue,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    descAviso: {
        fontSize: 14,
        color: colors.darkSilver
    },
    containerFooterAviso: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    textFooter: {
        fontSize: 12,
        marginBottom: 5
    },
    containerImgAviso: {
        marginRight: 5,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: colors.darkBlue
    }
})
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native';

interface PropsCounterTime {
    minutos: number;
    onEnd: () => void;
    onTimeUpdate?: (percentage: number) => void;
}

export const CounterTime = ({minutos, onEnd, onTimeUpdate}: PropsCounterTime) => {
    const [time, setTime] = useState({minutos, segundos: 0});
    
    // 🎨 Calcular porcentaje de tiempo restante
    const totalSegundos = minutos * 60;
    const segundosRestantes = (time.minutos * 60) + time.segundos;
    const porcentaje = (segundosRestantes / totalSegundos) * 100;
    
    // 🎨 Color dinámico según porcentaje
    const getTimerColor = () => {
        if (porcentaje > 50) {
            return '#34C759'; // Verde
        } else if (porcentaje > 20) {
            return '#FF9500'; // Naranja
        } else {
            return '#FF3B30'; // Rojo
        }
    };
    
    useEffect(() => {
        let min = time.minutos;
        let seg = time.segundos;
        const counter = setInterval(()=>{
            if(min===0 && seg===0){
                onEnd();
            }else if(seg===0){
                seg=59;
                min=min-1;
                setTime({minutos: min,segundos: seg});
            }else{
                seg=seg-1;
                setTime({minutos: min,segundos: seg});
            }
        },1000);
        return () => {
            clearInterval(counter);
        }
    },[time]);
    
    // 🔥 Notificar cambio de porcentaje
    useEffect(() => {
        if (onTimeUpdate) {
            onTimeUpdate(porcentaje);
        }
    }, [porcentaje]);

    return (
        <View style={styles.container}>
            <Text style={[styles.timer, { color: getTimerColor() }]}>
                {time.minutos.toString().padStart(2,'0')}:{time.segundos.toString().padStart(2,'0')}
            </Text>
        </View>  
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timer: {
        fontWeight: '700',
        fontSize: 20, // 🔥 MÁS GRANDE para el footer
        letterSpacing: 1.5,
    }
});
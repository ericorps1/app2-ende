import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native';

interface PropsCounterTime {
    minutos: number;
    onEnd: () => void;
}

export const CounterTime = ({minutos,onEnd}:PropsCounterTime) => {
    const [time, setTime] = useState({minutos, segundos: 0});
    
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

    return (
        <View style={styles.container}>
            <Text style={styles.timer}>
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
        color: '#FF3B30',
        fontWeight: '700',
        fontSize: 16,
    }
});
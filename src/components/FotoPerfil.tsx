import React from 'react'
import { Image, StyleProp } from 'react-native';
import { Avatar } from 'react-native-paper';
import { FormatNameAvatar } from '../hooks/useFormats';

interface PropsFotoPerfil {
    foto: undefined|string;
    style: object;
    nom_alu: string;
    size: number;
}

export const FotoPerfil = ({foto,nom_alu,style,size}:PropsFotoPerfil) => {
  return (
    (foto) 
        ? (
            <Image 
                source={{ uri: 'https://plataforma.ahjende.com/uploads/'+foto}}
                style={ style }
            />
        )
        : 
        (
            <Avatar.Text style={ style } label={FormatNameAvatar(nom_alu)} size={size} />
        )
  )
}

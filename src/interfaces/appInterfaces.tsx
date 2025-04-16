import { HTMLSource } from "react-native-render-html";
import { DataAlumno } from "../context/authReducer";

interface loginToken {
    login_token: string;
}


export interface LoginData {
    correo:   string;
    password: string;
}


export interface loginDataGet {
    correo:   string;
    password: string;
}

export interface LoginResponse {
    message:    string;
    status:     boolean;
    data:      { login_token: string, data_alumno: DataAlumno };
}

export interface Usuario {
    rol:    string;
    estado: boolean;
    google: boolean;
    nombre: string;
    correo: string;
    uid:    string;
    img?:   string;
}

export interface LoginResponseApi{
    status:     boolean;
    message:    string;
}

export interface Pagos{
    car_pag : string, 
    con_pag : string,
    des_pag : string, 
    est_pag : 'Pendiente' | 'Pagado' | 'Vencido', 
    fac_pag : string,
    fec_pag : string,
    fin_pag : string, 
    fol_pag : string, 
    id_alu_ram10 : number | string,
    id_gen_pag2 : number | string, 
    id_pag : number | string,
    ini_pag : string, 
    int_pag : string,
    mon_ori_pag : string,
    mon_pag : string,
    obs_pag : null | string,
    pag_pag : string,
    pri_pag : string, 
    pro_pag : string, 
    res_pag : string,
    tip1_pag : string,
    tip2_pag : string,
    tip_pag : string,
}

export interface DataProfileAlumno{
	tel_alu: string;
	dir_alu: string;
	col_alu: string;
	del_alu: string;
	ent_alu: string;
  cor1_alu: string;
  cur_alu: string;
}


export interface TarjetaBloqueINT {
    bloque_data: BloqueDataInfo;
    nom_mat?: string;
}

export interface BloqueDataInfo {
    id_blo: number;
    nom_blo: string;
    des_blo: string;
    con_blo: string;
    img_blo: string;
    ord_blo: string|null;
    id_mat6: number;
    id_sub_hor: number;
    nom_sub_hor: string;
    est_sub_hor: "Inactivo" | "Activo";
    fec_sub_hor: string;
    id_sub_hor_nat: string|null;
    id_sal1: number|null;
    id_gru1: number;
    id_mat1: number;
    id_pro1: number;
    id_fus2: number;
}

export interface RecursoTeoricoData {
    identificador: number;
    titulo: string;
    descripcion: string;
    fecha: string;
    tipo: 'Video' | 'Wiki' | 'Archivo';
    url_vid: string | null;
    arc_arc: string | null;
}

export type tiposActividades = 'Examen' | 'Foro' | 'Entregable';

export type tiposStatusFecha = 'No vigente' | 'Vigente' | 'Vencida';

export interface ActividadData {
    descripcion: string;
    fec_cal_act: string;
    fecha: null | string;
    fin: string;
    identificador: number;
    identificador_copia: number;
    inicio: string;
    pun_cal_act: number;
    puntaje: number;
    tipo: tiposActividades;
    titulo: string;
    estatus_fecha: tiposStatusFecha;
    id_cal_act: number;
    dur_exa: number;
    int_cal_act: number;
    nom_blo?: string;
    nom_mat?: string;
    readonly?: boolean;
}

export type TypesMsgModalType = 'info' | 'success' | 'danger' | 'error'

export interface Comentarios {
    act_alu_ram: null | string;
    apm_alu: string;
    app_alu: string;
    bec2_alu_ram: string;
    bec_alu_ram: string;
    bol_alu: string;
    car_alu_ram: string;
    che_alu_ram: null|string;
    civ_alu: string;
    col_alu: string;
    com_com: string;
    cor1_alu: string;
    cor_alu: string;
    cp_alu: string;
    cur_alu: string;
    del_alu: string;
    dir_alu: string;
    dis_com: null | string;
    ent_alu: string;
    est1_alu_ram: "Activo" | "Inactivo";
    est2_alu: string;
    est2_alu_ram: null | string;
    est_alu: "Activo" | "Inactivo";
    est_dil_alu: null | string;
    fec_com: string;
    fot_alu: null | string;
    gen_alu: "Hombre" | "Mujer";
    id_alu: number;
    id_alu1: number;
    id_alu_ram: number;
    id_alu_ram5: number;
    id_cit1: number;
    id_com: number;
    id_for_cop1: number;
    id_gen1: number;
    id_pla8: number;
    id_ram3: number;
    ing_alu:string;
    lik_com: null | string;
    lim_alu: string;
    lug_alu: string;
    nac_alu: string;
    nom_alu: string;
    ocu_alu: string;
    pas_alu: string;
    pro_alu: string;
    qr_alu: string;
    sal_alu: null | string;
    ses_alu: null | string;
    tel2_alu: number;
    tel_alu: number;
    tip_alu: string;//"Alumno";
    tut_alu: string;//"Pendiente";
    val_cor_alu: "Activo" | "Inactivo";
    vid_alu: null | string;
}

export interface PropsForoComentario {
    key: number;
    id_com: number;
    nombre: string;
    comentario: string;
    foto: null | string;
    fecha: string;
    replicas: [ReplicasForo];
    onPressResp: (ob:{id_com:number,nomCom:string}) => void;
    eliminar: boolean;
    eliminarComentario?: () => void;
    funcEliminarReplica?: (id_rep:number) => void;
}

export interface ReplicasForo {
    id_com: number;
    id_rep: number;
    id_alu: number;
    apm_alu: string;
    app_alu: string;
    fec_rep: string;
    fot_alu: null | string;
    nom_alu: string;
    rep_rep: string;
  }

export interface PropsActividad {
    route: {
        params: {
          data_actividad: ActividadData
        }
    },
    navigation: any
}

export interface FilePick {
    fileCopyUri: null | string;
    name: string; 
    size: number; 
    type: string; 
    uri: string;
}

export interface obRespuesta {
    id_pre: number;
    id_res: number;
    res_res: string;
    val_res: "Verdadero" | "Falso";
    id_pre2?: number;
    id_res1?: number;
}

export interface obPregunta {
    id_pre: number;
    pre_pre: string;
    pun_pre: number;
}

export interface ActividadPendiente{
    id: number;
    actividad: string;
    puntaje: number;
    inicio: string;
    fin: string;
    tipo: tiposActividades;
    alumno_rama: number;
    id_cop: number;
    id_sub_hor: number;
    id_blo: number;
    nom_blo: string;
    des_blo: string;
    con_blo: string;
    nom_mat: string;
}

export interface AvisoEstudiante{
    id: number;
    responsable: string;
    mensaje: string;
    imagen: string;
    plantel: string;
    tipo_imagen: string;
    link: string;
    imgWidth: number;
    imgHeight: number;
}

export interface ImgDimension{
    width: number;
    height: number;
}

export interface PayExpired{
  id: number;
  pay_status: string;
  description: string;
  date: string;
}
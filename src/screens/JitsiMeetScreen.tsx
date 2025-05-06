import React, {useCallback, useContext, useRef} from 'react';
import {JitsiMeeting} from '@jitsi/react-native-sdk';
import { AuthContext } from '../context/AuthContext';


interface MeetingProps {
  route: any;
  navigation: any;
}

export const JitsiMeetScreen = ( { route, navigation }: MeetingProps ) => {
  const { data_alumno } = useContext( AuthContext );
  console.log('--------------data_alumno?.fot_alu-----------', data_alumno?.fot_alu);
  const jitsiMeeting = useRef(null);
  const { id_sub_hor, title, nom_mat } = route.params;
  const onReadyToClose = useCallback(() => {
    // @ts-ignore
    jitsiMeeting.current.close();
    // @ts-ignore
    navigation.pop()
  }, [navigation]);

  const onEndpointMessageReceived = useCallback(() => {
    console.log('Recibiste un mensaje');
  }, []);

  const eventListeners = {
    onReadyToClose,
    onEndpointMessageReceived
  };

  return (
    // @ts-ignore
    <JitsiMeeting
      config = {{
        hideConferenceTimer: true,
        customToolbarButtons: [
          {
            icon: "https://w7.pngwing.com/pngs/987/537/png-transparent-download-downloading-save-basic-user-interface-icon-thumbnail.png",
            id: "btn1",
            text: "Button one"
          }, {
            icon: "https://w7.pngwing.com/pngs/987/537/png-transparent-download-downloading-save-basic-user-interface-icon-thumbnail.png",
            id: "btn2",
            text: "Button two"
          }
        ],
        whiteboard: {
          enabled: true,
          collabServerBaseUrl: "https://meet.jit.si/",
        },
        subject: `${nom_mat} - ${id_sub_hor}`
      }}
      userInfo={{
        displayName: data_alumno?.nom_alu ? data_alumno?.nom_alu : "",
        avatarURL: data_alumno?.fot_alu ? 'https://plataforma.ahjende.com/uploads/'+data_alumno?.fot_alu : "",
        email: "",
      }}
      eventListeners = { eventListeners as any }
      flags = {{
        "audioMute.enabled": true,
        "ios.screensharing.enabled": true,
        "fullscreen.enabled": false,
        "audioOnly.enabled": false,
        "android.screensharing.enabled": true,
        "pip.enabled": true,
        "pip-while-screen-sharing.enabled": true,
        "conference-timer.enabled": true,
        "close-captions.enabled": false,
        "toolbox.enabled": true,
      }}
      ref = { jitsiMeeting }
      style = {{ flex: 1 }}
      room = { id_sub_hor }
      serverURL = { "https://videoconferencias.ahjende.com/" } />
  );
};
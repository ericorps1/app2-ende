import React, {useCallback, useRef} from 'react';
import {JitsiMeeting} from '@jitsi/react-native-sdk';


interface MeetingProps {
  route: any;
  navigation: any;
}

export const JitsiMeetScreen = ( { route, navigation }: MeetingProps ) => {
  const jitsiMeeting = useRef(null);
  const { id_sub_hor, title } = route.params;
  const room = `id_sub_hor=${id_sub_hor}`;
  console.log('Este es el rooommm =>>>>>>>>   ',room);
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
          room = { room }
          serverURL = { "https://videoconferencias.ahjende.com/" } />
  );
};
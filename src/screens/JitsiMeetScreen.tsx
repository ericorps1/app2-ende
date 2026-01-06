import React, { useCallback, useContext, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { JitsiMeeting } from '@jitsi/react-native-sdk';
import { AuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MeetingProps {
  route: {
    params: {
      id_sub_hor: string;
      title: string;
      nom_mat: string;
    };
  };
  navigation: any;
}

const BASE_UPLOAD_URL = 'https://plataforma.ahjende.com/uploads/';
const JITSI_SERVER_URL = 'https://videoconferencias.ahjende.com/';

export const JitsiMeetScreen = ({ route, navigation }: MeetingProps) => {
  const { data_alumno } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const jitsiMeeting = useRef<any>(null);
  
  const { id_sub_hor, title, nom_mat } = route.params;

  const onReadyToClose = useCallback(() => {
    if (jitsiMeeting.current) {
      jitsiMeeting.current.close();
    }
    navigation.pop();
  }, [navigation]);

  const onEndpointMessageReceived = useCallback((message: any) => {
    console.log('📩 Mensaje recibido:', message);
  }, []);

  const eventListeners = {
    onReadyToClose,
    onEndpointMessageReceived,
  };

  const avatarURL = data_alumno?.fot_alu 
    ? `${BASE_UPLOAD_URL}${data_alumno.fot_alu}` 
    : undefined;

  const displayName = data_alumno?.nom_alu || 'Usuario';

  return (
    <View style={styles.container}>
      <JitsiMeeting
        ref={jitsiMeeting}
        style={[
          styles.meeting,
          {
            marginTop: insets.top,
            marginBottom: Math.max(insets.bottom, 12),
          }
        ]}
        room={id_sub_hor}
        serverURL={JITSI_SERVER_URL}
        
        config={{
          hideConferenceTimer: false,
          subject: `${nom_mat} - ${title}`,
          
          // 🔥 ESPAÑOL FORZADO
          defaultLanguage: 'es',
          lang: 'es',
          
          whiteboard: {
            enabled: true,
            collabServerBaseUrl: 'https://meet.jit.si/',
          },
          
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          
          // 🔥 TOOLBAR PERSONALIZADO (todos en español si el servidor lo soporta)
          toolbarButtons: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'raisehand',
            'videoquality',
            'filmstrip',
            'stats',
            'shortcuts',
            'tileview',
            'videobackgroundblur',
            'download',
            'help',
            'mute-everyone',
          ],
        }}
        
        userInfo={{
          displayName,
          avatarURL,
          email: data_alumno?.email || '',
        }}
        
        flags={{
          'audio-mute.enabled': true,
          'video-mute.enabled': true,
          'ios.screensharing.enabled': true,
          'android.screensharing.enabled': true,
          'fullscreen.enabled': false,
          'audioOnly.enabled': true,
          'pip.enabled': true,
          'pip-while-screen-sharing.enabled': true,
          'conference-timer.enabled': true,
          'close-captions.enabled': true,
          'toolbox.enabled': true,
          'chat.enabled': true,
          'invite.enabled': true,
          'raise-hand.enabled': true,
          'recording.enabled': false,
          'live-streaming.enabled': false,
          'security-options.enabled': false,
          'tile-view.enabled': true,
          'reactions.enabled': true,
          'add-people.enabled': false,
          'overflow-menu.enabled': true,
          'settings.enabled': true,
          'video-share.enabled': true,
        }}
        
        eventListeners={eventListeners}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  meeting: {
    flex: 1,
  },
});
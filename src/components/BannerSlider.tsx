import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Animated,
  FlatList,
  PanResponder,
  StatusBar,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface Banner {
  id: string;
  url: string;
  title?: string;
  description?: string;
  link?: string;
}

interface BannerSliderProps {
  banners: Banner[];
  autoPlayInterval?: number;
  height?: number;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  banners,
  autoPlayInterval = 4000,
  height = 200,
}) => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (banners.length > 1 && !lightboxVisible) {
      startAutoPlay();
    }

    return () => {
      stopAutoPlay();
    };
  }, [currentIndex, banners.length, lightboxVisible]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimer.current = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  };

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(newIndex);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
    stopAutoPlay();
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
  };

  const navigateLightbox = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setLightboxIndex((prev) => (prev + 1) % banners.length);
    } else {
      setLightboxIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const handleLinkPress = async (link?: string) => {
    if (link) {
      try {
        const supported = await Linking.canOpenURL(link);
        if (supported) {
          await Linking.openURL(link);
        }
      } catch (error) {
        console.log('Error abriendo link:', error);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          navigateLightbox('prev');
        } else if (gestureState.dx < -50) {
          navigateLightbox('next');
        }
      },
    })
  ).current;

  const renderBanner = ({ item, index }: { item: Banner; index: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openLightbox(index)}
        style={styles.bannerContainer}
      >
        <View style={styles.bannerWrapper}>
          <Image
            source={{ uri: item.url }}
            style={[styles.bannerImage, { height }]}
            resizeMode="cover"
          />
          {(item.title || item.description) && (
            <View style={styles.textOverlay}>
              {item.title && (
                <Text 
                  style={styles.bannerTitle} 
                  numberOfLines={2}
                  allowFontScaling={false}
                >
                  {item.title}
                </Text>
              )}
              {item.description && (
                <Text 
                  style={styles.bannerDescription} 
                  numberOfLines={2}
                  allowFontScaling={false}
                >
                  {item.description}
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDots = () => (
    <View style={[styles.dotsContainer, { backgroundColor: themeColors.backgroundCard }]}>
      {banners.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 20, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: themeColors.textPrimary,
              },
            ]}
          />
        );
      })}
    </View>
  );

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: themeColors.backgroundCard }]}>
        <AnimatedFlatList
          ref={flatListRef}
          data={banners}
          renderItem={renderBanner}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />
        {banners.length > 1 && renderDots()}
      </View>

      <Modal
        visible={lightboxVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeLightbox}
      >
        <StatusBar hidden />
        <View style={styles.lightboxContainer} {...panResponder.panHandlers}>
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 10 }]}
            onPress={closeLightbox}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={32} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.lightboxContent}>
            <Image
              source={{ uri: banners[lightboxIndex].url }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
            {(banners[lightboxIndex].title || banners[lightboxIndex].description) && (
              <View style={[styles.lightboxTextOverlay, { bottom: insets.bottom + 80 }]}>
                {banners[lightboxIndex].title && (
                  <Text 
                    style={styles.lightboxTitle} 
                    numberOfLines={2}
                    allowFontScaling={false}
                  >
                    {banners[lightboxIndex].title}
                  </Text>
                )}
                {banners[lightboxIndex].description && (
                  <Text 
                    style={styles.lightboxDescription} 
                    numberOfLines={3}
                    allowFontScaling={false}
                  >
                    {banners[lightboxIndex].description}
                  </Text>
                )}
                {banners[lightboxIndex].link && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => handleLinkPress(banners[lightboxIndex].link)}
                  >
                    <Text style={styles.linkButtonText} allowFontScaling={false}>
                      Más información
                    </Text>
                    <Icon name="arrow-forward" size={16} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {banners.length > 1 && (
            <View style={[styles.lightboxDotsContainer, { bottom: insets.bottom + 40 }]}>
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.lightboxDot,
                    index === lightboxIndex && styles.lightboxDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
  },
  bannerContainer: {
    width: SCREEN_WIDTH,
  },
  bannerWrapper: {
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  bannerImage: {
    width: SCREEN_WIDTH,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    includeFontPadding: false, // 🔥 MEJOR RENDERIZADO DE EMOJIS EN ANDROID
  },
  bannerDescription: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    includeFontPadding: false, // 🔥 MEJOR RENDERIZADO DE EMOJIS EN ANDROID
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  lightboxTextOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  lightboxTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    includeFontPadding: false, // 🔥 MEJOR RENDERIZADO DE EMOJIS EN ANDROID
  },
  lightboxDescription: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.95,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    includeFontPadding: false, // 🔥 MEJOR RENDERIZADO DE EMOJIS EN ANDROID
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 8,
    includeFontPadding: false, // 🔥 MEJOR RENDERIZADO DE EMOJIS EN ANDROID
  },
  lightboxDotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  lightboxDotActive: {
    backgroundColor: '#FFF',
    width: 20,
  },
});
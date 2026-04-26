import { useGeocoding } from '@hooks/useGeocoding';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type ListingMapProps = {
  address: string;
};

/**
 * Maps an address string and displays it on a Google Map.
 */
const ListingMap = ({ address }: ListingMapProps) => {
  const { region, isLoading, error } = useGeocoding(address);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#ccff00" />
        <Text style={styles.text}>Locating property...</Text>
      </View>
    );
  }

  if (error || !region) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="map-outline" size={32} color="#ffffff30" />
        <Text style={styles.errorText}>{error || "Map unavailable"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={region} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
  }
});

export default ListingMap;

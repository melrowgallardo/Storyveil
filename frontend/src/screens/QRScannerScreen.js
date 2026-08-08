import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, METRICS } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCANNER_SIZE = SCREEN_WIDTH * 0.7;

export default function QRScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (err) {
        console.warn('[Camera Permission Warning]:', err);
        setHasPermission(false);
      }
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`QR Code Scanned!\nContent: ${data}`);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={54} color={COLORS.textMuted} />
        <Text style={styles.errorTitle}>Camera Access Required</Text>
        <Text style={styles.errorSubtitle}>
          Camera permission is needed to scan Storyveil QR codes and sync reading sessions.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Overlay Bar */}
      <View style={styles.overlayTop}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.overlayTitle}>Scan Storyveil QR</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Target Focus Square */}
      <View style={styles.scannerFrame}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {/* Bottom Action Area */}
      <View style={styles.overlayBottom}>
        <Text style={styles.hintText}>Position QR code within the frame to scan</Text>
        {scanned && (
          <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
            <Ionicons name="refresh" size={18} color="#FFF" />
            <Text style={styles.rescanText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: METRICS.paddingLarge,
    gap: 12,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  errorTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  errorSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  overlayTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: METRICS.paddingMedium,
    paddingTop: METRICS.paddingLarge + 10,
    paddingBottom: METRICS.paddingMedium,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.secondary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  overlayBottom: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: METRICS.paddingLarge + 20,
    paddingHorizontal: METRICS.paddingMedium,
    backgroundColor: 'rgba(0,0,0,0.6)',
    gap: 12,
  },
  hintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rescanText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

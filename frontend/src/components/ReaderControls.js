import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, METRICS } from '../styles/theme';

export default function ReaderControls({
  chapterTitle,
  currentPage,
  totalPages,
  readerMode,
  onPrevChapter,
  onNextChapter,
  onToggleMode,
  onBack,
  isBookmarked,
  onToggleBookmark,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      {/* Top Reader Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 6, METRICS.paddingMedium) }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.chapterTitle} numberOfLines={1}>
          {chapterTitle || 'Chapter View'}
        </Text>

        <TouchableOpacity style={styles.iconBtn} onPress={onToggleBookmark}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked ? COLORS.primary : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Reader Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, METRICS.paddingMedium) }]}>
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.navBtn} onPress={onPrevChapter}>
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
            <Text style={styles.btnText}>Prev Ch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeBtn} onPress={onToggleMode}>
            <Ionicons name={readerMode === 'webtoon' ? 'document-text' : 'book'} size={16} color={COLORS.secondary} />
            <Text style={styles.modeText}>{readerMode === 'webtoon' ? 'Webtoon Mode' : 'Paged Mode'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navBtn} onPress={onNextChapter}>
            <Text style={styles.btnText}>Next Ch</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    inset: 0,
    justify: 'space-between',
    zIndex: 100,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: METRICS.paddingMedium,
    paddingTop: METRICS.paddingMedium,
    paddingBottom: METRICS.paddingSmall,
    backgroundColor: 'rgba(9, 10, 16, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justify: 'center',
  },
  bottomBar: {
    backgroundColor: 'rgba(9, 10, 16, 0.92)',
    paddingHorizontal: METRICS.paddingMedium,
    paddingVertical: METRICS.paddingMedium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    gap: 10,
  },
  pageIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pageText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    width: '100%',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  modeText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
});

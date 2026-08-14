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
  isSpeaking,
  onToggleVoice,
  isAutoTranslating,
  onToggleTranslation,
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

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.iconBtn, isSpeaking && styles.voiceActiveBtn]}
            onPress={onToggleVoice}
          >
            <Ionicons
              name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
              size={20}
              color={isSpeaking ? COLORS.accent : COLORS.text}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={onToggleBookmark}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? COLORS.primary : COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>


      {/* Bottom Reader Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, METRICS.paddingMedium) }]}>
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : '0 Pages'}
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.navBtn} onPress={onPrevChapter}>
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
            <Text style={styles.btnText}>Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.translateBtn, isAutoTranslating && styles.translateActiveBtn]}
            onPress={onToggleTranslation}
          >
            <Ionicons name="language" size={15} color={isAutoTranslating ? '#FFF' : COLORS.secondary} />
            <Text style={[styles.translateText, isAutoTranslating && styles.translateActiveText]}>
              {isAutoTranslating ? 'EN On' : 'Translate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeBtn} onPress={onToggleMode}>
            <Ionicons name={readerMode === 'webtoon' ? 'document-text' : 'book'} size={15} color={COLORS.secondary} />
            <Text style={styles.modeText}>{readerMode === 'webtoon' ? 'Webtoon' : 'Paged'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navBtn} onPress={onNextChapter}>
            <Text style={styles.btnText}>Next</Text>
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
    justifyContent: 'center',
  },
  voiceActiveBtn: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.5)',
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
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
  },
  translateActiveBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  translateText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  translateActiveText: {
    color: '#FFF',
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  modeText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
});


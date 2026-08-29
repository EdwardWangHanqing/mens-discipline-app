import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  Vibration,
  View,
  useWindowDimensions,
} from 'react-native';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  FadeOutLeft,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';
import { GlassView } from 'expo-glass-effect';
import { useRouter } from 'expo-router';

import FamilyControls, {
  SelectedActivitiesView,
  type FamilyControlsAuthorizationDisplayStatus,
} from '../../modules/family-controls';
import {
  Body,
  Card,
  Divider,
  Eyebrow,
  Icon,
  Metric,
  PrimaryButton,
  Screen,
  SecondaryButton,
  TextButton,
  Title,
  TopBar,
} from '../components/ui';
import {
  DAILY_SET_COUNT,
  REST_SECONDS,
  type Movement,
} from '../data/movements';
import type { OnboardingDraft } from './OnboardingFlow';
import { colors, radii, spacing, typography } from '../theme/designSystem';
import { consumeGrace, expireGrace, greetingForHour } from '../state/dailyState';

export type MainTab = 'home' | 'train' | 'locks';
export type DailyStatus = 'unrevealed' | 'revealed' | 'inProgress' | 'completed' | 'skipped';
export type ProgressSummary = {
  sessions: number;
  cycles: number;
  momentumDays: number;
  longestMomentum: number;
  completedDates: string[];
  skippedDates: string[];
};
export type GraceState = { dateKey: string; remaining: number; activeUntil: number | null };

export type MainExperienceSubscreen =
  | 'main'
  | 'profile'
  | 'history'
  | 'milestones'
  | 'settings'
  | 'notifications'
  | 'help'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'introduction'
  | 'lockPreferences'
  | 'manageApps'
  | 'lockSchedule';

export type SessionPhase = 'countdown' | 'active' | 'rest' | 'paused' | 'finishing' | 'complete';
export type MainExperiencePreviewState = {
  subscreen?: MainExperienceSubscreen;
  session?: SessionPhase | null;
  setNumber?: number;
  reps?: number;
  restSeconds?: number;
  countdown?: number;
  frozen?: boolean;
};
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const completionCelebrationVideo = require('../../assets/videos/completion-celebration-muted.mp4');

export function MainExperience({
  nickname,
  draft,
  movement,
  canReplaceMovement,
  tab,
  setTab,
  dailyStatus,
  progress,
  grace,
  setGrace,
  setDailyStatus,
  onRoutineCompleted,
  onCompletionContinue,
  onOpenAccount,
  onOpenPaywall,
  onRestartOnboarding,
  onChooseApps,
  familyControlsStatus = 'approved',
  familyControlsBusy = false,
  familyControlsMessage = null,
  selectionRequiresReview = false,
  onRefreshFamilyControls = async () => true,
  onOpenFamilyControlsSettings = () => undefined,
  onSkipToday,
  onUpdateLockTime,
  onReplaceMovement,
  previewState,
}: {
  nickname: string;
  draft: OnboardingDraft;
  movement: Movement;
  canReplaceMovement: boolean;
  tab: MainTab;
  setTab: (tab: MainTab) => void;
  dailyStatus: DailyStatus;
  progress: ProgressSummary;
  grace: GraceState;
  setGrace: (value: GraceState | ((current: GraceState) => GraceState)) => void;
  setDailyStatus: (status: DailyStatus) => void;
  onRoutineCompleted: () => void;
  onCompletionContinue: () => void;
  onOpenAccount: () => void;
  onOpenPaywall: () => void;
  onRestartOnboarding?: () => void;
  onChooseApps: () => void;
  familyControlsStatus?: FamilyControlsAuthorizationDisplayStatus;
  familyControlsBusy?: boolean;
  familyControlsMessage?: string | null;
  selectionRequiresReview?: boolean;
  onRefreshFamilyControls?: () => Promise<boolean>;
  onOpenFamilyControlsSettings?: () => void;
  onSkipToday: () => void;
  onUpdateLockTime: (lockTime: string) => void;
  onReplaceMovement: () => void;
  previewState?: MainExperiencePreviewState;
}) {
  const designPreview = previewState !== undefined;
  const router = useRouter();
  const previewFrozen = previewState?.frozen ?? false;
  const [subscreen, setSubscreen] = useState<MainExperienceSubscreen>(previewState?.subscreen ?? 'main');
  const [session, setSession] = useState<SessionPhase | null>(previewState?.session ?? null);
  const [setNumber, setSetNumber] = useState(previewState?.setNumber ?? 1);
  const [reps, setReps] = useState(previewState?.reps ?? 0);
  const [restSeconds, setRestSeconds] = useState(previewState?.restSeconds ?? REST_SECONDS);
  const [countdown, setCountdown] = useState(previewState?.countdown ?? 3);
  const [phaseBeforePause, setPhaseBeforePause] = useState<'active' | 'rest'>('active');
  const [pauseDismissing, setPauseDismissing] = useState(false);
  const [setCompleting, setSetCompleting] = useState(false);
  const [confirmation, setConfirmation] = useState<'grace' | 'skip' | null>(null);
  const [clock, setClock] = useState(0);
  const repProgress = useSharedValue(0);
  const restProgress = useSharedValue(1);
  const graceActive = grace.activeUntil !== null && grace.activeUntil > clock;

  useEffect(() => {
    if (designPreview || tab !== 'locks') return;
    void onRefreshFamilyControls();
  }, [designPreview, onRefreshFamilyControls, tab]);

  useEffect(() => {
    const initialTimer = setTimeout(() => setClock(Date.now()), 0);
    if (!grace.activeUntil) return () => clearTimeout(initialTimer);
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, [grace.activeUntil]);

  useEffect(() => {
    if (designPreview) return;
    if (grace.activeUntil && grace.activeUntil <= clock) {
      setGrace((current) => expireGrace(current, clock));
      if (dailyStatus !== 'completed' && dailyStatus !== 'skipped') {
        void FamilyControls.applyShield().catch(() => undefined);
      }
    }
  }, [clock, dailyStatus, designPreview, grace.activeUntil, setGrace]);

  useEffect(() => {
    if (previewFrozen) return;
    if (session !== 'countdown') return;
    const timer = setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(0);
        setReps(0);
        setSession('active');
      } else {
        setCountdown((value) => value - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, previewFrozen, session]);

  useEffect(() => {
    if (previewFrozen) return;
    if (session !== 'active') return;
    if (setCompleting) return;
    const timer = setTimeout(() => {
      const nextReps = reps + 1;
      setReps(nextReps);
      if (nextReps >= movement.repsPerSet) {
        if (setNumber === DAILY_SET_COUNT) {
          setSession('finishing');
        } else {
          setSetCompleting(true);
        }
      }
    }, movement.cadence.repDurationMs);
    return () => clearTimeout(timer);
  }, [movement.cadence.repDurationMs, movement.repsPerSet, onRoutineCompleted, previewFrozen, reps, session, setCompleting, setNumber]);

  useEffect(() => {
    if (!setCompleting || session !== 'active') return;
    const timer = setTimeout(() => {
      setRestSeconds(REST_SECONDS);
      setSetCompleting(false);
      setSession('rest');
    }, 300);
    return () => clearTimeout(timer);
  }, [session, setCompleting]);

  useEffect(() => {
    if (previewFrozen || session !== 'finishing') return;
    const timer = setTimeout(() => {
      setSession('complete');
      onRoutineCompleted();
    }, 1100);
    return () => clearTimeout(timer);
  }, [onRoutineCompleted, previewFrozen, session]);

  useEffect(() => {
    if (session !== 'active') {
      cancelAnimation(repProgress);
      return;
    }
    repProgress.value = reps / movement.repsPerSet;
    if (previewFrozen) return;
    repProgress.value = withTiming(1, {
      duration: Math.max(1, (movement.repsPerSet - reps) * movement.cadence.repDurationMs),
      easing: Easing.linear,
    });
    return () => cancelAnimation(repProgress);
    // Integer rep updates intentionally do not restart the UI-thread animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movement.cadence.repDurationMs, movement.id, movement.repsPerSet, previewFrozen, session, setNumber]);

  useEffect(() => {
    if (previewFrozen) return;
    if (session !== 'rest') return;
    const timer = setTimeout(() => {
      if (restSeconds <= 1) {
        setRestSeconds(0);
        setSetNumber((value) => value + 1);
        setReps(0);
        repProgress.set(0);
        setSession('active');
      } else {
        setRestSeconds((value) => value - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [previewFrozen, repProgress, restSeconds, session]);

  useEffect(() => {
    const restingOrHeld = session === 'rest' || (session === 'paused' && phaseBeforePause === 'rest');
    if (!restingOrHeld) {
      cancelAnimation(restProgress);
      restProgress.value = 1;
      return;
    }
    if (session === 'paused') {
      cancelAnimation(restProgress);
      return;
    }
    restProgress.value = restSeconds / REST_SECONDS;
    if (previewFrozen) return;
    restProgress.value = withTiming(0, {
      duration: Math.max(1, restSeconds * 1000),
      easing: Easing.linear,
    });
    return () => cancelAnimation(restProgress);
    // The ring stays continuous while the displayed seconds update discretely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseBeforePause, previewFrozen, session, setNumber]);

  if (session) {
    return (
      <SessionScreen
        phase={session}
        setNumber={setNumber}
        reps={reps}
        restSeconds={restSeconds}
        countdown={countdown}
        movement={movement}
        repProgress={repProgress}
        restProgress={restProgress}
        pausedPhase={phaseBeforePause}
        pauseDismissing={pauseDismissing}
        setCompleting={setCompleting}
        onPause={() => {
          if (session === 'active' || session === 'rest') setPhaseBeforePause(session);
          setSession('paused');
        }}
        onResume={() => {
          setPauseDismissing(true);
          setTimeout(() => {
            setSession(phaseBeforePause);
            setPauseDismissing(false);
          }, 220);
        }}
        onEnd={() => {
          setSetCompleting(false);
          setSession(null);
          setDailyStatus('inProgress');
          setTab('train');
        }}
        onContinue={() => {
          setSession(null);
          onCompletionContinue();
        }}
      />
    );
  }

  return (
    <View style={styles.fullScene}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.mainShell}>
          <Animated.View
            key={tab}
            entering={FadeInRight.duration(240)}
            exiting={FadeOut.duration(120)}
            layout={LinearTransition.duration(200)}
            style={styles.tabScene}
          >
        {tab === 'home' ? (
          <HomeTab
            nickname={nickname}
            dailyStatus={dailyStatus}
            progress={progress}
            lockTime={draft.lockTime}
            movement={movement}
            reveal={() => setDailyStatus('revealed')}
            begin={() => beginSession(true)}
            resume={() => beginSession(false)}
            openProfile={() => {
              if (designPreview) setSubscreen('profile');
              else router.push({ pathname: '/profile', params: { movementId: movement.id } });
            }}
          />
        ) : null}
        {tab === 'train' ? (
          <TrainTab
            dailyStatus={dailyStatus}
            movement={movement}
            canReplaceMovement={canReplaceMovement}
            replaceMovement={() => {
              setSetNumber(1);
              setReps(0);
              repProgress.set(0);
              onReplaceMovement();
            }}
            setNumber={setNumber}
            repProgress={repProgress}
            reveal={() => setDailyStatus('revealed')}
            begin={() => beginSession(true)}
            resume={() => beginSession(false)}
          />
        ) : null}
        {tab === 'locks' ? (
          <LocksTab
            selectedAppCount={draft.selectedAppCount}
            lockTime={draft.lockTime}
            dailyStatus={dailyStatus}
            graceActive={graceActive}
            graceRemaining={grace.remaining}
            graceSeconds={graceActive ? Math.max(0, Math.ceil(((grace.activeUntil ?? clock) - clock) / 1000)) : 0}
            requestGrace={() => setConfirmation('grace')}
            requestSkip={() => setConfirmation('skip')}
            openManageApps={() => setSubscreen('manageApps')}
            openSchedule={() => setSubscreen('lockSchedule')}
          />
        ) : null}
          </Animated.View>
          <BottomNavigation selected={tab} onSelect={setTab} />
        </View>
        {confirmation ? (
          <ConfirmationSheet
            type={confirmation}
            graceRemaining={grace.remaining}
            onCancel={() => setConfirmation(null)}
            onConfirm={() => {
              if (confirmation === 'grace' && grace.remaining > 0) {
                if (!designPreview) void FamilyControls.removeShield().catch(() => undefined);
                setGrace((current) => consumeGrace(current, Date.now()));
              }
              if (confirmation === 'skip') onSkipToday();
              setConfirmation(null);
            }}
          />
        ) : null}
      </SafeAreaView>
      {subscreen !== 'main' ? (
        <Animated.View
          key={subscreen}
          entering={FadeInRight.duration(300).easing(Easing.out(Easing.cubic))}
          exiting={FadeOutLeft.duration(220).easing(Easing.out(Easing.cubic))}
          style={styles.subscreenOverlay}
        >
          {renderSubscreen()}
        </Animated.View>
      ) : null}
    </View>
  );

  function beginSession(reset: boolean) {
    if (reset) {
      setSetNumber(1);
      setReps(0);
      repProgress.set(0);
    }
    setCountdown(3);
    setDailyStatus('inProgress');
    setSession('countdown');
  }

  function renderSubscreen() {
    const back = () => setSubscreen(subscreen === 'profile' ? 'main' : 'profile');
    if (subscreen === 'profile') {
      return (
        <ProfileScreen
          nickname={nickname}
          progress={progress}
          onBack={() => setSubscreen('main')}
          openHistory={() => setSubscreen('history')}
          openMilestones={() => setSubscreen('milestones')}
          openSettings={() => setSubscreen('settings')}
          openAccount={onOpenAccount}
          openMembership={onOpenPaywall}
        />
      );
    }
    if (subscreen === 'history') return <HistoryScreen progress={progress} movement={movement} onBack={back} />;
    if (subscreen === 'milestones') return <MilestonesScreen progress={progress} onBack={back} />;
    if (subscreen === 'settings') {
      return (
        <SettingsScreen
          onBack={back}
          openNotifications={() => setSubscreen('notifications')}
          openInformation={(page) => setSubscreen(page)}
          openIntroduction={() => setSubscreen('introduction')}
          onRestartOnboarding={onRestartOnboarding}
        />
      );
    }
    if (subscreen === 'notifications') return <NotificationsScreen onBack={() => setSubscreen('settings')} />;
    if (subscreen === 'introduction') return <IntroductionReplayScreen onBack={() => setSubscreen('settings')} />;
    if (subscreen === 'help' || subscreen === 'privacy' || subscreen === 'terms' || subscreen === 'about') {
      return <InformationScreen page={subscreen} onBack={() => setSubscreen('settings')} />;
    }
    if (subscreen === 'lockPreferences') return <LockPreferencesScreen onBack={() => setSubscreen('settings')} />;
    if (subscreen === 'manageApps') {
      return (
        <ManageAppsScreen
          count={draft.selectedAppCount}
          authorizationStatus={familyControlsStatus}
          busy={familyControlsBusy}
          message={familyControlsMessage}
          selectionRequiresReview={selectionRequiresReview}
          onBack={() => setSubscreen('main')}
          onChooseApps={onChooseApps}
          onOpenSettings={onOpenFamilyControlsSettings}
          onRefresh={() => void onRefreshFamilyControls()}
        />
      );
    }
    return (
      <LockScheduleScreen
        lockTime={draft.lockTime}
        onSave={(value) => {
          onUpdateLockTime(value);
          setSubscreen('main');
        }}
        onBack={() => setSubscreen('main')}
      />
    );
  }
}

function HomeTab({
  nickname,
  dailyStatus,
  progress,
  lockTime,
  movement,
  reveal,
  begin,
  resume,
  openProfile,
}: {
  nickname: string;
  dailyStatus: DailyStatus;
  progress: ProgressSummary;
  lockTime: string;
  movement: Movement;
  reveal: () => void;
  begin: () => void;
  resume: () => void;
  openProfile: () => void;
}) {
  const [greeting, setGreeting] = useState('Good evening');

  useEffect(() => {
    const updateGreeting = () => setGreeting(greetingForHour(new Date().getHours()));
    const initialUpdate = setTimeout(updateGreeting, 0);
    const interval = setInterval(updateGreeting, 60_000);
    return () => {
      clearTimeout(initialUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
      <View style={styles.homeHeader}>
        <View style={styles.homeGreeting}>
          <Text style={styles.greeting}>{greeting}, {nickname || 'Edward'}.</Text>
          <Text style={styles.support}>Stay disciplined. Own your day.</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={openProfile} style={styles.profileButton}>
          <Icon name="person" color={colors.primary} size={24} />
        </Pressable>
      </View>

      <MomentumCard progress={progress} dailyStatus={dailyStatus} />
      <MovementCard dailyStatus={dailyStatus} lockTime={lockTime} movement={movement} reveal={reveal} begin={begin} resume={resume} />
      <CalendarCard completedDates={progress.completedDates} skippedDates={progress.skippedDates} />
      <Card style={styles.lifetimeCard}>
        <Eyebrow>Lifetime Progress</Eyebrow>
        <View style={styles.metricRow}>
          <Metric value={progress.sessions} label="Sessions" />
          <View style={styles.metricDivider} />
          <Metric value={progress.cycles} label="Cycles" />
          <View style={styles.metricDivider} />
          <Metric value={progress.longestMomentum} label="Longest" />
        </View>
      </Card>
    </ScrollView>
  );
}

function MomentumCard({ progress, dailyStatus }: { progress: ProgressSummary; dailyStatus: DailyStatus }) {
  const weekCount = Math.min(7, progress.completedDates.filter(isDateInCurrentWeek).length);
  const skipped = dailyStatus === 'skipped';
  return (
    <Card style={styles.momentumCard}>
      <View style={styles.momentumTop}>
        <View style={styles.momentumCopy}>
          <Eyebrow>Momentum</Eyebrow>
          {skipped ? (
            <Animated.View entering={FadeInDown.duration(360)}>
              <Text style={styles.momentumRecovery}>Momentum starts again tomorrow.</Text>
              <Text style={styles.momentumRecoverySupport}>Your history is still yours.</Text>
            </Animated.View>
          ) : (
            <>
              <Text style={styles.momentumValue}>{progress.momentumDays}</Text>
              <Eyebrow accent>{progress.momentumDays === 1 ? 'Day of momentum' : 'Days of momentum'}</Eyebrow>
            </>
          )}
        </View>
        {!skipped ? <View style={styles.weekRing}>
          <Svg width={112} height={112} style={StyleSheet.absoluteFill}>
            <Circle cx={56} cy={56} r={48} fill="none" stroke={colors.borderStrong} strokeWidth={9} />
            <Circle
              cx={56}
              cy={56}
              r={48}
              fill="none"
              stroke={colors.accent}
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - weekCount / 7)}`}
              transform="rotate(-90 56 56)"
            />
          </Svg>
          <Text style={styles.weekRingValue}>{weekCount}/7</Text>
          <Text style={styles.weekRingLabel}>WEEK</Text>
        </View> : null}
      </View>
      <Divider />
      <Eyebrow>Weekly Consistency</Eyebrow>
      <View style={styles.weekDays}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
          const dayDate = startOfCurrentWeek();
          dayDate.setDate(dayDate.getDate() + index);
          const done = progress.completedDates.includes(localDateKey(dayDate));
          return (
            <View key={`${day}-${index}`} style={[styles.dayCell, done && styles.dayCellDone]}>
              <Text style={[styles.dayLetter, done && styles.dayLetterDone]}>{day}</Text>
              {done ? <View pointerEvents="none" style={styles.dayCheck}><Icon name="checkmark" color={colors.accent} size={13} weight="bold" /></View> : null}
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function MovementCard({
  dailyStatus,
  lockTime,
  movement,
  reveal,
  begin,
  resume,
}: {
  dailyStatus: DailyStatus;
  lockTime: string;
  movement: Movement;
  reveal: () => void;
  begin: () => void;
  resume: () => void;
}) {
  const hidden = dailyStatus === 'unrevealed';
  const completed = dailyStatus === 'completed';
  const skipped = dailyStatus === 'skipped';
  const inProgress = dailyStatus === 'inProgress';
  return (
    <Card style={styles.movementCard}>
      <Animated.View key={dailyStatus} entering={FadeInDown.duration(420).springify()} style={styles.movementHeader}>
        <View style={styles.movementThumbnail}>
          {hidden ? (
            <Image source={require('../../assets/images/reveal-cover.png')} style={styles.coverImage} />
          ) : (
            <Image source={movement.coachImage} style={styles.coachThumb} resizeMode="contain" />
          )}
        </View>
        <View style={styles.movementCopy}>
          <Eyebrow>Today&apos;s Movement</Eyebrow>
          <Text style={styles.movementTitle}>
            {hidden
              ? 'Your movement is ready.'
              : completed
                ? 'Completed today.'
                : skipped
                  ? 'Skipped today.'
                  : movement.displayName}
          </Text>
          <Text style={styles.movementSupport}>
            {hidden
              ? 'It will be revealed once you’re ready to train.'
              : completed
                ? 'You showed up.'
                : skipped
                  ? 'Back tomorrow.'
                  : 'Ready for today'}
          </Text>
        </View>
      </Animated.View>
      <View style={styles.metricRow}>
        <Metric value="1" label="Movement" />
        <View style={styles.metricDivider} />
        <Metric value="5" label="Sets" />
        <View style={styles.metricDivider} />
        <Metric value={movement.repsPerSet} label="Reps" />
      </View>
      <View style={[styles.deadlineRow, skipped && styles.skippedInfoRow]}>
        <Icon name={completed ? 'checkmark.circle.fill' : skipped ? 'info.circle' : 'clock'} color={completed ? colors.accent : colors.secondary} size={16} />
        <Text style={[styles.deadlineText, completed && styles.deadlineTextComplete]}>
          {completed ? 'MOVEMENT COMPLETE' : skipped ? 'TODAY’S MOVEMENT WAS SKIPPED' : `Complete before ${lockTime}`}
        </Text>
      </View>
      {skipped ? <View style={styles.noActionRow}><Text style={styles.noActionText}>NO ACTION AVAILABLE TODAY</Text></View> : null}
      {!completed && !skipped ? (
        <PrimaryButton
          label={hidden ? 'Reveal' : inProgress ? 'Resume' : 'Begin'}
          onPress={hidden ? reveal : inProgress ? resume : begin}
        />
      ) : null}
    </Card>
  );
}

function CalendarCard({ completedDates, skippedDates }: { completedDates: string[]; skippedDates: string[] }) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [direction, setDirection] = useState<-1 | 1>(1);
  const changeMonth = (delta: -1 | 1) => {
    setDirection(delta);
    setVisibleMonth((value) => new Date(value.getFullYear(), value.getMonth() + delta, 1));
  };
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 16 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -44) changeMonth(1);
      if (gesture.dx > 44) changeMonth(-1);
    },
  }), []);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const mondayOffset = (new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay() + 6) % 7;
  const monthTitle = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visibleMonth).toUpperCase();
  return (
    <View style={styles.calendarSection}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>{monthTitle}</Text>
        <View style={styles.calendarArrows}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => changeMonth(-1)} style={styles.calendarArrow}>
            <Icon name="chevron.left" color={colors.secondary} size={16} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => changeMonth(1)} style={styles.calendarArrow}>
            <Icon name="chevron.right" color={colors.secondary} size={16} />
          </Pressable>
        </View>
      </View>
      <Animated.View
        key={`${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`}
        entering={(direction > 0 ? FadeInRight : FadeInLeft).duration(260)}
        style={styles.calendarGrid}
        {...panResponder.panHandlers}
      >
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.calendarWeekday}>{day}</Text>
        ))}
        {Array.from({ length: mondayOffset }, (_, index) => <View key={`spacer-${index}`} style={styles.calendarSpacer} />)}
        {days.map((day) => {
          const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
          const dateKey = localDateKey(date);
          const done = completedDates.includes(dateKey) && date <= today;
          const skipped = skippedDates.includes(dateKey) && date <= today;
          const isToday = dateKey === localDateKey(today);
          return (
            <View key={day} style={styles.calendarDaySlot}>
              <View
                style={[
                  styles.calendarDay,
                  done && styles.calendarDayDone,
                  isToday && styles.calendarDayToday,
                  skipped && styles.calendarDaySkipped,
                ]}
              >
                <Text style={[styles.calendarDayText, done && styles.calendarDayTextDone]}>{day}</Text>
              </View>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

function TrainTab({
  dailyStatus,
  movement,
  canReplaceMovement,
  replaceMovement,
  setNumber,
  repProgress,
  reveal,
  begin,
  resume,
}: {
  dailyStatus: DailyStatus;
  movement: Movement;
  canReplaceMovement: boolean;
  replaceMovement: () => void;
  setNumber: number;
  repProgress: SharedValue<number>;
  reveal: () => void;
  begin: () => void;
  resume: () => void;
}) {
  const { height: viewportHeight } = useWindowDimensions();
  const compactHeight = viewportHeight < 900;
  const hidden = dailyStatus === 'unrevealed';
  const completed = dailyStatus === 'completed';
  const skipped = dailyStatus === 'skipped';
  const inProgress = dailyStatus === 'inProgress';
  if (hidden) {
    return (
      <Animated.View entering={FadeIn.duration(260)} exiting={FadeOut.duration(160)} style={styles.trainEmpty}>
        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.concealedIcon}>
          <Icon name="eye.slash" color={colors.accent} size={34} />
        </Animated.View>
        <Eyebrow>Today&apos;s Movement</Eyebrow>
        <Title compact>Ready when you are.</Title>
        <Body muted>Reveal the movement selected for today. Revealing does not change the draw.</Body>
        <View style={styles.trainEmptyButton}>
          <PrimaryButton label="Reveal Movement" onPress={reveal} />
        </View>
      </Animated.View>
    );
  }
  if (completed || skipped) return <OutcomeTrainTab skipped={skipped} movement={movement} />;
  return (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={[styles.trainContent, compactHeight && styles.trainContentCompact]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.trainHeading}>
        <Text style={styles.trainBrand}>VAEL</Text>
        <Text style={styles.trainTitle}>{movement.displayName}</Text>
      </View>
      <View style={styles.coachStage}>
        <Image source={movement.coachImage} style={styles.coachImage} resizeMode="contain" />
      </View>
      <Card style={styles.trainMetricsCard}>
        <View style={styles.metricRow}>
          <TrainingMetric icon="square.stack.3d.up" value={DAILY_SET_COUNT} label="Sets" />
          <View style={styles.metricDivider} />
          <TrainingMetric icon="arrow.triangle.2.circlepath" value={movement.repsPerSet} label="Reps" />
        </View>
      </Card>
      <Card style={styles.trainCueCard}>
        <Image source={require('../../assets/icons/train-lightning.png')} style={styles.lightningIcon} resizeMode="contain" />
        <Text numberOfLines={2} style={styles.trainCueText}>Follow the coach. Control every repetition.</Text>
      </Card>
      <PrimaryButton label={inProgress ? 'Resume Session' : 'Begin'} onPress={inProgress ? resume : begin} />
      <TextButton
        label={canReplaceMovement ? 'Replace Movement' : 'Replacement Used Today'}
        onPress={canReplaceMovement ? replaceMovement : () => undefined}
        color={canReplaceMovement ? colors.secondary : colors.tertiary}
      />
    </ScrollView>
  );
}

function TrainingMetric({ icon, value, label }: { icon: Parameters<typeof Icon>[0]['name']; value: string | number; label: string }) {
  return (
    <View style={styles.trainingMetric}>
      <View style={styles.trainingMetricValueRow}>
        <Icon name={icon} color={colors.accent} size={25} weight="medium" />
        <Text style={styles.trainingMetricValue}>{value}</Text>
      </View>
      <Text style={styles.trainingMetricLabel}>{label}</Text>
    </View>
  );
}

function OutcomeTrainTab({ skipped, movement }: { skipped: boolean; movement: Movement }) {
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.outcomeTrainContent} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(420)} style={styles.outcomeTrainHeader}>
        <Text style={styles.outcomeTrainEyebrow}>TODAY&apos;S TRAINING</Text>
        <Text style={styles.outcomeTrainTitle}>{skipped ? 'SKIPPED TODAY' : 'COMPLETED TODAY'}</Text>
        <Text style={styles.outcomeTrainSupport}>{skipped ? 'Back tomorrow.' : 'You showed up.'}</Text>
      </Animated.View>
      {skipped ? (
        <Animated.Image entering={FadeIn.duration(520)} source={movement.coachImage} style={styles.outcomeTrainCoach} resizeMode="contain" />
      ) : (
        <Animated.View entering={FadeIn.duration(520)} style={styles.outcomeTrainCompletionMedia}>
          <CompletionCelebrationVideo />
        </Animated.View>
      )}
      <View style={styles.outcomeTrainProgress}>
        <Text style={styles.outcomeTrainSummary}>{skipped ? 'NO ACTION AVAILABLE TODAY' : '5 OF 5 SETS COMPLETE'}</Text>
        <SetSegments currentSet={skipped ? 0 : DAILY_SET_COUNT + 1} />
      </View>
      <Card style={styles.outcomeTrainCard}>
        {!skipped ? <Image source={require('../../assets/icons/apps-unlocked.png')} style={styles.outcomeUnlockAsset} resizeMode="contain" /> : null}
        <View style={styles.outcomeCopy}>
          <Text style={styles.outcomeTitle}>{skipped ? 'TODAY’S MOVEMENT REMAINS IN YOUR CYCLE.' : 'CLEAR FOR TODAY'}</Text>
          {!skipped ? <Text style={styles.outcomeSupport}>Your routine is complete.</Text> : null}
        </View>
      </Card>
    </ScrollView>
  );
}

function LocksTab({
  selectedAppCount,
  lockTime,
  dailyStatus,
  graceActive,
  graceRemaining,
  graceSeconds,
  requestGrace,
  requestSkip,
  openManageApps,
  openSchedule,
}: {
  selectedAppCount: number;
  lockTime: string;
  dailyStatus: DailyStatus;
  graceActive: boolean;
  graceRemaining: number;
  graceSeconds: number;
  requestGrace: () => void;
  requestSkip: () => void;
  openManageApps: () => void;
  openSchedule: () => void;
}) {
  const completed = dailyStatus === 'completed';
  const skipped = dailyStatus === 'skipped';
  const appsAvailable = completed || graceActive;
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.locksContent} showsVerticalScrollIndicator={false}>
      <View style={styles.locksHeader}>
        <View style={styles.locksHeaderCopy}>
          <Eyebrow>Accountability Lock</Eyebrow>
          <Text style={styles.locksIntro}>Your apps stay locked{`\n`}until you complete tonight’s routine.</Text>
        </View>
        <Image source={require('../../assets/icons/lock-shield.png')} style={styles.headerShieldAsset} resizeMode="contain" />
      </View>

      <SectionTitle title="Selected Apps" action="Manage" onPress={openManageApps} />
      <Card style={styles.appsListCard}>
        {selectedAppCount ? (
          <>
            <SelectedActivitiesView
              available={appsAvailable}
              revision={selectedAppCount}
              style={{ height: Math.max(48, Math.min(selectedAppCount, 4) * 48) }}
            />
            {selectedAppCount > 4 ? <Text style={styles.moreAppsText}>+{selectedAppCount - 4} MORE SELECTED · MANAGE TO EDIT</Text> : null}
          </>
        ) : (
          <View style={styles.emptyApps}>
            <Text style={styles.emptyAppsTitle}>No apps selected</Text>
            <Text style={styles.emptyAppsCopy}>Set this up anytime without interrupting training.</Text>
          </View>
        )}
      </Card>

      <Pressable accessibilityRole="button" accessibilityLabel={`Edit lock time, currently ${lockTime}`} onPress={openSchedule}>
        <Card style={styles.lockTimeCard}>
          <View style={styles.lockTimeIcon}><Icon name="clock" color={colors.secondary} size={26} /></View>
          <View style={styles.lockTimeCopy}>
            <Eyebrow>Lock Time</Eyebrow>
            <Text style={styles.lockTimeValue}>{lockTime} — 6:00 AM</Text>
            <Text style={styles.lockTimeSupport}>EVERY DAY</Text>
          </View>
          <Icon name="chevron.right" color={colors.secondary} size={16} />
        </Card>
      </Pressable>

      {selectedAppCount ? (
        <Card style={styles.unlockHero}>
          <Image source={require('../../assets/icons/lock-ring.png')} style={styles.unlockRingAsset} resizeMode="contain" />
          <View style={styles.unlockCopy}>
            <Text style={styles.unlockKicker}>APPS UNLOCK AFTER</Text>
            <Text style={styles.unlockTitle}>
              {completed ? 'TODAY’S ROUTINE' : graceActive ? 'GRACE MODE ENDS' : skipped ? 'TOMORROW' : 'TONIGHT’S ROUTINE'}
            </Text>
            <Text style={styles.unlockSupport}>
              {graceActive ? `${Math.floor(graceSeconds / 60)}:${String(graceSeconds % 60).padStart(2, '0')} remaining` : appsAvailable ? 'Accountability cleared.' : 'Stay locked. Stay focused.'}
            </Text>
          </View>
        </Card>
      ) : null}

      {!completed && !skipped && selectedAppCount ? (
        <>
          <SectionTitle title="Need a Break?" />
          <View style={styles.breakActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={graceRemaining ? 'Use five-minute Grace' : 'No Grace extensions remaining'}
              accessibilityState={{ disabled: graceRemaining === 0 || graceActive }}
              disabled={graceRemaining === 0 || graceActive}
              style={[styles.breakCard, (graceRemaining === 0 || graceActive) && styles.breakCardDisabled]}
              onPress={requestGrace}
            >
              <Image source={require('../../assets/icons/grace-hourglass.png')} style={styles.breakAsset} resizeMode="contain" />
              <View>
                <Text style={styles.breakValue}>GRACE MODE</Text>
                <Text style={styles.breakAction}>{graceRemaining ? `${graceRemaining} LEFT` : 'NONE LEFT'}</Text>
              </View>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Skip today" style={styles.breakCard} onPress={requestSkip}>
              <Image source={require('../../assets/icons/skip-today.png')} style={styles.breakAsset} resizeMode="contain" />
              <View>
                <Text style={styles.breakValue}>SKIP TODAY</Text>
                <Text style={styles.breakSupport}>ONCE PER DAY</Text>
              </View>
            </Pressable>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function BottomNavigation({ selected, onSelect }: { selected: MainTab; onSelect: (tab: MainTab) => void }) {
  const tabs: { id: MainTab; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
    { id: 'home', label: 'HOME', icon: selected === 'home' ? 'house.fill' : 'house' },
    { id: 'train', label: 'TRAIN', icon: 'dumbbell' },
    { id: 'locks', label: 'LOCKS', icon: selected === 'locks' ? 'lock.fill' : 'lock' },
  ];
  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = selected === tab.id;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => onSelect(tab.id)}
            style={styles.navItem}
          >
            <Icon name={tab.icon} color={active ? colors.accent : colors.secondary} size={21} weight={active ? 'semibold' : 'regular'} />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SetSegments({
  currentSet,
  progress,
  completeCurrent = false,
}: {
  currentSet: number;
  progress?: SharedValue<number>;
  completeCurrent?: boolean;
}) {
  const completeCount = Math.min(DAILY_SET_COUNT, Math.max(0, currentSet - 1));
  return (
    <View style={styles.setSegments} accessibilityLabel={`${completeCount} of 5 sets complete`}>
      {Array.from({ length: DAILY_SET_COUNT }, (_, index) => {
        const segmentNumber = index + 1;
        return (
          <View key={segmentNumber} style={styles.setSegment}>
            <SetSegmentFill
              complete={segmentNumber < currentSet}
              current={segmentNumber === currentSet && !completeCurrent}
              completeCurrent={segmentNumber === currentSet && completeCurrent}
              progress={progress}
            />
          </View>
        );
      })}
    </View>
  );
}

function SetSegmentFill({
  complete,
  current,
  completeCurrent,
  progress,
}: {
  complete: boolean;
  current: boolean;
  completeCurrent: boolean;
  progress?: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: complete || completeCurrent ? 1 : current && progress ? progress.value : 0 }],
  }));
  return <Animated.View style={[styles.setSegmentFill, animatedStyle]} />;
}

function LiquidProgressBar({ progress, complete = false }: { progress: SharedValue<number>; complete?: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: complete ? 1 : progress.value }] }));
  return (
    <View style={styles.repTrack}>
      <Animated.View style={[styles.repFill, animatedStyle]} />
    </View>
  );
}

function RestCountdownRing({
  size,
  seconds,
  progress,
}: {
  size: number;
  seconds: number;
  progress: SharedValue<number>;
}) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.restReadout, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.borderStrong}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={[circumference, circumference]}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={styles.restCountdown}>0:{String(seconds).padStart(2, '0')}</Text>
      <Eyebrow>Rest</Eyebrow>
    </View>
  );
}

function MutedLoopingCoachVideo({
  source,
  fallback,
  visible,
}: {
  source: number;
  fallback: number;
  visible: boolean;
}) {
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.volume = 0;
    // Keep other audio playing normally; this session never claims the audio route.
    videoPlayer.audioMixingMode = 'auto';
    videoPlayer.showNowPlayingNotification = false;
    videoPlayer.staysActiveInBackground = false;
    videoPlayer.play();
  });

  useEffect(() => {
    if (visible) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, visible]);

  return (
    <View style={styles.sessionCoachMedia}>
      <VideoView
        player={player}
        nativeControls={false}
        allowsPictureInPicture={false}
        contentFit="contain"
        onFirstFrameRender={() => setHasFirstFrame(true)}
        style={styles.sessionCoach}
      />
      {!hasFirstFrame ? <Image source={fallback} style={styles.sessionCoachFallback} resizeMode="contain" /> : null}
    </View>
  );
}

function CoachStage({ movement, visible }: { movement: Movement; visible: boolean }) {
  const opacity = useSharedValue(visible ? 1 : 0);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.set(withTiming(visible ? 1 : 0, {
      duration: visible ? 360 : 260,
      easing: Easing.out(Easing.cubic),
    }));
  }, [opacity, visible]);

  return (
    <Animated.View pointerEvents="none" style={[styles.sessionCoachStage, animatedStyle]}>
      {movement.coachVideo ? (
        <MutedLoopingCoachVideo source={movement.coachVideo} fallback={movement.coachImage} visible={visible} />
      ) : (
        <Image source={movement.coachImage} style={styles.sessionCoach} resizeMode="contain" />
      )}
    </Animated.View>
  );
}

function StaticCoachStage({ movement }: { movement: Movement }) {
  return (
    <View pointerEvents="none" style={styles.sessionCoachStage}>
      <Image source={movement.coachImage} style={styles.sessionCoach} resizeMode="contain" />
    </View>
  );
}

function RestWindIcon() {
  return (
    <Svg width={34} height={30} viewBox="0 0 64 56" accessibilityLabel="Rest breathing cue">
      <Path d="M18 13 H36 C44 13 48 9 48 5 C48 1 45 0 42 0 C38 0 35 2 35 5" fill="none" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" />
      <Path d="M4 27 H47 C55 27 60 23 60 17 C60 12 56 9 52 9 C48 9 45 11 45 15" fill="none" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" />
      <Path d="M18 41 H33 C39 41 43 45 43 49 C43 53 40 56 36 56 C32 56 29 54 29 51" fill="none" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
}

function PauseOverlay({
  dismissing,
  onResume,
  onEnd,
}: {
  dismissing: boolean;
  onResume: () => void;
  onEnd: () => void;
}) {
  const progress = useSharedValue(0);
  const overlayStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 14 }, { scale: 0.97 + progress.value * 0.03 }],
  }));

  useEffect(() => {
    progress.set(withTiming(dismissing ? 0 : 1, {
      duration: dismissing ? 200 : 260,
      easing: Easing.out(Easing.cubic),
    }));
  }, [dismissing, progress]);

  return (
    <Animated.View style={[styles.pauseOverlay, overlayStyle]}>
      <GlassView pointerEvents="none" glassEffectStyle="regular" tintColor="rgba(8, 9, 11, 0.72)" colorScheme="dark" style={styles.pauseBackdrop} />
      <Animated.View style={sheetStyle}>
        <GlassView glassEffectStyle="regular" tintColor="rgba(23, 24, 27, 0.88)" colorScheme="dark" style={styles.pauseSheet}>
          <View style={styles.pauseGlyph}><Icon name="pause.fill" color={colors.accent} size={26} weight="medium" /></View>
          <Text style={styles.pauseTitle}>Stay with it</Text>
          <Text style={styles.pauseSupport}>Every rep builds control{`\n`}and confidence.</Text>
        <View style={styles.pauseActions}>
          <PrimaryButton label="Resume" onPress={onResume} />
            <TextButton label="End Workout" onPress={onEnd} color={colors.secondary} />
        </View>
        </GlassView>
      </Animated.View>
    </Animated.View>
  );
}

function CompletionCelebrationVideo({ transition = false }: { transition?: boolean }) {
  const player = useVideoPlayer(completionCelebrationVideo, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.volume = 0;
    videoPlayer.audioMixingMode = 'auto';
    videoPlayer.showNowPlayingNotification = false;
    videoPlayer.staysActiveInBackground = false;
    videoPlayer.play();
  });

  return (
    <View style={[styles.completionVideoStage, transition && styles.completionVideoStageTransition]}>
      <VideoView
        player={player}
        nativeControls={false}
        allowsPictureInPicture={false}
        contentFit="contain"
        style={styles.completionVideo}
      />
    </View>
  );
}

function CompletionTransitionScreen() {
  return (
    <Screen testID="session-finishing">
      <Animated.View entering={FadeIn.duration(240).easing(Easing.out(Easing.cubic))} style={styles.completionTransitionScreen}>
        <Animated.View entering={FadeInDown.duration(340).delay(80).easing(Easing.out(Easing.cubic))} style={styles.completionTransitionHeader}>
          <Eyebrow accent>Routine complete</Eyebrow>
          <Text style={styles.completionTransitionTitle}>Well done.</Text>
        </Animated.View>
        <Animated.View entering={FadeIn.duration(420).delay(120).easing(Easing.out(Easing.cubic))}>
          <CompletionCelebrationVideo transition />
        </Animated.View>
      </Animated.View>
    </Screen>
  );
}

function SessionScreen({
  phase,
  pausedPhase,
  setNumber,
  reps,
  restSeconds,
  countdown,
  movement,
  repProgress,
  restProgress,
  pauseDismissing,
  setCompleting,
  onPause,
  onResume,
  onEnd,
  onContinue,
}: {
  phase: SessionPhase;
  pausedPhase: 'active' | 'rest';
  setNumber: number;
  reps: number;
  restSeconds: number;
  countdown: number;
  movement: Movement;
  repProgress: SharedValue<number>;
  restProgress: SharedValue<number>;
  pauseDismissing: boolean;
  setCompleting: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onContinue: () => void;
}) {
  const displayPhase = phase === 'paused' ? pausedPhase : phase;
  const isRest = displayPhase === 'rest';
  const isCountdown = phase === 'countdown';
  if (phase === 'finishing') {
    return <CompletionTransitionScreen />;
  }
  if (phase === 'complete') {
    return (
      <Screen testID="routine-complete">
        <Animated.View entering={FadeIn.duration(360).easing(Easing.out(Easing.cubic))} style={styles.completeScreen}>
          <Animated.View entering={FadeInDown.duration(360).delay(70).easing(Easing.out(Easing.cubic))} style={styles.completeHeader}>
            <Eyebrow>Today&apos;s Training</Eyebrow>
            <Title>Completed today.</Title>
            <Body muted>You showed up.</Body>
          </Animated.View>
          <Animated.View entering={FadeIn.duration(420).delay(110).easing(Easing.out(Easing.cubic))}>
            <CompletionCelebrationVideo />
          </Animated.View>
          <Animated.Text entering={FadeInDown.duration(280).delay(150)} style={styles.completeSets}>5 OF 5 SETS COMPLETE</Animated.Text>
          <SetSegments currentSet={DAILY_SET_COUNT + 1} />
          <Card style={styles.outcomeCard}>
            <Image source={require('../../assets/icons/apps-unlocked.png')} style={styles.sessionUnlockAsset} resizeMode="contain" />
            <View style={styles.outcomeCopy}>
              <Text style={styles.outcomeTitle}>CLEAR FOR TODAY</Text>
              <Text style={styles.outcomeSupport}>Your routine is complete.</Text>
            </View>
          </Card>
          <PrimaryButton label="Continue" onPress={onContinue} />
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen testID={`session-${phase}`}>
      <View style={styles.sessionHeader}>
        <Eyebrow>{movement.displayName}</Eyebrow>
        <Text style={[styles.sessionSet, isRest && styles.sessionRestTitle]}>{isRest ? 'REST' : `SET ${setNumber} OF ${DAILY_SET_COUNT}`}</Text>
        {isRest ? <Text style={styles.sessionSupport}>SET {setNumber} COMPLETE · SET {setNumber + 1} NEXT</Text> : null}
      </View>
      <Animated.View
        key={isRest ? 'rest' : isCountdown ? 'countdown' : 'active'}
        entering={FadeIn.duration(280).easing(Easing.out(Easing.cubic))}
        exiting={FadeOut.duration(180).easing(Easing.in(Easing.cubic))}
        style={[styles.sessionPhaseContent, isRest && styles.sessionPhaseContentRest]}
      >
        {!isRest ? (
          <View style={styles.sessionMediaArea}>
            {isCountdown ? <StaticCoachStage movement={movement} /> : <CoachStage movement={movement} visible />}
          </View>
        ) : null}
        <SetSegments
          currentSet={isRest ? setNumber + 1 : setNumber}
          progress={isRest ? undefined : repProgress}
          completeCurrent={isCountdown || isRest}
        />
        {isCountdown ? (
          <View style={styles.countdownBlock}>
            <Eyebrow>Get Ready</Eyebrow>
            <Text style={styles.countdownValue}>{countdown || 'GO'}</Text>
            <Text style={styles.sessionInstruction}>Follow the coach. Control every repetition.</Text>
          </View>
        ) : isRest ? (
          <View style={styles.restContent}>
            <Animated.View entering={FadeInDown.duration(320).easing(Easing.out(Easing.cubic))} style={styles.restPrimaryArea}>
              <RestCountdownRing size={214} seconds={restSeconds} progress={restProgress} />
              <View style={styles.restCompletionReadout}>
                <Text style={styles.restRepValue}>{movement.repsPerSet} / {movement.repsPerSet}</Text>
                <Eyebrow>Set reps</Eyebrow>
                <View style={styles.restCompletionLine} />
              </View>
            </Animated.View>
            <Animated.View entering={FadeIn.duration(280).delay(80)} style={styles.restCue}>
              <RestWindIcon />
              <Text style={styles.restCueText}>BREATHE. RESET. THE NEXT SET IS READY.</Text>
            </Animated.View>
          </View>
        ) : (
            <Animated.View entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))} style={styles.sessionReadout}>
              <View style={styles.sessionMetricsCard}>
              <View style={styles.repReadout}>
                <Text style={styles.repValue}>{reps} / {movement.repsPerSet}</Text>
                <Eyebrow>Guided reps</Eyebrow>
                <LiquidProgressBar progress={repProgress} />
              </View>
              <View style={styles.sessionInstructionRow}>
                <Image source={require('../../assets/icons/train-lightning.png')} style={styles.sessionLightningIcon} resizeMode="contain" />
                <Text style={styles.sessionInstructionRowText}>{movement.instruction.toUpperCase()}</Text>
              </View>
              </View>
            </Animated.View>
        )}
      </Animated.View>
      {(phase === 'active' && !setCompleting) || phase === 'rest' ? <View style={styles.pauseControl}><SecondaryButton label="Pause" onPress={onPause} icon="pause" /></View> : null}
      {phase === 'paused' ? (
        <PauseOverlay dismissing={pauseDismissing} onResume={onResume} onEnd={onEnd} />
      ) : null}
    </Screen>
  );
}

export function ProfileScreen({
  nickname,
  progress,
  onBack,
  openHistory,
  openMilestones,
  openSettings,
  openAccount,
  openMembership,
}: {
  nickname: string;
  progress: ProgressSummary;
  onBack: () => void;
  openHistory: () => void;
  openMilestones: () => void;
  openSettings: () => void;
  openAccount: () => void;
  openMembership: () => void;
}) {
  return (
    <Screen scroll>
      <TopBar title="Profile" onBack={onBack} />
      <View style={styles.profileHero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(nickname || 'E').slice(0, 1).toUpperCase()}</Text></View>
        <Title compact>{nickname || 'Edward'}</Title>
        <Text style={styles.memberStatus}>VAEL MEMBER</Text>
      </View>
      <Card style={styles.profileMetricsCard}>
        <View style={styles.metricRow}>
          <Metric value={progress.sessions} label="Sessions" />
          <View style={styles.metricDivider} />
          <Metric value={progress.cycles} label="Cycles" />
          <View style={styles.metricDivider} />
          <Metric value={progress.longestMomentum} label="Longest streak" />
        </View>
      </Card>
      <View style={styles.menuGroup}>
        <MenuRow icon="chart.bar" label="History & Progress" onPress={openHistory} />
        <MenuRow icon="medal" label="Milestones" onPress={openMilestones} />
        <MenuRow icon="person.crop.circle" label="Profile & Account" onPress={openAccount} />
        <MenuRow icon="creditcard" label="Membership" onPress={openMembership} />
        <MenuRow icon="gearshape" label="Settings" onPress={openSettings} />
      </View>
    </Screen>
  );
}

export function HistoryScreen({ progress, movement, onBack }: { progress: ProgressSummary; movement: Movement; onBack: () => void }) {
  const recent = [...progress.completedDates].sort().reverse().slice(0, 8);
  const weeks = lastEightWeeks(progress.completedDates);
  return (
    <Screen scroll>
      <TopBar title="History & Progress" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Your Work</Eyebrow><Title compact>Progress, without noise.</Title></View>
      <Card style={styles.historyCalendar}>
        <Eyebrow>Last 8 Weeks</Eyebrow>
        <View style={styles.historyWeekdays}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.historyWeekday}>{day}</Text>)}</View>
        <View style={styles.historyWeekList}>
          {weeks.map((week, index) => (
            <View key={week.label} style={styles.historyWeekRow}>
              <View style={styles.historyWeekLabel}><Text style={styles.historyWeekNumber}>W{8 - index}</Text><Text style={styles.historyWeekDates}>{week.label}</Text></View>
              <View style={styles.historyDots}>{week.days.map((done, dayIndex) => <View key={dayIndex} style={[styles.historyDot, done && styles.historyDotDone]}>{done ? <Icon name="checkmark" color={colors.accentInk} size={10} weight="bold" /> : null}</View>)}</View>
            </View>
          ))}
        </View>
      </Card>
      <SectionTitle title="Recent Sessions" />
      <Card>
        {recent.length ? recent.map((dateKey, index) => (
          <View key={dateKey}>
            <View style={styles.historyRow}>
              <View style={styles.historyCheck}><Icon name="checkmark" color={colors.accentInk} size={12} weight="bold" /></View>
              <View style={styles.historyCopy}><Text style={styles.historyTitle}>{movement.displayName}</Text><Text style={styles.historyDate}>{formatHistoryDate(dateKey)} · 5 × {movement.repsPerSet}</Text></View>
            </View>
            {index < recent.length - 1 ? <Divider /> : null}
          </View>
        )) : <View style={styles.emptyHistory}><Icon name="calendar.badge.clock" color={colors.tertiary} size={26} /><Text style={styles.emptyAppsTitle}>No sessions yet</Text><Text style={styles.emptyAppsCopy}>Your completed routines will appear here.</Text></View>}
      </Card>
    </Screen>
  );
}

export function MilestonesScreen({ progress, onBack }: { progress: ProgressSummary; onBack: () => void }) {
  const milestones = [
    { icon: 'flame' as const, title: 'First Session', target: 1, type: 'sessions' as const },
    { icon: 'repeat' as const, title: 'First Cycle', target: 1, type: 'cycles' as const },
    { icon: 'chart.bar' as const, title: '25 Sessions', target: 25, type: 'sessions' as const },
    { icon: 'repeat' as const, title: '5 Cycles', target: 5, type: 'cycles' as const },
    { icon: 'repeat' as const, title: '10 Cycles', target: 10, type: 'cycles' as const },
    { icon: 'chart.bar' as const, title: '50 Sessions', target: 50, type: 'sessions' as const },
    { icon: 'chart.bar' as const, title: '100 Sessions', target: 100, type: 'sessions' as const },
    { icon: 'repeat' as const, title: '25 Cycles', target: 25, type: 'cycles' as const },
    { icon: 'repeat' as const, title: '50 Cycles', target: 50, type: 'cycles' as const },
    { icon: 'flame' as const, title: '7-Day Streak', target: 7, type: 'streak' as const },
    { icon: 'flame' as const, title: '30-Day Streak', target: 30, type: 'streak' as const },
    { icon: 'medal' as const, title: 'Quiet Consistency', target: 365, type: 'sessions' as const },
  ];
  const next = milestones.find((milestone) => milestoneValue(progress, milestone.type) < milestone.target) ?? milestones[milestones.length - 1];
  const nextValue = milestoneValue(progress, next.type);
  return (
    <Screen scroll>
      <TopBar title="Milestones" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Earned Quietly</Eyebrow><Title compact>Built by showing up.</Title><Body muted>{milestones.filter((milestone) => milestoneValue(progress, milestone.type) >= milestone.target).length} of {milestones.length} earned</Body></View>
      <Card style={styles.nextMilestoneCard}>
        <Eyebrow accent>Next milestone</Eyebrow>
        <View style={styles.nextMilestoneMain}><View style={styles.nextMilestoneIcon}><Icon name={next.icon} color={colors.accent} size={28} /></View><View style={styles.nextMilestoneCopy}><Text style={styles.nextMilestoneTitle}>{next.title}</Text><Text style={styles.nextMilestoneSupport}>{nextValue} / {next.target} completed</Text></View></View>
        <View style={styles.milestoneProgressTrack}><View style={[styles.milestoneProgressFill, { width: `${Math.min(100, (nextValue / next.target) * 100)}%` }]} /></View>
      </Card>
      <View style={styles.milestoneGrid}>
        {milestones.map((milestone) => <Milestone key={milestone.title} icon={milestone.icon} title={milestone.title} support={`${milestoneValue(progress, milestone.type)} / ${milestone.target} completed`} earned={milestoneValue(progress, milestone.type) >= milestone.target} />)}
      </View>
    </Screen>
  );
}

export function SettingsScreen({
  onBack,
  openNotifications,
  openInformation,
  openIntroduction,
  onRestartOnboarding,
}: {
  onBack: () => void;
  openNotifications: () => void;
  openInformation: (page: 'help' | 'privacy' | 'terms' | 'about') => void;
  openIntroduction: () => void;
  onRestartOnboarding?: () => void;
}) {
  return (
    <Screen scroll>
      <TopBar title="Settings" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Preferences</Eyebrow><Title compact>Keep it intentional.</Title></View>
      <View style={styles.menuGroup}>
        <MenuRow icon="bell" label="Notifications" onPress={openNotifications} />
      </View>
      <SectionTitle title="Experience" />
      <Card>
        <SettingToggle icon="speaker.wave.2" title="Coach Voice" support="Voice guidance during training" initial />
        <Divider />
        <SettingToggle icon="music.note" title="Training Music" support="Background audio during sessions" />
        <Divider />
        <SettingToggle icon="iphone.radiowaves.left.and.right" title="Haptics" support="Guided set cues" initial />
      </Card>
      <SectionTitle title="Support & Legal" />
      <Card style={styles.compactListCard}>
        <MenuRow compact icon="headphones" label="Help & Support" onPress={() => openInformation('help')} />
        <Divider /><MenuRow compact icon="hand.raised" label="Privacy Policy" onPress={() => openInformation('privacy')} />
        <Divider /><MenuRow compact icon="doc.text" label="Terms of Use" onPress={() => openInformation('terms')} />
        <Divider /><MenuRow compact icon="info.circle" label="About VAEL" onPress={() => openInformation('about')} />
      </Card>
      <SectionTitle title="App" />
      <Card style={styles.compactListCard}>
        <MenuRow compact icon="play.circle" label="Replay Introduction" onPress={openIntroduction} />
        {onRestartOnboarding ? <><Divider /><MenuRow compact icon="arrow.counterclockwise" label="Restart Onboarding (Testing)" onPress={onRestartOnboarding} /></> : null}
      </Card>
    </Screen>
  );
}

export type InformationPage = 'help' | 'privacy' | 'terms' | 'about';

export function InformationScreen({ page, onBack }: { page: InformationPage; onBack: () => void }) {
  const content: Record<InformationPage, { title: string; eyebrow: string; intro: string; sections: { title: string; body: string }[] }> = {
    help: {
      title: 'Help & Support',
      eyebrow: 'HOW VAEL WORKS',
      intro: 'A short guide to the experience you are using today.',
      sections: [
        { title: 'Today’s movement', body: 'Reveal your movement from Home, then begin when you are ready. A revealed movement stays available until it is completed or skipped.' },
        { title: 'Guided training', body: 'Each routine uses five guided sets. You can pause safely and resume without losing the current set.' },
        { title: 'Accountability', body: 'If you connect Screen Time and select apps, the lock rules you set are managed by iOS. Grace and Skip are always shown clearly before they change today’s state.' },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      eyebrow: 'YOUR DATA',
      intro: 'VAEL is designed to keep the experience private and intentional.',
      sections: [
        { title: 'Local progress', body: 'In this preview build, your nickname, routine history, daily state, and preferences are stored locally on this device.' },
        { title: 'Screen Time', body: 'If you choose to use accountability controls, iOS manages the selected-app authorization. VAEL does not display or expose the opaque app-selection tokens.' },
        { title: 'Camera and health data', body: 'The current MVP does not use the camera for training and does not connect to HealthKit.' },
        { title: 'Preview notice', body: 'This in-app summary is for the current preview build. A final public privacy policy and support contact are required before App Store release.' },
      ],
    },
    terms: {
      title: 'Terms of Use',
      eyebrow: 'PRODUCT PREVIEW',
      intro: 'Use VAEL as a private training and accountability tool.',
      sections: [
        { title: 'Your choice', body: 'You choose whether to train, connect Screen Time, select apps, or use the available daily recovery actions.' },
        { title: 'Subscriptions', body: 'Membership pricing and trial information are displayed before purchase. This preview build does not process live purchases or account authentication.' },
        { title: 'Wellness boundary', body: 'VAEL is a general fitness and consistency experience. It does not provide medical diagnosis, treatment, or guaranteed performance outcomes.' },
        { title: 'Preview notice', body: 'These are product-preview terms. Final public Terms of Use or an App Store EULA must be published before release.' },
      ],
    },
    about: {
      title: 'About VAEL',
      eyebrow: 'PRIVATE · DISCIPLINED · INTENTIONAL',
      intro: 'VAEL is a calm daily practice built around consistency, control, and a clear record of progress.',
      sections: [
        { title: 'One clear commitment', body: 'One movement each day. Five guided sets. A practical rhythm you can return to.' },
        { title: 'Accountability by choice', body: 'Screen Time controls can connect your daily commitment to the apps you choose, while keeping the choice in your hands.' },
        { title: 'Built quietly', body: 'Progress is recorded without feeds, public scores, or unnecessary noise.' },
      ],
    },
  };
  const current = content[page];
  return (
    <Screen scroll>
      <TopBar title={current.title} onBack={onBack} />
      <View style={styles.infoHeader}><Eyebrow accent>{current.eyebrow}</Eyebrow><Title compact>{current.title}</Title><Body muted>{current.intro}</Body></View>
      <View style={styles.infoSections}>
        {current.sections.map((section) => <Card key={section.title} style={styles.infoCard}><Text style={styles.infoCardTitle}>{section.title}</Text><Text style={styles.infoCardBody}>{section.body}</Text></Card>)}
      </View>
    </Screen>
  );
}

export function IntroductionReplayScreen({ onBack }: { onBack: () => void }) {
  const [page, setPage] = useState(0);
  const slides = [
    { eyebrow: 'VAEL', title: 'Train what most men ignore.', body: 'Short, private training built for consistency, control, and a stronger daily rhythm.', icon: 'figure.flexibility' as const },
    { eyebrow: 'THE DAILY FORMAT', title: 'One movement. Five guided sets.', body: 'VAEL sets the pace. You stay present, complete the work, and keep moving forward.', icon: 'square.stack.3d.up' as const },
    { eyebrow: 'ACCOUNTABILITY', title: 'Make the commitment clear.', body: 'When you choose Screen Time controls, selected apps can wait until you have shown up for today.', icon: 'checkmark.shield' as const },
  ];
  const current = slides[page];
  return (
    <Screen>
      <TopBar title="Introduction" onBack={onBack} />
      <Animated.View key={page} entering={FadeInRight.duration(240)} exiting={FadeOutLeft.duration(180)} style={styles.introductionContent}>
        <View style={styles.introductionIcon}><Icon name={current.icon} color={colors.accent} size={48} /></View>
        <Eyebrow accent>{current.eyebrow}</Eyebrow>
        <Title>{current.title}</Title>
        <Body muted>{current.body}</Body>
        <View style={styles.introductionProgress}>{slides.map((_, index) => <View key={index} style={[styles.introductionProgressSegment, index <= page && styles.introductionProgressSegmentActive]} />)}</View>
      </Animated.View>
      <View style={styles.introductionActions}>
        <PrimaryButton label={page === slides.length - 1 ? 'Done' : 'Continue'} onPress={() => page === slides.length - 1 ? onBack() : setPage((currentPage) => currentPage + 1)} />
        {page > 0 ? <TextButton label="Back" onPress={() => setPage((currentPage) => currentPage - 1)} /> : null}
      </View>
    </Screen>
  );
}

export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen scroll>
      <TopBar title="Notifications" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Stay On Track</Eyebrow><Title compact>Only the reminders that matter.</Title></View>
      <Card>
        <SettingToggle icon="sun.max" title="Daily Reveal" support="When today’s movement is ready" initial />
        <Divider />
        <SettingToggle icon="clock.badge.exclamationmark" title="Before Lock Time" support="A quiet reminder 30 minutes before" initial />
        <Divider />
        <SettingToggle icon="medal" title="Milestones" support="When a meaningful marker is reached" />
      </Card>
    </Screen>
  );
}

function LockPreferencesScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen scroll>
      <TopBar title="Lock Preferences" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Accountability</Eyebrow><Title compact>Firm, never noisy.</Title></View>
      <Card>
        <SettingToggle icon="lock.shield" title="Daily Accountability" support="Tie selected apps to completion" initial />
        <Divider />
        <SettingToggle icon="hourglass" title="Grace Availability" support="Three 5-minute uses per day" initial />
      </Card>
      <Text style={styles.settingsFootnote}>Changes to active lock rules take effect tomorrow.</Text>
    </Screen>
  );
}

function ManageAppsScreen({
  count,
  authorizationStatus,
  busy,
  message,
  selectionRequiresReview,
  onBack,
  onChooseApps,
  onOpenSettings,
  onRefresh,
}: {
  count: number;
  authorizationStatus: FamilyControlsAuthorizationDisplayStatus;
  busy: boolean;
  message: string | null;
  selectionRequiresReview: boolean;
  onBack: () => void;
  onChooseApps: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
}) {
  const authorized = authorizationStatus === 'approved' || authorizationStatus === 'approvedWithDataAccess';
  const checking = authorizationStatus === 'checking';
  const canRequestAuthorization = authorizationStatus === 'notDetermined';
  const needsRecovery = !checking && !authorized && !canRequestAuthorization;

  return (
    <Screen>
      <TopBar title="Manage Apps" onBack={onBack} />
      {needsRecovery ? (
        <>
          <View style={styles.pageHeader}>
            <Eyebrow accent>Screen Time Access Is Off</Eyebrow>
            <Title compact>Reconnect accountability.</Title>
            <Body muted>VAEL needs Screen Time access to manage the apps tied to your daily commitment. Training remains available.</Body>
          </View>
          <Card style={styles.screenTimeRecoveryCard}>
            <View style={styles.appsIcon}><Icon name="lock.slash" color={colors.accent} size={34} /></View>
            <Text style={styles.screenTimeRecoveryTitle}>Enable access in Settings</Text>
            <Text style={styles.screenTimeRecoveryCopy}>Open VAEL’s app settings, restore Screen Time access, then return here. iOS may ask you to choose apps again.</Text>
          </Card>
          {message ? <Text style={styles.familyControlsMessage}>{message}</Text> : null}
          <View style={styles.pageBottom}>
            <PrimaryButton label="Enable Screen Time Access" onPress={onOpenSettings} />
            <TextButton label="Check Again" onPress={onRefresh} />
          </View>
        </>
      ) : (
        <>
          <View style={styles.pageHeader}>
            <Eyebrow>Selected Apps</Eyebrow>
            <Title compact>{canRequestAuthorization ? 'Connect Screen Time.' : selectionRequiresReview ? 'Choose apps again.' : 'Choose what should wait.'}</Title>
            <Body muted>{canRequestAuthorization ? 'Enable Apple’s Screen Time access, then choose the apps tied to your daily commitment.' : selectionRequiresReview ? 'Screen Time access is back. Re-select apps so VAEL can rebuild a valid accountability setup.' : 'These apps are tied to your daily commitment.'}</Body>
          </View>
          <Card style={styles.manageAppsCard}>
            <View style={styles.appsIcon}><Icon name="app.dashed" color={colors.accent} size={34} /></View>
            <Text style={styles.appsCount}>{checking ? '…' : count || 'No'}</Text>
            <Text style={styles.appsLabel}>{selectionRequiresReview ? 'selection needs review' : count === 1 ? 'app selected' : 'apps selected'}</Text>
          </Card>
          {message ? <Text style={styles.familyControlsMessage}>{message}</Text> : null}
          <View style={styles.pageBottom}><PrimaryButton label={busy ? 'Checking…' : canRequestAuthorization ? 'Enable Screen Time Access' : selectionRequiresReview ? 'Choose Apps Again' : 'Choose Apps'} onPress={onChooseApps} disabled={busy || checking} /></View>
        </>
      )}
    </Screen>
  );
}

function LockScheduleScreen({ lockTime, onBack, onSave }: { lockTime: string; onBack: () => void; onSave: (value: string) => void }) {
  const [selectedTime, setSelectedTime] = useState(lockTime);
  return (
    <Screen>
      <TopBar title="Lock Schedule" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Daily Deadline</Eyebrow><Title compact>Done by {selectedTime}.</Title><Body muted>This commitment repeats every day. Changes take effect tomorrow.</Body></View>
      <Card style={styles.scheduleCard}>
        <Icon name="clock" color={colors.accent} size={32} />
        <DateTimePicker
          value={dateFromLockTime(selectedTime)}
          mode="time"
          display="spinner"
          themeVariant="dark"
          accentColor={colors.accent}
          style={styles.schedulePicker}
          onValueChange={(_, date) => setSelectedTime(formatLockTime(date))}
          testID="lock-schedule-wheel"
        />
        <Text style={styles.scheduleTime}>{selectedTime}</Text>
        <Text style={styles.scheduleSupport}>Unlock window ends at 6:00 AM</Text>
      </Card>
      <View style={styles.pageBottom}><PrimaryButton label="Save Schedule" onPress={() => onSave(selectedTime)} /></View>
    </Screen>
  );
}

function ConfirmationSheet({ type, graceRemaining, onCancel, onConfirm }: { type: 'grace' | 'skip'; graceRemaining: number; onCancel: () => void; onConfirm: () => void }) {
  const grace = type === 'grace';
  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.confirmationOverlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss confirmation" style={StyleSheet.absoluteFill} onPress={onCancel} />
      <Animated.View entering={FadeInRight.duration(260)} style={styles.confirmationSheet}>
        <Eyebrow>{grace ? 'Grace Mode' : 'Skip Today'}</Eyebrow>
        <Title compact>{grace ? 'Use 5-Minute Grace?' : 'Skip today?'}</Title>
        <Body muted>{grace ? `Apps will be available for 5 minutes.\n${graceRemaining} Grace ${graceRemaining === 1 ? 'extension' : 'extensions'} remain today.` : 'This ends today’s training, resets current momentum, and can’t be undone. Your movement stays in the cycle.'}</Body>
        <View style={styles.confirmationActions}>
          {grace ? (
            <PrimaryButton label="Use 5-Minute Grace" onPress={onConfirm} />
          ) : (
            <HoldToConfirmButton onConfirm={onConfirm} />
          )}
          <SecondaryButton label={grace ? 'Not Now' : 'Keep Today'} onPress={onCancel} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function HoldToConfirmButton({ onConfirm }: { onConfirm: () => void }) {
  const progress = useSharedValue(0);
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  const complete = () => {
    Vibration.vibrate(12);
    onConfirm();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Hold for two seconds to confirm skipping today"
      onPressIn={() => {
        cancelAnimation(progress);
        progress.set(withTiming(1, { duration: 2000 }, (finished) => {
          if (finished) runOnJS(complete)();
        }));
      }}
      onPressOut={() => {
        cancelAnimation(progress);
        progress.set(withSpring(0, { damping: 18, stiffness: 180 }));
      }}
      style={styles.holdButton}
    >
      <Animated.View style={[styles.holdButtonFill, fillStyle]} />
      <Text style={styles.holdButtonText}>HOLD TO CONFIRM</Text>
    </Pressable>
  );
}

function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionTitle}>
      <Eyebrow>{title}</Eyebrow>
      {action && onPress ? <TextButton label={action} onPress={onPress} color={colors.accent} /> : null}
    </View>
  );
}

function MenuRow({ icon, label, onPress, compact = false }: { icon: Parameters<typeof Icon>[0]['name']; label: string; onPress: () => void; compact?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, compact && styles.menuRowCompact, pressed && styles.menuRowPressed]}
    >
      <View style={styles.menuIcon}><Icon name={icon} color={colors.secondary} size={20} /></View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name="chevron.right" color={colors.tertiary} size={15} />
    </Pressable>
  );
}

function Milestone({ icon, title, support, earned = false }: { icon: Parameters<typeof Icon>[0]['name']; title: string; support: string; earned?: boolean }) {
  return (
    <Card style={[styles.milestone, earned ? styles.milestoneEarned : {}]}>
      <View style={[styles.milestoneIcon, earned && styles.milestoneIconEarned]}><Icon name={icon} color={earned ? colors.accent : colors.tertiary} size={26} /></View>
      <Text style={styles.milestoneTitle}>{title}</Text>
      <Text style={styles.milestoneSupport}>{support}</Text>
    </Card>
  );
}

function SettingToggle({ icon, title, support, initial = false }: { icon: Parameters<typeof Icon>[0]['name']; title: string; support: string; initial?: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  return (
    <View style={styles.settingRow}>
      <Icon name={icon} color={colors.secondary} size={21} />
      <View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingSupport}>{support}</Text></View>
      <Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: colors.borderStrong, true: colors.accent }} thumbColor={enabled ? colors.accentInk : colors.secondary} />
    </View>
  );
}

function milestoneValue(progress: ProgressSummary, type: 'sessions' | 'cycles' | 'streak') {
  if (type === 'cycles') return progress.cycles;
  if (type === 'streak') return progress.longestMomentum;
  return progress.sessions;
}

function lastEightWeeks(completedDates: string[]) {
  const completed = new Set(completedDates);
  const currentMonday = startOfCurrentWeek();
  return Array.from({ length: 8 }, (_, index) => {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - (7 - index) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return {
      label: `${shortDate(weekStart)} – ${shortDate(weekEnd)}`,
      days: Array.from({ length: 7 }, (_, dayIndex) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + dayIndex);
        return completed.has(localDateKey(day));
      }),
    };
  });
}

function shortDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfCurrentWeek() {
  const date = new Date();
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - mondayOffset);
  return date;
}

function isDateInCurrentWeek(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  const start = startOfCurrentWeek();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

function formatHistoryDate(dateKey: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${dateKey}T12:00:00`));
}

function dateFromLockTime(lockTime: string) {
  const date = new Date();
  const match = lockTime.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) {
    date.setHours(21, 0, 0, 0);
    return date;
  }
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  date.setHours(hour, Number(match[2]), 0, 0);
  return date;
}

function formatLockTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  fullScene: { flex: 1, backgroundColor: colors.canvas },
  mainShell: { flex: 1, backgroundColor: colors.canvas },
  tabScene: { flex: 1, backgroundColor: colors.canvas },
  subscreenOverlay: { position: 'absolute', inset: 0, zIndex: 2, backgroundColor: colors.canvas },
  tabContent: { flex: 1 },
  homeContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.xxxl },
  homeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  homeGreeting: { flex: 1, gap: spacing.xs },
  greeting: { color: colors.primary, fontSize: 19, fontWeight: '600', letterSpacing: 1 },
  support: { color: colors.secondary, fontSize: 15 },
  profileButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  momentumCard: { gap: spacing.lg, padding: spacing.lg },
  momentumTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  momentumCopy: { flex: 1 },
  momentumValue: { color: colors.primary, fontSize: 54, lineHeight: 62, fontWeight: '700', marginVertical: spacing.xs },
  momentumRecovery: { color: colors.primary, fontSize: 25, lineHeight: 32, fontWeight: '700', marginTop: spacing.xxl, maxWidth: 290 },
  momentumRecoverySupport: { color: colors.secondary, fontSize: 14, marginTop: spacing.xxl },
  weekRing: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center' },
  weekRingValue: { color: colors.primary, fontSize: 25, fontWeight: '700' },
  weekRingLabel: { color: colors.secondary, fontSize: 11, letterSpacing: 1.4, marginTop: 2 },
  weekDays: { flexDirection: 'row', gap: spacing.sm },
  dayCell: { flex: 1, minHeight: 54, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayCellDone: { borderColor: colors.accent },
  dayLetter: { color: colors.secondary, fontSize: 13, fontWeight: '700' },
  dayLetterDone: { color: colors.primary },
  dayCheck: { position: 'absolute', left: 0, right: 0, bottom: 5, alignItems: 'center' },
  movementCard: { padding: spacing.lg, gap: spacing.lg },
  movementHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  movementThumbnail: { width: 116, aspectRatio: 4 / 3, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.surfaceSoft },
  coverImage: { width: '100%', height: '100%' },
  coachThumb: { width: '100%', height: '100%' },
  movementCopy: { flex: 1, gap: spacing.sm },
  movementTitle: { color: colors.primary, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  movementSupport: { color: colors.secondary, fontSize: 13, lineHeight: 18, letterSpacing: 0.6 },
  metricRow: { minHeight: 78, flexDirection: 'row', alignItems: 'stretch' },
  metricDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.sm },
  deadlineRow: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  deadlineText: { ...typography.eyebrow, color: colors.secondary },
  deadlineTextComplete: { color: colors.accent },
  skippedInfoRow: { borderColor: colors.borderStrong },
  noActionRow: { minHeight: 52, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  noActionText: { ...typography.eyebrow, color: colors.secondary },
  calendarSection: { gap: spacing.xl },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarTitle: { color: colors.secondary, fontSize: 18, letterSpacing: 2.6 },
  calendarArrows: { flexDirection: 'row', gap: spacing.sm },
  calendarArrow: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  calendarWeekday: { width: '14.285%', color: colors.secondary, fontSize: 12, textAlign: 'center' },
  calendarSpacer: { width: '14.285%', height: 34 },
  calendarDaySlot: { width: '14.285%', height: 34, alignItems: 'center', justifyContent: 'center' },
  calendarDay: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  calendarDayDone: { backgroundColor: colors.accent },
  calendarDayToday: { borderWidth: 1, borderColor: colors.primary },
  calendarDaySkipped: { borderColor: colors.danger },
  calendarDayText: { color: colors.secondary, fontSize: 13 },
  calendarDayTextDone: { color: colors.accentInk, fontWeight: '700' },
  lifetimeCard: { gap: spacing.md },
  bottomNav: { minHeight: 68, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surfaceSoft, flexDirection: 'row', paddingBottom: spacing.sm },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  navLabel: { color: colors.secondary, fontSize: 10, letterSpacing: 1.1, fontWeight: '600' },
  navLabelActive: { color: colors.accent },
  trainEmpty: { flex: 1, paddingHorizontal: spacing.xxxl, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  concealedIcon: { width: 84, height: 84, borderRadius: 30, backgroundColor: colors.accentSurface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  trainEmptyButton: { alignSelf: 'stretch', marginTop: spacing.xl },
  trainContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.lg },
  trainContentCompact: { paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  trainHeading: { alignItems: 'center', gap: spacing.xl, paddingVertical: spacing.sm },
  trainBrand: { color: colors.secondary, fontSize: 17, letterSpacing: 7.2, fontWeight: '600', marginLeft: 7.2 },
  trainTitle: { color: colors.primary, fontSize: 34, lineHeight: 40, fontWeight: '800', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1.7 },
  coachStage: { width: '100%', aspectRatio: 4 / 3, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  coachImage: { width: '100%', height: '100%' },
  setSegments: { flexDirection: 'row', gap: spacing.sm },
  setSegment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong, overflow: 'hidden' },
  setSegmentFill: { position: 'absolute', inset: 0, backgroundColor: colors.accent, transformOrigin: 'left center' },
  trainMetricsCard: { minHeight: 116, justifyContent: 'center', paddingVertical: spacing.md },
  trainingMetric: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  trainingMetricValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  trainingMetricValue: { color: colors.primary, fontSize: 38, lineHeight: 44, fontWeight: '700' },
  trainingMetricLabel: { ...typography.eyebrow, color: colors.secondary, fontSize: 12, letterSpacing: 2.3 },
  trainCueCard: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.md },
  trainCueText: { color: colors.secondary, fontSize: 16, lineHeight: 22, letterSpacing: 0.35, flex: 1 },
  instructionRow: { minHeight: 42, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.md },
  lightningIcon: { width: 19, height: 24 },
  instructionText: { color: colors.secondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  outcomeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  outcomeCopy: { flex: 1, gap: spacing.xs },
  outcomeTitle: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  outcomeSupport: { color: colors.secondary, fontSize: 13 },
  outcomeTrainContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxl, gap: spacing.xxl },
  outcomeTrainHeader: { alignItems: 'center', gap: spacing.md },
  outcomeTrainEyebrow: { color: colors.secondary, fontSize: 15, letterSpacing: 3.2 },
  outcomeTrainTitle: { color: colors.primary, fontSize: 31, lineHeight: 38, fontWeight: '800', letterSpacing: 1.2, textAlign: 'center' },
  outcomeTrainSupport: { color: colors.secondary, fontSize: 18, letterSpacing: 2.2 },
  outcomeTrainCoach: { width: '100%', height: 330 },
  outcomeTrainCompletionMedia: { alignItems: 'center' },
  outcomeTrainProgress: { gap: spacing.md },
  outcomeTrainSummary: { color: colors.primary, fontSize: 18, lineHeight: 24, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' },
  outcomeTrainCard: { minHeight: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  outcomeUnlockAsset: { width: 72, height: 72 },
  locksContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.md },
  locksHeader: { minHeight: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  locksHeaderCopy: { flex: 1, gap: spacing.md },
  locksIntro: { color: colors.secondary, fontSize: 14, lineHeight: 21 },
  headerShieldAsset: { width: 86, height: 86 },
  sectionTitle: { marginTop: spacing.sm, minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appsListCard: { padding: 0, overflow: 'hidden' },
  appRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  appName: { color: colors.primary, fontSize: 16, fontWeight: '600', flex: 1 },
  appState: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
  emptyApps: { paddingVertical: spacing.lg, gap: spacing.sm },
  emptyAppsTitle: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  emptyAppsCopy: { color: colors.secondary, fontSize: 13 },
  moreAppsText: { color: colors.secondary, fontSize: 10, fontWeight: '700', letterSpacing: 1.1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  lockTimeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, minHeight: 90, marginTop: spacing.sm },
  lockTimeIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  lockTimeCopy: { flex: 1, gap: spacing.xs },
  lockTimeValue: { color: colors.primary, fontSize: 18, fontWeight: '600' },
  lockTimeSupport: { color: colors.tertiary, fontSize: 10, letterSpacing: 1.1 },
  unlockHero: { minHeight: 122, flexDirection: 'row', alignItems: 'center', gap: spacing.xl, borderColor: colors.borderStrong, marginTop: spacing.sm },
  unlockRing: { width: 82, height: 82, borderRadius: 41, borderWidth: 3, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent, shadowOpacity: 0.34, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  unlockRingAsset: { width: 94, height: 94 },
  unlockCopy: { flex: 1, gap: spacing.xs },
  unlockKicker: { color: colors.primary, fontSize: 12, letterSpacing: 1.1 },
  unlockTitle: { color: colors.accent, fontSize: 17, fontWeight: '800', letterSpacing: 1 },
  unlockSupport: { color: colors.secondary, fontSize: 13 },
  breakActions: { flexDirection: 'row', gap: spacing.md },
  breakCard: { flex: 1, minHeight: 94, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  breakCardDisabled: { opacity: 0.42 },
  breakAsset: { width: 31, height: 31 },
  breakValue: { color: colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  breakAction: { color: colors.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  breakSupport: { color: colors.tertiary, fontSize: 12 },
  sessionHeader: { paddingTop: spacing.xxl, gap: spacing.sm },
  sessionSet: { color: colors.primary, fontSize: 31, lineHeight: 38, fontWeight: '800', letterSpacing: 0.3 },
  sessionRestTitle: { fontSize: 52, lineHeight: 59, letterSpacing: 0.4 },
  sessionSupport: { color: colors.secondary, fontSize: 12, lineHeight: 18, letterSpacing: 1.05 },
  sessionPhaseContent: { minHeight: 0, flex: 1 },
  sessionPhaseContentRest: { flex: 1 },
  sessionMediaArea: { width: '100%', aspectRatio: 4 / 3, position: 'relative', marginTop: spacing.lg, marginBottom: spacing.lg },
  sessionCoachStage: { position: 'absolute', inset: 0, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, overflow: 'hidden' },
  sessionCoachMedia: { flex: 1 },
  sessionCoach: { width: '100%', height: '100%' },
  sessionCoachFallback: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  sessionReadout: { alignItems: 'stretch', justifyContent: 'center', paddingTop: spacing.lg, paddingHorizontal: spacing.md },
  sessionMetricsCard: { minHeight: 216, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.lg, justifyContent: 'space-between', gap: spacing.lg },
  repReadout: { minWidth: 0, alignItems: 'center', gap: spacing.sm },
  repValue: { color: colors.primary, fontSize: 54, lineHeight: 60, fontWeight: '700' },
  repTrack: { width: '80%', height: 8, borderRadius: 4, borderWidth: 1, borderColor: colors.borderStrong, overflow: 'hidden', marginTop: spacing.sm },
  repFill: { position: 'absolute', inset: 0, backgroundColor: colors.accent, transformOrigin: 'left center' },
  restReadout: { flexShrink: 0, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  restCountdown: { color: colors.primary, fontSize: 58, fontWeight: '700', lineHeight: 66 },
  sessionInstructionRow: { minHeight: 38, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm },
  sessionLightningIcon: { width: 15, height: 19 },
  sessionInstructionRowText: { color: colors.secondary, fontSize: 10, lineHeight: 14, letterSpacing: 0.75, flex: 1 },
  countdownBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: spacing.xxxl },
  countdownValue: { color: colors.primary, fontSize: 82, lineHeight: 92, fontWeight: '800' },
  sessionInstruction: { color: colors.secondary, fontSize: 16, lineHeight: 24, textAlign: 'center', letterSpacing: 0.45, marginTop: spacing.xxxl },
  restContent: { flex: 1, justifyContent: 'space-around', gap: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.md },
  restPrimaryArea: { alignItems: 'center', gap: spacing.xl },
  restCompletionReadout: { alignItems: 'center', gap: spacing.xs },
  restRepValue: { color: colors.primary, fontSize: 43, lineHeight: 50, fontWeight: '700' },
  restCompletionLine: { width: 128, height: 5, borderRadius: 3, backgroundColor: colors.accent, marginTop: spacing.sm },
  restCue: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  restCueText: { flexShrink: 1, color: colors.secondary, fontSize: 12, lineHeight: 18, letterSpacing: 0.9 },
  pauseControl: { marginTop: spacing.lg },
  pauseOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(1, 2, 4, 0.44)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxxl },
  pauseBackdrop: { position: 'absolute', inset: 0 },
  pauseSheet: { width: '100%', borderRadius: radii.xl, borderWidth: 1, borderColor: 'rgba(167, 176, 184, 0.42)', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl, alignItems: 'center', overflow: 'hidden' },
  pauseGlyph: { width: 68, height: 68, borderRadius: 34, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  pauseTitle: { color: colors.primary, fontSize: 34, lineHeight: 40, fontWeight: '700', textAlign: 'center' },
  pauseSupport: { color: colors.secondary, fontSize: 17, lineHeight: 25, textAlign: 'center', marginTop: spacing.lg },
  pauseActions: { alignSelf: 'stretch', gap: spacing.md, marginTop: spacing.xxxl },
  completionTransitionScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: spacing.xxxl, gap: spacing.xxl },
  completionTransitionHeader: { alignItems: 'center', gap: spacing.sm },
  completionTransitionTitle: { color: colors.primary, fontSize: 30, fontWeight: '700', letterSpacing: 0.3 },
  completionVideoStage: { width: '82%', maxWidth: 310, aspectRatio: 4 / 3, alignSelf: 'center', borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  completionVideoStageTransition: { width: '86%', maxWidth: 324 },
  completionVideo: { width: '100%', height: '100%' },
  completeScreen: { flex: 1, paddingTop: spacing.xxxl, paddingBottom: spacing.xl, gap: spacing.lg },
  completeHeader: { alignItems: 'center', gap: spacing.sm },
  completeSets: { color: colors.primary, fontSize: 17, fontWeight: '700', letterSpacing: 1.1 },
  sessionUnlockAsset: { width: 64, height: 64 },
  profileHero: { alignItems: 'center', paddingTop: spacing.xxxl, paddingBottom: spacing.xxl, gap: spacing.sm },
  avatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.surfaceRaised, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, shadowColor: colors.accent, shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 3 } },
  avatarText: { color: colors.primary, fontSize: 48, fontWeight: '700' },
  memberStatus: { color: colors.secondary, fontSize: 12, fontWeight: '600', letterSpacing: 1.4 },
  profileMetricsCard: { paddingVertical: spacing.sm },
  menuGroup: { gap: spacing.md, marginTop: spacing.xxl },
  menuRow: { minHeight: 72, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md },
  menuRowCompact: { minHeight: 60, borderWidth: 0, borderRadius: 0 },
  menuRowPressed: { backgroundColor: colors.surfaceRaised },
  menuIcon: { width: 34, alignItems: 'flex-start' },
  menuLabel: { flex: 1, color: colors.primary, fontSize: 16, fontWeight: '600' },
  pageHeader: { paddingTop: spacing.xxxl, paddingBottom: spacing.xxl, gap: spacing.md },
  historyChart: { height: 250, justifyContent: 'space-between' },
  historyCalendar: { gap: spacing.lg, padding: spacing.lg },
  historyWeekdays: { marginLeft: 74, flexDirection: 'row', justifyContent: 'space-between' },
  historyWeekday: { width: 25, textAlign: 'center', color: colors.secondary, fontSize: 11, fontWeight: '700' },
  historyWeekList: { gap: spacing.md },
  historyWeekRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  historyWeekLabel: { width: 62, gap: 2 },
  historyWeekNumber: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  historyWeekDates: { color: colors.secondary, fontSize: 10 },
  historyDots: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  historyDot: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  historyDotDone: { backgroundColor: colors.accent },
  bars: { height: 170, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  barColumn: { flex: 1, alignItems: 'center', gap: spacing.sm },
  bar: { width: '70%', borderRadius: 5, backgroundColor: colors.accent },
  barLabel: { color: colors.tertiary, fontSize: 9 },
  historyRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  historyCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  historyCopy: { flex: 1, gap: spacing.xs },
  historyTitle: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  historyDate: { color: colors.secondary, fontSize: 12 },
  emptyHistory: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  nextMilestoneCard: { gap: spacing.lg, padding: spacing.lg },
  nextMilestoneMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nextMilestoneIcon: { width: 58, height: 58, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  nextMilestoneCopy: { flex: 1, gap: spacing.xs },
  nextMilestoneTitle: { color: colors.primary, fontSize: 24, fontWeight: '700' },
  nextMilestoneSupport: { color: colors.secondary, fontSize: 14 },
  milestoneProgressTrack: { height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, overflow: 'hidden' },
  milestoneProgressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  milestoneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  milestone: { width: '48%', minHeight: 166, justifyContent: 'flex-end', gap: spacing.sm },
  milestoneEarned: { borderColor: colors.accent },
  milestoneIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  milestoneIconEarned: { backgroundColor: colors.accentSurface },
  milestoneTitle: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  milestoneSupport: { color: colors.secondary, fontSize: 12 },
  settingRow: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingCopy: { flex: 1, gap: spacing.xs },
  settingTitle: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  settingSupport: { color: colors.secondary, fontSize: 12 },
  compactListCard: { padding: 0, overflow: 'hidden' },
  infoHeader: { paddingTop: spacing.xxxl, paddingBottom: spacing.xxl, gap: spacing.md },
  infoSections: { gap: spacing.md, paddingBottom: spacing.xxxl },
  infoCard: { gap: spacing.sm },
  infoCardTitle: { color: colors.primary, fontSize: 17, fontWeight: '700' },
  infoCardBody: { color: colors.secondary, fontSize: 14, lineHeight: 21 },
  introductionContent: { flex: 1, justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  introductionIcon: { width: 104, height: 104, borderRadius: 36, backgroundColor: colors.accentSurface, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  introductionProgress: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  introductionProgressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong },
  introductionProgressSegmentActive: { backgroundColor: colors.accent },
  introductionActions: { gap: spacing.md, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, alignItems: 'center' },
  settingsReset: { marginTop: spacing.xxxl },
  settingsFootnote: { color: colors.tertiary, fontSize: 12, lineHeight: 18, marginTop: spacing.lg },
  manageAppsCard: { alignItems: 'center', paddingVertical: spacing.xxxl },
  screenTimeRecoveryCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxxl },
  screenTimeRecoveryTitle: { color: colors.primary, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  screenTimeRecoveryCopy: { color: colors.secondary, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  familyControlsMessage: { color: colors.secondary, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  appsIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.accentSurface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  appsCount: { color: colors.primary, fontSize: 42, fontWeight: '700' },
  appsLabel: { ...typography.eyebrow, color: colors.accent, marginTop: spacing.xs },
  pageBottom: { marginTop: 'auto', paddingBottom: spacing.xl },
  scheduleCard: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  schedulePicker: { width: '100%', height: 180 },
  scheduleTime: { color: colors.primary, fontSize: 44, fontWeight: '700' },
  scheduleSupport: { color: colors.secondary, fontSize: 13 },
  confirmationOverlay: { position: 'absolute', inset: 0, backgroundColor: colors.scrim, justifyContent: 'flex-end' },
  confirmationSheet: { minHeight: '66%', backgroundColor: colors.surfaceRaised, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  confirmationActions: { gap: spacing.md, marginTop: 'auto' },
  holdButton: { minHeight: 58, borderRadius: radii.md, backgroundColor: colors.accentPressed, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  holdButtonFill: { position: 'absolute', inset: 0, backgroundColor: colors.accent, transformOrigin: 'left center' },
  holdButtonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  holdButtonText: { color: colors.accentInk, fontSize: 16, fontWeight: '800', letterSpacing: 0.6 },
});

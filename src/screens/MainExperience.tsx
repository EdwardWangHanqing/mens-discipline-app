import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInRight, FadeOut, LinearTransition } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { SelectedActivitiesView } from '../../modules/family-controls';
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
  REPS_PER_SET,
  REST_SECONDS,
  todayMovement,
} from '../data/movements';
import type { OnboardingDraft } from './OnboardingFlow';
import { colors, radii, spacing, typography } from '../theme/designSystem';

export type MainTab = 'home' | 'train' | 'locks';
export type DailyStatus = 'unrevealed' | 'revealed' | 'inProgress' | 'completed' | 'skipped';
export type ProgressSummary = {
  sessions: number;
  cycles: number;
  momentumDays: number;
  longestMomentum: number;
  completedDates: string[];
};

type Subscreen =
  | 'main'
  | 'profile'
  | 'history'
  | 'milestones'
  | 'settings'
  | 'notifications'
  | 'lockPreferences'
  | 'manageApps'
  | 'lockSchedule';

type SessionPhase = 'countdown' | 'active' | 'rest' | 'paused' | 'complete';

export function MainExperience({
  nickname,
  draft,
  tab,
  setTab,
  dailyStatus,
  progress,
  setDailyStatus,
  onFreeRoutineComplete,
  onOpenAccount,
  onOpenPaywall,
  onResetOnboarding,
  onChooseApps,
  onSkipToday,
}: {
  nickname: string;
  draft: OnboardingDraft;
  tab: MainTab;
  setTab: (tab: MainTab) => void;
  dailyStatus: DailyStatus;
  progress: ProgressSummary;
  setDailyStatus: (status: DailyStatus) => void;
  onFreeRoutineComplete: () => void;
  onOpenAccount: () => void;
  onOpenPaywall: () => void;
  onResetOnboarding: () => void;
  onChooseApps: () => void;
  onSkipToday: () => void;
}) {
  const [subscreen, setSubscreen] = useState<Subscreen>('main');
  const [session, setSession] = useState<SessionPhase | null>(null);
  const [setNumber, setSetNumber] = useState(1);
  const [reps, setReps] = useState(0);
  const [restSeconds, setRestSeconds] = useState(REST_SECONDS);
  const [countdown, setCountdown] = useState(3);
  const [phaseBeforePause, setPhaseBeforePause] = useState<'active' | 'rest'>('active');
  const [confirmation, setConfirmation] = useState<'grace' | 'skip' | null>(null);
  const [graceActive, setGraceActive] = useState(false);

  useEffect(() => {
    if (session !== 'countdown') return;
    const timer = setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(0);
        setReps(0);
        setSession('active');
      } else {
        setCountdown((value) => value - 1);
      }
    }, 850);
    return () => clearTimeout(timer);
  }, [countdown, session]);

  useEffect(() => {
    if (session !== 'active') return;
    const timer = setTimeout(() => {
      const nextReps = reps + 1;
      setReps(nextReps);
      if (nextReps >= REPS_PER_SET) {
        if (setNumber === DAILY_SET_COUNT) {
          setSession('complete');
          setDailyStatus('completed');
        } else {
          setRestSeconds(REST_SECONDS);
          setSession('rest');
        }
      }
    }, 650);
    return () => clearTimeout(timer);
  }, [reps, session, setDailyStatus, setNumber]);

  useEffect(() => {
    if (session !== 'rest') return;
    const timer = setTimeout(() => {
      if (restSeconds <= 1) {
        setRestSeconds(0);
        setSetNumber((value) => value + 1);
        setReps(0);
        setSession('active');
      } else {
        setRestSeconds((value) => value - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [restSeconds, session]);

  if (session) {
    return (
      <SessionScreen
        phase={session}
        setNumber={setNumber}
        reps={reps}
        restSeconds={restSeconds}
        countdown={countdown}
        onPause={() => {
          if (session === 'active' || session === 'rest') setPhaseBeforePause(session);
          setSession('paused');
        }}
        onResume={() => setSession(phaseBeforePause)}
        onEnd={() => {
          setSession(null);
          setDailyStatus('inProgress');
          setTab('train');
        }}
        onContinue={() => {
          setSession(null);
          onFreeRoutineComplete();
        }}
      />
    );
  }

  if (subscreen !== 'main') {
    return renderSubscreen();
  }

  return (
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
            reveal={() => setDailyStatus('revealed')}
            begin={() => beginSession(true)}
            resume={() => beginSession(false)}
            openProfile={() => setSubscreen('profile')}
          />
        ) : null}
        {tab === 'train' ? (
          <TrainTab
            dailyStatus={dailyStatus}
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
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            if (confirmation === 'grace') setGraceActive(true);
            if (confirmation === 'skip') onSkipToday();
            setConfirmation(null);
          }}
        />
      ) : null}
    </SafeAreaView>
  );

  function beginSession(reset: boolean) {
    if (reset) {
      setSetNumber(1);
      setReps(0);
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
          onBack={() => setSubscreen('main')}
          openHistory={() => setSubscreen('history')}
          openMilestones={() => setSubscreen('milestones')}
          openSettings={() => setSubscreen('settings')}
          openAccount={onOpenAccount}
        />
      );
    }
    if (subscreen === 'history') return <HistoryScreen onBack={back} />;
    if (subscreen === 'milestones') return <MilestonesScreen onBack={back} />;
    if (subscreen === 'settings') {
      return (
        <SettingsScreen
          onBack={back}
          openNotifications={() => setSubscreen('notifications')}
          openLockPreferences={() => setSubscreen('lockPreferences')}
          onOpenPaywall={onOpenPaywall}
          onResetOnboarding={onResetOnboarding}
        />
      );
    }
    if (subscreen === 'notifications') return <NotificationsScreen onBack={() => setSubscreen('settings')} />;
    if (subscreen === 'lockPreferences') return <LockPreferencesScreen onBack={() => setSubscreen('settings')} />;
    if (subscreen === 'manageApps') {
      return <ManageAppsScreen count={draft.selectedAppCount} onBack={() => setSubscreen('main')} onChooseApps={onChooseApps} />;
    }
    return <LockScheduleScreen lockTime={draft.lockTime} onBack={() => setSubscreen('main')} />;
  }
}

function HomeTab({
  nickname,
  dailyStatus,
  progress,
  lockTime,
  reveal,
  begin,
  resume,
  openProfile,
}: {
  nickname: string;
  dailyStatus: DailyStatus;
  progress: ProgressSummary;
  lockTime: string;
  reveal: () => void;
  begin: () => void;
  resume: () => void;
  openProfile: () => void;
}) {
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
      <View style={styles.homeHeader}>
        <View style={styles.homeGreeting}>
          <Text style={styles.greeting}>Good evening, {nickname || 'Edward'}.</Text>
          <Text style={styles.support}>Stay disciplined. Own your day.</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={openProfile} style={styles.profileButton}>
          <Icon name="person" color={colors.primary} size={24} />
        </Pressable>
      </View>

      <MomentumCard progress={progress} />
      <MovementCard dailyStatus={dailyStatus} lockTime={lockTime} reveal={reveal} begin={begin} resume={resume} />
      <CalendarCard completedDates={progress.completedDates} skipped={dailyStatus === 'skipped'} />
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

function MomentumCard({ progress }: { progress: ProgressSummary }) {
  const weekCount = Math.min(7, progress.completedDates.filter(isDateInCurrentWeek).length);
  return (
    <Card style={styles.momentumCard}>
      <View style={styles.momentumTop}>
        <View>
          <Eyebrow>Momentum</Eyebrow>
          <Text style={styles.momentumValue}>{progress.momentumDays}</Text>
          <Eyebrow accent>Days of momentum</Eyebrow>
        </View>
        <View style={styles.weekRing}>
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
              rotation="-90"
              origin="56, 56"
            />
          </Svg>
          <Text style={styles.weekRingValue}>{weekCount}/7</Text>
          <Text style={styles.weekRingLabel}>WEEK</Text>
        </View>
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
              {done ? <Icon name="checkmark" color={colors.accent} size={13} weight="bold" /> : null}
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
  reveal,
  begin,
  resume,
}: {
  dailyStatus: DailyStatus;
  lockTime: string;
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
      <View style={styles.movementHeader}>
        <View style={styles.movementThumbnail}>
          {hidden ? (
            <Image source={require('../../assets/images/reveal-cover.png')} style={styles.coverImage} />
          ) : (
            <Image source={todayMovement.coachImage} style={styles.coachThumb} resizeMode="contain" />
          )}
        </View>
        <View style={styles.movementCopy}>
          <Eyebrow>Today&apos;s Movement</Eyebrow>
          <Text style={styles.movementTitle}>
            {hidden
              ? 'Your movement is ready.'
              : completed
                ? 'Routine complete.'
                : skipped
                  ? 'Today is closed.'
                  : todayMovement.displayName}
          </Text>
          <Text style={styles.movementSupport}>
            {hidden
              ? 'It will be revealed once you’re ready to train.'
              : completed
                ? 'You showed up. Accountability cleared.'
                : skipped
                  ? 'Skip Today was used. Momentum is paused.'
                  : '4 of 7 completed'}
          </Text>
        </View>
      </View>
      <View style={styles.metricRow}>
        <Metric value="1" label="Movement" />
        <View style={styles.metricDivider} />
        <Metric value="5" label="Sets" />
        <View style={styles.metricDivider} />
        <Metric value="20" label="Reps" />
      </View>
      <View style={styles.deadlineRow}>
        <Icon name={completed ? 'checkmark.circle.fill' : 'clock'} color={completed ? colors.accent : colors.secondary} size={16} />
        <Text style={[styles.deadlineText, completed && styles.deadlineTextComplete]}>
          {completed ? 'MOVEMENT COMPLETE' : `Complete before ${lockTime}`}
        </Text>
      </View>
      {!completed && !skipped ? (
        <PrimaryButton
          label={hidden ? 'Reveal' : inProgress ? 'Resume' : 'Begin'}
          onPress={hidden ? reveal : inProgress ? resume : begin}
        />
      ) : null}
    </Card>
  );
}

function CalendarCard({ completedDates, skipped }: { completedDates: string[]; skipped: boolean }) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const mondayOffset = (new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay() + 6) % 7;
  const monthTitle = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visibleMonth).toUpperCase();
  return (
    <View style={styles.calendarSection}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>{monthTitle}</Text>
        <View style={styles.calendarArrows}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => setVisibleMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))} style={styles.calendarArrow}>
            <Icon name="chevron.left" color={colors.secondary} size={16} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => setVisibleMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))} style={styles.calendarArrow}>
            <Icon name="chevron.right" color={colors.secondary} size={16} />
          </Pressable>
        </View>
      </View>
      <View style={styles.calendarGrid}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.calendarWeekday}>{day}</Text>
        ))}
        {Array.from({ length: mondayOffset }, (_, index) => <View key={`spacer-${index}`} style={styles.calendarSpacer} />)}
        {days.map((day) => {
          const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
          const dateKey = localDateKey(date);
          const done = completedDates.includes(dateKey) && date <= today;
          const isToday = dateKey === localDateKey(today);
          return (
            <View key={day} style={styles.calendarDaySlot}>
              <View
                style={[
                  styles.calendarDay,
                  done && styles.calendarDayDone,
                  isToday && styles.calendarDayToday,
                  isToday && skipped && styles.calendarDaySkipped,
                ]}
              >
                <Text style={[styles.calendarDayText, done && styles.calendarDayTextDone]}>{day}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TrainTab({
  dailyStatus,
  reveal,
  begin,
  resume,
}: {
  dailyStatus: DailyStatus;
  reveal: () => void;
  begin: () => void;
  resume: () => void;
}) {
  const hidden = dailyStatus === 'unrevealed';
  const completed = dailyStatus === 'completed';
  const skipped = dailyStatus === 'skipped';
  const inProgress = dailyStatus === 'inProgress';
  if (hidden) {
    return (
      <View style={styles.trainEmpty}>
        <View style={styles.concealedIcon}>
          <Icon name="eye.slash" color={colors.accent} size={34} />
        </View>
        <Eyebrow>Today&apos;s Movement</Eyebrow>
        <Title compact>Ready when you are.</Title>
        <Body muted>Reveal the movement selected for today. Revealing does not change the draw.</Body>
        <View style={styles.trainEmptyButton}>
          <PrimaryButton label="Reveal Movement" onPress={reveal} />
        </View>
      </View>
    );
  }
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.trainContent} showsVerticalScrollIndicator={false}>
      <View style={styles.trainHeading}>
        <Eyebrow>{completed ? 'Routine Complete' : skipped ? 'Today Closed' : 'Current Movement'}</Eyebrow>
        <Text style={styles.trainTitle}>{completed ? 'You showed up.' : skipped ? 'Training skipped.' : todayMovement.displayName}</Text>
        <Text style={styles.trainFocus}>{todayMovement.focus.toUpperCase()}</Text>
      </View>
      <View style={styles.coachStage}>
        <Image source={todayMovement.coachImage} style={styles.coachImage} resizeMode="contain" />
      </View>
      <Text style={styles.setSummary}>
        {completed ? '5 OF 5 SETS COMPLETE' : `${DAILY_SET_COUNT} SETS · ${REPS_PER_SET} REPS`}
      </Text>
      <SetSegments current={completed ? 5 : inProgress ? 1 : 0} />
      {!completed && !skipped ? (
        <Card style={styles.trainDetailCard}>
          <View style={styles.metricRow}>
            <Metric value="20" label="Reps" />
            <View style={styles.metricDivider} />
            <View style={styles.restMetric}>
              <Text style={styles.restValue}>0:20</Text>
              <Eyebrow>Rest</Eyebrow>
            </View>
          </View>
          <View style={styles.instructionRow}>
            <Icon name="bolt" color={colors.accent} size={18} />
            <Text numberOfLines={2} style={styles.instructionText}>{todayMovement.instruction}</Text>
          </View>
        </Card>
      ) : null}
      {completed ? (
        <Card style={styles.outcomeCard}>
          <Icon name="lock.open" color={colors.accent} size={25} />
          <View style={styles.outcomeCopy}>
            <Text style={styles.outcomeTitle}>APPS UNLOCKED</Text>
            <Text style={styles.outcomeSupport}>Accountability cleared for today.</Text>
          </View>
        </Card>
      ) : null}
      {!completed && !skipped ? (
        <PrimaryButton label={inProgress ? 'Resume Session' : 'Begin'} onPress={inProgress ? resume : begin} />
      ) : null}
    </ScrollView>
  );
}

function LocksTab({
  selectedAppCount,
  lockTime,
  dailyStatus,
  graceActive,
  requestGrace,
  requestSkip,
  openManageApps,
  openSchedule,
}: {
  selectedAppCount: number;
  lockTime: string;
  dailyStatus: DailyStatus;
  graceActive: boolean;
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
        <View style={styles.headerShield}>
          <Icon name={completed ? 'checkmark.shield.fill' : 'lock.shield.fill'} color={colors.accent} size={38} />
        </View>
      </View>

      <SectionTitle title="Selected Apps" action="Manage" onPress={openManageApps} />
      <Card style={styles.appsListCard}>
        {selectedAppCount ? (
          <SelectedActivitiesView
            available={appsAvailable}
            revision={selectedAppCount}
            style={{ height: Math.max(48, selectedAppCount * 48) }}
          />
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
          <View style={styles.unlockRing}>
            <Icon name={appsAvailable ? 'lock.open.fill' : 'lock.fill'} color={colors.primary} size={28} />
          </View>
          <View style={styles.unlockCopy}>
            <Text style={styles.unlockKicker}>APPS UNLOCK AFTER</Text>
            <Text style={styles.unlockTitle}>
              {completed ? 'TODAY’S ROUTINE' : graceActive ? 'GRACE MODE ENDS' : skipped ? 'TOMORROW' : 'TONIGHT’S ROUTINE'}
            </Text>
            <Text style={styles.unlockSupport}>{appsAvailable ? 'Accountability cleared.' : 'Stay locked. Stay focused.'}</Text>
          </View>
        </Card>
      ) : null}

      {!completed && !skipped && selectedAppCount ? (
        <>
          <SectionTitle title="Need a Break?" />
          <View style={styles.breakActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Use five-minute Grace" style={styles.breakCard} onPress={requestGrace}>
              <Icon name="hourglass" color={colors.primary} size={24} />
              <View>
                <Text style={styles.breakValue}>GRACE MODE</Text>
                <Text style={styles.breakAction}>5 MIN</Text>
              </View>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Skip today" style={styles.breakCard} onPress={requestSkip}>
              <Icon name="forward.end.fill" color={colors.primary} size={24} />
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

function SetSegments({ current }: { current: number }) {
  return (
    <View style={styles.setSegments} accessibilityLabel={`${current} of 5 sets complete`}>
      {Array.from({ length: DAILY_SET_COUNT }, (_, index) => (
        <View key={index} style={[styles.setSegment, index < current && styles.setSegmentActive]} />
      ))}
    </View>
  );
}

function SessionScreen({
  phase,
  setNumber,
  reps,
  restSeconds,
  countdown,
  onPause,
  onResume,
  onEnd,
  onContinue,
}: {
  phase: SessionPhase;
  setNumber: number;
  reps: number;
  restSeconds: number;
  countdown: number;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onContinue: () => void;
}) {
  if (phase === 'complete') {
    return (
      <Screen testID="routine-complete">
        <View style={styles.completeScreen}>
          <View style={styles.completeHeader}>
            <Eyebrow>Routine Complete</Eyebrow>
            <Title>Routine complete.</Title>
            <Body muted>You showed up.</Body>
          </View>
          <Image source={todayMovement.coachImage} style={styles.completeCoach} resizeMode="contain" />
          <Text style={styles.completeSets}>5 OF 5 SETS COMPLETE</Text>
          <SetSegments current={5} />
          <Card style={styles.outcomeCard}>
            <Icon name="lock.open" color={colors.accent} size={25} />
            <View style={styles.outcomeCopy}>
              <Text style={styles.outcomeTitle}>APPS UNLOCKED</Text>
              <Text style={styles.outcomeSupport}>Accountability cleared for today.</Text>
            </View>
          </Card>
          <PrimaryButton label="Continue" onPress={onContinue} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen testID={`session-${phase}`}>
      <View style={styles.sessionHeader}>
        <Eyebrow>{todayMovement.displayName}</Eyebrow>
        <Text style={styles.sessionSet}>{phase === 'rest' ? 'REST' : `SET ${setNumber} OF ${DAILY_SET_COUNT}`}</Text>
        {phase === 'rest' ? <Text style={styles.sessionSupport}>SET {setNumber} COMPLETE · SET {setNumber + 1} NEXT</Text> : null}
      </View>
      <View style={styles.sessionCoachStage}>
        <Image source={todayMovement.coachImage} style={styles.sessionCoach} resizeMode="contain" />
      </View>
      <SetSegments current={phase === 'rest' ? setNumber : setNumber - 1} />
      <View style={styles.sessionReadout}>
        {phase === 'countdown' ? (
          <View style={styles.countdownBlock}>
            <Eyebrow>Get Ready</Eyebrow>
            <Text style={styles.countdownValue}>{countdown || 'GO'}</Text>
            <Text style={styles.sessionInstruction}>Follow the coach. Control every repetition.</Text>
          </View>
        ) : (
          <>
            <View style={styles.repReadout}>
              <Text style={styles.repValue}>{phase === 'rest' ? `${REPS_PER_SET} / ${REPS_PER_SET}` : `${reps} / ${REPS_PER_SET}`}</Text>
              <Eyebrow>{phase === 'rest' ? 'Set reps' : 'Guided reps'}</Eyebrow>
              <View style={styles.repTrack}>
                <View style={[styles.repFill, { width: `${Math.max(4, (phase === 'rest' ? 100 : reps / REPS_PER_SET * 100))}%` }]} />
              </View>
            </View>
            {phase === 'rest' ? (
              <View style={styles.restReadout}>
                <Text style={styles.restCountdown}>0:{String(restSeconds).padStart(2, '0')}</Text>
                <Eyebrow>Rest</Eyebrow>
              </View>
            ) : null}
          </>
        )}
      </View>
      {phase !== 'countdown' ? <Text style={styles.sessionInstruction}>{todayMovement.instruction.toUpperCase()}</Text> : null}
      {phase === 'active' || phase === 'rest' ? <SecondaryButton label="Pause" onPress={onPause} icon="pause" /> : null}
      {phase === 'paused' ? (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseSheet}>
            <Eyebrow>Session Paused</Eyebrow>
            <Title compact>Stay with it.</Title>
            <Body muted>Your progress is held until you resume.</Body>
            <View style={styles.pauseActions}>
              <PrimaryButton label="Resume" onPress={onResume} />
              <SecondaryButton label="End Session" onPress={onEnd} danger />
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function ProfileScreen({
  nickname,
  onBack,
  openHistory,
  openMilestones,
  openSettings,
  openAccount,
}: {
  nickname: string;
  onBack: () => void;
  openHistory: () => void;
  openMilestones: () => void;
  openSettings: () => void;
  openAccount: () => void;
}) {
  return (
    <Screen scroll>
      <TopBar
        title="Profile"
        onBack={onBack}
        action={(
          <Pressable accessibilityRole="button" accessibilityLabel="Open settings" onPress={openSettings} hitSlop={8}>
            <Icon name="gearshape" color={colors.primary} />
          </Pressable>
        )}
      />
      <View style={styles.profileHero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(nickname || 'E').slice(0, 1).toUpperCase()}</Text></View>
        <Title compact>{nickname || 'Edward'}</Title>
        <Text style={styles.memberStatus}>FOUNDING MEMBER PREVIEW</Text>
      </View>
      <Card>
        <View style={styles.metricRow}>
          <Metric value="26" label="Sessions" />
          <View style={styles.metricDivider} />
          <Metric value="3" label="Cycles" />
          <View style={styles.metricDivider} />
          <Metric value="12" label="Momentum" />
        </View>
      </Card>
      <View style={styles.menuGroup}>
        <MenuRow icon="chart.bar" label="History & Progress" onPress={openHistory} />
        <MenuRow icon="medal" label="Milestones" onPress={openMilestones} />
        <MenuRow icon="person.crop.circle" label="Account" onPress={openAccount} />
        <MenuRow icon="gearshape" label="Settings" onPress={openSettings} />
      </View>
    </Screen>
  );
}

function HistoryScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen scroll>
      <TopBar title="History & Progress" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Your Work</Eyebrow><Title compact>Progress, without noise.</Title></View>
      <Card style={styles.historyChart}>
        <Eyebrow>Last 8 Weeks</Eyebrow>
        <View style={styles.bars}>
          {[4, 5, 4, 6, 5, 7, 5, 6].map((value, index) => (
            <View key={index} style={styles.barColumn}>
              <View style={[styles.bar, { height: value * 18 }]} />
              <Text style={styles.barLabel}>W{index + 1}</Text>
            </View>
          ))}
        </View>
      </Card>
      <SectionTitle title="Recent Sessions" />
      <Card>
        {['Kneeling Drive', 'Movement 07', 'Movement 03'].map((name, index) => (
          <View key={name}>
            <View style={styles.historyRow}>
              <View style={styles.historyCheck}><Icon name="checkmark" color={colors.accentInk} size={12} weight="bold" /></View>
              <View style={styles.historyCopy}><Text style={styles.historyTitle}>{name}</Text><Text style={styles.historyDate}>August {10 - index}, 2026 · 5 × 20</Text></View>
            </View>
            {index < 2 ? <Divider /> : null}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function MilestonesScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen scroll>
      <TopBar title="Milestones" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Earned Quietly</Eyebrow><Title compact>Built by showing up.</Title></View>
      <View style={styles.milestoneGrid}>
        <Milestone icon="flame" title="First Week" support="7 sessions" earned />
        <Milestone icon="repeat" title="Full Cycle" support="7 movements" earned />
        <Milestone icon="shield" title="Held the Line" support="7 locks cleared" earned />
        <Milestone icon="calendar" title="One Month" support="30 sessions" />
      </View>
    </Screen>
  );
}

function SettingsScreen({
  onBack,
  openNotifications,
  openLockPreferences,
  onOpenPaywall,
  onResetOnboarding,
}: {
  onBack: () => void;
  openNotifications: () => void;
  openLockPreferences: () => void;
  onOpenPaywall: () => void;
  onResetOnboarding: () => void;
}) {
  return (
    <Screen scroll>
      <TopBar title="Settings" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Preferences</Eyebrow><Title compact>Keep it intentional.</Title></View>
      <View style={styles.menuGroup}>
        <MenuRow icon="bell" label="Notifications" onPress={openNotifications} />
        <MenuRow icon="lock.shield" label="Lock Preferences" onPress={openLockPreferences} />
        <MenuRow icon="creditcard" label="Membership" onPress={onOpenPaywall} />
      </View>
      <SectionTitle title="Experience" />
      <Card>
        <SettingToggle icon="speaker.wave.2" title="Coach Voice" support="Future audio slot" initial />
        <Divider />
        <SettingToggle icon="music.note" title="Training Music" support="Future SUNO asset slot" />
        <Divider />
        <SettingToggle icon="iphone.radiowaves.left.and.right" title="Haptics" support="Guided set cues" initial />
      </Card>
      <View style={styles.settingsReset}><SecondaryButton label="Replay Onboarding" onPress={onResetOnboarding} /></View>
    </Screen>
  );
}

function NotificationsScreen({ onBack }: { onBack: () => void }) {
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
        <SettingToggle icon="hourglass" title="Grace Availability" support="Three 5-minute uses per cycle" initial />
      </Card>
      <Text style={styles.settingsFootnote}>Changes to active lock rules take effect tomorrow.</Text>
    </Screen>
  );
}

function ManageAppsScreen({ count, onBack, onChooseApps }: { count: number; onBack: () => void; onChooseApps: () => void }) {
  return (
    <Screen>
      <TopBar title="Manage Apps" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Selected Apps</Eyebrow><Title compact>Choose what should wait.</Title><Body muted>These apps are tied to your daily commitment.</Body></View>
      <Card style={styles.manageAppsCard}>
        <View style={styles.appsIcon}><Icon name="app.dashed" color={colors.accent} size={34} /></View>
        <Text style={styles.appsCount}>{count || 'No'}</Text>
        <Text style={styles.appsLabel}>{count === 1 ? 'app selected' : 'apps selected'}</Text>
      </Card>
      <View style={styles.pageBottom}><PrimaryButton label="Choose Apps" onPress={onChooseApps} /></View>
    </Screen>
  );
}

function LockScheduleScreen({ lockTime, onBack }: { lockTime: string; onBack: () => void }) {
  return (
    <Screen>
      <TopBar title="Lock Schedule" onBack={onBack} />
      <View style={styles.pageHeader}><Eyebrow>Daily Deadline</Eyebrow><Title compact>Done by {lockTime}.</Title><Body muted>This commitment repeats every day. Changes take effect tomorrow.</Body></View>
      <Card style={styles.scheduleCard}>
        <Icon name="clock" color={colors.accent} size={32} />
        <Text style={styles.scheduleTime}>{lockTime}</Text>
        <Text style={styles.scheduleSupport}>Unlock window ends at 6:00 AM</Text>
      </Card>
      <View style={styles.pageBottom}><PrimaryButton label="Save Schedule" onPress={onBack} /></View>
    </Screen>
  );
}

function ConfirmationSheet({ type, onCancel, onConfirm }: { type: 'grace' | 'skip'; onCancel: () => void; onConfirm: () => void }) {
  const grace = type === 'grace';
  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.confirmationOverlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss confirmation" style={StyleSheet.absoluteFill} onPress={onCancel} />
      <Animated.View entering={FadeInRight.duration(260)} style={styles.confirmationSheet}>
        <Eyebrow>{grace ? 'Grace Mode' : 'Skip Today'}</Eyebrow>
        <Title compact>{grace ? 'Use 5-Minute Grace?' : 'Skip today?'}</Title>
        <Body muted>{grace ? 'Apps will be available for 5 minutes.\n2 Grace extensions remain today.' : 'This ends today’s training, resets current momentum, and can’t be undone. Your movement stays in the cycle.'}</Body>
        <View style={styles.confirmationActions}>
          {grace ? (
            <PrimaryButton label="Use 5-Minute Grace" onPress={onConfirm} />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hold to confirm skipping today"
              onLongPress={onConfirm}
              delayLongPress={800}
              style={({ pressed }) => [styles.holdButton, pressed && styles.holdButtonPressed]}
            >
              <Text style={styles.holdButtonText}>HOLD TO CONFIRM</Text>
            </Pressable>
          )}
          <SecondaryButton label={grace ? 'Not Now' : 'Keep Today'} onPress={onCancel} />
        </View>
      </Animated.View>
    </Animated.View>
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

function MenuRow({ icon, label, onPress }: { icon: Parameters<typeof Icon>[0]['name']; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  mainShell: { flex: 1 },
  tabScene: { flex: 1 },
  tabContent: { flex: 1 },
  homeContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.xxxl },
  homeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  homeGreeting: { flex: 1, gap: spacing.xs },
  greeting: { color: colors.primary, fontSize: 19, fontWeight: '600', letterSpacing: 1 },
  support: { color: colors.secondary, fontSize: 15 },
  profileButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  momentumCard: { gap: spacing.lg, padding: spacing.lg },
  momentumTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  momentumValue: { color: colors.primary, fontSize: 54, lineHeight: 62, fontWeight: '700', marginVertical: spacing.xs },
  weekRing: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center' },
  weekRingValue: { color: colors.primary, fontSize: 25, fontWeight: '700' },
  weekRingLabel: { color: colors.secondary, fontSize: 11, letterSpacing: 1.4, marginTop: 2 },
  weekDays: { flexDirection: 'row', gap: spacing.sm },
  dayCell: { flex: 1, minHeight: 54, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayCellDone: { borderColor: colors.accent },
  dayLetter: { color: colors.secondary, fontSize: 13, fontWeight: '700' },
  dayLetterDone: { color: colors.primary },
  movementCard: { padding: spacing.lg, gap: spacing.lg },
  movementHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  movementThumbnail: { width: 102, height: 124, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.surfaceSoft },
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
  concealedIcon: { width: 84, height: 84, borderRadius: 30, backgroundColor: '#181B16', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  trainEmptyButton: { alignSelf: 'stretch', marginTop: spacing.xl },
  trainContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxl, gap: spacing.lg },
  trainHeading: { alignItems: 'center', gap: spacing.sm },
  trainTitle: { color: colors.primary, fontSize: 28, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.8 },
  trainFocus: { color: colors.secondary, fontSize: 14, letterSpacing: 1.4, textAlign: 'center' },
  coachStage: { height: 330, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  coachImage: { width: '100%', height: '100%' },
  setSummary: { color: colors.primary, fontSize: 17, fontWeight: '700', letterSpacing: 1.2 },
  setSegments: { flexDirection: 'row', gap: spacing.sm },
  setSegment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong },
  setSegmentActive: { backgroundColor: colors.accent },
  trainDetailCard: { gap: spacing.md, paddingBottom: spacing.sm },
  restMetric: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  restValue: { color: colors.primary, fontSize: 28, fontWeight: '700' },
  instructionRow: { minHeight: 42, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.md },
  instructionText: { color: colors.secondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  outcomeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  outcomeCopy: { flex: 1, gap: spacing.xs },
  outcomeTitle: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  outcomeSupport: { color: colors.secondary, fontSize: 13 },
  locksContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.md },
  locksHeader: { minHeight: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  locksHeaderCopy: { flex: 1, gap: spacing.md },
  locksIntro: { color: colors.secondary, fontSize: 14, lineHeight: 21 },
  headerShield: { width: 72, height: 78, alignItems: 'center', justifyContent: 'center', borderColor: colors.accent, borderWidth: 1.5, borderRadius: 22, backgroundColor: '#11140E' },
  sectionTitle: { marginTop: spacing.sm, minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appsListCard: { padding: 0, overflow: 'hidden' },
  appRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  appName: { color: colors.primary, fontSize: 16, fontWeight: '600', flex: 1 },
  appState: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
  emptyApps: { paddingVertical: spacing.lg, gap: spacing.sm },
  emptyAppsTitle: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  emptyAppsCopy: { color: colors.secondary, fontSize: 13 },
  lockTimeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, minHeight: 90, marginTop: spacing.sm },
  lockTimeIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  lockTimeCopy: { flex: 1, gap: spacing.xs },
  lockTimeValue: { color: colors.primary, fontSize: 18, fontWeight: '600' },
  lockTimeSupport: { color: colors.tertiary, fontSize: 10, letterSpacing: 1.1 },
  unlockHero: { minHeight: 122, flexDirection: 'row', alignItems: 'center', gap: spacing.xl, borderColor: colors.borderStrong, marginTop: spacing.sm },
  unlockRing: { width: 82, height: 82, borderRadius: 41, borderWidth: 3, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent, shadowOpacity: 0.34, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  unlockCopy: { flex: 1, gap: spacing.xs },
  unlockKicker: { color: colors.primary, fontSize: 12, letterSpacing: 1.1 },
  unlockTitle: { color: colors.accent, fontSize: 17, fontWeight: '800', letterSpacing: 1 },
  unlockSupport: { color: colors.secondary, fontSize: 13 },
  breakActions: { flexDirection: 'row', gap: spacing.md },
  breakCard: { flex: 1, minHeight: 94, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  breakValue: { color: colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  breakAction: { color: colors.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  breakSupport: { color: colors.tertiary, fontSize: 12 },
  sessionHeader: { paddingTop: spacing.xxl, gap: spacing.sm },
  sessionSet: { color: colors.primary, fontSize: 25, fontWeight: '700' },
  sessionSupport: { color: colors.secondary, fontSize: 12, letterSpacing: 1.1 },
  sessionCoachStage: { height: 270, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, marginVertical: spacing.xl },
  sessionCoach: { width: '100%', height: '100%' },
  sessionReadout: { minHeight: 150, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  repReadout: { flex: 1, alignItems: 'center', gap: spacing.sm },
  repValue: { color: colors.primary, fontSize: 46, fontWeight: '700' },
  repTrack: { width: '80%', height: 8, borderRadius: 4, borderWidth: 1, borderColor: colors.borderStrong, overflow: 'hidden', marginTop: spacing.md },
  repFill: { height: '100%', backgroundColor: colors.accent },
  restReadout: { width: 124, height: 124, borderRadius: 62, borderWidth: 7, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  restCountdown: { color: colors.primary, fontSize: 30, fontWeight: '700' },
  countdownBlock: { alignItems: 'center', gap: spacing.md },
  countdownValue: { color: colors.primary, fontSize: 64, fontWeight: '800' },
  sessionInstruction: { color: colors.secondary, fontSize: 12, lineHeight: 18, textAlign: 'center', letterSpacing: 0.8, marginBottom: spacing.xl },
  pauseOverlay: { position: 'absolute', inset: 0, backgroundColor: colors.scrim, justifyContent: 'flex-end' },
  pauseSheet: { backgroundColor: colors.surfaceRaised, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  pauseActions: { gap: spacing.md, marginTop: spacing.lg },
  completeScreen: { flex: 1, paddingTop: spacing.xxxl, paddingBottom: spacing.xl, gap: spacing.lg },
  completeHeader: { alignItems: 'center', gap: spacing.sm },
  completeCoach: { flex: 1, width: '100%', maxHeight: 350 },
  completeSets: { color: colors.primary, fontSize: 17, fontWeight: '700', letterSpacing: 1.1 },
  profileHero: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { color: colors.primary, fontSize: 32, fontWeight: '700' },
  memberStatus: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  menuGroup: { gap: spacing.sm, marginTop: spacing.xxl },
  menuRow: { minHeight: 62, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md },
  menuRowPressed: { backgroundColor: colors.surfaceRaised },
  menuIcon: { width: 34, alignItems: 'flex-start' },
  menuLabel: { flex: 1, color: colors.primary, fontSize: 16, fontWeight: '600' },
  pageHeader: { paddingVertical: spacing.xxxl, gap: spacing.md },
  historyChart: { height: 250, justifyContent: 'space-between' },
  bars: { height: 170, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  barColumn: { flex: 1, alignItems: 'center', gap: spacing.sm },
  bar: { width: '70%', borderRadius: 5, backgroundColor: colors.accent },
  barLabel: { color: colors.tertiary, fontSize: 9 },
  historyRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  historyCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  historyCopy: { flex: 1, gap: spacing.xs },
  historyTitle: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  historyDate: { color: colors.secondary, fontSize: 12 },
  milestoneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  milestone: { width: '48%', minHeight: 180, justifyContent: 'flex-end', gap: spacing.sm },
  milestoneEarned: { borderColor: colors.accent },
  milestoneIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  milestoneIconEarned: { backgroundColor: '#181B16' },
  milestoneTitle: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  milestoneSupport: { color: colors.secondary, fontSize: 12 },
  settingRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingCopy: { flex: 1, gap: spacing.xs },
  settingTitle: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  settingSupport: { color: colors.secondary, fontSize: 12 },
  settingsReset: { marginTop: spacing.xxxl },
  settingsFootnote: { color: colors.tertiary, fontSize: 12, lineHeight: 18, marginTop: spacing.lg },
  manageAppsCard: { alignItems: 'center', paddingVertical: spacing.xxxl },
  appsIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#181B16', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  appsCount: { color: colors.primary, fontSize: 42, fontWeight: '700' },
  appsLabel: { ...typography.eyebrow, color: colors.accent, marginTop: spacing.xs },
  pageBottom: { marginTop: 'auto', paddingBottom: spacing.xl },
  scheduleCard: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  scheduleTime: { color: colors.primary, fontSize: 44, fontWeight: '700' },
  scheduleSupport: { color: colors.secondary, fontSize: 13 },
  confirmationOverlay: { position: 'absolute', inset: 0, backgroundColor: colors.scrim, justifyContent: 'flex-end' },
  confirmationSheet: { minHeight: '66%', backgroundColor: colors.surfaceRaised, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  confirmationActions: { gap: spacing.md, marginTop: 'auto' },
  holdButton: { minHeight: 58, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  holdButtonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  holdButtonText: { color: colors.accentInk, fontSize: 16, fontWeight: '800', letterSpacing: 0.6 },
});

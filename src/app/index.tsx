import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import FamilyControls, {
  type FamilyControlsAuthorizationStatus,
} from '../../modules/family-controls';
import VisionPose, {
  type PoseDetectionResult,
} from '../../modules/vision-pose';

const missingDiagnosticImagePath =
  '/expo-vision-pose-diagnostic/missing-image.png';

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

type AuthorizationDiagnostic = {
  status: FamilyControlsAuthorizationStatus;
  errorMessage: string | null;
};

function readAuthorizationDiagnostic(): AuthorizationDiagnostic {
  try {
    return {
      status: FamilyControls.getAuthorizationStatus(),
      errorMessage: null,
    };
  } catch (error) {
    return {
      status: 'unknown',
      errorMessage: formatError(error),
    };
  }
}

export default function HomeScreen() {
  const [diagnostic, setDiagnostic] = useState(readAuthorizationDiagnostic);
  const [isRequesting, setIsRequesting] = useState(false);
  const [poseResult, setPoseResult] = useState<PoseDetectionResult | null>(null);
  const [poseErrorMessage, setPoseErrorMessage] = useState<string | null>(null);
  const [isRunningPoseDiagnostic, setIsRunningPoseDiagnostic] = useState(false);

  const refreshAuthorizationStatus = useCallback(() => {
    setDiagnostic(readAuthorizationDiagnostic());
  }, []);

  const requestAuthorization = useCallback(async () => {
    setIsRequesting(true);
    setDiagnostic((current) => ({ ...current, errorMessage: null }));

    try {
      await FamilyControls.requestAuthorization();
      setDiagnostic(readAuthorizationDiagnostic());
    } catch (error) {
      setDiagnostic((current) => ({
        ...current,
        errorMessage: formatError(error),
      }));
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const runPoseBridgeDiagnostic = useCallback(async () => {
    setIsRunningPoseDiagnostic(true);
    setPoseResult(null);
    setPoseErrorMessage(null);

    try {
      const result = await VisionPose.detectPoseFromImageFile(
        missingDiagnosticImagePath
      );
      setPoseResult(result);
    } catch (error) {
      setPoseErrorMessage(formatError(error));
    } finally {
      setIsRunningPoseDiagnostic(false);
    }
  }, []);

  useEffect(() => {
    void runPoseBridgeDiagnostic();
  }, [runPoseBridgeDiagnostic]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={styles.screen}
    >
      <Text style={styles.eyebrow}>{"MEN'S DISCIPLINE"}</Text>
      <Text style={styles.title}>Technical baseline</Text>
      <Text style={styles.body}>
        Official Expo application shell is running.
      </Text>

      <View style={styles.diagnosticSection}>
        <Text style={styles.diagnosticTitle}>Family Controls diagnostic</Text>
        <Text style={styles.status}>Status: {diagnostic.status}</Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={refreshAuthorizationStatus}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Refresh status</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isRequesting}
            onPress={requestAuthorization}
            style={[styles.button, isRequesting && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isRequesting ? 'Requesting…' : 'Request authorization'}
            </Text>
          </Pressable>
        </View>

        {diagnostic.errorMessage ? (
          <Text selectable style={styles.error}>
            {diagnostic.errorMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.diagnosticSection}>
        <Text style={styles.diagnosticTitle}>Vision pose diagnostic</Text>
        <Text style={styles.status}>
          Status: {poseResult?.status ?? 'notRun'}
        </Text>
        {poseResult?.errorCode ? (
          <Text style={styles.status}>Code: {poseResult.errorCode}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isRunningPoseDiagnostic}
          onPress={runPoseBridgeDiagnostic}
          style={[
            styles.button,
            isRunningPoseDiagnostic && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {isRunningPoseDiagnostic ? 'Running…' : 'Test native bridge'}
          </Text>
        </Pressable>

        <Text style={styles.caption}>
          Uses an intentionally missing local file. Expected: invalidInput /
          fileNotFound.
        </Text>

        {poseResult?.message || poseErrorMessage ? (
          <Text selectable style={styles.error}>
            {poseResult?.message ?? poseErrorMessage}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#171817',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 48,
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  eyebrow: {
    marginBottom: 12,
    color: '#A8A8A2',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  title: {
    color: '#F2F0EA',
    fontSize: 32,
    fontWeight: '600',
  },
  body: {
    marginTop: 12,
    color: '#A8A8A2',
    fontSize: 16,
    lineHeight: 24,
  },
  diagnosticSection: {
    marginTop: 32,
    gap: 12,
  },
  diagnosticTitle: {
    color: '#F2F0EA',
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    color: '#A8A8A2',
    fontSize: 16,
  },
  caption: {
    color: '#7F807B',
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: 10,
  },
  button: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: '#A8A8A2',
    borderRadius: 6,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#F2F0EA',
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    color: '#F08A84',
    fontSize: 14,
    lineHeight: 20,
  },
});

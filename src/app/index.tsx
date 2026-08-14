import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{"MEN'S DISCIPLINE"}</Text>
      <Text style={styles.title}>Technical baseline</Text>
      <Text style={styles.body}>
        Official Expo application shell is running.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#171817',
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
});

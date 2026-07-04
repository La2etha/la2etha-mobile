import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { Logo } from '../../src/components/Logo';
import { useAuth } from '../../src/auth/AuthContext';
import { validateLogin } from '../../src/features/auth/validate';
import { ApiError } from '../../src/api/errors';
import { colors, radius, space, type } from '../../src/theme';

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const v = validateLogin({ email, password });
    if (!v.ok) return setError(v.error!);
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      router.replace('/(app)' as never);
    } catch (e) {
      setError(e instanceof ApiError ? e.friendly : 'Something went off-script. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const input = {
    ...type.body,
    color: colors.ink,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    backgroundColor: colors.card,
  } as const;

  return (
    <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: space.lg }}>
        <Logo wordmark widthPct={0.7} />
      </View>
      <AppText variant="display">Welcome back</AppText>
      <TextInput
        style={input}
        placeholder="Email"
        placeholderTextColor={colors.inkSoft}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={input}
        placeholder="Password"
        placeholderTextColor={colors.inkSoft}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? (
        <AppText variant="label" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
      <GlowButton label="Sign in" onPress={submit} loading={busy} />
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        <AppText variant="body" color={colors.inkSoft}>
          New here?
        </AppText>
        <Link href={'/(auth)/register' as never}>
          <AppText variant="label" color={colors.stamp}>
            Create account
          </AppText>
        </Link>
      </View>
    </Screen>
  );
}

import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { Logo } from '../../src/components/Logo';
import { useAuth } from '../../src/auth/AuthContext';
import { validateRegister } from '../../src/features/auth/validate';
import { ApiError } from '../../src/api/errors';
import { colors, radius, role, space, type } from '../../src/theme';

export default function Register() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const v = validateRegister({ name, email, password });
    if (!v.ok) return setError(v.error!);
    setBusy(true);
    setError(null);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace('/(app)' as never);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.status === 400 || e.status === 409
            ? 'That email already has an account. Try signing in.'
            : e.friendly
          : 'Something went off-script. Please try again.';
      setError(msg);
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
    <Screen logo={false} style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: space.lg }}>
        <Logo wordmark widthPct={0.7} />
      </View>
      <AppText variant="display">Create your account</AppText>
      <TextInput
        style={input}
        placeholder="Your name"
        placeholderTextColor={colors.inkSoft}
        value={name}
        onChangeText={setName}
      />
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
      <GlowButton label="Create account" onPress={submit} loading={busy} />
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        <AppText variant="body" color={colors.inkSoft}>
          Have an account?
        </AppText>
        <Link href={'/(auth)/login' as never}>
          <AppText variant="label" color={role.actionDeep}>
            Sign in
          </AppText>
        </Link>
      </View>
    </Screen>
  );
}

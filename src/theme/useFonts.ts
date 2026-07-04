import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';

// Loads the brand faces via the Google Fonts packages (no manual .ttf management).
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Fraunces_600SemiBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    IBMPlexSansArabic_400Regular,
    SpaceMono_400Regular,
  });
  return loaded;
}

import { Stack } from "expo-router";
import { Button } from 'react-native';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown:false,
      }}

    >
      <Stack.Screen name="index" options={{ title: "NyaySaathi" }} />
    </Stack>
  );
}
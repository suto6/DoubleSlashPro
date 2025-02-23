import { Text, View, StyleSheet, Image } from "react-native";
// import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const Index = () => {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      router.push('/[auth]/login')
    }, 2000)
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SurakSha</Text>
      {/* <Image source={require("../assets/images/logo.png")} /> */}
      {/* <Link href={"/instructions"} style={styles.instructionsLink}>Instructions</Link> */}
    </View>
  );
}

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2F", // Dark background color
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF", // White text color
    marginBottom: 10,
  },
  instructionsLink: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 20,
    color: '#fa3c75',
    textDecorationLine: "underline"
  },
});
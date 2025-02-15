import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.config';

const Home = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/[auth]/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Welcome to NyaySaathi</Text>
                <TouchableOpacity 
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                >
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>Find the safest route</Text>
                
                <View style={styles.cardContainer}>
                    <TouchableOpacity style={styles.card}>
                        <Ionicons name="location" size={24} color="#fa3c75" />
                        <Text style={styles.cardTitle}>Start Destination</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card}>
                        <Ionicons name="location" size={24} color="#fa3c75" />
                        <Text style={styles.cardTitle}>End Destination</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.findRouteButton}
                        onPress={() => console.log('Button Pressed')}
                    >
                        <Text style={styles.findRouteButtonText}>Find the Safest Route</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E2F',
    },
    findRouteButton: {
        backgroundColor: '#fa3c75',
        padding: 16,
        borderRadius: 12,
        marginTop: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    findRouteButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A3F',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    signOutButton: {
        backgroundColor: '#2A2A3F',
        padding: 10,
        borderRadius: 8,
    },
    signOutText: {
        color: '#fa3c75',
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 30,
    },
    cardContainer: {
        gap: 20,
    },
    card: {
        backgroundColor: '#2A2A3F',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3D3D5C',
    },
    cardTitle: {
        fontSize: 18,
        color: '#FFFFFF',
        marginLeft: 12,
    },
    cardDescription: {
        fontSize: 16,
        color: '#999',
    },
});

export default Home;
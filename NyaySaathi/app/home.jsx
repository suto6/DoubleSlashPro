import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
                <Text style={styles.subtitle}>Your Legal Assistant</Text>
                
                <View style={styles.cardContainer}>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardTitle}>Legal Resources</Text>
                        <Text style={styles.cardDescription}>Access legal documents and information</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardTitle}>Find Lawyer</Text>
                        <Text style={styles.cardDescription}>Connect with legal professionals</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardTitle}>Legal Aid</Text>
                        <Text style={styles.cardDescription}>Get assistance with legal matters</Text>
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
        borderLeftWidth: 4,
        borderLeftColor: '#fa3c75',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 16,
        color: '#999',
    },
});

export default Home;
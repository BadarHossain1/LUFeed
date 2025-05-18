import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // Adjust the path as needed

const HomePage = ({ route, navigation }) => {
    const { userEmail } = route.params;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.replace('Login'); // Or navigate, depending on your navigation flow
        } catch (error) {
            console.error('Logout error:', error.message);
            alert('Failed to log out. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome, {userEmail}!</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F7',
        paddingHorizontal: 24,
    },
    welcome: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2942D8',
        marginBottom: 32,
    },
    logoutButton: {
        backgroundColor: '#E53935',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HomePage;

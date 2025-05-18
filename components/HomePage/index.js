import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomePage = ({ route }) => {
    const { userEmail } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome, {userEmail}!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F7',
    },
    welcome: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2942D8',
    },
});

export default HomePage;

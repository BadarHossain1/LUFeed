import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {auth} from '../../firebaseConfig'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';

const SignUp = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
  

    const handleSignUp = async () => {
        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill out all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update user profile with display name
            await updateProfile(userCredential.user, {
                displayName: username,
            });

            console.log('User registered:', userCredential.user.email);

            // Navigate to homepage
            navigation.navigate('HomePage', { userEmail: userCredential.user.email });
        } catch (error) {
            console.error('Signup error:', error.message);
            alert('Signup failed: ' + error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.content}>
                    {/* Header */}
                    <Text style={styles.header}>Create account</Text>

                    {/* Subheader */}
                    <Text style={styles.subheader}>
                        Create an account so you can explore all{'\n'}the existing jobs
                    </Text>

                    {/* Input fields */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            placeholderTextColor="#888"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#888"
                        />

                        

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#888"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholderTextColor="#888"
                        />
                    </View>

                    {/* Sign up button */}
                    <TouchableOpacity style={styles.signInButton} onPress={handleSignUp}>
                        <Text style={styles.signInButtonText}>Sign Up</Text>
                    </TouchableOpacity>

                    {/* Have an account button */}
                    <TouchableOpacity
                        style={styles.createAccountButton}
                        onPress={() => navigation && navigation.navigate('Login')}
                    >
                        <Text style={styles.createAccountText}>Have an Account? Sign In</Text>
                    </TouchableOpacity>

                    {/* Social login section */}
                    <View style={styles.socialLoginContainer}>
                        <Text style={styles.orText}>Or continue with</Text>

                        <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialButtonText}>G</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialButtonText}>𝍎</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialButtonText}>f</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#2942D8', // Royal blue color for the header
        marginBottom: 16,
        textAlign: 'center',
    },
    subheader: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        color: '#333',
        lineHeight: 22,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#F0F4FC',
        width: '100%',
        height: 55,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    forgotPasswordContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#2942D8',
        fontSize: 14,
    },
    signInButton: {
        backgroundColor: '#2942D8',
        width: '100%',
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    signInButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    createAccountButton: {
        width: '100%',
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    createAccountText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    socialLoginContainer: {
        width: '100%',
        alignItems: 'center',
    },
    orText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#ECECEC',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    socialButtonText: {
        fontSize: 24,
        color: '#333',
    },
});

export default SignUp;
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

const UserProfile = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Mock user posts
    const userPosts = [
        { id: 1, title: 'Campus Tour Experience', date: 'May 15, 2025', category: 'Club Activities' },
        { id: 2, title: 'My Research Project', date: 'May 10, 2025', category: 'Teachers Opinions' },
        { id: 3, title: 'Lost Blue Notebook', date: 'May 5, 2025', category: 'Lost & Found' },
    ];

    useEffect(() => {
        // Get current user from Firebase
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser({
                uid: currentUser.uid,
                displayName: currentUser.displayName || 'User',
                email: currentUser.email,
                photoURL: currentUser.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
                joinDate: 'May, 2025', // In a real app, this would be stored in user metadata
                role: 'Student' // In a real app, this would be stored in user metadata
            });
        }
        setLoading(false);
    }, []);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            navigation.replace('Login');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const handleChangeProfilePicture = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change your profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setUploadingImage(true);

                // In a real app, you would upload this image to Firebase Storage
                // and then update the user profile with the new URL

                // For demo purposes, we'll just simulate a delay and update the local state
                setTimeout(() => {
                    const newUser = { ...user, photoURL: result.assets[0].uri };
                    setUser(newUser);

                    // Update Firebase profile (note: this won't actually store the image)
                    updateProfile(auth.currentUser, {
                        photoURL: result.assets[0].uri
                    }).catch((error) => {
                        console.error("Error updating profile:", error);
                        Alert.alert("Error", "Failed to update profile picture");
                    });

                    setUploadingImage(false);
                }, 1500);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            setUploadingImage(false);
            Alert.alert("Error", "Failed to change profile picture");
        }
    };

    const handleSwitchAccount = () => {
        Alert.alert(
            'Switch Account',
            'Do you want to sign out and sign in with a different account?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Switch',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            navigation.replace('Login');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to sign out. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleViewMyPosts = () => {
        // In a real app, navigate to a filtered view of posts by this user
        Alert.alert('My Posts', 'This would navigate to a list of your posts.');
        // navigation.navigate('MyPosts', { userId: user.uid });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2942D8" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.notSignedInContainer}>
                <Text style={styles.notSignedInText}>
                    You're not signed in
                </Text>
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.replace('Login')}
                >
                    <Text style={styles.loginButtonText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Profile Header Section */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileImageContainer}>
                        {uploadingImage ? (
                            <ActivityIndicator size="large" color="#2942D8" style={styles.uploadingIndicator} />
                        ) : (
                            <Image
                                source={{ uri: user.photoURL }}
                                style={styles.profileImage}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.changePhotoButton}
                            onPress={handleChangeProfilePicture}
                        >
                            <MaterialIcons name="photo-camera" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>{user.displayName}</Text>
                    <Text style={styles.userRole}>{user.role}</Text>
                </View>

                {/* User Info Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="person" size={22} color="#c3d037" />
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user.email}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Member Since</Text>
                        <Text style={styles.infoValue}>{user.joinDate}</Text>
                    </View>
                </View>

                {/* My Posts Preview */}
                {/* <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="article" size={22} color="#c3d037" />
                        <Text style={styles.sectionTitle}>My Posts</Text>
                    </View>

                    {userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <View key={post.id} style={styles.postItem}>
                                <View style={styles.postDetails}>
                                    <Text style={styles.postTitle}>{post.title}</Text>
                                    <View style={styles.postMeta}>
                                        <Text style={styles.postDate}>{post.date}</Text>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>{post.category}</Text>
                                        </View>
                                    </View>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color="#999" />
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noPosts}>
                            You haven't created any posts yet.
                        </Text>
                    )}

                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={handleViewMyPosts}
                    >
                        <Text style={styles.viewAllText}>View All My Posts</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#2942D8" />
                    </TouchableOpacity>
                </View> */}

                {/* Account Actions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="settings" size={22} color="##c3d037" />
                        <Text style={styles.sectionTitle}>Account</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.accountAction}
                        onPress={handleSwitchAccount}
                    >
                        <MaterialIcons name="swap-horiz" size={24} color="#555" />
                        <Text style={styles.accountActionText}>Switch Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.accountAction}
                        onPress={handleLogout}
                    >
                        <MaterialIcons name="logout" size={24} color="#E53935" />
                        <Text style={[styles.accountActionText, styles.logoutText]}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomTabBar}>
                <TouchableOpacity onPress={() => navigation.navigate('HomePage')}>
                    <Ionicons name="home-outline" size={24} color="#555" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
                    <Ionicons name="add-circle-outline" size={28} color="#1976D2" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                    <MaterialIcons name="category" size={24} color="#555" />
                </TouchableOpacity>



                <TouchableOpacity>
                    <Ionicons name="person" size={24} color="#2942D8" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    loadingText: {
        marginTop: 10,
        color: '#555',
        fontSize: 16,
    },
    notSignedInContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    notSignedInText: {
        fontSize: 18,
        color: '#555',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#c3d037',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: '#445b64',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 6,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    scrollView: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#c3d037',
    },
    uploadingIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#c3d037',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 16,
        color: '#777',
    },
    section: {
        backgroundColor: 'white',
        marginTop: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    infoItem: {
        marginBottom: 14,
    },
    infoLabel: {
        fontSize: 14,
        color: '#777',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
    },
    postItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    postDetails: {
        flex: 1,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    postMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postDate: {
        fontSize: 13,
        color: '#777',
        marginRight: 8,
    },
    categoryBadge: {
        backgroundColor: '#f0f7ff',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 12,
        color: '#2942D8',
    },
    noPosts: {
        marginTop: 10,
        marginBottom: 10,
        color: '#777',
        textAlign: 'center',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    viewAllText: {
        color: '#c3d037',
        fontSize: 16,
        fontWeight: '500',
        marginRight: 6,
    },
    accountAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    accountActionText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#333',
    },
    logoutText: {
        color: '#E53935',
    },
    bottomTabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        elevation: 5,
    },
});

export default UserProfile;
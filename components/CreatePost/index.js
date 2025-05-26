import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const CreatePost = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Notices');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [user, setUser] = useState(null);

    // Effect hook to check and update user authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // Clean up the listener when component unmounts
        return () => unsubscribe();
    }, []);

    // Categories available for posts
    const categories = [
        'Notices',
        'Club Activities',
        'Lost & Found',
        'Teachers Opinions',
        'FAQs'
    ];

    // Function to handle image URL input
    const handleImageUrlInput = (url) => {
        setImageUrl(url);
    };

    // Function to handle form submission
    const handleSubmit = async () => {
        // Validate form
        if (!title.trim()) {
            Alert.alert('Error', 'Title is required');
            return;
        }

        if (!content.trim()) {
            Alert.alert('Error', 'Content is required');
            return;
        }

        try {
            const currentUser = auth.currentUser;
            const uniqueId = 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            const post = {
                id: uniqueId, // Custom ID that will be stored in the document
                title,
                category,
                caption: content, // Storing content as caption to match the existing structure
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
                authorId: currentUser?.uid || 'anonymous',
                authorName: currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Anonymous User'),
                authorProfileImage: currentUser?.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
                createdAt: new Date(),
                likesCount: 0,
                commentsCount: 0,
                shareCount: 0,
                Comments: []
            };

            // Add the post to Firestore in the "post" subcollection
            const postRef = collection(db, 'posts', 'main', 'post');
            await addDoc(postRef, post);

            Alert.alert(
                'Post Created!',
                'Your post has been created successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('HomePage')
                    }
                ]
            );
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post. Please try again later.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Post</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
                <Text style={styles.formTitle}>Create a New Post</Text>

                {/* Title Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter post title"
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Category Selector */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity
                        style={styles.categoryPicker}
                        onPress={() => setIsPickerVisible(!isPickerVisible)}
                    >
                        <Text style={styles.categoryText}>{category}</Text>
                        <Ionicons name="chevron-down" size={20} color="#555" />
                    </TouchableOpacity>

                    {isPickerVisible && (
                        <View style={styles.pickerContainer}>
                            {categories.map((cat, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.categoryOption,
                                        category === cat && styles.selectedCategory
                                    ]}
                                    onPress={() => {
                                        setCategory(cat);
                                        setIsPickerVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.categoryOptionText,
                                        category === cat && styles.selectedCategoryText
                                    ]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Image URL Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Post Image URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter image URL"
                        value={imageUrl}
                        onChangeText={handleImageUrlInput}
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Content Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Content</Text>
                    <TextInput
                        style={styles.contentInput}
                        placeholder="Write your post content here"
                        value={content}
                        onChangeText={setContent}
                        multiline={true}
                        numberOfLines={6}
                        textAlignVertical="top"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitButtonText}>Create Post</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
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
    formContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
    },
    categoryPicker: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 16,
        color: '#333',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginTop: 5,
        overflow: 'hidden',
    },
    categoryOption: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedCategory: {
        backgroundColor: '#f0f7ff',
    },
    selectedCategoryText: {
        color: '#2942D8',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#c3d037',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreatePost;
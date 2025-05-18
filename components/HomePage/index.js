import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Sample post data with images
const posts = [
    {
        id: 1,
        author: 'University Admin',
        authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        title: 'Important Notice for CSE Students',
        category: 'Notices',
        date: 'May 17, 2025',
        time: '2 hours ago',
        imageUrl: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        content: 'All CSE students must attend the workshop on AI tomorrow. The session will be held in Lab-301 at 10:00 AM.',
        likes: 24,
        comments: [
            { id: 1, author: 'John', text: 'Will there be a certificate?', time: '1h ago' },
            { id: 2, author: 'Sarah', text: 'Is attendance mandatory?', time: '30m ago' }
        ],
    },
    {
        id: 2,
        author: 'Debate Club',
        authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        title: 'Inter-University Debate Competition',
        category: 'Club Activities',
        date: 'May 16, 2025',
        time: '5 hours ago',
        imageUrl: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80',
        content: 'The debate club will host a workshop in room 301. All interested students can join. Registration is open until tomorrow.',
        likes: 13,
        comments: [
            { id: 1, author: 'Mike', text: 'Looking forward to it!', time: '3h ago' }
        ],
    },
    {
        id: 3,
        author: 'Student Council',
        authorAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        title: 'Lost ID Card Found',
        category: 'Lost & Found',
        date: 'May 15, 2025',
        time: '1 day ago',
        imageUrl: 'https://images.unsplash.com/photo-1586077427825-2c834b5f9c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80',
        content: 'Found a Leading University ID card near D-block. If you lost your ID, please contact the Student Affairs Office.',
        likes: 9,
        comments: [],
    },
    {
        id: 4,
        author: 'Dr. Rahman',
        authorAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        title: 'The Importance of Research',
        category: 'Teachers Opinions',
        date: 'May 14, 2025',
        time: '2 days ago',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
        content: 'Research is an essential part of academic growth. I encourage all final year students to engage in research activities.',
        likes: 31,
        comments: [
            { id: 1, author: 'Lisa', text: 'Thank you for the motivation!', time: '1d ago' },
            { id: 2, author: 'Kevin', text: 'Can you suggest some research topics?', time: '12h ago' }
        ],
    },
    {
        id: 5,
        author: 'Academic Affairs',
        authorAvatar: 'https://randomuser.me/api/portraits/women/28.jpg',
        title: 'Summer Course Registration',
        category: 'FAQs',
        date: 'May 13, 2025',
        time: '3 days ago',
        imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        content: 'Summer course registration starts next week. Check the university portal for eligibility and available courses.',
        likes: 18,
        comments: [
            { id: 1, author: 'Daniel', text: 'When is the payment deadline?', time: '2d ago' }
        ],
    },
];

const HomePage = ({ navigation, route }) => {
    const [likedPosts, setLikedPosts] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [showComments, setShowComments] = useState({});

    const handleLike = (postId) => {
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleCommentChange = (postId, text) => {
        setCommentInputs(prev => ({
            ...prev,
            [postId]: text
        }));
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const submitComment = (postId) => {
        if (!commentInputs[postId]?.trim()) return;
        alert('Comment posted: ' + commentInputs[postId]);
        setCommentInputs(prev => ({
            ...prev,
            [postId]: ''
        }));
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.replace('Login');
        } catch (error) {
            alert('Failed to log out. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <View style={styles.header}>
                <Text style={styles.title}>LUFeed</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
                    <MaterialIcons name="logout" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <Text style={styles.welcome}>Welcome, User!</Text>

            <ScrollView contentContainerStyle={styles.feed}>
                {posts.map(post => (
                    <View key={post.id} style={styles.postCard}>
                        <View style={styles.postHeader}>
                            <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
                            <View style={styles.postHeaderInfo}>
                                <Text style={styles.postAuthor}>{post.author}</Text>
                                <Text style={styles.postMeta}>{post.time} • {post.category}</Text>
                            </View>
                        </View>

                        <Text style={styles.postTitle}>{post.title}</Text>
                        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                        <Text style={styles.content}>{post.content}</Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleLike(post.id)}
                            >
                                <Ionicons
                                    name={likedPosts[post.id] ? "heart" : "heart-outline"}
                                    size={24}
                                    color={likedPosts[post.id] ? "#E53935" : "#555"}
                                />
                                <Text style={styles.actionText}>
                                    {likedPosts[post.id] ? post.likes + 1 : post.likes} Likes
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => toggleComments(post.id)}
                            >
                                <Ionicons name="chatbubble-outline" size={22} color="#555" />
                                <Text style={styles.actionText}>
                                    {post.comments.length} Comments
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showComments[post.id] && (
                            <View style={styles.commentsSection}>
                                {post.comments.map(comment => (
                                    <View key={comment.id} style={styles.commentItem}>
                                        <Text style={styles.commentAuthor}>{comment.author}:</Text>
                                        <Text style={styles.commentText}>{comment.text}</Text>
                                        <Text style={styles.commentTime}>{comment.time}</Text>
                                    </View>
                                ))}
                                <TextInput
                                    placeholder="Add a comment..."
                                    value={commentInputs[post.id] || ''}
                                    onChangeText={text => handleCommentChange(post.id, text)}
                                    style={styles.commentInput}
                                />
                                <TouchableOpacity onPress={() => submitComment(post.id)} style={styles.postCommentBtn}>
                                    <Text style={styles.postCommentText}>Post</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
            <View style={styles.bottomTabBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Ionicons name="home" size={24} color="black" />
                </TouchableOpacity>
               
                <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
                    <Ionicons name="add-circle-outline" size={28} color="#1976D2" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4' },
    header: {
        backgroundColor: '#1976D2',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
    },
    title: { fontSize: 24, color: 'white', fontWeight: 'bold' },
    logoutIcon: { padding: 5 },
    welcome: {
        fontSize: 16,
        padding: 10,
        textAlign: 'center',
        fontWeight: '500',
    },
    feed: { paddingBottom: 20 },
    postCard: {
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    authorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    postHeaderInfo: {},
    postAuthor: { fontWeight: 'bold', fontSize: 14 },
    postMeta: { fontSize: 12, color: '#777' },
    postTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    postImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
    content: { fontSize: 14, marginBottom: 10 },
    actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },
    actionButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    actionText: { fontSize: 14, marginLeft: 5 },
    commentsSection: { marginTop: 10 },
    commentItem: { marginBottom: 5 },
    commentAuthor: { fontWeight: 'bold' },
    commentText: { fontSize: 14 },
    commentTime: { fontSize: 12, color: '#999' },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginTop: 5,
        backgroundColor: '#f9f9f9',
    },
    postCommentBtn: {
        marginTop: 5,
        alignSelf: 'flex-end',
        backgroundColor: '#1976D2',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    postCommentText: { color: 'white', fontWeight: 'bold' },
    bottomTabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
    },

});

export default HomePage;
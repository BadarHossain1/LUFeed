// Importing necessary React components and hooks
import React, { useEffect, useState } from 'react';
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
    ActivityIndicator,
} from 'react-native';
// Importing Firebase authentication functions
import { signOut, onAuthStateChanged } from 'firebase/auth';
// Importing Firebase references from the app's configuration file
import { auth, db } from '../../firebaseConfig';
// Importing icon libraries for UI elements
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// Importing Tailwind CSS for React Native
import tw from 'twrnc';
// Importing Firestore functions for database operations
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, increment } from 'firebase/firestore';


// Main HomePage component definition, receiving navigation and route props from React Navigation
const HomePage = ({ navigation, route }) => {

    // Extract category filter from route params if provided
    const selectedCategory = route.params?.selectedCategory;
    const filterByCategory = route.params?.filterByCategory;
    // State for the current authenticated user
    const [user, setUser] = useState(null);
    // State to track which posts the user has liked (object with post IDs as keys)
    const [likedPosts, setLikedPosts] = useState({});
    // State for comment input fields (object with post IDs as keys and input text as values)
    const [commentInputs, setCommentInputs] = useState({});
    // State to track which posts have their comments section expanded
    const [showComments, setShowComments] = useState({});
    // State for storing all posts data fetched from Firebase or demo data
    const [posts, setPosts] = useState([]);
    // State to track loading status during data fetching
    const [loading, setLoading] = useState(true);

    // Helper function to format timestamps into readable relative time strings
    const formatTimestamp = (timestamp) => {
        // If there's no timestamp, return empty string
        if (!timestamp) return '';

        // Get current date
        const now = new Date();
        // Convert Firebase timestamp to JavaScript Date object if needed
        const postDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        // Calculate difference in minutes between now and post date
        const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

        // Return appropriate time string based on the time difference
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

        // Calculate difference in hours
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

        // Calculate difference in days
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

        // If more than a week, show the actual date
        return postDate.toLocaleDateString();
    };

    // Effect hook to check and update user authentication state
    useEffect(() => {
        // Set up a Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Update user state when auth state changes
            setUser(currentUser);
        });

        // Clean up the listener when component unmounts
        return () => unsubscribe();
    }, []);

    // Effect hook to fetch posts data (currently using demo data)
    useEffect(() => {
        const getData = async () => {
            // Set loading state to true while fetching data
            setLoading(true);
            try {
                const fetchedPosts = [];

                // Fetch posts from the "post" subcollection
                const postRef = collection(db, 'posts', 'main', 'post');
                const postSnapshot = await getDocs(postRef);
                for (const doc of postSnapshot.docs) {
                    const postData = doc.data();
                    const postId = doc.id;

                    // Fetch comments for the post
                    const commentsRef = collection(db, 'comments');
                    const commentsQuery = query(commentsRef, where('postId', '==', postId), orderBy('createdAt'));
                    const commentsSnapshot = await getDocs(commentsQuery);
                    const comments = commentsSnapshot.docs.map(commentDoc => commentDoc.data());

                    fetchedPosts.push({
                        id: postId,
                        ...postData,
                        Comments: comments,
                    });
                }

                // Fetch shared posts from the "sharedPost" subcollection
                const sharedPostRef = collection(db, 'posts', 'main', 'sharedPost');
                const sharedPostSnapshot = await getDocs(sharedPostRef);
                sharedPostSnapshot.docs.forEach(doc => {
                    fetchedPosts.push({ id: doc.id, ...doc.data() });
                });                // Sort posts: shared posts first, then by createdAt timestamp (newest first)
                fetchedPosts.sort((a, b) => {
                    // First prioritize shared posts
                    if (a.isShared && !b.isShared) return -1;
                    if (!a.isShared && b.isShared) return 1;
                    // Then sort by timestamp for posts of the same type (shared or normal)
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Error fetching posts:', error);
                alert('Failed to load posts. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        // Call the getData function when component mounts
        getData();
    }, []); // Empty dependency array means this runs once on component mount



    // Handle post like action
    const handleLike = async (postId) => {
        if (!user) {
            alert('Please log in to like posts.');
            return;
        }

        try {
            const likesRef = collection(db, 'likes');
            const userLikeQuery = query(likesRef, where('postId', '==', postId), where('userId', '==', user.uid));
            const userLikeSnapshot = await getDocs(userLikeQuery);

            if (!userLikeSnapshot.empty) {
                // Unlike the post
                const likeDocId = userLikeSnapshot.docs[0].id;
                await updateDoc(doc(db, 'likes', likeDocId), { deleted: true });                // Update the post's likesCount in local state and maintain sorting
                setPosts(prevPosts => {
                    const updatedPosts = prevPosts.map(post => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                likesCount: Math.max(0, (post.likesCount || 0) - 1)
                            };
                        }
                        return post;
                    });
                    return updatedPosts.sort((a, b) => {
                        // First prioritize shared posts
                        if (a.isShared && !b.isShared) return -1;
                        if (!a.isShared && b.isShared) return 1;
                        // Then sort by timestamp for posts of the same type
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                });
            } else {
                // Like the post
                // Generate a unique ID for the like
                const likeId = `like_${postId}_${user.uid}_${Date.now()}`;

                await addDoc(likesRef, {
                    id: likeId,
                    postId,
                    userId: user.uid,
                    createdAt: new Date(),
                });                // Update the post's likesCount in local state and maintain sorting
                setPosts(prevPosts => {
                    const updatedPosts = prevPosts.map(post => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                likesCount: (post.likesCount || 0) + 1
                            };
                        }
                        return post;
                    });
                    return updatedPosts.sort((a, b) => {
                        // First prioritize shared posts
                        if (a.isShared && !b.isShared) return -1;
                        if (!a.isShared && b.isShared) return 1;
                        // Then sort by timestamp for posts of the same type
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                });
            }

            // Update local state for visual feedback
            setLikedPosts(prev => ({
                ...prev,
                [postId]: !prev[postId],
            }));
        } catch (error) {
            console.error('Error updating like:', error);
            alert('Failed to update like. Please try again later.');
        }
    };

    // Handle post share functionality
    const handleShare = async (post) => {
        const postToShare = post.isShared ? post.originalPost : post;

        // Validate required fields
        if (!postToShare.title || !postToShare.imageUrl || !postToShare.caption) {
            alert('Cannot share this post. Missing required fields.');
            return;
        }

        // Generate a unique ID for the shared post that includes the original post's ID
        const uniqueId = `shared_${postToShare.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        const sharedPost = {
            id: uniqueId,
            authorId: user?.uid || 'guest-user',
            authorName: user?.displayName || user?.email?.split('@')[0] || 'Guest User',
            authorProfileImage: user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
            title: postToShare.title,
            caption: 'Shared this post with you!',
            imageUrl: postToShare.imageUrl,
            category: postToShare.category,
            createdAt: new Date(),
            likesCount: 0,
            commentsCount: 0,
            shareCount: 0,
            isShared: true,
            sharedById: user?.uid || 'guest-user',
            sharedByName: user?.displayName || user?.email?.split('@')[0] || 'Guest User',
            sharedProfileImage: user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
            sharedAt: new Date(),
            originalPost: {
                id: postToShare.id,
                authorId: postToShare.authorId,
                authorName: postToShare.authorName,
                authorProfileImage: postToShare.authorProfileImage,
                title: postToShare.title,
                caption: postToShare.caption,
                imageUrl: postToShare.imageUrl,
                category: postToShare.category,
                createdAt: postToShare.createdAt,
            },
            Comments: [],
        };

        try {
            const sharedPostRef = collection(db, 'posts', 'main', 'sharedPost');
            await addDoc(sharedPostRef, sharedPost);            // Add the new post and sort: shared posts first, then by timestamp
            setPosts(prevPosts => {
                const updatedPosts = [...prevPosts, sharedPost];
                return updatedPosts.sort((a, b) => {
                    // First prioritize shared posts
                    if (a.isShared && !b.isShared) return -1;
                    if (!a.isShared && b.isShared) return 1;
                    // Then sort by timestamp for posts of the same type (shared or normal)
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
            });
            alert('Post shared successfully!');
        } catch (error) {
            console.error('Error sharing post:', error);
            alert('Failed to share post. Please try again later.');
        }
    };

    // Handle comment input text changes
    const handleCommentChange = (postId, text) => {
        // Update the comment text for the specific post in state
        setCommentInputs(prev => ({
            ...prev,
            [postId]: text
        }));
    };

    // Toggle comments visibility for a post
    const toggleComments = (postId) => {
        // Flip the visibility state for this specific post's comments
        setShowComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));

        // In a real app, this might also fetch comments from Firestore when opening
        // const fetchComments = async () => {
        //   const commentsRef = collection(db, "comments");
        //   const q = query(commentsRef, where("postId", "==", postId), orderBy("createdAt"));
        //   const snapshot = await getDocs(q);
        //   const commentsList = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        //   // Update post with fetched comments
        // }
    };

    // Handle comment submission
    const submitComment = async (postId) => {
        // Check if comment text exists and isn't just whitespace
        if (!commentInputs[postId]?.trim()) return;

        try {
            // Generate a unique ID for the comment
            const commentId = `comment_${postId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const commentData = {
                id: commentId,
                postId,
                authorId: user.uid,
                authorName: user.displayName || user.email.split('@')[0],
                text: commentInputs[postId],
                createdAt: new Date(),
            };

            const commentsRef = collection(db, 'comments');
            await addDoc(commentsRef, commentData);            // Update local state with the full comment object and maintain sorting
            setPosts(prevPosts => {
                const updatedPosts = prevPosts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            Comments: [...post.Comments, commentData],
                            commentsCount: (post.commentsCount || 0) + 1
                        };
                    }
                    return post;
                });
                return updatedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            });

            setCommentInputs(prev => ({
                ...prev,
                [postId]: '',
            }));
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Failed to submit comment. Please try again later.');
        }
    };

    // Handle user logout
    const handleLogout = async () => {
        try {
            // Sign out the user using Firebase auth
            await signOut(auth);
            // Navigate to the Login screen after successful logout
            navigation.replace('Login');
        } catch (error) {
            alert('Failed to log out. Please try again.');
        }
    };

    // Handle login button press
    const handleLoginPress = () => {
        // Navigate to the Login screen
        navigation.navigate('Login');
    };

    // Render the component UI
    return (
        // KeyboardAvoidingView adjusts layout when keyboard appears
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            {/* App header with title and login/logout button */}
            <View style={styles.header}>
                <Text style={styles.title}>LUFeed</Text>
                {/* Conditionally render logout or login button based on authentication state */}
                {user ? (
                    <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
                        <MaterialIcons name="logout" size={24} color="white" />
                    </TouchableOpacity>) : (
                    <TouchableOpacity onPress={handleLoginPress} style={styles.loginButton}>
                        <MaterialIcons name="login" size={24} color="white" />
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Welcome message with user name or guest */}
            <Text style={styles.welcome}>
                {user ? `Welcome, ${user.displayName || user.email.split('@')[0] || 'User'}!` : 'Welcome, Guest!'}
            </Text>

            {/* Category filter header - only shown when a category is selected */}
            {selectedCategory && filterByCategory && (
                <View style={styles.categoryFilterHeader}>
                    <Text style={styles.categoryFilterText}>
                        Showing posts in "{selectedCategory}"
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.setParams({ selectedCategory: null, filterByCategory: false })}
                        style={styles.clearFilterButton}
                    >
                        <Text style={styles.clearFilterText}>Clear Filter</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Show loading indicator when fetching posts, otherwise show the posts feed */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#445b64" />
                    <Text style={styles.loadingText}>Loading posts...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.feed}>
                    {/* Filter posts by category if needed, then map through posts array */}
                    {posts
                        .filter(post => !filterByCategory || post.category === selectedCategory)
                        .map(post => (
                            <View key={post.id} style={styles.postCard}>
                                {/* If it's a shared post, show who shared it */}
                                {post.isShared && (
                                    <View style={styles.sharedPostHeader}>
                                        {/* Profile image of user who shared */}
                                        <Image source={{ uri: post.sharedProfileImage }} style={styles.smallAvatar} />
                                        <View style={styles.sharedPostInfo}>
                                            {/* Show sharer's name */}
                                            <Text style={styles.sharedByText}>
                                                <Text style={styles.sharedByName}>{post.sharedByName}</Text> shared this post
                                            </Text>
                                            {/* Show when it was shared */}
                                            <Text style={styles.sharedTimeText}>{formatTimestamp(post.sharedAt)}</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Post content (either original or shared post content) */}
                                <View style={post.isShared ? styles.originalPostContent : styles.postContent}>
                                    <View style={styles.postHeader}>
                                        {/* Author profile image */}
                                        <Image
                                            source={{ uri: post.isShared ? post.originalPost.authorProfileImage : post.authorProfileImage }}
                                            style={styles.authorAvatar}
                                        />
                                        <View style={styles.postHeaderInfo}>
                                            {/* Author name */}
                                            <Text style={styles.postAuthor}>
                                                {post.isShared ? post.originalPost.authorName : post.authorName}
                                            </Text>
                                            {/* Post metadata: category and timestamp */}
                                            <Text style={styles.postMeta}>
                                                {post.isShared ? post.originalPost.category : post.category} • {' '}
                                                {post.isShared ? formatTimestamp(post.originalPost.createdAt) : formatTimestamp(post.createdAt)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Post title */}
                                    <Text style={styles.postTitle}>
                                        {post.isShared ? post.originalPost.title : post.title}
                                    </Text>

                                    {/* Post image */}
                                    <Image
                                        source={{ uri: post.isShared ? post.originalPost.imageUrl : post.imageUrl }}
                                        style={styles.postImage}
                                    />

                                    {/* Post caption/content */}
                                    <Text style={styles.content}>
                                        {post.isShared ? post.originalPost.caption : post.caption}
                                    </Text>
                                </View>

                                {/* Shared caption - displayed outside the original post box */}
                                {post.isShared && !post.caption.includes("Shared this post with you!") && (
                                    <Text style={styles.sharedCaption}>{post.caption}</Text>
                                )}

                                {/* Post action buttons: like, comment, share */}
                                <View style={styles.actionButtons}>                                    {/* Like button */}
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleLike(post.id)}
                                    >
                                        {/* Change icon based on whether user liked the post */}
                                        <Ionicons
                                            name={likedPosts[post.id] ? "heart" : "heart-outline"}
                                            size={24}
                                            color={likedPosts[post.id] ? "#E53935" : "#555"}
                                        />
                                    </TouchableOpacity>

                                    {/* Comment button */}
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => toggleComments(post.id)}
                                    >
                                        <Ionicons name="chatbubble-outline" size={22} color="#555" />
                                        <Text style={styles.actionText}>
                                            {post.commentsCount}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Share button */}
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleShare(post)}
                                    >
                                        <Ionicons name="share-social-outline" size={22} color="#555" />
                                        <Text style={styles.actionText}>
                                            {post.shareCount}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Comments section - only visible when expanded */}
                                {showComments[post.id] && (
                                    <View style={styles.commentsSection}>
                                        {/* Map through comments and display them */}
                                        {post.Comments.map((comment, index) => (
                                            <View key={index} style={styles.commentItem}>
                                                <Text style={styles.commentAuthor}>
                                                    {comment.authorName || 'Anonymous'}: <Text style={styles.commentText}>{comment.text || comment}</Text>
                                                </Text>
                                            </View>
                                        ))}
                                        {/* Comment input field */}
                                        <TextInput
                                            placeholder="Add a comment..."
                                            value={commentInputs[post.id] || ''}
                                            onChangeText={text => handleCommentChange(post.id, text)}
                                            style={styles.commentInput}
                                        />
                                        {/* Submit comment button */}
                                        <TouchableOpacity onPress={() => submitComment(post.id)} style={styles.postCommentBtn}>
                                            <Text style={styles.postCommentText}>Post</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}
                </ScrollView>
            )}

            {/* Bottom navigation tab bar */}
            <View style={styles.bottomTabBar}>
                {/* Home tab */}
                <TouchableOpacity onPress={() => navigation.navigate('HomePage')}>
                    <Ionicons name="home" size={24} color="black" />
                </TouchableOpacity>

                {/* Create post tab */}
                <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
                    <Ionicons name="add-circle-outline" size={28} color="#1976D2" />
                </TouchableOpacity>

                {/* Categories tab */}
                <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                    <MaterialIcons name="category" size={24} color="black" />
                </TouchableOpacity>

                {/* User profile tab */}
                <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
                    <Ionicons name="person-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

// StyleSheet to define all the component styles
const styles = StyleSheet.create({
    // Container for the entire screen, fills the available space with light background
    container: { flex: 1, backgroundColor: '#f4f4f4' },

    // Header bar styling with dark teal background
    header: {
        backgroundColor: '#445b64',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50, // Extra padding for status bar
        paddingBottom: 10,
    },

    // App title in the header
    title: { fontSize: 24, color: 'white', fontWeight: 'bold' },

    // Button in the header (logout button)
    headerButton: { padding: 5 },

    // Login button styling with yellow-green background
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#c3d037',
        padding: 8,
        borderRadius: 8,
    },

    // Text inside login button
    loginButtonText: {
        color: 'white',
        marginLeft: 5,
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Logout icon styling
    logoutIcon: { padding: 5 },

    // Container for the loading indicator
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },

    // Text below the loading spinner
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },

    // Welcome message styling
    welcome: {
        fontSize: 18,
        padding: 10,
        textAlign: 'center',
        fontWeight: '600',
        color: '#445b64',
        marginTop: 5,
        marginBottom: 5,
    },

    // Header for category filter information
    categoryFilterHeader: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#fffefe',
        marginHorizontal: 10,
        marginBottom: 10,
        borderRadius: 8,
    },

    // Text showing which category is selected
    categoryFilterText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },

    // Button to clear category filter
    clearFilterButton: {
        backgroundColor: '#c3d037',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 5,
    },

    // Text in clear filter button
    clearFilterText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },

    // Container for the feed of posts
    feed: { paddingBottom: 20 },

    // Individual post card styling
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
        marginBottom: 50

    },

    // Post header with author info
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },

    // Author avatar image
    authorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },

    // Container for post header text information
    postHeaderInfo: { flex: 1 },

    // Author name text
    postAuthor: { fontWeight: 'bold', fontSize: 14 },

    // Post metadata text (category, time)
    postMeta: { fontSize: 12, color: '#777', marginTop: 2 },

    // Container for shared post information
    sharedInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#f0f8ff',
        padding: 8,
        borderRadius: 4,
    },

    // Text showing share information
    sharedInfoText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 5
    },

    // Post title text
    postTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },

    // Post image styling
    postImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },

    // Post content/caption text
    content: { fontSize: 14, marginBottom: 10 },

    // Container for action buttons (like, comment, share)
    actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },

    // Individual action button
    actionButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },

    // Text in action buttons (counts)
    actionText: { fontSize: 14, marginLeft: 5 },

    // Comments section container
    commentsSection: { marginTop: 10 },

    // Individual comment item
    commentItem: {
        marginBottom: 8,
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 8,
    },

    // Comment author name
    commentAuthor: { fontWeight: 'bold', fontSize: 13 },

    // Comment text content
    commentText: {
        fontWeight: 'normal',
        fontSize: 13,
        color: '#333'
    },

    // Comment timestamp
    commentTime: { fontSize: 12, color: '#999', marginTop: 2 },

    // Input field for new comments
    commentInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginTop: 5,
        backgroundColor: '#f9f9f9',
    },

    // Submit comment button
    postCommentBtn: {
        marginTop: 5,
        alignSelf: 'flex-end',
        backgroundColor: '#1976D2',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },

    // Text in submit comment button
    postCommentText: { color: 'white', fontWeight: 'bold' },

    // Bottom tab navigation bar
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
        zIndex: 1000,
    },

    // Small avatar for shared post headers
    smallAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
    },

    // Header for shared posts
    sharedPostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },

    // Container for shared post text information
    sharedPostInfo: {
        flex: 1,
    },

    // Text showing who shared the post
    sharedByText: {
        fontSize: 13,
        color: '#555',
    },

    // Name of person who shared the post
    sharedByName: {
        fontWeight: 'bold',
        color: '#333',
    },

    // Timestamp for when the post was shared
    sharedTimeText: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },

    // Styling for the original post content in a shared post
    originalPostContent: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eaeaea',
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
    },

    // Caption added by the person who shared the post
    sharedCaption: {
        fontSize: 14,
        color: '#555',
        marginBottom: 12,
        fontStyle: 'italic',
        paddingHorizontal: 5,
    },

    // Base styles for post content (normal, non-shared posts)
    postContent: {
        // Base styles for post content
    },
});

export default HomePage;
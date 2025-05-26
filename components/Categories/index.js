import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const Categories = ({ navigation }) => {
    // Define categories with their icons and colors
    const categoryData = [
        {
            id: 1,
            name: 'Notices',
            icon: <MaterialIcons name="campaign" size={40} color="#E53935" />,
            color: '#FFCDD2',
            description: 'Important announcements and notices from the university'
        },
        {
            id: 2,
            name: 'Club Activities',
            icon: <Ionicons name="people" size={40} color="#1E88E5" />,
            color: '#BBDEFB',
            description: 'Events, meetings and activities from university clubs'
        },
        {
            id: 3,
            name: 'Lost & Found',
            icon: <FontAwesome5 name="search-location" size={36} color="#43A047" />,
            color: '#C8E6C9',
            description: 'Lost or found items within the campus'
        },
        {
            id: 4,
            name: 'Teachers Opinions',
            icon: <Ionicons name="school" size={40} color="#8E24AA" />,
            color: '#E1BEE7',
            description: 'Thoughts, advice and experiences shared by faculty'
        },
        {
            id: 5,
            name: 'FAQs',
            icon: <MaterialIcons name="question-answer" size={40} color="#FB8C00" />,
            color: '#FFE0B2',
            description: 'Common questions and answers about university life'
        }
    ]; const handleCategoryPress = (category) => {
        // Navigate to a filtered view of the home screen with this category
        navigation.navigate('HomePage', {
            selectedCategory: category.name,
            filterByCategory: true
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#445b64" barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Categories</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.subtitle}>Browse posts by category</Text>

                <View style={styles.categoriesContainer}>
                    {categoryData.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={[styles.categoryCard, { backgroundColor: category.color }]}
                            onPress={() => handleCategoryPress(category)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.categoryIcon}>
                                {category.icon}
                            </View>
                            
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <Text style={styles.categoryDescription} numberOfLines={2}>
                                {category.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomTabBar}>
                <TouchableOpacity onPress={() => navigation.navigate('HomePage')}>
                    <Ionicons name="home" size={24} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
                    <Ionicons name="add-circle-outline" size={28} color="#1976D2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                    <MaterialIcons name="category" size={24} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>

                    <Ionicons name="person-outline" size={24} color="black" />
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
    contentContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
        textAlign: 'center',
        lineHeight: 28,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        minHeight: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryIcon: {
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#333',
    },
    categoryDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
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
        zIndex: 999,
    },
});

export default Categories;
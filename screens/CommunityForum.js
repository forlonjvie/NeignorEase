import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const ForumPost = ({ title, content, writer, createdAt, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{title || 'Untitled Post'}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{content || 'No content available.'}</Text>
      <Text style={styles.postMeta}>By {writer} on {new Date(createdAt).toLocaleString()}</Text>
    </View>
  </TouchableOpacity>
);

const CommunityForum = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePosts, setVisiblePosts] = useState(10);
  const [user, setUser] = useState(null);
  const [showNewPostBanner, setShowNewPostBanner] = useState(false);
  const [bannerAnimation] = useState(new Animated.Value(0));

  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
    fetchPosts();
    const intervalId = setInterval(fetchPosts, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const filtered = posts.filter(post => {
      const title = post.title_posts?.toLowerCase() || '';
      const content = post.content?.toLowerCase() || '';
      return title.includes(searchQuery.toLowerCase()) || content.includes(searchQuery.toLowerCase());
    });
    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  const fetchUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchPosts = async () => {
    const postsAPIURL = "https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getPost.php";

    try {
      const response = await fetch(postsAPIURL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const jsonResponse = await response.json();
      if (jsonResponse.Status) {
        const newPosts = jsonResponse.Data;
        setPosts(newPosts);

        if (newPosts.some(post => new Date(post.created_at).getTime() > Date.now() - 10000)) {
          showNewPostBannerAnimation();
        }
      } else {
        Alert.alert(jsonResponse.Message);
      }
    } catch (error) {
      Alert.alert("Error: " + error.message);
    }
  };

  const showNewPostBannerAnimation = () => {
    setShowNewPostBanner(true);
    Animated.timing(bannerAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(bannerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowNewPostBanner(false));
    }, 5000);
  };

  const togglePostsVisibility = () => {
    setVisiblePosts(prevVisible => prevVisible === 10 ? filteredPosts.length : 10);
  };

  const bannerTranslateY = bannerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0]
  });

  return (
    <View style={styles.container}>
      {showNewPostBanner && (
        <Animated.View style={[styles.banner, { transform: [{ translateY: bannerTranslateY }] }]}>
          <Text style={styles.bannerText}>New posts available! 🎉</Text>
        </Animated.View>
      )}

      <TextInput
        style={styles.searchInput}
        placeholder="Search posts..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView style={styles.postsContainer}>
        {filteredPosts.slice(0, visiblePosts).map((post, index) => (
          <ForumPost 
            key={`post_${post.post_id}`} 
            title={post.title_posts} 
            content={post.content} 
            writer={post.HO_username} 
            createdAt={post.created_at}
            onPress={() => navigation.navigate('PostDetail', { postId: post.post_id })}
          />
        ))}
      </ScrollView>

      {filteredPosts.length > 10 && (
        <TouchableOpacity style={styles.toggleButton} onPress={togglePostsVisibility}>
          <Text style={styles.toggleButtonText}>
            {visiblePosts === 10 ? 'Show More' : 'Show Less'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.composeButton}
        onPress={() => navigation.navigate('compose_blog')}
      >
        <Icon name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    paddingTop: 10,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4caf50',
    padding: 12,
    alignItems: 'center',
    zIndex: 1000,
  },
  bannerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 25,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  postContent: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  postMeta: {
    fontSize: 12,
    color: '#888',
  },
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 16,
    backgroundColor: '#007bff',
    borderRadius: 25,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  composeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});

export default CommunityForum;

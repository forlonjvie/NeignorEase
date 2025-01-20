import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Modal, Alert, TouchableOpacity, Image, ActivityIndicator, TextInput, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Maintenance = ({ navigation }) => {
  const [state, setState] = useState({
    username: '',
    posts: [],
    filteredPosts: [],
    selectedPost: null,
    searchQuery: '',
    loading: true,
    refreshing: false,
    error: null
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) throw new Error('Not authenticated');
      const { username } = JSON.parse(userData);
      setState(prev => ({ ...prev, username }));
      fetchPosts(username);
    } catch {
      navigation.replace('Login');
    }
  };

  const fetchPosts = async (username) => {
    try {
      const response = await fetch(
        `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getMaintenanceRequestLog.php?username=${username}`
      );
      const { Status, Data, Message } = await response.json();
      
      if (!Status) throw new Error(Message);
      
      const posts = Data.filter(post => post.status === 'pending');
      setState(prev => ({
        ...prev,
        posts,
        filteredPosts: posts,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  const handleSearch = query => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      filteredPosts: prev.posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase())
      )
    }));
  };

  const handleRefresh = async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    await fetchPosts(state.username);
    setState(prev => ({ ...prev, refreshing: false }));
  };

  if (state.loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {state.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts(state.username)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maintenance Requests</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests..."
          value={state.searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={state.refreshing} onRefresh={handleRefresh} />
        }
      >
        {state.filteredPosts.map((post, index) => (
          <RequestCard
            key={index}
            post={post}
            onPress={() => setState(prev => ({ ...prev, selectedPost: post }))}
          />
        ))}
        
        {state.filteredPosts.length === 0 && (
          <Text style={styles.emptyText}>No maintenance requests found</Text>
        )}
      </ScrollView>

      <DetailModal
        post={state.selectedPost}
        visible={!!state.selectedPost}
        onClose={() => setState(prev => ({ ...prev, selectedPost: null }))}
      />
    </View>
  );
};

const RequestCard = ({ post, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardHeader}>
      <MaterialIcons
        name="error-outline"
        size={24}
        color={post.status === 'pending' ? '#ff6b6b' : '#4caf50'}
      />
      <Text style={styles.cardTitle} numberOfLines={1}>{post.title}</Text>
    </View>
    <Text style={styles.cardDescription} numberOfLines={2}>{post.content}</Text>
    {post.image_url && (
      <Image
        source={{ uri: `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/${post.image_url}` }}
        style={styles.cardImage}
      />
    )}
    <Text style={styles.cardDate}>
      {new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}
    </Text>
  </TouchableOpacity>
);

const DetailModal = ({ post, visible, onClose }) => {
  if (!post) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{post.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {post.image_url && (
            <Image
              source={{ uri: `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/${post.image_url}` }}
              style={styles.modalImage}
              resizeMode="cover"
            />
          )}
          
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalDescription}>{post.content}</Text>
            <Text style={styles.modalDate}>
              Submitted on {new Date(post.created_at).toLocaleString()}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  modalImage: {
    width: '100%',
    height: 240,
  },
  modalScroll: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 32,
  }
});

export default Maintenance;
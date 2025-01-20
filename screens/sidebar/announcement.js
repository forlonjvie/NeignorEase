import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Alert, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Individual Announcement Post Component
const AnnouncementPost = ({ id, title, content, date_time, isOpened, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.postContainer}>
      <View style={styles.postHeader}>
        <MaterialIcons
          name="notifications"
          size={24}
          color={isOpened ? "#a0a0a0" : "#ff6b6b"}
        />
        <Text style={[
          styles.title,
          isOpened ? styles.opened : styles.unopened
        ]}>
          {title}
        </Text>
      </View>
      <View style={styles.postContent}>
        <Text style={styles.description}>
          {content.substring(0, 100)}...
        </Text>
        <Text style={styles.dateTime}>
          {date_time}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Search Bar Component
const SearchBar = ({ onSearch }) => {
  return (
    <View style={styles.searchContainer}>
      <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search announcements..."
        onChangeText={onSearch}
        placeholderTextColor="#999"
      />
    </View>
  );
};

// Announcement Module Component
const Announcement = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [readPosts, setReadPosts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // Filter posts by search query
  const filterPosts = (query) => {
    const searchResults = posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(query.toLowerCase());
      const contentMatch = post.content.toLowerCase().includes(query.toLowerCase());
      return titleMatch || contentMatch;
    });
    setFilteredPosts(searchResults);
    updateDisplayedPosts(searchResults, false);
  };

  // Update displayed posts based on showAll flag
  const updateDisplayedPosts = (postsToDisplay, showAllFlag) => {
    if (showAllFlag) {
      setDisplayedPosts(postsToDisplay);
    } else {
      setDisplayedPosts(postsToDisplay.slice(0, ITEMS_PER_PAGE));
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowAll(false);
    filterPosts(query);
  };

  // Toggle show all/less
  const toggleShowAll = () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);
    updateDisplayedPosts(filteredPosts, newShowAll);
  };

  // Fetch announcements from server
  const fetchAnnouncements = async () => {
    try {
      const LoginAPIURL = "https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getAnnouncement.php";
      const response = await fetch(LoginAPIURL);
      const jsonResponse = await response.json();

      if (jsonResponse.Status) {
        setPosts(jsonResponse.Data);
        setFilteredPosts(jsonResponse.Data);
        updateDisplayedPosts(jsonResponse.Data, false);

        // Load read post status from AsyncStorage
        const storedReadPosts = await AsyncStorage.getItem('readPosts');
        if (storedReadPosts) {
          setReadPosts(JSON.parse(storedReadPosts));
        }
      } else {
        Alert.alert('Error', jsonResponse.Message);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      Alert.alert('Error', 'Unable to fetch announcements');
    }
  };

  // Handle pull to refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setSearchQuery('');
    setShowAll(false);
    fetchAnnouncements().then(() => setRefreshing(false));
  }, []);

  // Mark post as read and open modal
  const handlePostPress = async (post) => {
    const updatedReadPosts = {
      ...readPosts,
      [post.title]: true
    };
    setReadPosts(updatedReadPosts);
    await AsyncStorage.setItem('readPosts', JSON.stringify(updatedReadPosts));
    setSelectedPost(post);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedPost(null);
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {displayedPosts.map((post, index) => (
          <AnnouncementPost
            key={index}
            {...post}
            isOpened={readPosts[post.title] || false}
            onPress={() => handlePostPress(post)}
          />
        ))}
        
        {filteredPosts.length > ITEMS_PER_PAGE && (
          <TouchableOpacity 
            style={styles.showMoreButton} 
            onPress={toggleShowAll}
          >
            <Text style={styles.showMoreButtonText}>
              {showAll ? "Show Less" : `Show More (${filteredPosts.length - ITEMS_PER_PAGE} more)`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Full Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedPost?.title}</Text>
            <ScrollView>
              <Text style={styles.modalDescription}>
                {selectedPost?.content}
              </Text>
              <Text style={styles.modalDateTime}>
                {selectedPost?.date_time}
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  opened: {
    color: '#666',
  },
  unopened: {
    color: '#000',
  },
  postContent: {
    marginLeft: 34,
  },
  description: {
    color: '#666',
    marginBottom: 5,
  },
  dateTime: {
    color: '#999',
    fontSize: 12,
  },
  showMoreButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  showMoreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalDescription: {
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  modalDateTime: {
    color: '#999',
    fontSize: 12,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Announcement;
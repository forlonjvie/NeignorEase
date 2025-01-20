import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const MonthlyDue = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [monthlyDues, setMonthlyDues] = useState([]);
  const [filteredDues, setFilteredDues] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleDues, setVisibleDues] = useState(10);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { username } = JSON.parse(userData);
          setUsername(username);
          fetchMonthlyDue(username);
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error("Failed to get user data:", error);
        navigation.navigate('Login');
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const filtered = monthlyDues.filter(due =>
      due.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      due.year.toString().includes(searchQuery) ||
      due.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDues(filtered);
    setVisibleDues(10);
  }, [searchQuery, monthlyDues]);

  const fetchMonthlyDue = async (username) => {
    try {
      const response = await axios.get(`https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getDueLog.php?username=${username}`);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setMonthlyDues(response.data);
        setFilteredDues(response.data);
      }
    } catch (error) {
      console.error('Error fetching monthly due:', error);
      setError('Failed to fetch monthly due');
    }
  };

  const renderDueItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.infoItem}>
        <Text style={styles.label}>Month:</Text>
        <Text style={styles.value}>{item.month}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.label}>Year:</Text>
        <Text style={styles.value}>{item.year}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.label}>Amount Due:</Text>
        <Text style={styles.value}>Php {item.amount}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{item.status}</Text>
      </View>
    </View>
  );

  const showMoreDues = () => {
    setVisibleDues(prevVisible => prevVisible + 10);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search monthly dues..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.content}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : filteredDues.length > 0 ? (
          <>
            <FlatList
              data={filteredDues.slice(0, visibleDues)}
              renderItem={renderDueItem}
              keyExtractor={(item) => item.md_id.toString()}
            />
            {visibleDues < filteredDues.length && (
              <TouchableOpacity style={styles.showMoreButton} onPress={showMoreDues}>
                <Text style={styles.showMoreButtonText}>Show More</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.loading}>No monthly dues found</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 10,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    color: '#666',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  showMoreButton: {
    backgroundColor: 'rgb(10, 80, 57)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  showMoreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MonthlyDue;

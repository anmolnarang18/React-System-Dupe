import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import {COLORS} from '../../shared/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TEMP_MEMBERS} from '../../shared/Constants';
export default function TaskCreation({navigation}) {
  const [name, setName] = useState({
    isValid: true,
    errMsg: '',
    val: '',
  });

  const [desc, setDesc] = useState({
    isValid: true,
    errMsg: '',
    val: '',
  });

  const [membersList, setMembersList] = useState([]);

  const [createdDate, setCreatedDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [openCDate, setOpenCDate] = useState(false);
  const [openEDate, setOpenEDate] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchMembers();
    }, []),
  );

  const fetchMembers = async () => {
    let list = await AsyncStorage.getItem(TEMP_MEMBERS);
    list = JSON.parse(list);

    const requiredMembers = (list || []).filter(
      e => e.isSelected && e.value > 0,
    );

    setMembersList(requiredMembers);
  };

  const handleBack = async () => {
    navigation.goBack();
    await AsyncStorage.removeItem(TEMP_MEMBERS);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
        }}>
        <Icon
          onPress={handleBack}
          name="arrowleft"
          style={{alignSelf: 'flex-start', fontSize: 30, marginRight: '5%'}}
        />
        <Text style={styles.headerText}>Create New Task</Text>
      </View>
      <View style={styles.box}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Name</Text>
          <TextInput
            value={name.val}
            placeholder="Please enter task name"
            onChangeText={val =>
              setName({
                isValid: true,
                errMsg: '',
                val: val,
              })
            }
            style={styles.input}
          />
          {!name.isValid && <Text style={styles.errText}>{name.errMsg}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Description</Text>
          <TextInput
            value={desc.val}
            placeholder="Please enter task description"
            multiline
            onChangeText={val =>
              setDesc({
                isValid: true,
                errMsg: '',
                val: val,
              })
            }
            style={styles.input}
          />
          {!desc.isValid && <Text style={styles.errText}>{desc.errMsg}</Text>}
        </View>

        <View style={styles.dateContainer}>
          <View>
            <Text
              onPress={() => setOpenCDate(prev => !prev)}
              style={styles.inputText}>
              Created date
            </Text>
            <DatePicker
              modal
              open={openCDate}
              date={createdDate}
              onConfirm={date => {
                console.log('DATE', date);
                setOpenCDate(prev => !prev);
                setCreatedDate(date);
              }}
              onCancel={() => {
                setOpenCDate(prev => !prev);
              }}
            />

            <Text onPress={() => setOpenCDate(true)} style={styles.inputText}>
              {moment(createdDate).format('DD/M/YYYY')}
            </Text>
          </View>

          <View>
            <Text
              onPress={() => setOpenEDate(prev => !prev)}
              style={styles.inputText}>
              Last date
            </Text>
            <DatePicker
              modal
              open={openEDate}
              minimumDate={createdDate}
              date={endDate}
              onConfirm={date => {
                setOpenEDate(prev => !prev);
                setEndDate(date);
              }}
              onCancel={() => {
                setOpenEDate(prev => !prev);
              }}
            />

            <Text onPress={() => setOpenEDate(true)} style={styles.inputText}>
              {moment(endDate).format('DD/M/YYYY')}
            </Text>
          </View>
        </View>

        <View>
          <Text
            onPress={() => navigation.navigate('LIST')}
            style={styles.addText}>
            + Add members
          </Text>
        </View>

        <View>
          {membersList.map(item => (
            <>
              <Text>{item.name}</Text>
              <Text>{item.value}</Text>
            </>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: '5%',
  },
  box: {
    backgroundColor: '#fff',
    paddingVertical: '5%',
    width: '100%',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    display: 'flex',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: '5%',
  },
  dateContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    marginTop: '3%',
  },
  inputContainer: {
    marginTop: '5%',
    marginBottom: '2%',
    width: '100%',
    paddingHorizontal: '5%',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: 'grey',
    borderWidth: 1,
    padding: '2%',
  },
  inputText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: '2%',
  },
  errText: {},
  addText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'red',
    padding: '3%',
    alignSelf: 'flex-end',
  },
});

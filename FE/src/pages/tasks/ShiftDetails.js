import React, {useState} from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import DatePicker from 'react-native-date-picker';
import moment from 'moment';

import {COLORS} from '../../shared/Styles';
import {SHIFT_STATUS, USER_TYPE} from '../../shared/Constants';

import CustomHeader from '../../components/CustomHeader';
import apiClient from '../../api/Api';

import {decideShiftClr, decidingShiftType} from '../../utils/UtilityFuncs';
import CustomButton from '../../components/CustomButton';
import { handleValidation } from '../../utils/Validations';

export default function ShiftDetails({navigation, route}) {
  const {shiftInfo, userInfo, fetchDataWithIndex} = route.params;

  const [desc, setDesc] = useState({
    isValid: true,
    errMsg: '',
    val: shiftInfo.description,
  });

  const [startDate, setStartDate] = useState(new Date(shiftInfo.startDate));
  const [endDate, setEndDate] = useState(new Date(shiftInfo.endDate));
  const [isManager, setIsManager] = useState(
    userInfo.type === USER_TYPE.MANAGER,
  );

  const [openCDate, setOpenCDate] = useState(false);
  const [openEDate, setOpenEDate] = useState(false);

  const calcTime = (startDate,endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);

    const hours = end.diff(start, 'hours');

    return hours;
  };

  const handleSubmit = () => {
    const descValid = handleValidation(desc.val, "STRING", "shift description");
   
    if (!descValid.isValid) {
      setDesc(descValid);
      return;
    }

    apiClient.put('/shift/updateShift',{
      shiftId: shiftInfo._id,
      description: desc.val,
      startDate,
      endDate
    })
    .then(resp => {
      console.log('RESPONSE COMING', resp);
      fetchDataWithIndex(true);
      navigation.goBack();
    })
    .catch(error => {
      console.log('UPDATION ERROR=', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.data?.message ||
          'Something went wrong!',
      );
    })
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        onIconPress={() => navigation.goBack()}
        heading="Shift details"
      />

      <View style={styles.box}>
        <View style={styles.row}>
          <Text style={styles.headerText}>
            #{decidingShiftType(moment(startDate).format('HH:MM:SS'))}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '400',
              color: decideShiftClr(shiftInfo.status),
            }}>
            {shiftInfo.status}
          </Text>
        </View>
            
        {isManager ? (
           <View style={styles.row}>

        { shiftInfo.confirmedBy?.name && (
            <Text style={{fontSize: 14, fontWeight: '400', marginTop: '3%'}}>
              <Text style={{fontWeight: '600'}}>Worker:</Text>{' '}
              {shiftInfo.confirmedBy?.name}
            </Text>
          )}
          <Text
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  marginTop: '3%',
                }}>
                <Text style={{fontWeight: '600'}}>Shift hours:</Text>{' '}
                {calcTime(startDate, endDate)} hrs
              </Text>
              
          </View>
        ) : (
          <>
            <View style={styles.row}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  marginTop: '3%',
                }}>
                <Text style={{fontWeight: '600'}}>Manager:</Text>{' '}
                {shiftInfo.createdBy?.name}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  marginTop: '3%',
                }}>
                <Text style={{fontWeight: '600'}}>Shift hours:</Text>{' '}
                {calcTime(startDate, endDate)} hrs
              </Text>
            </View>

            {shiftInfo.status === SHIFT_STATUS.CONFIRMED &&
            shiftInfo.swappedFrom ? (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  marginTop: '3%',
                }}>
                Swapped from:
                <Text style={styles.hgText}> {shiftInfo.swappedFrom.name}</Text>
              </Text>
            ) : null}
          </>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Description</Text>
          <TextInput
            value={desc.val}
            placeholder="Please enter shift description"
            numberOfLines={2}
            multiline
            editable={isManager}
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

        <View style={styles.inputContainer}>
          <Text
            onPress={() => setOpenCDate(prev => !prev)}
            style={styles.inputText}>
            Start date/time
          </Text>
          <DatePicker
            modal
            minimumDate={new Date(moment().add({hours: 8}))}
            open={isManager ? openCDate : false}
            date={startDate}
            onConfirm={date => {
              setOpenCDate(prev => !prev);
              setStartDate(date);
              setEndDate(new Date(moment(date).add({hours: 8})))
              // if (moment(endDate).diff(date) < 0) {
              //   setEndDate(date);
              // }
            }}
            onCancel={() => {
              setOpenCDate(prev => !prev);
            }}
          />

          <Text onPress={() => setOpenCDate(true)} style={styles.input}>
            Time: {moment(startDate).format('hh:mm a')} & Date:{' '}
            {moment(startDate).format('DD/M/YYYY')}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text
            onPress={() => setOpenEDate(prev => !prev)}
            style={styles.inputText}>
            End date/time
          </Text>
          <DatePicker
            modal
            open={isManager ? openEDate : false}
            minimumDate={new Date(moment(startDate).add(4, 'h'))}
            maximumDate={new Date(moment(startDate).add(12, 'h'))}
            date={endDate}
            onConfirm={date => {
              setOpenEDate(prev => !prev);
              setEndDate(date);
            }}
            onCancel={() => {
              setOpenEDate(prev => !prev);
            }}
          />

          <Text onPress={() => setOpenEDate(true)} style={styles.input}>
            Time: {moment(endDate).format('hh:mm a')} & Date:{' '}
            {moment(endDate).format('DD/M/YYYY')}
          </Text>
        </View>

       {isManager && <CustomButton
          title='Submit'
          onPress={handleSubmit}
        
        />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '3%',
  },
  box: {
    alignItems:'center',
    backgroundColor: '#fff',
    paddingVertical: '5%',
    width: '100%',
    borderColor: COLORS.secondary,
    borderWidth: 1,
    borderRadius: 10,
    display: 'flex',
    padding:'5%',
    marginTop:'5%',
    elevation:4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width:'100%'
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  dropdown1BtnStyle: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderBottomWidth: 0.5,
    borderRadius: 8,
    borderColor: '#444',
    alignSelf: 'center',
    marginTop: '1%',
  },
  dropdown1BtnTxtStyle: {color: '#444', textAlign: 'left', fontSize: 14},
  dropdown1DropdownStyle: {backgroundColor: '#EFEFEF'},
  dropdown1RowStyle: {
    backgroundColor: '#EFEFEF',
    borderBottomColor: '#C5C5C5',
  },

  memberContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: 'center',
    padding: '5%',
    marginTop: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderColor: '#444',
    borderBottomWidth: 0.5,
    borderRadius: 8,
    padding: '2%',
  },
  inputText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: '2%',
  },
  errText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'red',
    marginTop: '1%',
  },
  addText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.secondary,
    padding: '3%',
    alignSelf: 'center',
  },
  btn: {
    marginTop: '5%',
    marginBottom: '2%',
    width: '80%',
    padding: '3%',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 30,
    alignSelf: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

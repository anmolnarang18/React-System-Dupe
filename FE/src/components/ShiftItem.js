import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import moment from 'moment';
import Icon from 'react-native-vector-icons/AntDesign';

import {SHIFT_STATUS, USER_TYPE} from '../shared/Constants';
import {COLORS} from '../shared/Styles';
import {
  decideTaskClr,
  decidingShiftType,
} from '../utils/UtilityFuncs';
import CustomButton from './CustomButton';

export default function ShiftItem({
  data,
  userInfo,
  onConfirm,
  onComplete,
  onCancel,
  onSwap,
}) {

  const calcTime = () => {
    const start = moment(data.startDate);
    const end = moment(data.endDate);
  
    const hours = end.diff(start,'hours');
   
    return hours;

  }

  return (
    <View
      style={styles.itemContainer}>
       
      <View style={styles.row}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: COLORS.secondary,
          }}>
          #{decidingShiftType(moment(data.startDate).format('HH:MM:SS'))}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '400',
            color: decideTaskClr(data.status),
          }}>
          {data.status}
        </Text>
      </View>

      <View style={[styles.row, {marginTop: '2%'}]}>
        <View>
          <Text style={{fontWeight: '600'}}>Start</Text>
          <Text style={{fontSize: 12, fontWeight: '400', marginTop: '2%', color: COLORS.primary}}>
            {moment(data.startDate).format('DD/MMM/YY')}-
            {moment(data.startDate).format('hh:mm a')}
          </Text>
        </View>

        <View>
          <Text style={{fontWeight: '600'}}>End</Text>
          <Text style={{fontSize: 12, fontWeight: '400', marginTop: '2%', color: COLORS.primary}}>
            {moment(data.endDate).format('DD/MMM/YY')}-
            {moment(data.endDate).format('hh:mm a')}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={{fontSize: 14, fontWeight: '400', marginTop: '2%'}}>
        ~ {data.description}
      </Text>

      {userInfo.type === USER_TYPE.MANAGER ? (
        data.assignedTo?.name && (
          <Text style={{fontSize: 14, fontWeight: '400', marginTop: '3%'}}>
            <Text style={{fontWeight: '600'}}>Worker:</Text>{' '}
            {data.assignedTo?.name}
          </Text>
        )
      ) : (
        <>

        <View style={styles.row} >
        <Text
            style={{
              fontSize: 14,
              fontWeight: '400',
              marginTop: '3%',
            }}>
            <Text style={{fontWeight: '600'}}>Manager:</Text>{' '}
            {data.createdBy.name}
          </Text>
        
        <Text
            style={{
              fontSize: 14,
              fontWeight: '400',
              marginTop: '3%',
            }}>
            <Text style={{fontWeight: '600'}}>Shift hours:</Text>{' '}
            { calcTime() } hrs
          </Text>
        </View>
        

          {data.status === SHIFT_STATUS.NOT_ASSIGNED ? (
            <CustomButton 
              title="Confirm" 
              onPress={()=>onConfirm(data._id)} 
              parentStyles={{alignSelf:'center'}}
            />
          ) : data.status === SHIFT_STATUS.CONFIRMED ? (
            <View style={styles.row}>
              <CustomButton 
                title="Complete" 
                onPress={()=>onComplete(data._id)}
                parentStyles={{width:'35%'}} 
              />

              <CustomButton 
                title="Cancel" 
                onPress={()=>onSwap(data)} 
                parentStyles={{width:'15%', backgroundColor:COLORS.secondary}} 
              >
                <Icon name='swap' style={{fontSize:16, color: '#fff'}} />
                </CustomButton>

              <CustomButton 
                title="Cancel" 
                onPress={() =>onCancel(data._id)} 
                parentStyles={{width:'35%', backgroundColor:'#fff', borderWidth:1, borderColor: 'red'}} 
                textStyles={{color: 'red'}}
              />
            </View>
          ) : data.status === SHIFT_STATUS.SWAP ? (
            <CustomButton title="Swap" onPress={onSwap} />
          ) : null}

        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#fff',
    padding: '3%',
    width: '100%',
    borderColor: COLORS.secondary,
    borderWidth: 0.5,
    borderRadius: 5,
    display: 'flex',
    marginVertical: '3%',
    elevation:2,
    shadowOffset:{x:5, y:5},
    shadowColor:'#000'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

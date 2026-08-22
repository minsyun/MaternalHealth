import { defineStore } from 'pinia';
import axios from 'axios';
import dayjs from 'dayjs';
import api from '../services/api';

// 定義類型對照表
const TYPE_MAP = {
  '產檢': 'checkup',
  '提醒': 'reminder',
  '預約': 'appointment',
  '其他': 'other'
};

const REVERSE_TYPE_MAP = Object.fromEntries(
  Object.entries(TYPE_MAP).map(([key, value]) => [value, key])
);

export const useCalendarStore = defineStore('schedule', {
  state: () => {
    const savedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    return {
      events: [],
      diaries: [],
      loading: false,
      currentUserId: savedUser.user_id || null
    };
  },

  actions: {
    saveToLocal(user_id) {
      sessionStorage.setItem(`events_${user_id}`, JSON.stringify(this.events));
      sessionStorage.setItem(`diaries_${user_id}`, JSON.stringify(this.diaries));
    },

    async fetchAllData(user_id) {
      if (!user_id) return;
      this.currentUserId = user_id;
      this.loading = true;
      try {
        const response = await api.get(`http://192.168.100.6:3001/api/schedule`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const { dbEvents, dbDiaries } = response.data;

        // 轉換行程資料
        this.events = dbEvents.map(item => ({
          id: item.event_id,
          date: dayjs(item.event_start_date).format('YYYY-MM-DD'),      
          startDate: dayjs(item.event_start_date).format('YYYY-MM-DD'),
          endDate: item.event_end_date
            ? dayjs(item.event_end_date).format('YYYY-MM-DD')
            : dayjs(item.event_start_date).format('YYYY-MM-DD'),
          title: item.event_title,
          type: TYPE_MAP[item.event_type] || 'other',
          rawType: item.event_type,
          startTime: item.event_start_time ? item.event_start_time.substring(0, 5) : '', 
          endTime: item.event_end_time ? item.event_end_time.substring(0, 5) : '',
          location: item.event_place,
          description: item.event_describe,
          createdAt: item.event_created_datetime,
          updatedAt: item.event_modified_datetime,
          isAuto: item.event_is_auto === 1,
          isEditable: item.event_is_editable === 1
        }));

        // 轉換日記資料
        this.diaries = dbDiaries.map(item => ({
          id: item.diary_id,
          date: dayjs(item.diary_date).format('YYYY-MM-DD'),
          title: item.diary_title,
          content: item.diary_description,
          image: item.diary_file_path || null,
          createdAt: item.diary_created_datetime,
          updatedAt: item.diary_modified_datetime
        }));

        // 獲取成功後存入 sessionStorage
        this.saveToLocal(user_id);
        
        console.log("資料轉換完成並已存入本地快取");
      } catch (error) {
        console.error('獲取資料庫資料失敗:', error);
      } finally {
        this.loading = false;
      }
    },

    // 新增行程
    async addEvent(newEvent) {
      try {
        const payload = {
          event_title: newEvent.title,
          event_type: REVERSE_TYPE_MAP[newEvent.type] || '其他',
          event_start_date: newEvent.startDate,
          event_end_date: newEvent.endDate, 
          event_start_time: newEvent.startTime.length === 5 ? `${newEvent.startTime}:00` : newEvent.startTime,
          event_end_time: newEvent.endTime.length === 5 ? `${newEvent.endTime}:00` : newEvent.endTime,
          event_place: newEvent.location || '',
          event_describe: newEvent.description || '',
          personal_informations_user_id: this.currentUserId,
        };
        await axios.post('http://192.168.100.6:3001/api/schedule', payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        await this.fetchAllData(this.currentUserId); 
      } catch (error) {
        console.error('新增失敗:', error);
        throw error;
      }
    },

    // 編輯行程 
    async updateEvent(updatedEvent) {
      try {
        const payload = {
          event_title: updatedEvent.title,
          event_type: REVERSE_TYPE_MAP[updatedEvent.type] || '其他',
          event_start_date: updatedEvent.startDate,
          event_end_date: updatedEvent.endDate, 
          event_start_time: updatedEvent.startTime,
          event_end_time: updatedEvent.endTime,
          event_place: updatedEvent.location,
          event_describe: updatedEvent.description,
          personal_informations_user_id: this.currentUserId
        };
        await axios.put(`http://192.168.100.6:3001/api/schedule/${updatedEvent.id}`, payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        await this.fetchAllData(this.currentUserId);
      } catch (error) { console.error('更新失敗:', error); }
    },

    // 刪除行程
    async deleteEvent(eventId) {
      try {
        await axios.delete(`http://192.168.100.6:3001/api/schedule/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        await this.fetchAllData(this.currentUserId); 
      } catch (error) {
        console.error('刪除失敗:', error);
      }
    },

    // 新增日記 
    async addDiary(diary, imageFile) {
      try {
        const formData = new FormData();
        formData.append('date', diary.date);
        formData.append('title', diary.title || '今日日記');
        formData.append('content', diary.content || '');
        //formData.append('personal_informations_user_id', this.currentUserId);
        
        if (imageFile) {
          formData.append('image', imageFile);
        }

        await axios.post('http://192.168.100.6:3001/api/diary', formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        await this.fetchAllData(this.currentUserId);
      } catch (error) {
        console.error("儲存日記失敗:", error);
        throw error;
      }
    },

    // 編輯日記
    async updateDiary(updatedDiary, imageFile) {
      try {
        const formData = new FormData();
        formData.append('title', updatedDiary.title || '今日日記');
        formData.append('date', updatedDiary.date);
        formData.append('content', updatedDiary.content || '');
        formData.append('personal_informations_user_id', this.currentUserId);
        
        if (imageFile) {
          formData.append('image', imageFile); 
        } else {
          formData.append('image', updatedDiary.image || '');
        }
        await axios.put(`http://192.168.100.6:3001/api/diary/${updatedDiary.id}`, formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        await this.fetchAllData(this.currentUserId); 
      } catch (error) {
        console.error('更新日記失敗:', error);
        throw error;
      }
    },

    // 刪除日記
    async deleteDiary(diaryId) {
      try {
        await axios.delete(`http://192.168.100.6:3001/api/diary/${diaryId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        await this.fetchAllData(this.currentUserId); 
      } catch (error) {
        console.error('刪除日記失敗:', error);
      }
    },
  }
});
// Компонент фильтра по дате с тремя типами: день, группа дней, месяц
// Сохраняет выбранный фильтр в куки
import { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';

// Сохраняю выбранный фильтр в куки
function saveDateFilter(type, value) {
  if (type && value) {
    const filterData = JSON.stringify({ type, value });
    document.cookie = `task_date_filter=${encodeURIComponent(filterData)}; max-age=86400; path=/`;
  } else {
    document.cookie = 'task_date_filter=; max-age=0; path=/';
  }
}

// Читаю сохраненный фильтр из куки
function getDateFilter() {
  const cookies = document.cookie.split(';');
  const filterCookie = cookies.find(cookie => cookie.trim().startsWith('task_date_filter='));
  
  if (filterCookie) {
    try {
      const filterValue = filterCookie.split('=')[1];
      const decoded = decodeURIComponent(filterValue);
      return JSON.parse(decoded);
    } catch (e) {
      document.cookie = 'task_date_filter=; max-age=0; path=/';
      return null;
    }
  }
  
  return null;
}

function DateFilter({ selectedDate, selectedDayGroup, selectedMonth, onDateChange, onDayGroupChange, onMonthChange }) {
  const [availableDates, setAvailableDates] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('none'); // none, day, day_group, month

  // Загружаю доступные даты и месяцы из БД
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [datesData, monthsData] = await Promise.all([
          tasksAPI.getAvailableDates(),
          tasksAPI.getAvailableMonths()
        ]);
        setAvailableDates(datesData.dates || []);
        setAvailableMonths(monthsData.months || []);
      } catch (err) {
        console.error('Ошибка загрузки дат/месяцев:', err);
        setAvailableDates([]);
        setAvailableMonths([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Загружаю сохраненный фильтр из куки при монтировании
  useEffect(() => {
    const saved = getDateFilter();
    if (saved && saved.type && saved.value) {
      if (saved.type === 'day' && saved.value !== selectedDate) {
        onDateChange(saved.value);
        setFilterType('day');
      } else if (saved.type === 'day_group' && saved.value !== selectedDayGroup) {
        onDayGroupChange(saved.value);
        setFilterType('day_group');
      } else if (saved.type === 'month' && saved.value !== selectedMonth) {
        onMonthChange(saved.value);
        setFilterType('month');
      }
    } else {
      // Определяю тип активного фильтра
      if (selectedDate) setFilterType('day');
      else if (selectedDayGroup) setFilterType('day_group');
      else if (selectedMonth) setFilterType('month');
      else setFilterType('none');
    }
  }, []);

  // Обновляю тип фильтра при изменении значений
  useEffect(() => {
    if (selectedDate) setFilterType('day');
    else if (selectedDayGroup) setFilterType('day_group');
    else if (selectedMonth) setFilterType('month');
    else setFilterType('none');
  }, [selectedDate, selectedDayGroup, selectedMonth]);

  // Обрабатываю выбор типа фильтра
  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    // Очищаю все фильтры при смене типа
    if (type === 'none') {
      handleReset();
    } else if (type === 'day') {
      onDayGroupChange(null);
      onMonthChange(null);
    } else if (type === 'day_group') {
      onDateChange(null);
      onMonthChange(null);
    } else if (type === 'month') {
      onDateChange(null);
      onDayGroupChange(null);
    }
  };

  // Обрабатываю изменение даты
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate) {
      saveDateFilter('day', newDate);
      onDateChange(newDate);
    } else {
      handleReset();
    }
  };

  // Обрабатываю изменение группы дней
  const handleDayGroupChange = (e) => {
    const newGroup = e.target.value;
    if (newGroup) {
      saveDateFilter('day_group', newGroup);
      onDayGroupChange(newGroup);
    } else {
      handleReset();
    }
  };

  // Обрабатываю изменение месяца
  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    if (newMonth) {
      saveDateFilter('month', newMonth);
      onMonthChange(newMonth);
    } else {
      handleReset();
    }
  };

  // Сбрасываю все фильтры
  const handleReset = () => {
    saveDateFilter(null, null);
    onDateChange(null);
    onDayGroupChange(null);
    onMonthChange(null);
    setFilterType('none');
  };

  // Форматирую дату для отображения
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Форматирую месяц для отображения
  const formatMonth = (monthString) => {
    try {
      const [year, month] = monthString.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch (e) {
      return monthString;
    }
  };

  return (
    <div className="space-y-3">
      {/* Выбор типа фильтра */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleFilterTypeChange('day')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            filterType === 'day'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          По дню
        </button>
        <button
          onClick={() => handleFilterTypeChange('day_group')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            filterType === 'day_group'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Группа дней
        </button>
        <button
          onClick={() => handleFilterTypeChange('month')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            filterType === 'month'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          По месяцу
        </button>
      </div>

      {/* Фильтр по дню */}
      {filterType === 'day' && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label htmlFor="date-filter" className="block text-gray-700 text-sm font-bold mb-2">
              Выберите день
            </label>
            <select
              id="date-filter"
              value={selectedDate || ''}
              onChange={handleDateChange}
              disabled={loading}
              className="shadow appearance-none border rounded-xl w-full min-w-[220px] py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200 cursor-pointer hover:bg-gray-50 disabled:opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '2.5rem',
              }}
            >
              <option value="">Все даты</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Фильтр по группе дней */}
      {filterType === 'day_group' && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label htmlFor="day-group-filter" className="block text-gray-700 text-sm font-bold mb-2">
              Выберите период
            </label>
            <select
              id="day-group-filter"
              value={selectedDayGroup || ''}
              onChange={handleDayGroupChange}
              className="shadow appearance-none border rounded-xl w-full min-w-[220px] py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200 cursor-pointer hover:bg-gray-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '2.5rem',
              }}
            >
              <option value="">Все периоды</option>
              <option value="today">Сегодня</option>
              <option value="yesterday">Вчера</option>
              <option value="week">Последние 7 дней</option>
              <option value="month">Последние 30 дней</option>
            </select>
          </div>
        </div>
      )}

      {/* Фильтр по месяцу */}
      {filterType === 'month' && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label htmlFor="month-filter" className="block text-gray-700 text-sm font-bold mb-2">
              Выберите месяц
            </label>
            <select
              id="month-filter"
              value={selectedMonth || ''}
              onChange={handleMonthChange}
              disabled={loading}
              className="shadow appearance-none border rounded-xl w-full min-w-[220px] py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200 cursor-pointer hover:bg-gray-50 disabled:opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '2.5rem',
              }}
            >
              <option value="">Все месяцы</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Кнопка сброса фильтра */}
      {(selectedDate || selectedDayGroup || selectedMonth) && (
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 whitespace-nowrap"
          title="Сбросить все фильтры по дате"
        >
          Сброс фильтров
        </button>
      )}
    </div>
  );
}

export default DateFilter;

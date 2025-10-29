// Работа с куками: сохраняю и читаю данные формы создания задачи

// Сохраняю данные задачи в куки
export function saveTaskDraft(title, description) {
  if (title || description) {
    const draftData = JSON.stringify({ title: title || '', description: description || '' });
    document.cookie = `task_draft=${encodeURIComponent(draftData)}; max-age=86400; path=/`;
  } else {
    // Очищаю куки если все пусто
    document.cookie = 'task_draft=; max-age=0; path=/';
  }
}

// Читаю сохраненные данные задачи из куки
export function getTaskDraft() {
  const cookies = document.cookie.split(';');
  const draftCookie = cookies.find(cookie => cookie.trim().startsWith('task_draft='));
  
  if (draftCookie) {
    try {
      const draftValue = draftCookie.split('=')[1];
      const decoded = decodeURIComponent(draftValue);
      return JSON.parse(decoded);
    } catch (e) {
      // Если ошибка парсинга, очищаю куки
      document.cookie = 'task_draft=; max-age=0; path=/';
      return { title: '', description: '' };
    }
  }
  
  return { title: '', description: '' };
}

// Очищаю данные задачи из куки
export function clearTaskDraft() {
  document.cookie = 'task_draft=; max-age=0; path=/';
}


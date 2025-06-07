function calculateFutureWeeklyWorkHours_SingleLog() {
  // --- 1. Specify the target span (next Mon-Fri) ---
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=日, 1=月, ..., 6=土

  let diffToMonday;
  if (dayOfWeek <= 1) {
    diffToMonday = 1 - dayOfWeek;
  } else { 
    diffToMonday = 8 - dayOfWeek;
  }

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  // --- 2. Get your schedule from your google calender ---
  const calendar = CalendarApp.getDefaultCalendar();
  const events = calendar.getEvents(monday, friday);

  // --- 3. Store the result ---
  const outputLines = [];
  outputLines.push(`集計期間: ${monday.toLocaleDateString()} 〜 ${friday.toLocaleDateString()}`);

  if (events.length === 0) {
    outputLines.push('対象期間に予定はありません。');
  } else {
    const workHours = {};
    for (const event of events) {
      let title = event.getTitle();

      // Specify the title to skip
      if (title.includes('みなさんへ') || (title.includes('認可')) || (title.includes('参加'))) {
        continue;
      }

      // Filter the title
      if (title.includes('XXX') || title.includes('作業：') || title.includes('ミーツ')) {

        // Hide detail info on private schedule ミーツ
        if (title.includes('ミーツ')) {
          title = '【ミーツ】';
        }

        // --- Cauculate working time ---
        const durationInMillis = event.getEndTime().getTime() - event.getStartTime().getTime();
        if (!workHours[title]) {
          workHours[title] = 0;
        }
        workHours[title] += durationInMillis;
      }
    }

    if (Object.keys(workHours).length === 0) {
      outputLines.push('\n集計対象の予定は見つかりませんでした。');
    } else {
      // --- 4. Categorize each titles ---
      const meetingItems = {};
      const taskItems = {};
      
      for (const title in workHours) {
        if (title.includes('【ミーツ】') || title.includes('SFD')) {
          meetingItems[title] = workHours[title];
        } else {
          taskItems[title] = workHours[title];
        }
      }

      let totalMeetingHours = 0;
      let totalTaskHours = 0;

      // --- 5. Generate new order for output ---
      if (Object.keys(meetingItems).length > 0) {
        outputLines.push('\n--- 会議系 合計予定工数 ---');
        
        const sortedMeetingTitles = Object.keys(meetingItems).sort((a, b) => {
          if (a === '【ミーツ】' && b !== '【ミーツ】') return 1;
          if (b === '【ミーツ】' && a !== '【ミーツ】') return -1;
          return a.localeCompare(b);
        });

        for (const title of sortedMeetingTitles) {
          const totalMillis = meetingItems[title];
          const totalHours = totalMillis / (1000 * 60 * 60);
          totalMeetingHours += totalHours;
          outputLines.push(`${title}：${totalHours.toFixed(2)} H`);
        }
      }

      if (Object.keys(taskItems).length > 0) {
        outputLines.push('\n--- 作業系 合計予定工数 ---');
        
        const sortedTaskTitles = Object.keys(taskItems).sort();

        for (const title of sortedTaskTitles) {
          const totalMillis = taskItems[title];
          const totalHours = totalMillis / (1000 * 60 * 60);
          totalTaskHours += totalHours; // ★★★ 作業時間を加算
          outputLines.push(`${title}：${totalHours.toFixed(2)} H`);
        }
      }

      // 6. Sum up total working time and the buffer.
      const grandTotalHours = totalMeetingHours + totalTaskHours;
      const monthlyCapacity = 7.5 * 20; // 月の想定稼働時間 (150時間)
      const weeklyCapacity = 7.5 * 5;
      const weeklybufferHours = weeklyCapacity - grandTotalHours;
      const monthlybufferHours = monthlyCapacity - grandTotalHours;
      const percentage = (grandTotalHours / monthlyCapacity) * 100;

      outputLines.push('\n--- （予定）総合計 & 月次バッファ ---');
      outputLines.push(`会議系の合計: ${totalMeetingHours.toFixed(2)} H`);
      outputLines.push(`作業系の合計: ${totalTaskHours.toFixed(2)} H`);
      outputLines.push('---------------------------------');
      outputLines.push(`週次合計工数: ${grandTotalHours.toFixed(2)} H`);
      outputLines.push(`週次残バッファ: ${weeklybufferHours.toFixed(2)} H`);
      outputLines.push(`月次消化率: ${percentage.toFixed(2)} %`);
      outputLines.push(`月次残バッファ: ${monthlybufferHours.toFixed(2)} H (月150H基準)`);
    }
  }

  // --- 6. Connect the array to standard output log ---
  Logger.log(outputLines.join('\n'));
}

/**
 * 統一された時間管理ユーティリティ
 * 
 * JST対応、営業時間考慮、デフォルト値計算を統一管理
 */

// 営業時間設定
export const BUSINESS_HOURS = {
  OPEN: 8,    // 8:00
  CLOSE: 20,  // 20:00
} as const;

// デフォルトレンタル時間（時間）
export const DEFAULT_RENTAL_DURATION_HOURS = 6;

/**
 * JST（日本標準時）で現在時刻を取得
 */
export function getCurrentJST(): Date {
  const now = new Date();
  // JSTはUTC+9
  const jstOffset = 9 * 60; // 9時間を分に変換
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (jstOffset * 60000));
}

/**
 * 指定された時間をJSTでフォーマット
 */
export function formatJSTTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 指定された日付をJSTでフォーマット
 */
export function formatJSTDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-');
}

/**
 * 指定された時間を2時間刻みに丸める
 */
export function roundToTwoHourInterval(date: Date): Date {
  const rounded = new Date(date);
  const hour = rounded.getHours();
  const roundedHour = Math.ceil(hour / 2) * 2;
  rounded.setHours(roundedHour, 0, 0, 0);
  return rounded;
}

/**
 * 営業時間内かどうかをチェック
 */
export function isWithinBusinessHours(date: Date): boolean {
  const hour = date.getHours();
  return hour >= BUSINESS_HOURS.OPEN && hour < BUSINESS_HOURS.CLOSE;
}

/**
 * 営業時間外の場合、次の営業開始時間に調整
 */
export function adjustToBusinessHours(date: Date): Date {
  const adjusted = new Date(date);
  const hour = adjusted.getHours();
  
  if (hour < BUSINESS_HOURS.OPEN) {
    // 営業開始時間前に設定
    adjusted.setHours(BUSINESS_HOURS.OPEN, 0, 0, 0);
  } else if (hour >= BUSINESS_HOURS.CLOSE) {
    // 営業終了時間後は翌日の営業開始時間
    adjusted.setDate(adjusted.getDate() + 1);
    adjusted.setHours(BUSINESS_HOURS.OPEN, 0, 0, 0);
  }
  
  return adjusted;
}

/**
 * デフォルトの受取日時を計算
 * - 現在時刻+1時間以降の2時間刻みの時間
 * - 営業時間内に調整
 */
export function getDefaultPickupDateTime(): Date {
  const now = getCurrentJST();
  const pickupTime = new Date(now.getTime() + 60 * 60 * 1000); // +1時間
  const roundedPickup = roundToTwoHourInterval(pickupTime);
  return adjustToBusinessHours(roundedPickup);
}

/**
 * デフォルトの返却日時を計算
 * - 受取日時から指定時間後
 * - 営業時間外の場合は翌日の同じ時間に調整
 */
export function getDefaultReturnDateTime(pickupDateTime: Date, durationHours: number = DEFAULT_RENTAL_DURATION_HOURS): Date {
  const returnTime = new Date(pickupDateTime.getTime() + durationHours * 60 * 60 * 1000);
  const hour = returnTime.getHours();
  
  // 営業時間外の場合は翌日の同じ時間に設定
  if (hour >= BUSINESS_HOURS.CLOSE) {
    const nextDay = new Date(pickupDateTime.getTime() + 24 * 60 * 60 * 1000);
    nextDay.setHours(pickupDateTime.getHours(), pickupDateTime.getMinutes(), 0, 0);
    return nextDay;
  }
  
  return returnTime;
}

/**
 * デフォルトの検索条件を取得
 */
export function getDefaultSearchConditions() {
  const pickupDateTime = getDefaultPickupDateTime();
  const returnDateTime = getDefaultReturnDateTime(pickupDateTime);
  
  return {
    pickupDate: formatJSTDate(pickupDateTime),
    pickupTime: formatJSTTime(pickupDateTime),
    returnDate: formatJSTDate(returnDateTime),
    returnTime: formatJSTTime(returnDateTime),
  };
}

/**
 * 日時文字列をJSTのDateオブジェクトに変換
 */
export function parseJSTDateTime(dateStr: string, timeStr: string): Date {
  // JSTで日時を構築
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(hour, minute, 0, 0);
  
  return date;
}

/**
 * レンタル期間を時間単位で計算
 */
export function calculateRentalDurationHours(pickupDateTime: Date, returnDateTime: Date): number {
  const durationMs = returnDateTime.getTime() - pickupDateTime.getTime();
  return Math.ceil(durationMs / (1000 * 60 * 60));
}

/**
 * レンタル期間を日単位で計算
 */
export function calculateRentalDurationDays(pickupDateTime: Date, returnDateTime: Date): number {
  const hours = calculateRentalDurationHours(pickupDateTime, returnDateTime);
  return Math.ceil(hours / 24);
}

/**
 * 受取日時変更時の返却日時を自動計算
 */
export function calculateReturnDateTimeFromPickup(
  pickupDate: string,
  pickupTime: string,
  durationHours: number = DEFAULT_RENTAL_DURATION_HOURS
): { returnDate: string; returnTime: string } {
  const pickupDateTime = parseJSTDateTime(pickupDate, pickupTime);
  const returnDateTime = getDefaultReturnDateTime(pickupDateTime, durationHours);
  
  return {
    returnDate: formatJSTDate(returnDateTime),
    returnTime: formatJSTTime(returnDateTime),
  };
}

/**
 * 検索条件の妥当性をチェック
 */
export function validateSearchConditions(
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string
): { isValid: boolean; errorMessage?: string } {
  const pickupDateTime = parseJSTDateTime(pickupDate, pickupTime);
  const returnDateTime = parseJSTDateTime(returnDate, returnTime);
  const now = getCurrentJST();
  
  // 受取日時が現在時刻より前
  if (pickupDateTime <= now) {
    return {
      isValid: false,
      errorMessage: '受取日時は現在時刻より後の時間を選択してください。'
    };
  }
  
  // 返却日時が受取日時より前
  if (returnDateTime <= pickupDateTime) {
    return {
      isValid: false,
      errorMessage: '返却日時は受取日時より後の時間を選択してください。'
    };
  }
  
  // 最小レンタル時間（1時間）チェック
  const durationHours = calculateRentalDurationHours(pickupDateTime, returnDateTime);
  if (durationHours < 1) {
    return {
      isValid: false,
      errorMessage: 'レンタル時間は最低1時間必要です。'
    };
  }
  
  // 最大レンタル時間（30日）チェック
  if (durationHours > 30 * 24) {
    return {
      isValid: false,
      errorMessage: 'レンタル時間は最大30日までです。'
    };
  }
  
  return { isValid: true };
}

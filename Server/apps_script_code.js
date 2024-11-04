// 유효한 사용자 목록 가져오기 함수
function getValidUsers() {
    const sheetId = "1dUfC43XC1ilq4dpP2ic1dmE4wEVttGD2092g8KeqbsM"; // 학번과 이름이 저장된 Google Sheets ID
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("ID"); // 시트 이름 변경
    const data = sheet.getRange(1, 1, sheet.getLastRow(), 2).getValues(); // 1행부터 읽어옴
    const validUsers = {};

    data.forEach(row => {
        const studentId = row[0].toString(); // 학번
        const studentName = row[1]; // 이름
        validUsers[studentId] = studentName;
    });

    // JSON으로 반환
    return ContentService.createTextOutput(JSON.stringify(validUsers)).setMimeType(ContentService.MimeType.JSON);
}

// 로그 기록 함수
function logEvent(userId, eventType, comment) {
    const sheetId = "1dUfC43XC1ilq4dpP2ic1dmE4wEVttGD2092g8KeqbsM"; // 로그 기록할 Google Sheets ID
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("게임로그기록"); // 로그 시트 이름 변경

    const now = new Date();
    const eventDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd");

    // 시트의 현재 행 수를 확인하여 순번을 설정 (2행부터 시작)
    const rowCount = sheet.getLastRow(); // 현재 행 수 확인
    const eventId = rowCount > 1 ? rowCount - 1 : 0; // 헤더를 제외하고 순번 설정

    // 시트에 데이터 추가 (순번, 날짜, 시간, ID, 이벤트, 코멘트 순서로)
    const newRowIndex = rowCount >= 1 ? rowCount + 1 : 2; // 2행부터 시작하도록 설정

    // Date 객체를 사용하여 날짜와 시간을 저장
    sheet.getRange(newRowIndex, 1, 1, 6).setValues([[eventId, eventDate, now, userId, eventType, comment]]);

    // 시트의 데이터가 추가된 후, 다시 시트를 읽어서 순번을 조정
    const updatedRowCount = sheet.getLastRow();
    for (let i = 2; i <= updatedRowCount; i++) { // 2행부터 시작
        sheet.getRange(i, 1).setValue(i - 2); // 순번을 0부터 시작하도록 설정
    }
}

// 웹 앱으로 호출 시 getValidUsers 함수 실행
function doGet(e) {
    return getValidUsers();
}

// POST 요청 처리 함수
function doPost(e) {
    const data = JSON.parse(e.postData.contents); // POST로 받은 데이터 파싱

    // 이벤트 ID와 데이터 추출
    const userId = data.userId || 0;
    const eventType = data.eventType || "Unknown";
    const comment = data.comment || "";

    logEvent(userId, eventType, comment); // 로그 기록

    // 성공 응답 반환
    const response = ContentService.createTextOutput("로그 기록 성공").setMimeType(ContentService.MimeType.TEXT);

    // CORS 헤더 추가
    response.setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type"
    });

    return response; // 응답 반환
}

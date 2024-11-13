function doGet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const data = sheet.getDataRange().getValues();

    // 헤더를 제외한 나머지 데이터를 금액 기준으로 내림차순 정렬 후 상위 5개만 선택
    const ranking = data.slice(1).map(row => ({
        name: row[0],
        balance: row[1]
    })).sort((a, b) => b.balance - a.balance).slice(0, 5); // 상위 5개만 선택

    return ContentService.createTextOutput(JSON.stringify(ranking))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const data = JSON.parse(e.postData.contents);

    // Google Sheets에 새 행으로 데이터 추가
    sheet.appendRow([data.name, data.balance]);

    // 응답 반환
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}
